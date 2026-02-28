const { uploadToDrive } = require('/data/workspace/data/skills/bloomie-drive-delivery/scripts/upload.js');

uploadToDrive(
  '/data/workspace/KB-STATUS-REPORT.html',
  'KB-STATUS-REPORT.html'
)
  .then(result => {
    console.log('✅ Report uploaded to Google Drive\n');
    console.log('File: KB-STATUS-REPORT.html');
    console.log('Link:', result.url);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Upload failed:', err.message);
    process.exit(1);
  });
