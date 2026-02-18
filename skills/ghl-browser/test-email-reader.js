const BrowserEmailReader = require('./email-reader-browser');

(async () => {
  const reader = new BrowserEmailReader();
  
  try {
    console.log('Testing browser-based email reader...\n');
    const code = await reader.getLatestCodeFromYahoo();
    
    console.log('\n✅ Success!');
    console.log(`Code: ${code}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await reader.disconnect();
  }
})();
