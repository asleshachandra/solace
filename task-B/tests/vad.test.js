describe('Mock Voice Activity Detection (VAD) test', () => {
  // Mock async iterable simulating speech frames
  async function* mockRecordAndDetectVoice() {
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 10)); // simulate async delay
      yield { frameId: i, speech: true };
    }
  }

  it('should detect speech frames using mocked VAD', async () => {
    const speechFrames = [];
    for await (const frame of mockRecordAndDetectVoice()) {
      speechFrames.push(frame);
    }
    if (speechFrames.length === 0) {
      throw new Error('No speech frames detected in mocked VAD!');
    }
  });
});
