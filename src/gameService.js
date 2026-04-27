import { supabase, clientId } from './supabase';

export const createRoom = async (username) => {
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Create room
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert([
      { id: roomId, host_id: clientId, settings: { mafias: 1, villagers: 3, doctors: 0, detectives: 0 }, status: 'lobby' }
    ])
    .select()
    .single();

  if (roomError) return { error: roomError.message };

  // Join player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .upsert([
      { id: clientId, room_id: roomId, username: username }
    ])
    .select()
    .single();

  if (playerError) return { error: playerError.message };

  return { success: true, room: { ...room, players: [player] } };
};

export const joinRoom = async (roomId, username) => {
  // Check if room exists and is in lobby
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (fetchError || !room) return { error: 'Room not found' };
  if (room.status !== 'lobby') return { error: 'Game already started' };

  // Check if username taken
  const { data: existingPlayers } = await supabase
    .from('players')
    .select('username')
    .eq('room_id', roomId);

  if (existingPlayers?.some(p => p.username === username)) {
    return { error: 'Username already taken' };
  }

  // Join player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .upsert([
      { id: clientId, room_id: roomId, username: username }
    ])
    .select()
    .single();

  if (playerError) return { error: playerError.message };

  return { success: true, room };
};

export const fetchRoomData = async (roomId) => {
  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
    
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomId);

  if (room && players) {
    return { ...room, players };
  }
  return null;
};

export const updateSettings = async (roomId, settings) => {
  await supabase
    .from('rooms')
    .update({ settings })
    .eq('id', roomId);
};

export const assignGod = async (roomId, targetId) => {
  // Clear previous god flag on players
  await supabase
    .from('players')
    .update({ is_god: false })
    .eq('room_id', roomId);

  if (targetId) {
    // Set new god
    await supabase
      .from('players')
      .update({ is_god: true })
      .eq('id', targetId);
  }

  // Update room
  await supabase
    .from('rooms')
    .update({ god_id: targetId })
    .eq('id', roomId);
};

export const startGame = async (roomId, settings, players, godId) => {
  const { mafias, villagers, doctors, detectives } = settings;
  const activePlayers = players.filter(p => p.id !== godId);

  const roles = [
    ...Array(mafias).fill('Mafia'),
    ...Array(villagers).fill('Villager'),
    ...Array(doctors).fill('Doctor'),
    ...Array(detectives).fill('Detective')
  ];

  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // Assign roles in DB
  const updatePromises = activePlayers.map((player, index) => 
    supabase.from('players').update({ role: roles[index] }).eq('id', player.id)
  );

  if (godId) {
    updatePromises.push(supabase.from('players').update({ role: 'God' }).eq('id', godId));
  }

  await Promise.all(updatePromises);

  // Update room status
  await supabase
    .from('rooms')
    .update({ status: 'playing' })
    .eq('id', roomId);
};

export const leaveRoom = async (roomId) => {
  await supabase.from('players').delete().eq('id', clientId);
};
