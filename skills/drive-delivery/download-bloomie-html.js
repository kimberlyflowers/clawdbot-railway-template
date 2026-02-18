const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const tokens = JSON.parse(fs.readFileSync('.drive-tokens.json', 'utf8'));

const FILE_ID = '1MqaU9LuofeFBie-ICeATgSK-s8qf7mot';
const OUTPUT_PATH = '/data/workspace/bloomie-sales-page.html';

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

async function downloadFile() {
  console.log('📥 Downloading Bloomie sales page HTML...\n');

  try {
    const accessToken = await getAccessToken();
    console.log('✓ Got access token');

    const url = `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media`;
    console.log(`Fetching: ${url}\n`);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const html = await response.text();
    fs.writeFileSync(OUTPUT_PATH, html);

    const sizeKb = (html.length / 1024).toFixed(1);
    console.log(`✓ Downloaded ${sizeKb} KB`);
    console.log(`✓ Saved to: ${OUTPUT_PATH}\n`);

    // Quick validation
    if (html.includes('<!DOCTYPE') || html.includes('<html')) {
      console.log('✅ Valid HTML file');
      
      // Count sections
      const sectionCount = (html.match(/<section|<div class="section/gi) || []).length;
      console.log(`📊 Sections found: ${sectionCount}`);
      
      return true;
    } else {
      console.log('⚠️ File may not be valid HTML');
      return false;
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

downloadFile();
