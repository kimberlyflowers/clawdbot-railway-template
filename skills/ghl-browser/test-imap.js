const EmailReader = require('./email-reader');

(async () => {
  const reader = new EmailReader();
  
  try {
    console.log('Testing IMAP connection...\n');
    await reader.connect();
    console.log('\n✅ IMAP connection successful!');
    
    console.log('\nFetching latest GHL email...');
    const code = await reader.getLatestGHLEmail();
    
    console.log(`\n✅ Got code: ${code}`);
    
    await reader.disconnect();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
