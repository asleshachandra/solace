export function recordInBrowser({ mimeType = 'audio/webm', maxDurationMs = 10000 } = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };

      recorder.start();

      // Auto-stop after maxDurationMs
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, maxDurationMs);
    } catch (err) {
      reject(err);
    }
  });
}
