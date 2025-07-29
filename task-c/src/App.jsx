import { useState, useEffect, useRef } from "react";
import MicButton from "./components/MicButton";
import TranscriptView from "./components/TranscriptView";
import StatusToast from "./components/StatusToast";
import { recordUntilSilentInBrowser } from "./utils/recordUntilSilentInBrowser";
import { encryptBlob } from "./utils/encryption";
import { uploadBlob, downloadAndDecryptBlob } from "./utils/api";
import { transcribeAudio } from "./utils/whisper";
import { getChatResponse } from "./utils/chat";
import { synthesizeSpeech } from "./utils/polly";

export default function App() {
  const [status, setStatus] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [decryptedOutput, setDecryptedOutput] = useState("(awaiting output)");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [blobKey, setBlobKey] = useState(null);

  const [voice, setVoice] = useState("Joanna");
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const onAudioEnded = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStart = async () => {
    try {
      setStatus("Listening...");
      setIsRecording(true);

      const blob = await recordUntilSilentInBrowser();
      setRecordedBlob(blob);
      setStatus("Transcribing audio...");

      const transcription = await transcribeAudio(blob);
      setTranscript((prev) => [...prev, { role: "user", text: transcription }]);
      setStatus("Thinking...");

      const messages = [
        {
          role: "system",
          content: `
You are a supportive and empathetic therapist trained in psychiatric knowledge.
Respond briefly and focus on one question or point at a time to encourage dialogue.
Be warm and understanding, and avoid long lists or advice dumps.
`,
        },
        ...transcript.map((msg) => ({
          role: msg.role,
          content: msg.text || "",
        })),
        { role: "user", content: transcription },
      ];

      const response = await getChatResponse(messages);

      setTranscript((prev) => [...prev, { role: "assistant", text: response }]);
      setStatus(null);
      setIsRecording(false);

      const audioBlob = await synthesizeSpeech(response, voice);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error("Error:", err);
      setStatus("Recording, transcription, or chat failed.");
      setIsRecording(false);
    }
  };

  const handleStopUpload = async () => {
    if (!recordedBlob) {
      setStatus("No recording available to upload.");
      return;
    }
    try {
      setStatus("Encrypting...");
      const encrypted = await encryptBlob(recordedBlob);

      // Debug log to check encrypted data and types before upload
      console.log("Calling uploadBlob with:", {
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext,
        key: encrypted.key,
        ivType: typeof encrypted.iv,
        ciphertextType: typeof encrypted.ciphertext,
        keyType: typeof encrypted.key,
        isKeyString: typeof encrypted.key === "string",
      });

      setStatus("Uploading...");
      const key = await uploadBlob(encrypted);
      setBlobKey(key);

      setStatus("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("Upload failed.");
    }
  };

  const handleFetchDecrypt = async () => {
  if (!blobKey) {
    setStatus("No blob key available. Please upload first.");
    return;
  }
  try {
    console.log("DECRYPT DEBUG — blobKey:", blobKey); // debug blobKey
    setStatus("Fetching and decrypting...");
    const plaintext = await downloadAndDecryptBlob(blobKey);
    console.log("Decrypted plaintext:", plaintext); // DEBUG
    setDecryptedOutput(plaintext);
    setStatus(null);
  } catch (err) {
    console.error("Fetch/Decrypt error:", err);
    setStatus("Failed to fetch or decrypt.");
  }
};

  return (
    <div className="page-background p-6 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-6">Solace SDK Demo</h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-start",
          marginTop: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className="button"
          onClick={handleStart}
          disabled={isRecording || isPlaying}
        >
          {isRecording ? "Recording..." : "Start Recording"}
        </button>
        <button
          className="button"
          onClick={handleStopUpload}
          disabled={isRecording || isPlaying}
        >
          Stop & Upload
        </button>
        <button
          className="button"
          onClick={handleFetchDecrypt}
          disabled={isRecording || isPlaying}
        >
          Fetch & Decrypt
        </button>

        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          disabled={isRecording || isPlaying}
          style={{
            backgroundColor: "#1E2F27",
            color: "white",
            borderRadius: "6px",
            padding: "6px",
          }}
        >
          <option value="Joanna">Female Voice (Joanna)</option>
          <option value="Matthew">Male Voice (Matthew)</option>
        </select>

        {audioUrl && (
          <button
            className="button"
            onClick={togglePlayPause}
            style={{ minWidth: "90px" }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        )}
      </div>

      {status && <StatusToast message={status} />}

      <div
        style={{
          maxHeight: "320px",
          overflowY: "auto",
          marginTop: "1rem",
          padding: "0 10px",
        }}
      >
        <TranscriptView transcript={transcript} />
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={onAudioEnded}
        style={{ display: "none" }}
      />

      <div className="mt-8">
        <h2 className="font-bold text-lg mb-2">Decrypted Output</h2>
        <pre className="bg-[#1E2F27] p-4 rounded text-sm">{decryptedOutput}</pre>
      </div>
    </div>
  );
}
