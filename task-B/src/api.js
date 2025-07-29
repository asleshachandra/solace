const FUNCTION_URL = "https://hacjmskgnfhdnatfhsdq6iozee0ejkeb.lambda-url.us-east-1.on.aws/";
const BUCKET = "solace-decrypt-blob-bucket-3965c485";
const BLOB_KEY = "sample-encrypted-message"; // Shared key between upload and download

/**
 * Helper to convert Uint8Array to base64
 */
function toBase64(u8) {
  return btoa(String.fromCharCode(...u8));
}

/**
 * Uploads encrypted blob data to your backend.
 * @param {object} encrypted - The encrypted payload { iv, ciphertext, key }.
 */
export async function uploadBlob(encrypted) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobKey: BLOB_KEY,
      iv: toBase64(new Uint8Array(encrypted.iv)),
      ciphertext: toBase64(new Uint8Array(encrypted.ciphertext)),
      key: toBase64(new Uint8Array(encrypted.key)),
      bucket: BUCKET
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.statusText}\n${errorText}`);
  }

  return await res.text(); // Should return confirmation or echoed blobKey
}

/**
 * Downloads and decrypts the blob via your Lambda.
 */
export async function downloadAndDecryptBlob() {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobKey: BLOB_KEY,
      bucket: BUCKET
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Download failed: ${res.statusText}\n${errorText}`);
  }

  const result = await res.json();
  return result.plaintext;
}
