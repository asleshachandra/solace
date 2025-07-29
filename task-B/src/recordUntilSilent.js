import mic from 'mic';

export function recordUntilSilent(timeoutMs = 2000, silenceThreshold = 0.02) {
  return new Promise((resolve, reject) => {
    const micInstance = mic({
      rate: '16000',
      channels: '1',
      debug: false,
      exitOnSilence: 0,
      fileType: 'wav',
    });

    const micInputStream = micInstance.getAudioStream();
    const audioChunks = [];
    let lastHeard = Date.now();

    micInputStream.on('data', (data) => {
      audioChunks.push(data);

      const samples = [];
      for (let i = 0; i < data.length; i += 2) {
        const sample = data.readInt16LE(i) / 32768;
        samples.push(sample);
      }

      const avgVolume = samples.reduce((sum, s) => sum + Math.abs(s), 0) / samples.length;
      if (avgVolume > silenceThreshold) {
        lastHeard = Date.now();
      }

      if (Date.now() - lastHeard > timeoutMs) {
        micInstance.stop();
      }
    });

    micInputStream.on('error', reject);

    micInputStream.on('stopComplete', () => {
      resolve(Buffer.concat(audioChunks));
    });

    micInstance.start();
  });
}
