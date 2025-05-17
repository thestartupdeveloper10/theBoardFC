import { useQuery } from '@tanstack/react-query';
import { playerApi, playerStatsApi, teamStatsApi, fixturesApi, newsApi } from './api';

// ----- Player Queries -----
export const usePlayers = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: playerApi.getAll,
  });
};

export const usePlayer = (id: string) => {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => playerApi.getById(id),
    enabled: !!id, // Only run if ID is provided
  });
};

// ----- Player Stats Queries -----
export const useAllPlayerStats = () => {
  return useQuery({
    queryKey: ['playerStats'],
    queryFn: playerStatsApi.getAll,
  });
};

export const usePlayerStats = (playerId: string, season?: string) => {
  return useQuery({
    queryKey: ['playerStats', playerId, season],
    queryFn: () => playerStatsApi.getByPlayerId(playerId, season),
    enabled: !!playerId, // Only run if player ID is provided
  });
};

export const usePlayerStat = (id: string) => {
  return useQuery({
    queryKey: ['playerStats', id],
    queryFn: () => playerStatsApi.getById(id),
    enabled: !!id, // Only run if ID is provided
  });
};

export const useSeasons = () => {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: playerStatsApi.getSeasons,
  });
};

// ----- Team Stats Queries -----
export const useTeamStats = () => {
  return useQuery({
    queryKey: ['teamStats'],
    queryFn: teamStatsApi.getAll,
  });
};

export const useTeamStat = (id: string) => {
  return useQuery({
    queryKey: ['teamStats', id],
    queryFn: () => teamStatsApi.getById(id),
    enabled: !!id, // Only run if ID is provided
  });
};

// ----- Fixtures Queries -----
export const useFixtures = () => {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: fixturesApi.getAll,
  });
};

export const useFixture = (id: string) => {
  return useQuery({
    queryKey: ['fixtures', id],
    queryFn: () => fixturesApi.getById(id),
    enabled: !!id, // Only run if ID is provided
  });
};

// ----- News Queries -----
export const useNewsArticles = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: newsApi.getAll,
  });
};

export const useNewsArticle = (id: string) => {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(id),
    enabled: !!id,
  });
}; 