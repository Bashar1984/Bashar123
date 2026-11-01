const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, process.argv[2]||'swatch.html'));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.resolve(__dirname, process.argv[3]||'style-swatch-9x16.png') });
  await b.close();
})();
