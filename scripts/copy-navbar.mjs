// Copies the shared navbar web component from the captionz repo into
// src/app/navbar so it is never duplicated in this repo's git history.
// Runs automatically before start/build/watch/test (see package.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.resolve(
  root,
  process.env.NAVBAR_SRC ?? '../cats-love-youtube/src/app/navbar',
);
const dest = path.join(root, 'src/app/navbar');

if (!fs.existsSync(src)) {
  console.error(`[copy-navbar] Source folder not found: ${src}`);
  console.error('[copy-navbar] Set NAVBAR_SRC to the captionz navbar folder.');
  process.exit(1);
}

const header = `/**
 * !!! READONLY - DO NOT EDIT !!!
 * This file is copied automatically from ${path.relative(root, src)}
 * by scripts/copy-navbar.mjs on every build. Any change here will be overwritten.
 * Edit the original file in the captionz repo instead.
 */
`;

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

for (const name of fs.readdirSync(src)) {
  const from = path.join(src, name);
  if (!fs.statSync(from).isFile()) continue;
  const to = path.join(dest, name);
  fs.writeFileSync(to, header + fs.readFileSync(from, 'utf8'));
  fs.chmodSync(to, 0o444);
}

console.log(`[copy-navbar] Copied ${src} -> ${path.relative(root, dest)}`);
