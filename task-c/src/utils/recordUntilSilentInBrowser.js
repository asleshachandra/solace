export async function recordUntilSilentInBrowser(silenceMs = 1000) {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      let silenceTimeout;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const data = new Uint8Array(analyser.fftSize);
      source.connect(analyser);

      const detectSilence = () => {
        analyser.getByteTimeDomainData(data);
        const silence = data.every((val) => Math.abs(val - 128) < 5);
        if (silence) {
          if (!silenceTimeout) {
            silenceTimeout = setTimeout(() => {
              mediaRecorder.stop();
              stream.getTracks().forEach((t) => t.stop());
            }, silenceMs);
          }
        } else {
          clearTimeout(silenceTimeout);
          silenceTimeout = null;
        }
        if (mediaRecorder.state === 'recording') {
          requestAnimationFrame(detectSilence);
        }
      };

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(blob);
      };

      mediaRecorder.start();
      detectSilence();
    } catch (err) {
      reject(err);
    }
  });
}
