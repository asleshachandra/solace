// api.js

const UPLOAD_FUNCTION_URL = "https://hacjmskgnfhdnatfhsdq6iozee0ejkeb.lambda-url.us-east-1.on.aws/";
const DECRYPT_FUNCTION_URL = "https://ivs4zux6rw5qsov5xabfmxb7ky0mlsux.lambda-url.us-east-1.on.aws/";
const BUCKET = "solace-decrypt-blob-bucket-3965c485";

function toBase64(u8) {
  return btoa(String.fromCharCode(...u8));
}

export async function uploadBlob(encrypted) {
  console.log("UPLOAD DEBUG", "iv:", encrypted.iv, "ciphertext:", encrypted.ciphertext, "key:", encrypted.key);

  const res = await fetch(UPLOAD_FUNCTION_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobKey: null,
      iv: toBase64(new Uint8Array(encrypted.iv)),
      ciphertext: toBase64(new Uint8Array(encrypted.ciphertext)),
      key: encrypted.key, // placeholder key
      bucket: BUCKET,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.statusText}\n${errorText}`);
  }

  const result = await res.json();
  return result.blobKey || JSON.stringify(result);
}

export async function downloadAndDecryptBlob(blobKey) {
  const res = await fetch(DECRYPT_FUNCTION_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobKey,
      bucket: BUCKET,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Download failed: ${res.statusText}\n${errorText}`);
  }

  const result = await res.json();
  return result.plaintext; // should be [Simulated plaintext]
}
