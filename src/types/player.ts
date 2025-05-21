// src/types/player.ts
export interface Player {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    player_number: number | null; // Allow null instead of undefined
    position: string | null;
    birth_date: string | null;
    height: number | null;
    weight: number | null;
    bio: string | null;
    profile_image_url: string | null;
    joined_date: string | null;
    status: string;
    [key: string]: any; // To allow additional properties if needed
  }