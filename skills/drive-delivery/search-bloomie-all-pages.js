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

async function listAllFilesWithPagination() {
  console.log('🔍 Searching Bloomie Deliveries folder (WITH PAGINATION)...\n');

  const accessToken = await getAccessToken();
  const allFiles = [];
  let pageToken = null;
  let pageNum = 0;

  try {
    while (true) {
      pageNum++;
      console.log(`📄 Fetching page ${pageNum}...`);

      const query = `'${FOLDER_ID}' in parents and trashed=false`;
      let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,webViewLink),nextPageToken&pageSize=100`;
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const files = data.files || [];
      
      allFiles.push(...files);
      console.log(`   ✓ Page ${pageNum}: ${files.length} files (total so far: ${allFiles.length})`);

      // Check for next page
      pageToken = data.nextPageToken;
      if (!pageToken) {
        console.log(`\n✓ Reached end of results (${pageNum} pages)\n`);
        break;
      }

      await new Promise(r => setTimeout(r, 200)); // Rate limit safety
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  // Display ALL files
  console.log('='.repeat(70));
  console.log(`📋 COMPLETE FILE LIST (${allFiles.length} total):`);
  console.log('='.repeat(70) + '\n');

  allFiles.forEach((file, i) => {
    const size = file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'unknown';
    const isHtml = file.name.endsWith('.html');
    const icon = isHtml ? '📄 HTML' : '📎';
    
    console.log(`${i + 1}. ${icon} ${file.name}`);
    console.log(`   Size: ${size} | Type: ${file.mimeType}`);
    if (isHtml) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
      console.log(`   Download: ${downloadUrl}`);
    }
    console.log();
  });

  // Find HTML files
  const htmlFiles = allFiles.filter(f => f.name.endsWith('.html'));
  
  console.log('='.repeat(70));
  console.log(`\n🎯 HTML FILES FOUND: ${htmlFiles.length}\n`);
  
  if (htmlFiles.length > 0) {
    htmlFiles.forEach(file => {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
      console.log(`📄 ${file.name}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Size: ${(file.size / 1024).toFixed(1)} KB`);
      console.log(`   Download: ${downloadUrl}\n`);
    });
  } else {
    console.log('❌ No HTML files found in folder');
    console.log(`\nTotal files in folder: ${allFiles.length}`);
  }

  return htmlFiles;
}

listAllFilesWithPagination();
