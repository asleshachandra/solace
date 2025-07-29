import { encryptBlob, decryptBlob } from './src/utils/encryption.js';
import { uploadBlob, downloadAndDecryptBlob } from './src/utils/api.js';

async function test() {
  try {
    const message = "Hello, this is a test message!";
    const buffer = Buffer.from(message, "utf-8");

    console.log("Encrypting...");
    const encrypted = await encryptBlob(buffer);

    console.log("Uploading...");
    const blobKey = await uploadBlob(encrypted);
    console.log("Uploaded blobKey:", blobKey);

    console.log("Downloading and decrypting...");
    const decryptedMessage = await downloadAndDecryptBlob(blobKey);

    console.log("Decrypted message:", decryptedMessage); // should show [Simulated plaintext]

  } catch (err) {
    console.error("Error:", err);
  }
}

test();
