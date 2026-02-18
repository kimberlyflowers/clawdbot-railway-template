const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  let browser, page;

  try {
    console.log('📥 Fetching bloomie-page-a-v16-carousel.html from Google Drive...\n');

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    // Search for the file in Google Drive
    console.log('Opening Google Drive...');
    await page.goto('https://drive.google.com/drive/folders/1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1?usp=sharing', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    console.log('Looking for bloomie-page-a-v16-carousel.html...');

    // Try to find the file link
    const fileLink = await page.locator('a, span').filter({ hasText: 'bloomie-page-a-v16-carousel' }).first();

    if (!fileLink) {
      throw new Error('File not found in folder');
    }

    console.log('✓ Found file');

    // Get the file URL and open it
    const fileUrl = await fileLink.getAttribute('href');
    console.log(`File URL: ${fileUrl}`);

    // Open the file to get download link
    await fileLink.click();
    await page.waitForTimeout(2000);

    // The file should open - we need to get its content
    // For HTML files, Google Drive may show it or we need the download URL
    console.log('Attempting to read HTML content...');

    // Try to get the page content
    const content = await page.content();

    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      const outputPath = '/tmp/bloomie-page-a-v16-carousel.html';
      fs.writeFileSync(outputPath, content);
      console.log(`✓ Saved to ${outputPath}`);
    } else {
      // If not direct HTML, try to find download button
      console.log('File opened in Drive viewer, attempting direct download...');
      
      // Download the file using the download attribute
      const downloadLink = page.locator('a[download], a[href*="download"]').first();
      if (downloadLink) {
        await downloadLink.click();
        await page.waitForTimeout(2000);
        console.log('✓ Download triggered');
      }
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
})();
