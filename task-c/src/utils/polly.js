import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

// Initialize Polly client with credentials
const pollyClient = new PollyClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

/**
 * Synthesize speech from text using AWS Polly
 * @param {string} text - Text to convert to speech
 * @param {string} voiceId - Polly voice ID ('Joanna' or 'Matthew' for example)
 * @returns {Promise<Blob>} Audio Blob of synthesized speech
 */
export async function synthesizeSpeech(text, voiceId = "Joanna") {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: voiceId,
    LanguageCode: "en-US"  // ✅ Force English output
  });

  const response = await pollyClient.send(command);

  // Convert audio stream to Blob
  const audioChunks = [];
  const reader = response.AudioStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    audioChunks.push(value);
  }

  const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
  return audioBlob;
}
