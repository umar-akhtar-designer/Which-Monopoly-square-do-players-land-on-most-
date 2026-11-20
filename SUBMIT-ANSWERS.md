# Answers for the submit form

Copy these into the Final Project page. Character limits are in brackets.

## Title [60]

```
Which Monopoly square do players land on most?
```

## Your project in one sentence [140]

```
I simulated Monopoly turns from the official rules to find the most visited square, then tested the model on 200,000 hidden turns.
```

## Which course concepts did you use? [300]

```
A probabilistic model with parameters taken from the rules (dice and card chances, one lost turn in Jail), a locked test set opened once, and score = log10 likelihood per turn, compared with a uniform guess.
```

## How you used AI [300]

```
I used OpenCode with a DeepSeek model. It suggested four projects; I chose Monopoly and accepted its 50% Jail guess. It wrote the code and the text, and checked the numbers against published simulations. My part was choosing the project and accepting the simplifications, then reviewing the page.
```

## Files to upload

| Part | File |
| --- | --- |
| Thumbnail | `thumbnail/thumbnail.png` (1280×720, 78 KB) |
| Video | record with `video/SCRIPT.md`, or record on the page |
| Website | upload the whole `app/` folder |

The writeup PDF is optional because you chose the website. You can skip it.

## Before you press Submit

- [ ] Open the site and click the button once, so you have seen the hidden test
      result yourself.
- [ ] Watch the video once with the sound on, and check it is 60 seconds or
      less.
- [ ] Read the "How you used AI" answer and make sure it matches what
      happened. If you changed anything yourself, add it.
- [ ] Decide about the public showcase checkbox. You get the gold star either
      way. Projects by students under 18 are never shown publicly.
- [ ] Submit before Monday, December 21.

## If the form rejects the website

The form checks the same rules as `node tools/check.mjs`. If it names a file,
fix that file and run `node tools/check.mjs` again. Do not add packages to
`package.json`, and do not add an `.html` file inside `app/`.
