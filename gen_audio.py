"""
批量生成英语单词 MP3 音频
使用 edge-tts (微软 Azure 神经网络 TTS，免费)
声音：en-US-JennyNeural（自然女声，适合儿童教育）
"""
import asyncio
import edge_tts
import os
import sys

# 修复 Windows 终端编码
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VOICE = "en-US-JennyNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "audio")

WORDS = [
    # 原有 40 词
    "February", "necessary", "definitely", "separate", "restaurant",
    "beautiful", "government", "environment", "embarrass", "similar",
    "immediately", "especially", "calendar", "vegetable", "character",
    "exercise", "accommodate", "occasionally", "occurrence", "interesting",
    "different", "probably", "usually", "temperature", "equipment",
    "attention", "position", "comfortable", "emergency", "president",
    "tomorrow", "opposite", "furniture", "dictionary", "interview",
    "introduce", "understand", "communicate", "experience", "continue",
    # 新增 80 词——日常生活类
    "acknowledge", "accomplish", "atmosphere", "category", "committee",
    "community", "conscience", "decision", "description", "disappear",
    "disappoint", "education", "excellent", "familiar", "favorite",
    "guarantee", "hygiene", "imagination", "incredible", "information",
    # 学校学科类
    "abbreviate", "arithmetic", "bibliography", "certificate", "civilization",
    "competition", "conclusion", "curriculum", "examination", "explanation",
    "geography", "grammar", "hypothesis", "laboratory", "literature",
    "mathematics", "measurement", "paragraph", "pronunciation",
    # 自然科学类
    "agriculture", "biology", "catastrophe", "chemistry", "contaminate",
    "electricity", "endangered", "evaporate", "evolution", "experiment",
    "hibernation", "hurricane", "investigation", "metamorphosis", "microscope",
    "organism", "photosynthesis", "precipitation", "vertebrate",
    # 时间地点类
    "anniversary", "approximately", "architecture", "boundary", "celebration",
    "circumstance", "contemporary", "coordinates", "destination", "expedition",
    "fortunately", "headquarters", "hemisphere", "horizontal", "infrastructure",
    "millennium", "neighborhood", "perpendicular", "surveillance",
    "topography", "vicinity", "wilderness",
]

async def generate_word(word: str, semaphore: asyncio.Semaphore):
    """生成单个单词的 MP3 文件"""
    output_path = os.path.join(OUTPUT_DIR, f"{word.lower()}.mp3")
    if os.path.exists(output_path):
        print(f"  [SKIP] already exists: {word}")
        return

    async with semaphore:
        try:
            communicate = edge_tts.Communicate(word, VOICE, rate="-15%")
            await communicate.save(output_path)
            print(f"  [OK] {word}")
        except Exception as e:
            print(f"  [ERR] {word}: {e}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output dir: {OUTPUT_DIR}")
    print(f"Voice: {VOICE}")
    print(f"Total words: {len(WORDS)}\n")

    semaphore = asyncio.Semaphore(3)  # 最多同时3个并发请求，防止被限流
    tasks = [generate_word(w, semaphore) for w in WORDS]
    await asyncio.gather(*tasks)

    # 验证结果
    generated = [f for f in os.listdir(OUTPUT_DIR) if f.endswith(".mp3")]
    print(f"\nDone! Generated {len(generated)} MP3 files")

if __name__ == "__main__":
    asyncio.run(main())
