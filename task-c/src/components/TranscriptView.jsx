export default function TranscriptView({ transcript }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
        maxHeight: '100%',
        overflowY: 'auto',
        paddingRight: '8px',
      }}
    >
      {transcript.map((msg, index) => (
        <div
          key={index}
          style={{
            maxWidth: '75%',
            padding: '10px 15px',
            borderRadius: '12px',
            backgroundColor: msg.role === 'user' ? '#60BF88' : '#1E2F27',
            color: msg.role === 'user' ? 'white' : '#a5d6a7',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            boxShadow:
              msg.role === 'user'
                ? '0 2px 6px rgba(96, 191, 136, 0.5)'
                : '0 2px 6px rgba(30, 47, 39, 0.8)',
          }}
        >
          <strong>{msg.role === 'user' ? 'You:' : 'Therapist:'}</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}
