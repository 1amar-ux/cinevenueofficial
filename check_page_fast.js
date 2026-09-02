import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Navigating...');
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 5000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
  console.log('Done.');
})();
