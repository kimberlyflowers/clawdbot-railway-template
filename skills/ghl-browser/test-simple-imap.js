const SimpleImapReader = require('./imap-simple-reader');

(async () => {
  try {
    console.log('Testing simplified IMAP reader...\n');
    const reader = new SimpleImapReader();
    const code = await reader.getLatestCode(30000);
    
    console.log(`\n✅ Success! Got code: ${code}`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
})();
