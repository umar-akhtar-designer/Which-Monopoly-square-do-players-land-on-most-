#!/usr/bin/env node
// Checks the app/ folder against the Probability for AI final project website
// rules (see AGENTS.md). Usage: node tools/check.mjs [folder]
// The course's upload runs a stricter version of these checks with a real
// parser; this one is a quick local preview of the same rules.
import {readdirSync, readFileSync, statSync, existsSync} from 'node:fs';
import {join, relative, extname, resolve, sep, dirname} from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'app');
const ALLOWED_IMPORTS = new Set([
  'react',
  'recharts',
  'styled-components',
  'react-icons/fa',
  'sweetalert2',
  'katex',
]);
const CODE_EXT = new Set(['.tsx', '.ts', '.jsx', '.js']);
const STYLE_EXT = new Set(['.css']);
const DATA_EXT = new Set(['.json']);
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const ENTRY_NAMES = ['App.tsx', 'App.jsx', 'App.js'];
const FIX_FOR_EXT = {
  '.html': 'a website here is a React app, not an .html page; start from the app/ folder in the starter bundle',
};
const MAX_CODE_BYTES = 1024 * 1024;
const MAX_DATA_BYTES = 5 * 1024 * 1024;

const LOADS = 'this loads a file from another site. Put the file in your app/ folder and import it instead';
const BANNED = [
  [/\bfetch\s*\(/, 'fetch(): websites can\'t use the network. Put your data in a .json file next to App.tsx and import it'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest: websites can\'t use the network. Put your data in a .json file next to App.tsx and import it'],
  [/\bWebSocket\b/, 'WebSocket: websites can\'t use the network. Put your data in a .json file next to App.tsx and import it'],
  [/\bEventSource\b/, 'EventSource: websites can\'t use the network. Put your data in a .json file next to App.tsx and import it'],
  [/\bsendBeacon\b/, 'sendBeacon: websites can\'t use the network. Remove it'],
  [/\bimport\s*\(/, 'dynamic import(): move it to an import line at the top of the file'],
  [/\brequire\s*\(/, 'require(): change it to an import line at the top of the file'],
  [/\beval\s*\(/, 'eval() can\'t be used. Write the code out directly instead'],
  [/\bnew\s+Function\b/, 'new Function can\'t be used. Write an ordinary function instead'],
  [/\bset(?:Timeout|Interval)\s*\(\s*['"`]/, 'setTimeout/setInterval with a string can\'t be used. Pass a function instead: setTimeout(() => tick(), 10)'],
  [/\bdocument\.cookie\b/, 'document.cookie can\'t be used. Keep values in React state instead'],
  [/\b(?:localStorage|sessionStorage|indexedDB)\b/, 'browser storage can\'t be used here. Keep values in React state instead'],
  [/\bwindow\.open\b/, 'window.open can\'t be used. Use an ordinary link instead'],
  [/\bwindow\.(?:top|parent)\b|\b(?:top|parent)\.(?:location|postMessage|document)\b/, 'websites can\'t reach outside their own page. Remove this line'],
  [/\bdangerouslySetInnerHTML\b/, 'dangerouslySetInnerHTML can\'t be used. Write the content as JSX instead'],
  [/<\s*(?:script|iframe|object|embed)\b/i, '<script>, <iframe>, <object> and <embed> can\'t be used. Put the code in your own files, and show pictures with <img>'],
  [/(?:\bsrc(?:Set)?\s*=\s*\{?\s*['"`]|\burl\(\s*['"]?|\bfrom\s+['"]|\bimport\s+['"]|\.src\s*=\s*['"`])https?:\/\//i, LOADS],
  [/(?:\bsrc(?:Set)?\s*=\s*\{?\s*['"`]|\.src\s*=\s*['"`]|\burl\(\s*['"`]?)(?![a-z][a-z0-9+.-]*:|\/\/)[^'"`()\s]*\.(?:png|jpe?g|gif|webp|svg)\b/i, 'this uses a picture by its path, which doesn\'t work here. Import the picture instead, like import cat from \'./cat.png\', and use cat in place of the path'],
];
const STYLE_BANNED = [
  [/@import\b/i, '@import can\'t be used here. Import each .css file from your code instead, like import \'./more.css\''],
];
const IMPORT_RE = /(?:^|[\s;])(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const CSS_URL_RE = /\burl\(\s*(["']?)(.*?)\1\s*\)/gi;

/** Removes comments so rules only see code, keeping line numbers intact. */
function stripComments(text) {
  return stripBlockComments(text).replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

/** Removes CSS comments, where // starts a web address, not a comment. */
function stripBlockComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
}

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    if (name.startsWith('.')) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Whether a .css file's url() address is a picture inside app/. */
function isUploadedPicture(cssFile, address) {
  if (address.startsWith('/')) return false;
  const target = resolve(dirname(cssFile), address);
  return (
    target.startsWith(ROOT + sep) &&
    IMAGE_EXT.has(extname(target).toLowerCase()) &&
    existsSync(target) &&
    statSync(target).isFile()
  );
}

const problems = [];
const report = (file, line, message) => problems.push({file, line, message});

if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) {
  console.error(`No folder at ${ROOT}. Run this from the project folder, next to app/.`);
  process.exit(2);
}

const files = walk(ROOT);
const rel = f => relative(join(ROOT, '..'), f) || 'app';
let codeBytes = 0;
let dataBytes = 0;

const entry = ENTRY_NAMES.map(name => join(ROOT, name)).find(existsSync);
if (!entry) {
  report(rel(ROOT), 0, 'no App.tsx in app/. Add one that starts with: export default function App() { ... }');
} else {
  const text = stripComments(readFileSync(entry, 'utf8'));
  if (!/\bexport\s+default\b/.test(text) && !/\bas\s+default\b/.test(text)) {
    report(rel(entry), 0, 'App must have a default export (export default function App() { ... })');
  }
}

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const size = statSync(file).size;
  if (DATA_EXT.has(ext) || IMAGE_EXT.has(ext)) {
    dataBytes += size;
    continue;
  }
  if (STYLE_EXT.has(ext)) {
    codeBytes += size;
    stripBlockComments(readFileSync(file, 'utf8')).split('\n').forEach((text, i) => {
      for (const [pattern, message] of STYLE_BANNED) {
        if (pattern.test(text)) report(rel(file), i + 1, message);
      }
      for (const match of text.matchAll(CSS_URL_RE)) {
        const address = match[2];
        if (address === '' || address.startsWith('#') || /^data:/i.test(address)) continue;
        if (address.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(address)) {
          report(rel(file), i + 1, LOADS);
        } else if (!isUploadedPicture(file, address)) {
          report(rel(file), i + 1, `url('${address}') isn't a picture in your upload. Put the picture in your app/ folder, and write its path from this .css file, like url('./cat.png')`);
        }
      }
    });
    continue;
  }
  if (!CODE_EXT.has(ext)) {
    report(rel(file), 0, FIX_FOR_EXT[ext] ?? `${ext || 'no extension'} files can't be part of a website; use .tsx, .ts, .jsx, .js, .css, .json, or a picture (.png, .jpg, .gif, .webp or .svg)`);
    continue;
  }
  codeBytes += size;
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((text, i) => {
    for (const [pattern, message] of BANNED) {
      if (pattern.test(text)) report(rel(file), i + 1, message);
    }
    for (const match of text.matchAll(IMPORT_RE)) {
      const spec = match[1];
      if (spec.startsWith('./') || spec.startsWith('../')) {
        const target = resolve(join(file, '..'), spec);
        if (target !== ROOT && !target.startsWith(ROOT + sep)) {
          report(rel(file), i + 1, `imports '${spec}', which is outside app/. Move that file into app/ and import it from there`);
        } else if (STYLE_EXT.has(extname(target).toLowerCase()) && /\sfrom\s/.test(match[0])) {
          report(rel(file), i + 1, `imports '${spec}' as a CSS module, which doesn't work here. Write import '${spec}' on its own line, and use its class names as they are written`);
        }
      } else if (!/^https?:\/\//i.test(spec) && !ALLOWED_IMPORTS.has(spec)) {
        report(rel(file), i + 1, `imports '${spec}', which websites can't use. Use only react, recharts, styled-components, react-icons/fa, sweetalert2 and katex`);
      }
    }
  });
}

if (codeBytes > MAX_CODE_BYTES) report(rel(ROOT), 0, `${(codeBytes / 1048576).toFixed(1)} MB of code; the limit is 1 MB. Remove code you don't use`);
if (dataBytes > MAX_DATA_BYTES) report(rel(ROOT), 0, `${(dataBytes / 1048576).toFixed(1)} MB of data and pictures; the limit is 5 MB. Keep only the rows you need, and save big pictures smaller`);

if (problems.length === 0) {
  const size = bytes => (bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(0)} KB`);
  console.log(`Passed: ${files.length} files, ${size(codeBytes)} of code, ${size(dataBytes)} of data.`);
  process.exit(0);
}
console.log(`${problems.length} thing${problems.length === 1 ? '' : 's'} to fix:`);
for (const {file, line, message} of problems) {
  console.log(`  ${file}${line ? ` line ${line}` : ''}: ${message}`);
}
process.exit(1);
