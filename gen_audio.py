"""
批量生成英语单词 MP3 音频，两种引擎可选：

1) edge-tts（默认，免费）：微软神经网络 TTS，声音 en-US-JennyNeural（和现有 231 个 MP3 一样）
       pip install edge-tts
       python gen_audio.py

2) MiniMax（需要 MiniMax 账号的 API Key，按字数计费，413 个单词只有几千字符）
       Windows:  set MINIMAX_API_KEY=你的key
       Mac/Linux: export MINIMAX_API_KEY=你的key
       python gen_audio.py --minimax            只补缺的
       python gen_audio.py --minimax --force    全部重新生成（所有词同一个声音，推荐）
   可选环境变量：
       MINIMAX_HOST    国内账号用 api.minimaxi.com（默认），海外账号用 api.minimax.io
       MINIMAX_VOICE   声音 ID（默认 English_Graceful_Lady，可在 MiniMax 控制台的声音列表里换）
       MINIMAX_MODEL   默认 speech-02-hd
       MINIMAX_GROUP_ID  老账号如果报错要求 GroupId 就填上

单词表直接从 words.js 读取；已存在且非空的 MP3 会跳过（除非 --force）。
跑完后会重写 audio/manifest.js（页面据此判断哪些词有 MP3，没有的用浏览器朗读）。
       python gen_audio.py --manifest-only   只重写 manifest，不联网
"""
import asyncio
import json
import os
import re
import sys
import time
import urllib.request

# 修复 Windows 终端编码
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VOICE = "en-US-JennyNeural"
ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "audio")
FORCE = "--force" in sys.argv


def load_words():
    with open(os.path.join(ROOT, "words.js"), encoding="utf-8") as f:
        return re.findall(r'"w":"([^"]+)"', f.read())


def audio_path(word):
    return os.path.join(OUTPUT_DIR, re.sub(r"[^a-z0-9]", "", word.lower()) + ".mp3")


def has_audio(word):
    p = audio_path(word)
    return os.path.exists(p) and os.path.getsize(p) > 0


def todo(words):
    return words if FORCE else [w for w in words if not has_audio(w)]


# ── edge-tts ──────────────────────────────────────────────
async def edge_word(word, semaphore):
    import edge_tts
    async with semaphore:
        try:
            await edge_tts.Communicate(word, VOICE, rate="-15%").save(audio_path(word))
            print(f"  [OK] {word}")
        except Exception as e:
            print(f"  [ERR] {word}: {e}")
            if os.path.exists(audio_path(word)) and os.path.getsize(audio_path(word)) == 0:
                os.remove(audio_path(word))


async def run_edge(words):
    semaphore = asyncio.Semaphore(3)  # 最多同时3个并发请求，防止被限流
    await asyncio.gather(*(edge_word(w, semaphore) for w in words))


# ── MiniMax ───────────────────────────────────────────────
def minimax_word(word, key):
    host = os.environ.get("MINIMAX_HOST", "api.minimaxi.com")
    url = f"https://{host}/v1/t2a_v2"
    if os.environ.get("MINIMAX_GROUP_ID"):
        url += "?GroupId=" + os.environ["MINIMAX_GROUP_ID"]
    body = {
        "model": os.environ.get("MINIMAX_MODEL", "speech-02-hd"),
        "text": word,
        "stream": False,
        "language_boost": "English",
        "voice_setting": {"voice_id": os.environ.get("MINIMAX_VOICE", "English_Graceful_Lady"),
                          "speed": 0.85, "vol": 1, "pitch": 0},
        "audio_setting": {"sample_rate": 32000, "bitrate": 128000, "format": "mp3", "channel": 1},
    }
    req = urllib.request.Request(url, json.dumps(body).encode(), method="POST", headers={
        "Authorization": "Bearer " + key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    base = data.get("base_resp") or {}
    if base.get("status_code", 0) != 0:
        raise RuntimeError(f"{base.get('status_code')} {base.get('status_msg')}")
    audio = (data.get("data") or {}).get("audio")
    if not audio:
        raise RuntimeError("no audio in response: " + json.dumps(data)[:200])
    with open(audio_path(word), "wb") as f:
        f.write(bytes.fromhex(audio))


def run_minimax(words):
    key = os.environ.get("MINIMAX_API_KEY")
    if not key:
        sys.exit("请先设置环境变量 MINIMAX_API_KEY")
    for i, w in enumerate(words, 1):
        for attempt in range(3):
            try:
                minimax_word(w, key)
                print(f"  [OK {i}/{len(words)}] {w}")
                break
            except Exception as e:
                print(f"  [ERR] {w}: {e}")
                time.sleep(2 * (attempt + 1))
        time.sleep(0.3)  # 别打太快，防止限流


def write_manifest(words):
    ok = sorted({re.sub(r"[^a-z0-9]", "", w.lower()) for w in words if has_audio(w)})
    with open(os.path.join(OUTPUT_DIR, "manifest.js"), "w", encoding="utf-8") as f:
        f.write("// 自动生成（gen_audio.py）：有 MP3 的单词列表\n")
        f.write("window.AUDIO_WORDS = " + json.dumps(ok) + "\n")
    print(f"manifest: {len(ok)} / {len(words)} words have MP3")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    words = load_words()
    if "--manifest-only" not in sys.argv:
        need = todo(words)
        engine = "MiniMax" if "--minimax" in sys.argv else f"edge-tts ({VOICE})"
        print(f"Engine: {engine}   words: {len(words)}   to generate: {len(need)}\n")
        if "--minimax" in sys.argv:
            run_minimax(need)
        else:
            asyncio.run(run_edge(need))
    write_manifest(words)


if __name__ == "__main__":
    main()
