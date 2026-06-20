import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
        console.warn('[Cuisines] ⚠️ Supabase returned 0 rows — using hardcoded fallback');
      }
    } catch (e: any) {
      console.error('[Cuisines] ❌ Supabase error — using hardcoded fallback\n', e?.message);
      setError(e?.message ?? 'Could not fetch cuisines');
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
