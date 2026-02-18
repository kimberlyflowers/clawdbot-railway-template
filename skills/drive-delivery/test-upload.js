const { uploadToDrive } = require('./scripts/upload.js');

async function uploadScreenshot() {
  try {
    console.log('📤 Uploading GHL login screenshot to Google Drive...\n');
    
    const result = await uploadToDrive(
      '/tmp/ghl-dashboard.png',
      'GHL-Login-POC-Screenshot-2FA.png'
    );

    console.log('✅ Upload successful!\n');
    console.log('File Details:');
    console.log(`  File ID: ${result.fileId}`);
    console.log(`  Filename: ${result.filename}`);
    console.log(`  MIME Type: ${result.mimeType}`);
    console.log('\n🔗 Shareable Links:');
    console.log(`  View Link: ${result.webViewLink}`);
    console.log(`  Direct Link: ${result.url}`);
    
    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadScreenshot();
