"""
批量生成英语单词 MP3 音频
使用 edge-tts (微软 Azure 神经网络 TTS，免费)
声音：en-US-JennyNeural（自然女声，适合儿童教育）
"""
import asyncio
import edge_tts
import os

VOICE = "en-US-JennyNeural"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "audio")

WORDS = [
    "February", "necessary", "definitely", "separate", "restaurant",
    "beautiful", "government", "environment", "embarrass", "similar",
    "immediately", "especially", "calendar", "vegetable", "character",
    "exercise", "accommodate", "occasionally", "occurrence", "interesting",
    "different", "probably", "usually", "temperature", "equipment",
    "attention", "position", "comfortable", "emergency", "president",
    "tomorrow", "opposite", "furniture", "dictionary", "interview",
    "introduce", "understand", "communicate", "experience", "continue",
]

async def generate_word(word: str, semaphore: asyncio.Semaphore):
    """生成单个单词的 MP3 文件"""
    output_path = os.path.join(OUTPUT_DIR, f"{word.lower()}.mp3")
    if os.path.exists(output_path):
        print(f"  ⏭  已存在，跳过: {word}")
        return

    async with semaphore:
        try:
            communicate = edge_tts.Communicate(word, VOICE, rate="-15%")
            await communicate.save(output_path)
            print(f"  ✅  {word}")
        except Exception as e:
            print(f"  ❌  {word}: {e}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"生成目录: {OUTPUT_DIR}")
    print(f"使用声音: {VOICE}")
    print(f"共 {len(WORDS)} 个单词\n")

    semaphore = asyncio.Semaphore(3)  # 最多同时3个并发请求，防止被限流
    tasks = [generate_word(w, semaphore) for w in WORDS]
    await asyncio.gather(*tasks)

    # 验证结果
    generated = [f for f in os.listdir(OUTPUT_DIR) if f.endswith(".mp3")]
    print(f"\n完成！共生成 {len(generated)} 个 MP3 文件")

if __name__ == "__main__":
    asyncio.run(main())
