# Instructions for AI agents working on this project

You are helping a student in **Probability for AI**, a free online course from
Stanford, build their final project. Read this whole file before you change
anything. The student may be new to programming, and may be writing English
as a second language.

## Your role

- We'd like the student to make the big decisions: the question, their guess
  before looking, the probability model (its story and its parameters), which
  data to lock away as a test set, and what the results mean. For each one,
  offer two or three options with one line on each, and let the student pick.
- After each change, explain briefly and in plain words what you did.
- Keep a short running list in `AI-NOTES.md` of what you did and what the
  student did or decided, so they can describe their use of AI honestly when
  they submit.
- Never invent data. If real data is missing, say so. If you simulate data,
  label it "simulated" in the code and in the app.
- Cite every data source in `SOURCES.md` (the name, the URL and the license).
  Also show it on the page itself, in a line like "Data: …", because
  `SOURCES.md` isn't uploaded.
- Follow `AI-POLICY.md`.

## Rules the website must follow

The course's upload checks rules 1 to 6, and a website that breaks one will
not be published. Nothing checks rule 7, but follow it, because the showcase
is for everyone.

1. `app/App.tsx` (or `app/App.jsx`) default-exports a React component. Only
   the `app/` folder is uploaded.
2. Import only from `react`, `recharts`, `styled-components`,
   `react-icons/fa`, `sweetalert2`, `katex`, and relative paths inside `app/`.
   Anything else is refused. **Never add a package to `package.json`.**
3. The app doesn't use the network at run time:
   - no `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`,
     `navigator.sendBeacon`, dynamic `import()`, `require()` or CSS
     `@import`;
   - no `http://` or `https://` address that loads something, in `src`,
     `srcSet`, CSS `url()`, `import` or `fetch`. Links to your sources
     (`href`) and addresses in plain text are fine.
   Put data and pictures in `app/`, and import them, for example
   `import rows from './rain.json'`. Give every file a different name, because
   a student on a phone uploads the files without their folders.
4. The app has no unsafe code:
   - no `eval`, `new Function`, or `setTimeout` or `setInterval` with a
     string;
   - no `document.cookie`, `localStorage`, `sessionStorage`, `indexedDB`,
     `window.open`, `window.top` or `window.parent`;
   - no `dangerouslySetInnerHTML`, and no `<script>`, `<iframe>`, `<object>`
     or `<embed>` in JSX.
5. TypeScript (`.tsx` and `.ts`) is easiest for the checks, but plain
   JavaScript (`.jsx` and `.js`) works too.
   - Styles can go in `.css` files. Import each one on its own line, like
     `import './App.css'`, and use its class names as written. CSS modules
     don't work here.
   - Data goes in `.json` files.
   - Pictures can be `.png`, `.jpg`, `.gif`, `.webp` or `.svg` files. Import
     each one, like `import cat from './cat.png'`, and use `src={cat}`, not
     the file's path. A `.css` file can use a picture by its path from that
     file, like `url('./cat.png')`.
   - Other files, such as an `.html` page, can't be part of the site.
6. `app/` has at most 1 MB of code, and at most 5 MB of data and pictures
   together.
7. The site is accessible.
   - Text is at least 16 px.
   - Every picture has a text alternative (`alt`, `aria-label` or
     `<title>`).
   - Every control works by keyboard and has a label.
   - Contrast is at least 3:1.

After every change, run `node tools/check.mjs` and fix everything it reports
before you say you are done.

## The course's words

- A **model** is a probabilistic story with **parameters**. Write the story
  before any code. Say "parameter", never "knob".
- **Score** means log₁₀ likelihood, and higher is better.
- Before looking closely at the data, lock part of it away as a **locked test
  set**. Open it once, at the end.
- For calibration, use "calibrated", "overconfident" and "underconfident".
  The only calibration number the course uses is the **average gap**.
- The course taught the Bernoulli, binomial, Poisson and Normal
  distributions; logistic regression (σ of a weighted sum); and small neural
  networks. Explain anything beyond these in plain words, or don't use it.

## Preview

- If Node.js is installed, run `npm install` once, then `npm run dev`, and
  open the link it prints.
- If it isn't, upload the `app/` folder in the website part of the submit form.
  The form checks the rules and shows the site running.

## Before you say you are done

- `node tools/check.mjs` passes.
- The app runs in the preview.
- `SOURCES.md` lists every dataset.
- `AI-NOTES.md` is up to date, with what you did and what the student did or
  decided.
