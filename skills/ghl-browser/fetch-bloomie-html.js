const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('📥 Fetching Bloomie sales page HTML...\n');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();

  try {
    console.log('[1] Opening Bloomie Deliveries folder...');
    await page.goto('https://drive.google.com/drive/folders/1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('[2] Waiting for folder to load...');
    await page.waitForTimeout(3000);

    console.log('[3] Searching for bloomie-page-a-v16-carousel.html...');
    
    // Look for file links
    const files = await page.locator('[data-tooltip], [title]').all();
    console.log(`   Found ${files.length} items`);

    // Try to find and click the HTML file
    const htmlFile = await page.locator('text=/bloomie.*carousel|bloomie.*html/i').first();
    
    if (htmlFile) {
      console.log('✓ Found HTML file!');
      const href = await htmlFile.getAttribute('href');
      console.log(`   Link: ${href}`);
      
      // Extract file ID from href if present
      const match = href?.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        const fileId = match[1];
        console.log(`   File ID: ${fileId}`);
        
        // Use export URL to get HTML
        const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;
        console.log(`\n[4] Fetching via export URL...\n${exportUrl}\n`);
        
        await page.goto(exportUrl, { waitUntil: 'networkidle', timeout: 20000 });
        const html = await page.content();
        
        const outputPath = '/tmp/bloomie-sales-page.html';
        fs.writeFileSync(outputPath, html);
        console.log(`✓ Saved ${html.length} bytes to ${outputPath}`);
        
        process.exit(0);
      }
    } else {
      console.log('⚠️  HTML file not found via search');
      console.log('\n[3b] Listing all visible files...');
      const allText = await page.locator('body').innerText();
      console.log(allText.substring(0, 500));
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
