const { decryptFromLambda } = require('../src/index');

const lambdaUrl = 'https://hacjmskgnfhdnatfhsdq6iozee0ejkeb.lambda-url.us-east-1.on.aws/';
const blobKey = 'sample-encrypted-message';

(async () => {
  try {
    const plaintext = await decryptFromLambda(blobKey, lambdaUrl);
    console.log('Decrypted message:', plaintext);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();