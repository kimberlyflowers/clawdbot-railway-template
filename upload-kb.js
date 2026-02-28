const { uploadToDrive } = require('/data/workspace/data/skills/bloomie-drive-delivery/scripts/upload.js');

uploadToDrive(
  '/data/workspace/email-monitor/KB-GHL-EMAIL-SENDING.md',
  'GHL Email Sending - Complete Implementation Guide.md'
)
  .then(result => {
    console.log('✅ KB Document uploaded to Google Drive\n');
    console.log('📄 File Details:');
    console.log('   File ID: ' + result.fileId);
    console.log('   Direct Link: ' + result.url);
    console.log('   Web View: ' + result.webViewLink);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Upload failed:', err.message);
    process.exit(1);
  });
