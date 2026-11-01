const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(__dirname, 'swatch.html'));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.resolve(__dirname, 'style-swatch-9x16.png') });
  await b.close();
})();
