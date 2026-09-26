"""
批量生成英语单词 MP3 音频
使用 edge-tts (微软 Azure 神经网络 TTS，免费)
声音：en-US-JennyNeural（自然女声，适合儿童教育）

单词表直接从 words.js 读取；已存在且非空的 MP3 会跳过。
跑完后会重写 audio/manifest.js（页面据此判断哪些词有 MP3，没有的用浏览器朗读）。

用法:  pip install edge-tts   然后   python gen_audio.py
       python gen_audio.py --manifest-only   只重写 manifest，不联网
"""
import asyncio
import json
import os
import re
import sys

# 修复 Windows 终端编码
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VOICE = "en-US-JennyNeural"
ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "audio")


def load_words():
    with open(os.path.join(ROOT, "words.js"), encoding="utf-8") as f:
        return re.findall(r'"w":"([^"]+)"', f.read())


def audio_path(word):
    return os.path.join(OUTPUT_DIR, re.sub(r"[^a-z0-9]", "", word.lower()) + ".mp3")


def has_audio(word):
    p = audio_path(word)
    return os.path.exists(p) and os.path.getsize(p) > 0


async def generate_word(word, semaphore):
    """生成单个单词的 MP3 文件"""
    import edge_tts
    if has_audio(word):
        return
    async with semaphore:
        try:
            await edge_tts.Communicate(word, VOICE, rate="-15%").save(audio_path(word))
            print(f"  [OK] {word}")
        except Exception as e:
            print(f"  [ERR] {word}: {e}")
            if os.path.exists(audio_path(word)) and os.path.getsize(audio_path(word)) == 0:
                os.remove(audio_path(word))


def write_manifest(words):
    ok = sorted({re.sub(r"[^a-z0-9]", "", w.lower()) for w in words if has_audio(w)})
    with open(os.path.join(OUTPUT_DIR, "manifest.js"), "w", encoding="utf-8") as f:
        f.write("// 自动生成（gen_audio.py）：有 MP3 的单词列表\n")
        f.write("window.AUDIO_WORDS = " + json.dumps(ok) + "\n")
    print(f"manifest: {len(ok)} / {len(words)} words have MP3")


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    words = load_words()
    if "--manifest-only" not in sys.argv:
        missing = [w for w in words if not has_audio(w)]
        print(f"Voice: {VOICE}   words: {len(words)}   missing: {len(missing)}\n")
        semaphore = asyncio.Semaphore(3)  # 最多同时3个并发请求，防止被限流
        await asyncio.gather(*(generate_word(w, semaphore) for w in missing))
    write_manifest(words)


if __name__ == "__main__":
    asyncio.run(main())
