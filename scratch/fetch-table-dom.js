const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to storybook WithColumnConfig...");
  await page.goto('http://localhost:4400/iframe.html?id=components-table--with-column-config&viewMode=story');
  
  console.log("Waiting for baps-table...");
  await page.waitForSelector('baps-table', { timeout: 10000 });
  
  await page.waitForTimeout(2000);
  
  console.log("Evaluating innerHTML...");
  const html = await page.evaluate(() => {
    const table = document.querySelector('baps-table');
    return table ? table.innerHTML : 'No table found';
  });
  
  fs.writeFileSync('scratch/table-dom.html', html);
  console.log("Saved to scratch/table-dom.html");
  
  await browser.close();
})();
