import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playerApi, playerStatsApi, teamStatsApi, fixturesApi } from './api';

// ----- Player Mutations -----
export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playerApi.create,
    onSuccess: () => {
      // Invalidate the players list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playerApi.update,
    onSuccess: (data) => {
      // Update both the list and the individual player in the cache
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['players', data.id] });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playerApi.delete,
    onSuccess: (playerId) => {
      // Update players list after deletion
      queryClient.invalidateQueries({ queryKey: ['players'] });
      // Remove this specific player from cache
      queryClient.removeQueries({ queryKey: ['players', playerId] });
      // Invalidate player stats as they've been deleted too
      queryClient.invalidateQueries({ queryKey: ['playerStats'] });
    },
  });
};

// ----- Player Stats Mutations -----
export const useCreatePlayerStat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playerStatsApi.create,
    onSuccess: (data) => {
      // Assuming data includes player_id
      queryClient.invalidateQueries({ queryKey: ['playerStats'] });
      queryClient.invalidateQueries({ queryKey: ['playerStats', data[0]?.player_id] });
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
    },
  });
};

export const useUpdatePlayerStat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playerStatsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playerStats'] });
      queryClient.invalidateQueries({ queryKey: ['playerStats', data.player_id] });
      queryClient.invalidateQueries({ queryKey: ['playerStats', data.id] });
    },
  });
};

export const useDeletePlayerStat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: playerStatsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerStats'] });
      // Note: We don't know which player_id this was for, so we invalidate all player stats
    },
  });
};

// ----- Team Stats Mutations -----
export const useCreateTeamStat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamStatsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamStats'] });
    },
  });
};

export const useUpdateTeamStat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamStatsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teamStats'] });
      // Check if data is an array and access the first item's id
      if (Array.isArray(data) && data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['teamStats', data[0].id] });
      } else if (data && 'id' in data) {
        // If it's a single object with an id
        queryClient.invalidateQueries({ queryKey: ['teamStats', data.id] });
      }
    },
  });
};

export const useDeleteTeamStat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teamStatsApi.delete,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['teamStats'] });
      queryClient.removeQueries({ queryKey: ['teamStats', id] });
    },
  });
};

// ----- Fixtures Mutations -----
export const useCreateFixture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fixturesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
    },
  });
};

export const useUpdateFixture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fixturesApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      // Check if data is an array and access the first item's id
      if (Array.isArray(data) && data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['fixtures', data[0].id] });
      } else if (data && 'id' in data) {
        // If it's a single object with an id
        queryClient.invalidateQueries({ queryKey: ['fixtures', data.id] });
      }
    },
  });
};

export const useDeleteFixture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fixturesApi.delete,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['fixtures'] });
      queryClient.removeQueries({ queryKey: ['fixtures', id] });
    },
  });
}; 