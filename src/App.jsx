import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './index.css';
import { supabase, clientId } from './supabase';
import { createRoom, joinRoom, fetchRoomData, leaveRoom } from './gameService';

function App() {
  const [appState, setAppState] = useState('landing'); // landing, lobby, game
  const [room, setRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!room?.id) return;

    // Fetch initial state perfectly
    const syncRoom = async () => {
      const updatedRoom = await fetchRoomData(room.id);
      if (updatedRoom) {
        setRoom(updatedRoom);
        if (updatedRoom.status === 'playing') setAppState('game');
      }
    };
    syncRoom();

    // Subscribe to room changes
    const roomSub = supabase
      .channel('room_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` }, (payload) => {
        setRoom(prev => ({ ...prev, ...payload.new }));
        if (payload.new.status === 'playing') {
          setAppState('game');
        }
      })
      .subscribe();

    // Subscribe to player changes
    const playerSub = supabase
      .channel('player_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` }, () => {
        syncRoom(); // Easiest way to keep players array sorted and complete
      })
      .subscribe();

    const handleBeforeUnload = () => {
      leaveRoom(room.id);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(playerSub);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [room?.id]);

  const handleJoin = async (action, username, roomId) => {
    setCurrentUser(username);
    setError(null);
    
    let response;
    if (action === 'create') {
      response = await createRoom(username);
      if (response.error) {
        setError(response.error);
      } else {
        setRoom(response.room);
        setAppState('lobby');
      }
    } else if (action === 'join') {
      response = await joinRoom(roomId, username);
      if (response.error) {
        setError(response.error);
      } else {
        setRoom(response.room);
        setAppState(response.room.status === 'playing' ? 'game' : 'lobby');
      }
    }
    return response;
  };

  return (
    <>
      {appState === 'landing' && <Landing onJoin={handleJoin} />}
      {appState === 'lobby' && room && <Lobby room={room} currentUser={currentUser} error={error} />}
      {appState === 'game' && room && <Game room={room} currentUser={currentUser} />}
    </>
  );
}

export default App;
