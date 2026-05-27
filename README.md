# Spelling Quest ⚔️

A spelling battle game for 5th-grade English learners. Built for one specific kid; works offline; no accounts; deploys as a static site.

**Live:** https://word.fopusha.com (or https://englishword.pages.dev)

## What it is

5th graders who are native English speakers but spell multi-syllable words badly need spaced practice, not phonics drills. This is a single HTML page that wraps spelling practice in a boss-battle game:

- Pick a word from a list of 40 hard 5th-grade words (or paste your own list)
- Each battle = one monster (15 of them, ending with the boss dragon)
- Spell correctly → attack the monster
- Spell wrong → lose a heart
- Defeat the monster → coins + XP
- Custom on-screen keyboard (no iOS autocomplete cheating)

3 challenge modes randomly mixed per attack:
- 🎧 Listen & Spell — hear word, type full spelling
- 🧩 Puzzle — drag syllables in order
- ⚠️ Trap Zones — fill the hard letters in skeleton word

## Mastery (real spaced repetition)

A word is mastered only when:
1. answered correctly ≥ 2 times,
2. last two attempts in a row both correct,
3. ≥ 20 minutes between first ever correct and now.

This forces the kid to come back to a word at a later session — not just speed-tap two correct answers in a row to fake it.

## Tech

- Single `index.html` (vanilla JS, no build)
- Web Speech API for TTS (iOS native voices, no API key)
- Web Audio API for SFX (generated, no audio files needed)
- `localStorage` for persistence
- Optional `monsters/*.png` for nicer art (falls back to emoji)
- Optional `audio/*.mp3` for BGM

## Deploy

```bash
wrangler pages deploy . --project-name=englishword --commit-dirty=true --branch=main
```
