# activepieces-readonly-audit

## Run

1. Install dependencies:
   `npm install`
2. Install Playwright browser:
   `npx playwright install chromium`
3. Save auth state:
   `ACTIVEPIECES_URL=https://your-activepieces-host node save-auth.js`
4. Start a read-only audit session:
   `ACTIVEPIECES_URL=https://your-activepieces-host/path node audit-readonly.js`
5. Capture screenshot and page text:
   `ACTIVEPIECES_URL=https://your-activepieces-host/path node capture-audit.js`

## Notes

- `save-auth.js` writes login state to `auth.json`
- `audit-readonly.js` blocks all mutating requests and allows only GET, HEAD, OPTIONS
- `capture-audit.js` writes `audit-output/page.png` and `audit-output/page.txt`
