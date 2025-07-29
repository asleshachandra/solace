export default function MicButton({ isRecording, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full p-6 text-white shadow-lg transition-all duration-300
        ${isRecording ? 'bg-solaceGreen animate-pulse' : 'bg-gray-400 hover:bg-solaceGreen'}`}
    >
      🎙️
    </button>
  );
}
