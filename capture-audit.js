const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const START_URL = process.env.ACTIVEPIECES_URL || process.argv[2];
const AUTH_FILE = process.env.AUTH_FILE || 'auth.json';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'audit-output';

if (!START_URL) {
  console.error('Usage: ACTIVEPIECES_URL=https://your-activepieces-host/path node capture-audit.js');
  process.exit(1);
}

function installReadonlyGuard(page) {
  page.route('**/*', async (route) => {
    const method = route.request().method().toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return route.continue();
    }
    console.log(`Blocked ${method} ${route.request().url()}`);
    return route.abort('blockedbyclient');
  });
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: AUTH_FILE });
  const page = await context.newPage();

  await installReadonlyGuard(page);
  await page.goto(START_URL, { waitUntil: 'networkidle' });

  const screenshotPath = path.join(OUTPUT_DIR, 'page.png');
  const textPath = path.join(OUTPUT_DIR, 'page.txt');
  const text = await page.locator('body').innerText();

  await page.screenshot({ path: screenshotPath, fullPage: true });
  fs.writeFileSync(textPath, text, 'utf8');

  console.log(`Saved ${screenshotPath}`);
  console.log(`Saved ${textPath}`);

  await browser.close();
})();
