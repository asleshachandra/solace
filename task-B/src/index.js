// src/index.js
const axios = require('axios');

/**
 * Encrypts a plaintext string using AES-GCM.
 * Returns an object with base64-encoded IV, ciphertext, and the CryptoKey.
 */
async function encryptBlob(plaintext, key = null) {
  if (typeof plaintext !== 'string') {
    throw new Error('Plaintext must be a string');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const cryptoKey = key || await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  return {
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: Buffer.from(encrypted).toString('base64'),
    key: cryptoKey,
  };
}

/**
 * Decrypts an encrypted blob using the provided CryptoKey.
 */
async function decryptBlob({ iv, ciphertext }, key) {
  if (!iv || !ciphertext || !key) {
    throw new Error('iv, ciphertext, and key are required for decryption');
  }

  const ivBytes = Uint8Array.from(Buffer.from(iv, 'base64'));
  const encryptedBytes = Buffer.from(ciphertext, 'base64');

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    encryptedBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Calls a Lambda function that decrypts a blob stored in S3.
 * This is used for Task A integration.
 */
async function decryptFromLambda(blobKey, lambdaUrl) {
  if (!blobKey || !lambdaUrl) {
    throw new Error('Both blobKey and lambdaUrl must be provided');
  }

  try {
    const response = await axios.post(lambdaUrl, { blobKey }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data && response.data.plaintext) {
      return response.data.plaintext;
    } else {
      throw new Error('Decryption failed: Unexpected response format');
    }
  } catch (err) {
    throw new Error(`Decryption failed: ${err.message}`);
  }
}

/**
 * Uploads an encrypted blob to a backend. Expects a response with a blobKey.
 */
async function uploadBlob({ iv, ciphertext }, apiUrl, token = null) {
  if (!iv || !ciphertext || !apiUrl) {
    throw new Error('iv, ciphertext, and apiUrl are required');
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios.post(apiUrl, { iv, ciphertext }, { headers });

    if (!response.data || !response.data.blobKey) {
      throw new Error('Unexpected response format from upload API');
    }

    return response.data.blobKey;
  } catch (err) {
    throw new Error(`Upload failed: ${err.message}`);
  }
}

/**
 * Downloads an encrypted blob and decrypts it locally using the provided key.
 */
async function downloadAndDecrypt(blobKey, apiUrl, key, token = null) {
  if (!blobKey || !apiUrl || !key) {
    throw new Error('blobKey, apiUrl, and key are required');
  }

  try {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios.get(`${apiUrl}/${blobKey}`, { headers });

    const { iv, ciphertext } = response.data;
    if (!iv || !ciphertext) {
      throw new Error('Downloaded blob missing iv or ciphertext');
    }

    return await decryptBlob({ iv, ciphertext }, key);
  } catch (err) {
    throw new Error(`Download and decrypt failed: ${err.message}`);
  }
}

module.exports = {
  encrypt: encryptBlob,
  decrypt: decryptBlob,
  decryptFromLambda,
  uploadBlob,
  downloadAndDecrypt,
};
