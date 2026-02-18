const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKENS_FILE = path.join(__dirname, '.drive-tokens.json');
const FOLDER_ID = '1u4bjqh92rl9xJHC5vmP69fgDq_beNsF1';

async function listFilesInFolder() {
  console.log('📂 Listing files in Bloomie Deliveries folder...\n');

  try {
    // Load tokens
    if (!fs.existsSync(TOKENS_FILE)) {
      throw new Error(`Tokens file not found: ${TOKENS_FILE}`);
    }

    const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    console.log('✓ Loaded Drive tokens\n');

    // Create auth
    const oauth2Client = new google.auth.OAuth2(
      '1096434850659-8d4dqfhj9jqu8t9s6i6hpll5ucc3k3ul.apps.googleusercontent.com',
      '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',
      'http://localhost:3000/oauth2callback'
    );

    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    console.log(`Searching folder: ${FOLDER_ID}\n`);

    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, mimeType, size, webViewLink)',
      pageSize: 100,
    });

    const files = res.data.files || [];

    if (files.length === 0) {
      console.log('❌ No files found in folder');
      return;
    }

    console.log(`✓ Found ${files.length} files:\n`);

    files.forEach((file, i) => {
      const sizeKb = file.size ? (file.size / 1024).toFixed(1) : 'unknown';
      const isHtml = file.name.endsWith('.html');
      const marker = isHtml ? '📄 HTML' : '📎';
      console.log(`${i + 1}. ${marker} ${file.name}`);
      console.log(`   Size: ${sizeKb} KB | Type: ${file.mimeType}`);
      console.log(`   Link: ${file.webViewLink}\n`);
    });

    // Filter HTML files
    const htmlFiles = files.filter(f => f.name.endsWith('.html'));
    if (htmlFiles.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('🎯 HTML FILES FOUND:');
      console.log('='.repeat(60));
      htmlFiles.forEach(file => {
        console.log(`\n📄 ${file.name}`);
        console.log(`   ID: ${file.id}`);
        console.log(`   Size: ${(file.size / 1024).toFixed(1)} KB`);
        console.log(`   View: ${file.webViewLink}`);
        
        // Export URL for HTML
        const exportUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        console.log(`   Download: ${exportUrl}`);
      });
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

listFilesInFolder();
