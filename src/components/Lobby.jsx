import React from 'react';
import { Users, Shield, Search, AlertTriangle, Smile, Sparkles, Briefcase } from 'lucide-react';
import { clientId } from '../supabase';
import { updateSettings, assignGod, startGame } from '../gameService';

const RoleControl = ({ label, icon: Icon, count, onUpdate, isHost }) => (
  <div className="setting-item">
    <label><Icon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> {label}</label>
    <div className="setting-controls">
      {isHost && <button onClick={() => onUpdate(count - 1)} disabled={count <= 0}>-</button>}
      <span>{count}</span>
      {isHost && <button onClick={() => onUpdate(count + 1)}>+</button>}
    </div>
  </div>
);

const Lobby = ({ room, error }) => {
  const isHost = room.host_id === clientId;

  const handleUpdateSetting = async (key, value) => {
    if (!isHost) return;
    const newSettings = { ...room.settings, [key]: value };
    await updateSettings(room.id, newSettings);
  };

  const handleAssignGod = async (targetId) => {
    if (!isHost) return;
    await assignGod(room.id, targetId);
  };

  const handleStartGame = async () => {
    if (!isHost) return;
    await startGame(room.id, room.settings, room.players, room.god_id);
  };

  const { mafias = 1, villagers = 3, doctors = 0, detectives = 0, jokers = 0, divas = 0, dons = 0 } = room.settings;
  const totalRoles = mafias + villagers + doctors + detectives + jokers + divas + dons;
  const activePlayersCount = room.players.filter(p => !p.is_god).length;
  const canStart = isHost && activePlayersCount === totalRoles;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="room-info">
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 500 }}>Room Code</h3>
        <div className="room-id">{room.id}</div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '15px', textAlign: 'center', background: 'rgba(255, 75, 75, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3>Players ({room.players.length})</h3>
          <ul className="player-list">
            {room.players.map(player => (
              <li key={player.id} className="player-card">
                <span style={{ fontWeight: player.id === clientId ? 'bold' : 'normal', flex: 1, color: player.id === clientId ? 'var(--accent)' : 'inherit' }}>
                  {player.username} {player.id === clientId && '(You)'}
                </span>
                {player.id === room.host_id && <span className="host-badge">HOST</span>}
                {player.is_god && <span className="god-badge">GOD</span>}
                
                {isHost && !player.is_god && player.id !== room.host_id && (
                   <button className="assign-god-btn" onClick={() => handleAssignGod(player.id)}>Make God</button>
                )}
                {isHost && player.is_god && (
                   <button className="assign-god-btn" onClick={() => handleAssignGod(null)}>Remove God</button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3>Role Distribution</h3>
          <div className="settings-grid">
            <RoleControl label="Mafia" icon={AlertTriangle} count={mafias} onUpdate={(val) => handleUpdateSetting('mafias', val)} isHost={isHost} />
            <RoleControl label="Villager" icon={Users} count={villagers} onUpdate={(val) => handleUpdateSetting('villagers', val)} isHost={isHost} />
            <RoleControl label="Doctor" icon={Shield} count={doctors} onUpdate={(val) => handleUpdateSetting('doctors', val)} isHost={isHost} />
            <RoleControl label="Detective" icon={Search} count={detectives} onUpdate={(val) => handleUpdateSetting('detectives', val)} isHost={isHost} />
            <RoleControl label="Joker" icon={Smile} count={jokers} onUpdate={(val) => handleUpdateSetting('jokers', val)} isHost={isHost} />
            <RoleControl label="Diva" icon={Sparkles} count={divas} onUpdate={(val) => handleUpdateSetting('divas', val)} isHost={isHost} />
            <RoleControl label="Don" icon={Briefcase} count={dons} onUpdate={(val) => handleUpdateSetting('dons', val)} isHost={isHost} />
          </div>

          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: activePlayersCount === totalRoles ? 'rgba(76, 209, 55, 0.1)' : 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#a0aab2' }}>Players requiring roles: {activePlayersCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#a0aab2' }}>Total roles configured: {totalRoles}</div>
            {activePlayersCount !== totalRoles && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>
                Match the roles count to the players count to start.
              </div>
            )}
          </div>

          {isHost ? (
            <button 
              onClick={handleStartGame} 
              disabled={!canStart}
              style={{ marginTop: '20px', opacity: canStart ? 1 : 0.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
            >
              Start Game
            </button>
          ) : (
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#a0aab2', padding: '14px' }}>
              Waiting for host to start...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
