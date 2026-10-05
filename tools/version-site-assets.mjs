import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

// Only rewrite the deployment artifact, never the checked-in source pages.
const root = resolve(process.argv[2] || '_site');
const assetPattern = /\.(?:css|js|png|jpe?g|svg|webp|gif|avif|ico|woff2?|ttf|mp4)$/i;
const hashes = new Map();

async function versionUrl(url, source) {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url;
  const base = new URL(relative(root, source).split(sep).join('/'), 'https://local.invalid/');
  const parsed = new URL(url, base);
  const pathname = decodeURIComponent(parsed.pathname);
  if (!assetPattern.test(pathname)) return url;
  const target = resolve(root, '.' + pathname);
  const rel = relative(root, target);
  if (rel === '..' || rel.startsWith('..' + sep)) throw new Error(`Asset outside site: ${url}`);
  if (!hashes.has(target)) {
    try {
      hashes.set(target, createHash('sha256').update(await readFile(target)).digest('hex').slice(0, 16));
    } catch (error) {
      // Keep pre-existing missing image references from breaking deployment.
      // Missing scripts/styles would break dynamic content, so fail those builds.
      if (/\.(css|js)$/i.test(pathname)) throw error;
      console.warn(`Missing asset in ${relative(root, source)}: ${url}`);
      return url;
    }
  }
  parsed.searchParams.set('v', hashes.get(target));
  return url.split(/[?#]/)[0] + parsed.search + parsed.hash;
}

async function rewrite(file, pattern, replace) {
  const source = await readFile(file, 'utf8');
  const matches = [...source.matchAll(pattern)];
  let result = source;
  for (const match of matches.reverse()) {
    const value = await replace(match);
    result = result.slice(0, match.index) + value + result.slice(match.index + match[0].length);
  }
  await writeFile(file, result);
}

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const files = await collect(root);
// Rewrite CSS first so its final content hash includes updated image/font URLs.
for (const file of files.filter(file => file.endsWith('.css'))) {
  await rewrite(file, /url\(\s*(['"]?)([^'"\s)]+)\1\s*\)/g,
    async match => `url(${match[1]}${await versionUrl(match[2], file)}${match[1]})`);
}
hashes.clear();
for (const file of files.filter(file => file.endsWith('.html'))) {
  await rewrite(file, /\b(src|href)\s*=\s*(['"])(.*?)\2/g,
    async match => `${match[1]}=${match[2]}${await versionUrl(match[3], file)}${match[2]}`);
}
console.log('Versioned deployed asset URLs by content hash.');
