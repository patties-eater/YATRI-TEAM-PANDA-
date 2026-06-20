import { supabase } from '../lib/supabase';
import type { Cuisine, CuisineLocation } from '../cuisines';

// Shape returned by Supabase join query
type CuisineRow = Omit<Cuisine, 'locations'> & {
  cuisine_locations: CuisineLocation[];
};

function toModel(row: CuisineRow): Cuisine {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    diet: row.diet,
    tags: row.tags ?? [],
    accent: row.accent,
    emoji: row.emoji,
    image: row.image,
    locations: row.cuisine_locations ?? [],
  };
}

/** Fetch every cuisine with its locations. */
export async function fetchAllCuisines(): Promise<Cuisine[]> {
  const { data, error } = await supabase
    .from('cuisines')
    .select(`*, cuisine_locations(*)`)
    .order('name');

  if (error) throw new Error(error.message);
  return (data as CuisineRow[]).map(toModel);
}

/** Fetch a single cuisine by id. Returns null when not found. */
export async function fetchCuisineById(id: string): Promise<Cuisine | null> {
  const { data, error } = await supabase
    .from('cuisines')
    .select(`*, cuisine_locations(*)`)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return toModel(data as CuisineRow);
}

/** Fetch cuisines filtered by category or diet. */
export async function fetchCuisinesByFilter(opts: {
  category?: string;
  diet?: 'Veg' | 'Non Veg';
}): Promise<Cuisine[]> {
  let query = supabase
    .from('cuisines')
    .select(`*, cuisine_locations(*)`)
    .order('name');

  if (opts.category) query = query.eq('category', opts.category);
  if (opts.diet)     query = query.eq('diet', opts.diet);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as CuisineRow[]).map(toModel);
}
