// demo/test-roundtrip.js
const { encryptBlob, decryptBlob } = require('../src/index');

(async () => {
  try {
    const message = 'solace SDK test message';
    const encrypted = await encryptBlob(message);
    
    console.log('--- Encrypted ---');
    console.log('IV:', encrypted.iv);
    console.log('Ciphertext:', encrypted.ciphertext);

    const decrypted = await decryptBlob({
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext
    }, encrypted.key);

    console.log('\n--- Decrypted ---');
    console.log('Result:', decrypted);

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
