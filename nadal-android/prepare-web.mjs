import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const source = resolve(root, '..');
const output = resolve(root, 'www');
await mkdir(output, { recursive: true });
let html = await readFile(resolve(source, 'nadal-app.html'), 'utf8');
html = html.replaceAll('/move/images/', './images/').replaceAll('/move/move-logo.png', './move-logo.png');
await writeFile(resolve(output, 'index.html'), html);
for (const name of ['nadal-app.css', 'nadal-app.js', 'move-logo.png', 'images']) {
  await cp(resolve(source, name), resolve(output, name), { recursive: true });
}
