# Spelling Quest ⚔️

A spelling game for 5th graders. Single static page, works offline, no accounts.

**Live:** https://word.fopusha.com

## How it plays

Home screen → **Daily Quest** (~8 min), a Duolingo-style path of 5 stages:

1. 📖 **Learn new words**: guess first (skipped if already known), then UK-school **Look · Say · Cover · Write · Check**
2. 🎮 **Mini-game** (random)
3. ✍️ **Dictation checkpoint**: hear the word, type it all; mistakes are corrected by re-typing
4. 🎮 **Mini-game** (a different one)
5. 👾 **Boss dictation**: every correct word hits the monster; beat it to add it to the collection (✨ shiny if all first-try)

Mini-games: 🫧 Bubble Pop · 🔍 Spot the right spelling · 🧩 Syllable puzzle · 🕳️ Fill the tricky letters · ⚡ Speed match

Also: 🎮 Arcade (free play), 📝 Spelling test (school-style, results at the end), 📚 Word book, 🏆 Collection with 24 monsters + 🎁 pet chests bought with coins, 🔥 daily streak.

## Learning model

- Only **dictation** changes a word's level; games are practice.
- Leitner spaced repetition: correct → next box (review after 1 / 3 / 7 / 16 / 35 days), wrong → box 1.
  A word is "mastered" once it reaches box 4, meaning it was still right after a 3-day gap.

## Words

`words.js`: 413 words across 4 levels. Levels 1–2 include the UK National Curriculum
Year 3–4 and Year 5–6 statutory spelling lists (US spelling). Parents can paste the school's
weekly list in ⚙ settings; those words are taught first.

## Audio

`audio/*.mp3` (edge-tts, en-US-JennyNeural); any word without an MP3 uses the browser's voice.
After adding words, run:

```bash
pip install edge-tts
python gen_audio.py        # generates missing MP3s + rewrites audio/manifest.js
```

## Tech

Vanilla JS in `index.html` + `words.js`, `localStorage` for progress (old v3 saves are migrated automatically),
optional `monsters/<id>.png` art (falls back to emoji).
