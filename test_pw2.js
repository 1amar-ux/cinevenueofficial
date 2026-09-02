import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:3000/productions');
  await page.goto('http://localhost:3000/productions', { waitUntil: 'networkidle' }).catch(e => console.log("goto error:", e));
  
  console.log('Navigating to http://localhost:3000/admin-dashboard');
  await page.goto('http://localhost:3000/admin-dashboard', { waitUntil: 'networkidle' }).catch(e => console.log("goto error:", e));
  
  await browser.close();
})();
