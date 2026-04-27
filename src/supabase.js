import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a random client ID to identify this specific browser session
export const getClientId = () => {
  let id = localStorage.getItem('mafia_client_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mafia_client_id', id);
  }
  return id;
};

export const clientId = getClientId();
