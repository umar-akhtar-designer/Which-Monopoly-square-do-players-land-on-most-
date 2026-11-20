# Probability for AI final project starter bundle

This folder has templates and instructions for your final project. You can use it with any AI tool.

**Is the final project optional?** Yes, it's optional. Finishing it adds a gold star to your certificate that links to your project, and it can also make up one missed section.

## What you submit

1. A thumbnail. This is one 16:9 picture of at least 1280 × 720 pixels, like
   the ones on YouTube, and every project needs one. Start from
   `thumbnail/thumbnail-template.png`, or the `.svg` beside it.
2. A 60-second video about your project. Plan it with
   `video/VIDEO-SCRIPT.md`. If you're under 18, don't make a video.
3. A PDF writeup of at most two pages, or a website. Start the writeup from
   `writeup/WRITEUP-TEMPLATE.md`, and build a website in the `app/` folder.

Read `AI-POLICY.md` before you start.

## If you build with a coding agent

Coding agents (Claude Code, Codex, Antigravity, OpenCode, Qwen Code, Cursor
or Copilot) read `AGENTS.md` (or `CLAUDE.md`, `GEMINI.md` or `QWEN.md`, which
point to it) on their own. It tells your agent the rules your website must
follow and how to work with you. Open this folder in your tool and say what
you want to build.

## If you build in a chat app

Chat apps, such as Gemini with Canvas, ChatGPT, Claude, DeepSeek or Kimi,
don't read files from this folder. Paste the box in `PROMPT.md` into your
first message instead.

## Check your website

Your website must pass the course's checks before it can be published (see
`AGENTS.md`, "Rules the website must follow").

- If you have Node.js, run `node tools/check.mjs` in this folder. It lists
  anything to fix, by file and line. To preview the site, run `npm install`
  once, then `npm run dev`.
- If you don't have Node.js, upload your `app/` folder in the website part of
  the submit form. The form checks the rules and shows your site running.

## What's in here

| Path | What it is |
| --- | --- |
| `app/` | Your website. `App.tsx` is a small example to replace. |
| `AGENTS.md` | Instructions for your AI agent. |
| `PROMPT.md` | The same rules, to paste into a chat app. |
| `AI-POLICY.md` | The AI policy for your project. |
| `AI-NOTES.md` | A running list of what your AI did and what you did. |
| `SOURCES.md` | Where every dataset came from, and its license. |
| `tools/check.mjs` | Checks your website against the rules. |
| `writeup/`, `thumbnail/`, `video/` | Templates for the other things you submit. |
| `package.json`, `index.html`, `dev/`, `vite.config.js` | For the local preview only. |
