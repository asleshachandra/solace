ask C – Solace Lite End-to-End Demo

This project prototypes a minimal voice-to-voice companion demo integrating secure audio capture, basic encryption, backend upload/download, ASR, chatbot, and TTS features.

Overview

- Captures microphone input in the browser using Web Audio API
- Implements voice activity detection (VAD) using the SDK from Task B
- Encrypts audio blobs client-side before upload
- Uploads encrypted blobs to AWS via the Task A Lambda backend
- Downloads and decrypts blobs for playback (currently returns placeholder “\[Simulated plaintext]” due to backend limitations)
- Uses OpenAI GPT for chatbot interaction (basic integration)
- Synthesizes responses via AWS Polly with two selectable voices (“Man” and “Woman”)
- Basic UI with buttons and dropdown for voice selection
- Displays transcription and chatbot text response
- Includes simple error handling and user feedback

Setup Instructions

1. Prerequisites
- Node.js (>=16.x)
- npm or yarn
- Access to Task A Lambda URLs and S3 bucket (configured in `.env`)
- Microphone access in browser
- OpenAI and AWS credentials configured in environment variables

2. Installation

```
cd task-C
npm install
```

Running Locally

```
npm run dev
```

This launches the React app locally (default: [http://localhost:3000](http://localhost:3000)) with live reload.

Progress and Current Status

- Audio Capture and VAD working reliably with automatic stop on silence detection
- Encryption & Upload fully functional with AWS Lambda backend
- Download & Decryption currently returns placeholder “\[Simulated plaintext]” due to backend cryptography issues (to be fixed)
- Basic GPT chatbot integration functional, full conversational memory pending
- AWS Polly TTS integration with selectable “Man” and “Woman” voices
- Minimal, clean UI consistent with Solace branding:
  - Primary brand green (#60BF88) for interactive elements
  - Neutral grays and off-white backgrounds for calm experience
  - Voice options named for friendliness and personality

Known Issues and Next Steps
- Backend Lambda decryption returns placeholder text due to cryptography runtime and base64 padding errors
- Planning to rebuild Lambda deployment package to resolve native dependency errors
- Debug and fix encryption key management and base64 encoding issues
- Implement encrypted localStorage conversational memory layer (optional)
- Add UI polish: loading indicators, error toasts, accessibility improvements
- Add automated unit and integration tests
- Finalize deployment environment and secure credentials

Developer Notes

- Integration task emphasizing frontend capture, encryption, AWS Lambda backend, and AI APIs
- UI design prioritizes simplicity and brand consistency
- Error handling aims to be user-friendly without overwhelming
- AES-GCM 256 encryption performed client-side, aligned with Task A design
- AWS IAM policies scoped for least privilege and security compliance
