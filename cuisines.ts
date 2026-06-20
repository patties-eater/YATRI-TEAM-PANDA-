// Data now lives in Supabase. These are just the shared types.
// Fetching is handled by the CuisinesProvider in data/cuisines.tsx.

export type CuisineLocation = {
  id: string;
  latitude: number;
  longitude: number;
  area: string;
};

export type Diet = 'Veg' | 'Non Veg';

export type Cuisine = {
  id: string;
  name: string;
  description: string;
  category: string;
  diet: Diet;
  tags: string[];
  accent: string;
  emoji: string;
  image: string;
  featured?: boolean;
  locations: CuisineLocation[];
};
