// demo/test-upload-download.js
const { encrypt, decrypt, uploadBlob, downloadAndDecrypt } = require('../src/index');

// Mock in-memory blob store
const mockBlobStore = {};
const mockApiUrl = 'https://mock.api/secure-blob';

// Mocked POST (upload)
async function mockUpload(url, blob, config) {
  const blobKey = `blob-${Date.now()}`;
  mockBlobStore[blobKey] = blob;
  return { data: { blobKey } }; // MUST match expected shape
}

// Mocked GET (download)
async function mockDownload(blobKey) {
  if (!mockBlobStore[blobKey]) {
    throw new Error('Blob not found');
  }
  return { data: mockBlobStore[blobKey] };
}

// Override axios
const axios = require('axios');
axios.post = mockUpload;
axios.get = (url, config) => {
  const blobKey = url.split('/').pop();
  return mockDownload(blobKey);
};

(async () => {
  try {
    const message = 'Solace secure blob test!';
    const encrypted = await encrypt(message);

    console.log('\n--- Uploading Encrypted Blob ---');
    const blobKey = await uploadBlob(encrypted, mockApiUrl);
    console.log('Blob key:', blobKey);

    console.log('\n--- Downloading and Decrypting ---');
    const decrypted = await downloadAndDecrypt(blobKey, mockApiUrl, encrypted.key);
    console.log('Decrypted message:', decrypted);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
