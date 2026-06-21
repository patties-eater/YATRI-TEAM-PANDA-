
export type CuisineLocation = {
  id: string;
  latitude: number;
  longitude: number;
  area: string;
  isOrigin?: boolean;
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
  whyFamous?: string;
  story?: string;
  whereToFind?: string;
  locations: CuisineLocation[];
};
