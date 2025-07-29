export async function encryptBlob(blob) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    await blob.arrayBuffer()
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);

  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
    key: Array.from(new Uint8Array(exportedKey)),
  };
}

export async function decryptBlob({ iv, ciphertext, key }) {
  const importedKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(key),
    "AES-GCM",
    true,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    importedKey,
    new Uint8Array(ciphertext)
  );

  return new TextDecoder().decode(decrypted);
}
