export type Difficulty = 'Easy' | 'Moderate' | 'Hard';

export type Trail = {
  id: string;
  name: string;
  region: string;
  difficulty: Difficulty;
  days: string;
  maxAltitude: string;
  description: string;
  porterPrice: string;
};

const TRAILS: Trail[] = [
  {
    id: 'ebc',
    name: 'Everest Base Camp',
    region: 'Khumbu, Nepal',
    difficulty: 'Hard',
    days: '12–14 days',
    maxAltitude: '5,364 m',
    description:
      'The Everest Base Camp trek is one of the world\'s most iconic mountain journeys. ' +
      'Winding through Sherpa villages, Buddhist monasteries, and dramatic Himalayan scenery, ' +
      'it culminates at the foot of the world\'s tallest peak at 5,364 m.',
    porterPrice: 'Porter from $25/day',
  },
  {
    id: 'abc',
    name: 'Annapurna Base Camp',
    region: 'Annapurna, Nepal',
    difficulty: 'Moderate',
    days: '7–10 days',
    maxAltitude: '4,130 m',
    description:
      'The Annapurna Base Camp trek offers stunning close-up views of the Annapurna massif. ' +
      'The trail passes through terraced fields, rhododendron forests, and traditional Gurung ' +
      'villages before reaching the high sanctuary.',
    porterPrice: 'Porter from $20/day',
  },
  {
    id: 'langtang',
    name: 'Langtang Valley',
    region: 'Langtang, Nepal',
    difficulty: 'Easy',
    days: '5–7 days',
    maxAltitude: '3,870 m',
    description:
      'The Langtang Valley trek is a hidden gem close to Kathmandu. It passes through lush ' +
      'forests, yak pastures, and traditional Tamang villages, offering a quieter alternative ' +
      'to the more popular Himalayan routes.',
    porterPrice: 'Porter from $15/day',
  },
];

export function getTrail(id: string): Trail | undefined {
  return TRAILS.find(t => t.id === id);
}

export default TRAILS;
