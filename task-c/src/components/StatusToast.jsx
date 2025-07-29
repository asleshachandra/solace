export default function StatusToast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-mediumGray px-4 py-2 rounded-xl shadow border border-gray-300 text-sm">
      {message}
    </div>
  );
}
