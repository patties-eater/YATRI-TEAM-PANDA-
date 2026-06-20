export type CuisineLocation = {
  id: string;
  latitude: number;
  longitude: number;
  area: string;
};

export type Cuisine = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  accent: string;
  emoji: string;
  image: string;
  locations: CuisineLocation[];
};

const CUISINES: Cuisine[] = [
  {
    id: '1',
    name: 'Momo',
    description: 'Steamed or fried dumplings filled with spiced minced meat or vegetables.',
    category: 'Street Food',
    tags: ['Spicy', 'Popular'],
    accent: '#E07A5F',
    emoji: '🥟',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '1a', latitude: 27.7154, longitude: 85.3123, area: 'Thamel' },
      { id: '1b', latitude: 27.7011, longitude: 85.3079, area: 'Freak Street' },
      { id: '1c', latitude: 27.7215, longitude: 85.3621, area: 'Boudha' },
    ],
  },
  {
    id: '2',
    name: 'Dal Bhat',
    description: 'The national dish — lentil soup served with steamed rice, vegetables and pickles.',
    category: 'Main Course',
    tags: ['Vegetarian', 'Traditional'],
    accent: '#F2CC8F',
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '2a', latitude: 27.7088, longitude: 85.3106, area: 'Asan' },
      { id: '2b', latitude: 27.6655, longitude: 85.3249, area: 'Patan' },
      { id: '2c', latitude: 27.6922, longitude: 85.3392, area: 'Baneshwor' },
    ],
  },
  {
    id: '3',
    name: 'Sel Roti',
    description: 'Traditional homemade ring-shaped rice bread, crispy outside and soft inside.',
    category: 'Snack',
    tags: ['Sweet', 'Festive'],
    accent: '#C4813A',
    emoji: '🍩',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '3a', latitude: 27.6710, longitude: 85.4297, area: 'Bhaktapur' },
      { id: '3b', latitude: 27.6779, longitude: 85.2795, area: 'Kirtipur' },
    ],
  },
  {
    id: '4',
    name: 'Thukpa',
    description: 'Hearty noodle soup loaded with vegetables or meat, perfect for cold days.',
    category: 'Soup',
    tags: ['Warm', 'Filling'],
    accent: '#81B29A',
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '4a', latitude: 27.7220, longitude: 85.3630, area: 'Boudha' },
      { id: '4b', latitude: 27.7175, longitude: 85.3140, area: 'Thamel' },
    ],
  },
  {
    id: '5',
    name: 'Chatamari',
    description: 'Newari rice crepe topped with minced meat, egg and spices — the Nepali pizza.',
    category: 'Street Food',
    tags: ['Savory', 'Newari'],
    accent: '#3D405B',
    emoji: '🫓',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '5a', latitude: 27.6644, longitude: 85.3220, area: 'Patan Durbar' },
      { id: '5b', latitude: 27.7044, longitude: 85.3068, area: 'Kathmandu Durbar' },
    ],
  },
  {
    id: '6',
    name: 'Yomari',
    description: 'Sweet steamed dumplings made of rice flour with a chaku filling inside.',
    category: 'Dessert',
    tags: ['Sweet', 'Newari'],
    accent: '#9C6B4E',
    emoji: '🍡',
    image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '6a', latitude: 27.6688, longitude: 85.3193, area: 'Patan' },
      { id: '6b', latitude: 27.6733, longitude: 85.4308, area: 'Bhaktapur' },
    ],
  },
  {
    id: '7',
    name: 'Bara',
    description: 'Savory lentil patties, pan-fried and often topped with egg or minced meat.',
    category: 'Snack',
    tags: ['Savory', 'Newari'],
    accent: '#6B7F66',
    emoji: '🫔',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '7a', latitude: 27.7058, longitude: 85.3138, area: 'New Road' },
      { id: '7b', latitude: 27.6644, longitude: 85.3247, area: 'Patan' },
    ],
  },
  {
    id: '8',
    name: 'Gundruk',
    description: 'Fermented leafy green vegetable — a tangy Nepali superfood side dish.',
    category: 'Side Dish',
    tags: ['Fermented', 'Traditional'],
    accent: '#5C7A4E',
    emoji: '🥬',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '8a', latitude: 27.6843, longitude: 85.3155, area: 'Kalimati' },
      { id: '8b', latitude: 27.7147, longitude: 85.2904, area: 'Swayambhu' },
    ],
  },
  {
    id: '9',
    name: 'Kwati',
    description: 'Mixed bean soup with nine types of sprouted beans, rich in protein.',
    category: 'Soup',
    tags: ['Protein', 'Festival'],
    accent: '#7B5EA7',
    emoji: '🫘',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '9a', latitude: 27.6710, longitude: 85.4297, area: 'Bhaktapur' },
      { id: '9b', latitude: 27.7090, longitude: 85.3100, area: 'Asan' },
    ],
  },
  {
    id: '10',
    name: 'Aloo Tama',
    description: 'Tangy curry made from bamboo shoots and potatoes — a Nepali comfort classic.',
    category: 'Curry',
    tags: ['Tangy', 'Vegetarian'],
    accent: '#D4A853',
    emoji: '🥘',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
    locations: [
      { id: '10a', latitude: 27.6920, longitude: 85.3390, area: 'Baneshwor' },
      { id: '10b', latitude: 27.7000, longitude: 85.3340, area: 'Putalisadak' },
    ],
  },
];

export default CUISINES;

export function getCuisine(id: string): Cuisine | undefined {
  return CUISINES.find(c => c.id === id);
}
