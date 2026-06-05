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
    ticket_link?: string;
    notes?: string;
    opponent_logo_url?: string;
    match_poster_url?: string | null;
    mvp_player_id?: string | null;
    mvp_note?: string | null;
  }
