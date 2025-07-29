// demo/app.js

const readline = require("readline");
const { encrypt, decrypt } = require("../src/index");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter a message to encrypt: ", async (message) => {
  try {
    const encrypted = await encrypt(message);

    console.log("\n--- Encrypted ---");
    console.log("IV:", encrypted.iv);
    console.log("Ciphertext:", encrypted.ciphertext);
    console.log("Key:", encrypted.key);

    const decrypted = await decrypt(encrypted);

    console.log("\n--- Decrypted ---");
    console.log("Result:", decrypted);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
  }
});
