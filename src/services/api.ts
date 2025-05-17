import { supabase } from '@/lib/supabase';

// ----- Player API -----
export const playerApi = {
  // Get all players
  getAll: async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  // Get a single player by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Create a new player
  create: async (playerData: any) => {
    const { data, error } = await supabase
      .from('players')
      .insert(playerData)
      .select('id')
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Update an existing player
  update: async ({ id, ...playerData }: any) => {
    const { data, error } = await supabase
      .from('players')
      .update(playerData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Delete a player
  delete: async (id: string) => {
    // First delete player stats
    const { error: statsDeleteError } = await supabase
      .from('player_stats')
      .delete()
      .eq('player_id', id);
    
    if (statsDeleteError) throw statsDeleteError;
    
    // Then delete the player
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
};

// ----- Player Stats API -----
export const playerStatsApi = {
  // Get all stats
  getAll: async () => {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .order('season', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Get stats for a specific player
  getByPlayerId: async (playerId: string, season?: string) => {
    let query = supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', playerId);
    
    if (season && season !== 'all') {
      query = query.eq('season', season);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  // Get a single stat record by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Create a new stat record
  create: async (statData: any) => {
    const { data, error } = await supabase
      .from('player_stats')
      .insert(statData)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  // Update an existing stat record
  update: async ({ id, ...statData }: any) => {
    const { data, error } = await supabase
      .from('player_stats')
      .update(statData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Delete a stat record
  delete: async (id: string) => {
    const { error } = await supabase
      .from('player_stats')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  },
  
  // Get all unique seasons
  getSeasons: async () => {
    const { data, error } = await supabase
      .from('player_stats')
      .select('season')
      .order('season', { ascending: false });
    
    if (error) throw error;
    
    // Extract unique seasons
    const uniqueSeasons = [...new Set(data.map(item => item.season))];
    return uniqueSeasons;
  }
};

// ----- Team Stats API -----
export const teamStatsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('team_stats')
      .select('*')
      .order('season', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('team_stats')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (statData: any) => {
    const { data, error } = await supabase
      .from('team_stats')
      .insert(statData)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  update: async ({ id, ...statData }: any) => {
    const { data, error } = await supabase
      .from('team_stats')
      .update(statData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('team_stats')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
};

// ----- Fixtures API -----
export const fixturesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  create: async (fixtureData: any) => {
    const { data, error } = await supabase
      .from('fixtures')
      .insert(fixtureData)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  update: async ({ id, ...fixtureData }: any) => {
    const { data, error } = await supabase
      .from('fixtures')
      .update(fixtureData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('fixtures')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
};

// ----- News API -----
export const newsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('publish_date', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
}; 