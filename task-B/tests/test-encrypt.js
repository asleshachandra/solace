const { encrypt } = require('../src/index');

(async () => {
  const plaintext = "hello solace team :)";
  const result = await encrypt(plaintext);

  console.log("Encrypted blob:");
  console.log("IV:", result.iv);
  console.log("Ciphertext:", result.ciphertext);
  console.log("Key:", result.key);
})();
