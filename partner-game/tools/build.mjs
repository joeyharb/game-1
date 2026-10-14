// Assembles the single-file game: ../index.html
// Usage: node build.mjs            (content from ../src/content.js)
//        node build.mjs --keep-content   (keep the CONTENT block already in ../index.html,
//                                         so edits made by the CP team are not lost)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..'), src = join(root, 'src'), out = join(root, 'index.html');
const read = (p) => readFileSync(p, 'utf8');

let content = read(join(src, 'content.js'));
if (process.argv.includes('--keep-content') && existsSync(out)) {
  const html = read(out);
  const m = html.match(/<script>\n(\/\* ={10,}\n \* LAST MILE HEROES: GAME CONTENT[\s\S]*?)\n<\/script>/);
  if (!m) throw new Error('CONTENT block not found in index.html');
  content = m[1];
  writeFileSync(join(src, 'content.js'), content + '\n');
  console.log('Kept the CONTENT block from index.html (and copied it back to src/content.js).');
}

const three = buildSync({ entryPoints: [join(here, 'three-entry.js')], bundle: true, minify: true, format: 'iife',
  globalName: 'THREE', target: 'es2019', legalComments: 'none', write: false }).outputFiles[0].text;
const threeVer = JSON.parse(read(join(here, 'node_modules/three/package.json'))).version;

const gameDir = join(src, 'game');
const game = readdirSync(gameDir).filter((f) => f.endsWith('.js')).sort().map((f) => read(join(gameDir, f))).join('\n');

// fail early on syntax errors in the readable parts
for (const [name, code] of [['content', content], ['game', '(function(){' + game + '})']]) {
  try { new Function(code); } catch (e) { console.error('Syntax error in ' + name + ':', e.message); process.exit(1); }
}

const html = read(join(src, 'index.template.html'))
  .replace('/*@STYLES@*/', () => read(join(src, 'styles.css')))
  .replace('/*@CONTENT@*/', () => content.trimEnd())
  .replace('/*@THREEVER@*/', () => threeVer.split('.')[1])
  .replace('/*@THREE@*/', () => three.trim())
  .replace('/*@GAME@*/', () => game);
writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`index.html written: ${kb} KB (three ${threeVer}: ${(three.length / 1024).toFixed(0)} KB, game ${(game.length / 1024).toFixed(0)} KB, content ${(content.length / 1024).toFixed(0)} KB)`);
