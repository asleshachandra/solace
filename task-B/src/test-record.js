const fs = require('fs');
const path = require('path');
const { recordUntilSilent } = require('../src/recordUntilSilent');

(async () => {
  console.log('Recording... Speak now.');

  try {
    const buffer = await recordUntilSilent(2000, 0.02);
    const outputPath = path.join(__dirname, 'demo-output.wav');
    fs.writeFileSync(outputPath, buffer);
    console.log('Recording saved to demo-output.wav');
  } catch (err) {
    console.error('Error during recording:', err);
  }
})();
