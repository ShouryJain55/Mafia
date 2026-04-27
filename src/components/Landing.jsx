import React, { useState } from 'react';

const Landing = ({ onJoin }) => {
  const [step, setStep] = useState('initial'); // 'initial', 'create', 'join'
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await onJoin('create', username, null);
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await onJoin('join', username, roomId.toUpperCase());
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>MAFIA</h1>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

      {step === 'initial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => { setStep('create'); setError(''); }}>
            Create New Game
          </button>
          <button className="secondary" onClick={() => { setStep('join'); setError(''); }}>
            Join Game
          </button>
        </div>
      )}

      {step === 'create' && (
        <>
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="Enter your alias..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
            />
          </div>
          <button onClick={handleCreateRoom} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Game'}
          </button>
          <button className="secondary" onClick={() => { setStep('initial'); setError(''); }} disabled={isLoading} style={{ marginTop: '10px' }}>
            Back
          </button>
        </>
      )}

      {step === 'join' && (
        <>
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="Enter your alias..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
            />
          </div>
          <div className="input-group">
            <label>Room ID</label>
            <input
              type="text"
              placeholder="e.g. A1B2C3"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <button onClick={handleJoinRoom} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Game'}
          </button>
          <button className="secondary" onClick={() => { setStep('initial'); setError(''); }} disabled={isLoading} style={{ marginTop: '10px' }}>
            Back
          </button>
        </>
      )}
    </div>
  );
};

export default Landing;
