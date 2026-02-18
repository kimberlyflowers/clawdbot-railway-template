const { uploadToDrive } = require('./scripts/upload.js');

async function uploadScreenshot() {
  try {
    console.log('📤 Uploading 2FA screen...\n');
    
    const result = await uploadToDrive(
      '/tmp/ghl-browser-state/2fa-screen.png',
      'GHL-2FA-Screen-VerifyCode.png'
    );

    console.log('✅ Upload successful!\n');
    console.log('🔗 View: ' + result.webViewLink + '\n');
    
    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadScreenshot();
