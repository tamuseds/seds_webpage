import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const script = new URL('./version-site-assets.mjs', import.meta.url);

test('deployment URLs track changed assets and preserve external links', async () => {
  const root = await mkdtemp(join(tmpdir(), 'asset-versions-'));
  const run = () => execFileSync(process.execPath, [script.pathname, root], { stdio: 'pipe' });
  try {
    for (const folder of ['pages', 'css', 'js', 'images']) await mkdir(join(root, folder));
    await writeFile(join(root, 'images/logo.svg'), '<svg/>');
    await writeFile(join(root, 'css/site.css'), 'body{background:url(../images/logo.svg)}');
    await writeFile(join(root, 'js/logos.js'), 'window.SPONSOR_LOGOS=[];');
    const page = join(root, 'pages/index.html');
    await writeFile(page, '<link href="../css/site.css?v=1"><script src = "../js/logos.js?v=1"></script><a href="https://example.com/a.js?v=1">External</a>');
    run();
    const first = await readFile(page, 'utf8');
    assert.match(first, /logos\.js\?v=[a-f0-9]{16}/);
    assert.ok(first.includes('https://example.com/a.js?v=1'));
    run();
    assert.equal(await readFile(page, 'utf8'), first);
    await writeFile(join(root, 'js/logos.js'), 'window.SPONSOR_LOGOS=["new.svg"];');
    await writeFile(join(root, 'images/logo.svg'), '<svg>changed</svg>');
    run();
    const next = await readFile(page, 'utf8');
    assert.notEqual(next.match(/logos\.js\?v=\w+/)[0], first.match(/logos\.js\?v=\w+/)[0]);
    assert.notEqual(next.match(/site\.css\?v=\w+/)[0], first.match(/site\.css\?v=\w+/)[0]);
    await writeFile(page, '<script src="js/missing.js"></script>');
    assert.throws(run, /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
