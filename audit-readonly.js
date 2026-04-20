const { chromium } = require('playwright');

const START_URL = process.env.ACTIVEPIECES_URL || process.argv[2];
const AUTH_FILE = process.env.AUTH_FILE || 'auth.json';

if (!START_URL) {
  console.error('Usage: ACTIVEPIECES_URL=https://your-activepieces-host/path node audit-readonly.js');
  process.exit(1);
}

function installReadonlyGuard(context) {
  context.route('**/*', async (route) => {
    const method = route.request().method().toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return route.continue();
    }
    console.log(`Blocked ${method} ${route.request().url()}`);
    return route.abort('blockedbyclient');
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: AUTH_FILE,
    serviceWorkers: 'block',
  });
  await installReadonlyGuard(context);
  const page = await context.newPage();

  await page.goto(START_URL, { waitUntil: 'networkidle' });

  const title = await page.title();
  const url = page.url();
  console.log(`Opened read-only audit session: ${title} -> ${url}`);
  console.log('Mutating requests are blocked. Press Ctrl+C to end the session.');
})();
