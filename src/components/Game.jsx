import React from 'react';
import { clientId } from '../supabase';

const roleDetails = {
  Mafia: {
    desc: 'Eliminate the villagers without getting caught.',
    icon: '🔪'
  },
  Villager: {
    desc: 'Find the Mafia and vote them out during the day.',
    icon: '🧑‍🌾'
  },
  Doctor: {
    desc: 'Protect one person each night from being eliminated.',
    icon: '🛡️'
  },
  Detective: {
    desc: 'Investigate one person each night to discover if they are Mafia.',
    icon: '🕵️'
  },
  Joker: {
    desc: 'Your goal is to get yourself voted out during the day.',
    icon: '🤡'
  },
  Diva: {
    desc: 'You are a high-profile citizen. If you are eliminated, everyone will know your role.',
    icon: '✨'
  },
  Don: {
    desc: 'You are the head of the Mafia. Your identity cannot be discovered by the Detective.',
    icon: '🕴️'
  },
  God: {
    desc: 'You are the moderator. Guide the town through the day and night phases.',
    icon: '👁️'
  }
};

const Game = ({ room }) => {
  const myPlayer = room.players.find(p => p.id === clientId);
  const myRole = myPlayer?.role || 'Observer';
  const roleInfo = roleDetails[myRole] || { desc: 'Observe the game.', icon: '👀' };

  return (
    <div className="container game-container">
      <div className="role-reveal">
        <h2 style={{ color: '#a0aab2', fontSize: '1.5rem', marginBottom: '10px' }}>Your Role is</h2>
        <div style={{ fontSize: '5rem', marginBottom: '20px', animation: 'fadeIn 1s ease-out 0.5s both' }}>
          {roleInfo.icon}
        </div>
        <h1 className={`role-title role-${myRole}`}>
          {myRole}
        </h1>
        <p className="role-description" style={{ animation: 'fadeIn 1s ease-out 1s both' }}>
          {roleInfo.desc}
        </p>

        {myRole === 'God' && (
          <div className="god-dashboard" style={{ animation: 'fadeIn 1s ease-out 1.5s both' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>God's Dashboard (Secret)</h3>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {room.players.filter(p => !p.is_god).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '500' }}>{p.username}</td>
                    <td className={`role-${p.role}`} style={{ fontWeight: 'bold' }}>{p.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#a0aab2' }}>
              Guide the players through the phases. Only you can see this dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
