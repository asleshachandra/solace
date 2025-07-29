export async function encryptBlob(buffer) {
  const iv = new Array(12).fill(0); // dummy IV
  const ciphertext = Array.from(new Uint8Array(buffer)); // raw bytes
  const key = "placeholder-encrypted-key"; // fixed placeholder

  return { iv, ciphertext, key };
}

export async function decryptBlob({ iv, ciphertext, key }) {
  return "[Simulated plaintext]";
}
