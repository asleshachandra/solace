import { strict as assert } from 'assert';
import { encryptBlob, decryptBlob } from '../../src/encryption.js';

describe('Encryption Tests', function() {
  it('should encrypt and decrypt correctly', async function() {
    const plaintext = new Blob([new TextEncoder().encode("Hello Solace!")]);
    const encrypted = await encryptBlob(plaintext);

    const decryptedText = await decryptBlob({
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext,
      key: encrypted.key
    });

    assert.equal(decryptedText, "Hello Solace!");
  });
});
