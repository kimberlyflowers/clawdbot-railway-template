const fs = require('fs');
const { google } = require('googleapis');

async function uploadToGoogleDrive() {
  try {
    console.log('Loading config...');
    const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
    console.log('✓ Config loaded');
    
    console.log('Loading token...');
    const tokens = JSON.parse(fs.readFileSync(__dirname + '/.drive-tokens.json', 'utf8'));
    console.log('✓ Token loaded');
    
    const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, 'http://localhost:3000/oauth2callback');
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
    
    console.log('Creating Drive client...');
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    console.log('Uploading JADEN execution plan...');
    const res = await drive.files.create({
      requestBody: {
        name: 'JADEN-EXECUTION-PLAN-COMPLETE.md',
        mimeType: 'text/plain',
        parents: [config.folderId],
      },
      media: {
        mimeType: 'text/plain',
        body: fs.createReadStream('/tmp/JADEN-EXECUTION-PLAN-COMPLETE.md'),
      },
      fields: 'id, webViewLink, name',
    });
    
    console.log('\n✅ FILE UPLOADED SUCCESSFULLY!');
    console.log('   File Name:', res.data.name);
    console.log('   File ID:', res.data.id);
    console.log('   View Link: ' + res.data.webViewLink);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

uploadToGoogleDrive();
