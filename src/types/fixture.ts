// src/types/fixture.ts
export interface Fixture {
    id: string;
    match_date: string;
    opponent: string;
    competition: string;
    location: string;
    is_home_game: boolean;
    home_score: number | null;
    away_score: number | null;
    status: string;
    ticket_link?: string; // Consistently optional
    notes?: string;
    opponent_logo_url?: string;
  }