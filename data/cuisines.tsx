import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Cuisine } from '../cuisines';

type CuisinesContextValue = {
  cuisines: Cuisine[];
  loading: boolean;
  error: string | null;
  getCuisine: (id: string) => Cuisine | undefined;
  refetch: () => void;
};

const CuisinesContext = createContext<CuisinesContextValue | null>(null);

type Row = {
  id: string;
  name: string;
  description: string;
  category: string;
  diet: Cuisine['diet'];
  tags: string[] | null;
  accent: string;
  emoji: string;
  image: string;
  featured: boolean | null;
  origin_place: string | null;
  origin_culture: string | null;
  authenticity: Cuisine['authenticity'] | null;
  heritage: string | null;
  cuisine_locations:
    | { id: string; latitude: number; longitude: number; area: string }[]
    | null;
};

function mapRow(r: Row): Cuisine {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    diet: r.diet,
    tags: r.tags ?? [],
    accent: r.accent,
    emoji: r.emoji,
    image: r.image,
    featured: r.featured ?? false,
    originPlace: r.origin_place ?? undefined,
    originCulture: r.origin_culture ?? undefined,
    authenticity: r.authenticity ?? undefined,
    heritage: r.heritage ?? undefined,
    locations: (r.cuisine_locations ?? []).map(l => ({
      id: l.id,
      latitude: l.latitude,
      longitude: l.longitude,
      area: l.area,
    })),
  };
}

export function CuisinesProvider({ children }: { children: ReactNode }) {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('cuisines')
      .select(
        'id,name,description,category,diet,tags,accent,emoji,image,featured,' +
          'origin_place,origin_culture,authenticity,heritage,' +
          'cuisine_locations(id,latitude,longitude,area)',
      )
      .order('featured', { ascending: false })
      .order('sort_order', { ascending: true });

    if (err) {
      setError(err.message);
      setCuisines([]);
    } else {
      setCuisines((data as unknown as Row[]).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getCuisine = useCallback(
    (id: string) => cuisines.find(c => c.id === id),
    [cuisines],
  );

  return (
    <CuisinesContext.Provider
      value={{ cuisines, loading, error, getCuisine, refetch: load }}
    >
      {children}
    </CuisinesContext.Provider>
  );
}

export function useCuisines(): CuisinesContextValue {
  const ctx = useContext(CuisinesContext);
  if (!ctx) {
    throw new Error('useCuisines must be used inside a CuisinesProvider');
  }
  return ctx;
}
