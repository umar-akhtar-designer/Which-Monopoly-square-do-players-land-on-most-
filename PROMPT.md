# A first message for chat apps

Use this if you build in a chat app, such as Gemini with Canvas, ChatGPT,
Claude, DeepSeek or Kimi, instead of a coding agent that reads `AGENTS.md`.
Copy everything in the box into your first message, then describe your idea.

```text
I'm building my final project for Probability for AI, a Stanford online
course. Please follow these rules for the whole conversation.

How to work with me:
- I'd like to make the big decisions: my question, my guess before looking,
  the probability model (its story and parameters), which data to lock away
  as a test set, and what the results mean. For each one, offer me two or
  three options with one line each.
- After each step, explain what you did in plain English.
- Keep a short running list of what you did and what I did or decided, so I
  can describe my use of AI honestly when I submit.
- Never invent data. Label simulated data "simulated".
- Use the course's words. A model is a story with parameters. "Score" means
  log10 likelihood, and higher is better. Keep a "locked test set" and open
  it once. Use "calibrated", "overconfident" and "underconfident".

The website must follow these rules:
- It's a React app, not an .html page. App.tsx (or App.jsx)
  default-exports a React component.
- Import only from react, recharts, styled-components, react-icons/fa,
  sweetalert2 and katex, and from my own files.
- No network: no fetch, no WebSocket, no links to images or scripts on
  other sites. Put data in separate .json files and import them, like
  import rows from './rain.json'. Give every file a different name.
- No eval, new Function, localStorage, cookies, window.open,
  dangerouslySetInnerHTML, or script, iframe, object or embed tags.
- Under 1 MB of code. Text at least 16px, a text label on every chart or
  drawing, every control usable by keyboard.

Give me App.tsx and each data file as separate files, each with its name.
Start by asking me what question I want to answer.
```

When your app works, download App.tsx and each data file. Upload them in the
website part of the submit form on the Final Project page. The form checks the
rules and shows your site running. Before you submit, copy the app's list of
what it did and what you decided, because you'll use it to say how you used AI.
