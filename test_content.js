import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/productions', { waitUntil: 'networkidle' });
  let html = await page.content();
  console.log("PRODUCTIONS CONTAINS Error:", html.includes("vite-error-overlay"));
  console.log("PRODUCTIONS CONTAINS Vite Error:", html.includes("Error:"));
  
  await browser.close();
})();
