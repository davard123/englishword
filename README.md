# Spelling Quest ⚔️

A spelling game for 5th graders. Single static page, works offline, no accounts.

**Live:** https://word.fopusha.com

## 🏰 Word Tower Defense (main mode, `td.js`)

- Monsters walk down a path toward your castle, and each one carries a word. **Only spelling kills them:**
  type the whole word and press ⚔️; a correct answer fires a volley that destroys the monster.
  A wrong answer misfires, shows the correct spelling and why, and the kid re-types it to finish the monster.
- 👻 Ghost monsters are this level's new words: the kid guesses first, then sees and copies the answer. They come back later in the level with the word hidden.
- **One word = one health bar.** Monsters carry 1–3 words (bars shown above the head); each correct word knocks off a bar
  with a yelp, and the last one triggers an explosion and a victory jingle. Exceptions (👑) are the last bar of an elite monster.
- **Towers run on spelling energy.** Each letter typed charges the energy bar; on a correct Fire the energy flows into every tower
  (×1.5 for a first-try answer, ×1.5–2 for combos). Every tower only acts when charged: 🏹 archer (1 energy per volley at
  gold-stealing bats), ❄️ ice (freeze pulse, 5), 💣 cannon (knock back, 7), ⚡ tesla (stun, 9). A wrong answer is a dud:
  the energy fizzles and the combo resets.
- Every 6th level is a 🏯 **siege**: each spelled word knocks a brick off the enemy fortress, and the enemy cannon fires on a timer.
  A perfect word gives a 🛡️ shield. Knock down every brick to capture the boss for the collection.
- A word counts as a correct dictation only when it's spelled with no wrong letters. Missed words return in the next wave.
- 5 chapters with 6 levels each, then they loop at higher difficulty. Stars, an 🛠️ armory with permanent upgrades, and coins.

## 🧪 Magic Rule Levels (`rules.js`)

42 levels that teach spelling *rules* instead of single words: 21 suffix levels (plurals, -ed, -ing, -er/-est, -ly, -ful, -less,
-ness, -ment, -al, -able/-ible, -tion/-sion, -ous, -y, -er/-or, -ive), 9 prefix levels (un-, dis-, mis-, re-, pre-/fore-/post-,
in-/im-/il-/ir-, over-/under-/out-, super-/sub-/inter-…, number prefixes) and 12 root levels (port, spect, rupt, tract, dict,
scrib, struct, vis, ject, Greek roots, -logy, aud/voc). Each level opens with a rule card. Monsters show a formula such as `stop + ed`,
and the kid types the result. 👑 Exceptions (go → went, true → truly) appear as elite monsters. A wrong answer shows which rule applies.

In every mode the kid types the **whole word** and then presses ⚔️ to fire. A wrong answer shows the reason and the changed letters,
and the kid re-types the correct spelling to finish the monster. New words: the kid tries first, then sees the answer, then copies it.

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
