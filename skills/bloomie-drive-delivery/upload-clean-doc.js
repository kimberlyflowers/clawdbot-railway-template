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
    
    console.log('Uploading JADEN Execution Plan (clean doc)...');
    const res = await drive.files.create({
      requestBody: {
        name: 'JADEN-Execution-Plan-Complete.txt',
        mimeType: 'text/plain',
        parents: [config.folderId],
      },
      media: {
        mimeType: 'text/plain',
        body: fs.createReadStream('/tmp/JADEN-EXECUTION-PLAN-DOC.txt'),
      },
      fields: 'id, webViewLink, name, mimeType, createdTime',
    });
    
    console.log('\n================================================================================');
    console.log('✅ EXECUTION PLAN UPLOADED TO GOOGLE DRIVE');
    console.log('================================================================================');
    console.log('File Name: ' + res.data.name);
    console.log('File ID: ' + res.data.id);
    console.log('Created: ' + res.data.createdTime);
    console.log('View Link: ' + res.data.webViewLink);
    console.log('================================================================================\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

uploadToGoogleDrive();
