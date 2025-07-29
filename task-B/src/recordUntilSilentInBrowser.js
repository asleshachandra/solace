export async function recordUntilSilentInBrowser(timeoutMs = 2000, silenceThreshold = 0.02) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  const data = new Uint8Array(analyser.fftSize);
  let silenceStart = null;

  source.connect(analyser);

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const fullBlob = new Blob(audioChunks, { type: 'audio/webm' });

      // Convert WebM to WAV for backend compatibility
      const arrayBuffer = await fullBlob.arrayBuffer();
      resolve(arrayBuffer);
    };

    function monitorSilence() {
      analyser.getByteTimeDomainData(data);
      const rms = Math.sqrt(data.reduce((sum, x) => {
        const norm = (x - 128) / 128;
        return sum + norm * norm;
      }, 0) / data.length);

      const now = Date.now();

      if (rms < silenceThreshold) {
        if (silenceStart === null) {
          silenceStart = now;
        } else if (now - silenceStart > timeoutMs) {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          return;
        }
      } else {
        silenceStart = null;
      }

      requestAnimationFrame(monitorSilence);
    }

    mediaRecorder.start();
    monitorSilence();
  });
}
