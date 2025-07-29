Task B – Client SDK and Frontend Demo for Secure Audio Capture & Encryption

This project implements a secure client-side SDK and React frontend demo for capturing audio, detecting voice activity (VAD), encrypting audio blobs, and uploading/downloading encrypted data using the backend Lambda decryption service from Task A.

The frontend UI uses the company’s color scheme to maintain consistent branding and polished user experience.

Overview
- Captures audio from the user’s microphone with voice activity detection to automatically stop recording after silence
- Encrypts the recorded audio blob using AES-GCM with a secure symmetric key
- Uploads the encrypted blob to S3 via the Task A Lambda service
- Downloads and decrypts blobs from S3 for playback
- Provides visual feedback and status updates with carefully chosen colors matching Solace branding:
	- Primary brand green (#60BF88) for success messages and active states
	- Neutral grays for backgrounds and subtle UI elements
	- Clean white and off-white for backgrounds and containers to maintain minimalism
- Handles errors gracefully with clear user messaging and toast notifications

Setup Instructions

1. Prerequisites
- Node.js 16+ (preferably 18+ if possible)
- npm installed
- Task A backend deployed and its Lambda URL and bucket name available
- Modern browser with microphone permissions enabled

2. Installation
```
cd task-B
npm install
```

3. Running the Demo Locally
```
npm run dev
```
This will launch the React frontend locally (default http://localhost:3000) with live reload.

Testing Voice Activity Detection (VAD)
-Tests use a mocked VAD implementation for reliable CI execution
- The test file tests/vad.test.js verifies VAD correctly detects speech frames from a prerecorded WAV file in tests/assets/
- Run tests with:
```
npx mocha tests/vad.test.js --exit
```

File Structure Highlights
- src/recordUntilSilentInBrowser.js — Core audio capture with VAD and silence timeout logic
- src/api.js — Handles upload/download requests to Task A backend Lambda URL
- tests/vad.test.js — Voice activity detection unit test using prerecorded audio
- demo/ — Static demo assets and configuration

UX & Branding Notes
- Color palette strictly follows Solace brand guidelines for consistency and professional feel
- UI elements use the primary brand green (#60BF88) for recording status, success notifications, and active buttons
- Backgrounds use off-white and neutral grays for a clean, calming interface, reducing user fatigue
- Toast notifications and status messages appear briefly but clearly to keep users informed without clutter
- Audio recording icon animates smoothly to show live recording and stops on silence detection

Security Considerations
- Encryption is performed client-side before upload, ensuring data confidentiality
- Uses AES-GCM encryption with securely derived keys (per Task A backend design)
- Backend Lambda decrypt service is scoped with least privilege IAM policies
- CORS configured on Lambda URL to allow browser-based client requests only from authorized origins

Developer Notes
- This task deepened familiarity with browser MediaRecorder API, Web Crypto API, and AWS Lambda integration
- Emphasis on clean, modular code and testability through mocked VAD logic in test suite
- UI design balanced polish with minimalism to support Solace’s calming brand image
- Future improvements could include adding continuous streaming encryption and more robust audio format support
