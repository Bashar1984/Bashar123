// usage: node render.js <start> <end> [outdir]   (frame indices, end exclusive)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [s, e] = [+process.argv[2], +process.argv[3]];
  const out = process.argv[4] || path.resolve(__dirname, 'build/frames');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', err => { console.error('PAGE ERROR', err.message); process.exit(1); });
  await p.goto('file://' + path.resolve(__dirname, 'scene.html'));
  for (let f = s; f < e; f++) {
    await p.evaluate(t => render(t), f / 24);
    await p.screenshot({ path: path.join(out, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 93 });
  }
  await b.close();
})();
