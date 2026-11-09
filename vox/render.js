// usage: node render.js <startFrame> <endFrame> [outDir]   (end exclusive, 24 fps)
// or:    node render.js stills <t1,t2,...> [outDir]       (seconds -> PNG stills for review)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const stills = process.argv[2] === 'stills';
  const out = process.argv[4] || path.resolve(__dirname, 'build/frames');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.resolve(__dirname, 'scene.html'));
  await p.evaluate(() => document.fonts.ready);
  if (stills) {
    for (const t of process.argv[3].split(',').map(Number)) {
      await p.evaluate(t => render(t), t);
      await p.screenshot({ path: path.join(out, 't' + String(t).padStart(6, '0') + '.png') });
    }
  } else {
    const [s, e] = [+process.argv[2], +process.argv[3]];
    for (let fr = s; fr < e; fr++) {
      await p.evaluate(t => render(t), fr / 24);
      await p.screenshot({ path: path.join(out, String(fr).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    }
  }
  await b.close();
})();
