# AI notes

A running list of what the AI did and what I decided. Used at the end for the
"How I used AI" question on the submit form.

## Decisions I made

- 2026-11-20: Chose the **Monopoly landing-squares** question (simulate the
  game) over football home advantage, cherry blossom dates and cricket.
- 2026-11-20: Chose to hand in a **website** (small React app) instead of a PDF
  writeup.
- 2026-11-20: **Guess before looking.** I had no strong guess. The AI offered
  four squares (Jail, Illinois Avenue, Go, Free Parking); I said I did not know
  and asked it to go ahead. It wrote down **"Jail / Just Visiting, 50% sure"**
  and I accepted that before any result was computed. The guess was suggested
  by the AI, not by me.
- 2026-11-20: **The model.** I accepted the AI's plain-words story taken from
  Hasbro's rules: two fair dice, one lost turn in Jail, each card drawn
  independently, no buying, houses, trading or doubles extra turn.
- 2026-11-20: **Locked test set.** 200,000 turns with seed 20261221, written in
  `app/lockedTest.json` before the result was opened.

## What the AI did

- 2026-11-20: Read `AGENTS.md`, `AI-POLICY.md`, `README.md`,
  `writeup/WRITEUP-TEMPLATE.md` and `video/VIDEO-SCRIPT.md`.
- 2026-11-20: Checked the setup: Node v22.14.0, `node tools/check.mjs` passed.
- 2026-11-20: Wrote the website: `app/board.json`, `app/chance.json`,
  `app/chest.json`, `app/lockedTest.json` and `app/App.tsx`. The app computes
  the exact long-run chances with a table of one-turn moves, simulates turns
  with a seeded random number generator, shows a chart, scores the model
  against a uniform guess, and opens the locked test set once.
- 2026-11-20: Ran `npx vite build` (built) and `node tools/check.mjs` (passed).
- 2026-11-20: Checked the numbers: Jail 9.16% and Illinois Avenue 3.08%,
  the same order as published simulations. Found and fixed a bug: the score
  showed NaN because Go To Jail has chance 0.
- 2026-11-20: Wrote `SOURCES.md`.
- 2026-11-20: Rewrote the page in a plainer, first-person voice and a simpler
  hand-made look (paper background, serif headings, note for the guess). The
  student asked for this because the first version looked too polished.
- 2026-11-20: Fixed the chart after the student saw it: the axis label
  collided with the legend, and the chart library's auto-sizing container
  was rendering the chart at 14 by 14 pixels. The chart now measures its own
  width, has the legend on top, and a caption underneath.
- 2026-11-20: Designed `thumbnail/thumbnail.png` (1280×720) and wrote
  `video/SCRIPT.md` (about 145 words).

## Still to do

- 60-second video (script is in `video/SCRIPT.md`).
- Submit form answers are in `SUBMIT-ANSWERS.md`.
