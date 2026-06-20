
export type CuisineLocation = {
  id: string;
  latitude: number;
  longitude: number;
  area: string;
};

export type Diet = 'Veg' | 'Non Veg';

export type Authenticity = 'Indigenous' | 'Traditional' | 'Adopted';

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
  originPlace?: string;
  originCulture?: string;
  authenticity?: Authenticity;
  heritage?: string;
  locations: CuisineLocation[];
};
