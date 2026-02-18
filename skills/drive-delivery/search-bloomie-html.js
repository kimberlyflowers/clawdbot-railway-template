const fs = require('fs');
const path = require('path');

// Load config
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const tokens = JSON.parse(fs.readFileSync('.drive-tokens.json', 'utf8'));

const FOLDER_ID = '1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1';

async function getAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function listFilesInFolder() {
  console.log('🔍 Searching Bloomie Deliveries folder for HTML files...\n');

  try {
    const accessToken = await getAccessToken();
    console.log('✓ Got access token\n');

    const query = `'${FOLDER_ID}' in parents and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,webViewLink)&pageSize=100`;

    console.log(`Querying: ${url.substring(0, 80)}...\n`);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.files || [];

    console.log(`✓ Found ${files.length} total files:\n`);
    console.log('='.repeat(70));

    let htmlCount = 0;
    files.forEach((file, i) => {
      const size = file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'unknown';
      const isHtml = file.name.endsWith('.html');
      if (isHtml) htmlCount++;

      const icon = isHtml ? '📄' : '📎';
      console.log(`\n${i + 1}. ${icon} ${file.name}`);
      console.log(`   Size: ${size}`);
      console.log(`   Type: ${file.mimeType}`);
      console.log(`   View: ${file.webViewLink}`);

      if (isHtml) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        console.log(`   Download: ${downloadUrl}`);
      }
    });

    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Total HTML files: ${htmlCount}`);

    // Show HTML files specifically
    const htmlFiles = files.filter(f => f.name.endsWith('.html'));
    if (htmlFiles.length > 0) {
      console.log('\n🎯 HTML FILES (for you to grab):');
      htmlFiles.forEach(file => {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        console.log(`\n${file.name}`);
        console.log(`Download: ${downloadUrl}`);
      });
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

listFilesInFolder();
