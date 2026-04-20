const { chromium } = require('playwright');

const START_URL = process.env.ACTIVEPIECES_URL || process.argv[2];
const AUTH_FILE = process.env.AUTH_FILE || 'auth.json';

if (!START_URL) {
  console.error('Usage: ACTIVEPIECES_URL=https://your-activepieces-host node save-auth.js');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(START_URL, { waitUntil: 'domcontentloaded' });

  console.log('Complete login in the browser window, then press Enter here to save auth state.');

  process.stdin.setEncoding('utf8');
  process.stdin.resume();
  process.stdin.once('data', async () => {
    await context.storageState({ path: AUTH_FILE });
    await browser.close();
    console.log(`Saved auth state to ${AUTH_FILE}`);
    process.exit(0);
  });
})();
