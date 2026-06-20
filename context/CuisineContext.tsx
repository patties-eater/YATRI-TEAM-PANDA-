import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import type { Cuisine } from '../cuisines';
import FALLBACK_CUISINES from '../cuisines';
import { fetchAllCuisines } from '../services/cuisineService';

type CuisineContextValue = {
  cuisines: Cuisine[];
  loading: boolean;
  error: string | null;
  getCuisineById: (id: string) => Cuisine | undefined;
  refresh: () => void;
};

const CuisineContext = createContext<CuisineContextValue>({
  cuisines: FALLBACK_CUISINES,
  loading: false,
  error: null,
  getCuisineById: (id) => FALLBACK_CUISINES.find(c => c.id === id),
  refresh: () => {},
});

export function CuisineProvider({ children }: { children: ReactNode }) {
  const [cuisines, setCuisines] = useState<Cuisine[]>(FALLBACK_CUISINES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCuisines();
      if (data.length > 0) {
        console.log(`[Cuisines] ✅ Supabase — ${data.length} dishes loaded`);
        setCuisines(data);
      } else {
        Alert.alert('Supabase', '⚠️ Connected but 0 rows returned. Check seed.sql was run.');
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Unknown error';
      console.error('[Cuisines] ❌', msg);
      Alert.alert('Supabase Error', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <CuisineContext.Provider
      value={{
        cuisines,
        loading,
        error,
        getCuisineById: (id) => cuisines.find(c => c.id === id),
        refresh: load,
      }}
    >
      {children}
    </CuisineContext.Provider>
  );
}

export const useCuisines = () => useContext(CuisineContext);
