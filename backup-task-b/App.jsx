import './fonts.css';
import React, { useState } from 'react';
import { recordUntilSilentInBrowser } from '../../src/recordUntilSilentInBrowser';
import { encryptBlob, decryptBlob } from './encryption';
import { uploadBlob, downloadAndDecryptBlob } from '../../src/api';

function App() {
  const [status, setStatus] = useState('Idle');
  const [output, setOutput] = useState('');
  const [recordingBlob, setRecordingBlob] = useState(null);

  const handleStartRecording = async () => {
    setStatus('Recording... Speak now. It will auto-stop after silence.');
    try {
      const blob = await recordUntilSilentInBrowser();
      setRecordingBlob(blob);
      setStatus('Recording complete. Ready to upload.');
    } catch (err) {
      console.error(err);
      setStatus('Error capturing audio.');
    }
  };

  const handleStopAndUpload = async () => {
    if (!recordingBlob) {
      setStatus('No recording available.');
      return;
    }

    setStatus('Encrypting audio...');
    try {
      console.log('[DEBUG] recordingBlob:', recordingBlob);
      const blobToEncrypt =
        recordingBlob instanceof Blob
          ? recordingBlob
          : new Blob([recordingBlob], { type: 'audio/webm' });

      const encrypted = await encryptBlob(blobToEncrypt);
      console.log('[DEBUG] Encrypted result:', encrypted);

      setStatus('Uploading to Task A backend...');
      await uploadBlob(encrypted);

      window.latestEncrypted = encrypted;
      localStorage.setItem('encryptedBlob', JSON.stringify(encrypted));

      setStatus('Upload successful. Ready to decrypt.');
    } catch (err) {
      console.error('Upload failed:', err);
      setStatus('Error during encryption or upload.');
    }
  };

  const handleFetchAndDecrypt = async () => {
    setStatus('Fetching and decrypting...');
    try {
      const plaintext = await downloadAndDecryptBlob();
      setOutput(plaintext);
      setStatus('Decryption successful.');
    } catch (err) {
      console.error('Decryption failed:', err);
      setStatus('Error during decryption.');
    }
  };

  return (
    <main
      style={{
        background: '#1A3A2D',
        minHeight: '100vh',
        padding: '3rem 2rem',
        color: '#F8F8F5',
        fontFamily: '"Inter", sans-serif',
        lineHeight: 1.6,
      }}
    >
      <h1
        style={{
          fontSize: '2.75rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
        }}
      >
        Solace SDK Demo
      </h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={handleStartRecording} style={buttonStyle}>
          Start Recording
        </button>{' '}
        <button onClick={handleStopAndUpload} style={buttonStyle}>
          Stop & Upload
        </button>{' '}
        <button onClick={handleFetchAndDecrypt} style={buttonStyle}>
          Fetch & Decrypt
        </button>
      </div>

      <p>
        <strong>Status:</strong> {status}
      </p>

      <h3 style={{ marginTop: '2rem' }}>Decrypted Output</h3>
      <pre>{output || '(awaiting output)'}</pre>
    </main>
  );
}

const buttonStyle = {
  background: '#F88379',
  color: '#1A3A2D',
  border: 'none',
  padding: '0.75rem 1.25rem',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '1rem',
  marginRight: '0.5rem',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  transition: 'opacity 0.2s ease-in-out',
};

export default App;
