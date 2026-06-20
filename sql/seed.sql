-- ─── YATRI – Seed Data ────────────────────────────────────────────────────────
-- Run AFTER schema.sql.
-- Supabase Dashboard → SQL Editor → New Query → Run

-- ── Cuisines ──────────────────────────────────────────────────────────────────
INSERT INTO cuisines (id, name, description, category, diet, tags, accent, emoji, image) VALUES
  ('1',  'Momo',      'Steamed or fried dumplings filled with spiced minced meat or vegetables.',              'Street Food',  'Non Veg', ARRAY['Spicy','Popular'],         '#E07A5F', '🥟', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'),
  ('2',  'Dal Bhat',  'The national dish — lentil soup served with steamed rice, vegetables and pickles.',    'Main Course',  'Veg',     ARRAY['Vegetarian','Traditional'], '#F2CC8F', '🍛', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'),
  ('3',  'Sel Roti',  'Traditional homemade ring-shaped rice bread, crispy outside and soft inside.',         'Snack',        'Veg',     ARRAY['Sweet','Festive'],          '#C4813A', '🍩', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),
  ('4',  'Thukpa',    'Hearty noodle soup loaded with vegetables or meat, perfect for cold days.',            'Soup',         'Non Veg', ARRAY['Warm','Filling'],           '#81B29A', '🍜', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80'),
  ('5',  'Chatamari', 'Newari rice crepe topped with minced meat, egg and spices — the Nepali pizza.',       'Street Food',  'Non Veg', ARRAY['Savory','Newari'],          '#3D405B', '🫓', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80'),
  ('6',  'Yomari',    'Sweet steamed dumplings made of rice flour with a chaku filling inside.',              'Dessert',      'Veg',     ARRAY['Sweet','Newari'],           '#9C6B4E', '🍡', 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=400&q=80'),
  ('7',  'Bara',      'Savory lentil patties, pan-fried and often topped with egg or minced meat.',          'Snack',        'Non Veg', ARRAY['Savory','Newari'],          '#6B7F66', '🫔', 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80'),
  ('8',  'Gundruk',   'Fermented leafy green vegetable — a tangy Nepali superfood side dish.',               'Side Dish',    'Veg',     ARRAY['Fermented','Traditional'],  '#5C7A4E', '🥬', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'),
  ('9',  'Kwati',     'Mixed bean soup with nine types of sprouted beans, rich in protein.',                 'Soup',         'Veg',     ARRAY['Protein','Festival'],       '#7B5EA7', '🫘', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80'),
  ('10', 'Aloo Tama', 'Tangy curry made from bamboo shoots and potatoes — a Nepali comfort classic.',        'Curry',        'Veg',     ARRAY['Tangy','Vegetarian'],       '#D4A853', '🥘', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80'),
  ('11', 'Sekuwa',    'Smoky charcoal-grilled meat marinated in Himalayan herbs and spices.',                'Street Food',  'Non Veg', ARRAY['Grilled','Smoky'],          '#B5562E', '🍢', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80'),
  ('12', 'Choila',    'Spicy Newari dish of flame-grilled buff tossed with mustard oil and chillies.',       'Snack',        'Non Veg', ARRAY['Spicy','Newari'],           '#8C3B2E', '🍖', 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=400&q=80'),
  ('13', 'Sukuti',    'Dried spiced meat jerky, stir-fried with onion, garlic and timur pepper.',           'Snack',        'Non Veg', ARRAY['Dried','Savory'],           '#6E4630', '🥩', 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=400&q=80'),
  ('14', 'Dhido',     'Traditional thick buckwheat or millet porridge, eaten with curry and greens.',       'Main Course',  'Veg',     ARRAY['Healthy','Traditional'],    '#7A6A4F', '🍲', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80'),
  ('15', 'Juju Dhau', 'The "king of yogurts" — rich, creamy sweet curd set in clay pots from Bhaktapur.',  'Dessert',      'Veg',     ARRAY['Sweet','Creamy'],           '#C9A24B', '🍮', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80'),
  ('16', 'Aloo Achar','Tangy cold potato salad tossed with sesame, lemon and fenugreek tempering.',         'Side Dish',    'Veg',     ARRAY['Tangy','Refreshing'],       '#9C8A3E', '🥗', 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=400&q=80')
ON CONFLICT (id) DO NOTHING;

-- ── Cuisine Locations ─────────────────────────────────────────────────────────
INSERT INTO cuisine_locations (id, cuisine_id, latitude, longitude, area) VALUES
  -- Momo
  ('1a',  '1',  27.7154, 85.3123, 'Thamel'),
  ('1b',  '1',  27.7011, 85.3079, 'Freak Street'),
  ('1c',  '1',  27.7215, 85.3621, 'Boudha'),
  -- Dal Bhat
  ('2a',  '2',  27.7088, 85.3106, 'Asan'),
  ('2b',  '2',  27.6655, 85.3249, 'Patan'),
  ('2c',  '2',  27.6922, 85.3392, 'Baneshwor'),
  -- Sel Roti
  ('3a',  '3',  27.6710, 85.4297, 'Bhaktapur'),
  ('3b',  '3',  27.6779, 85.2795, 'Kirtipur'),
  -- Thukpa
  ('4a',  '4',  27.7220, 85.3630, 'Boudha'),
  ('4b',  '4',  27.7175, 85.3140, 'Thamel'),
  -- Chatamari
  ('5a',  '5',  27.6644, 85.3220, 'Patan Durbar'),
  ('5b',  '5',  27.7044, 85.3068, 'Kathmandu Durbar'),
  -- Yomari
  ('6a',  '6',  27.6688, 85.3193, 'Patan'),
  ('6b',  '6',  27.6733, 85.4308, 'Bhaktapur'),
  -- Bara
  ('7a',  '7',  27.7058, 85.3138, 'New Road'),
  ('7b',  '7',  27.6644, 85.3247, 'Patan'),
  -- Gundruk
  ('8a',  '8',  27.6843, 85.3155, 'Kalimati'),
  ('8b',  '8',  27.7147, 85.2904, 'Swayambhu'),
  -- Kwati
  ('9a',  '9',  27.6710, 85.4297, 'Bhaktapur'),
  ('9b',  '9',  27.7090, 85.3100, 'Asan'),
  -- Aloo Tama
  ('10a', '10', 27.6920, 85.3390, 'Baneshwor'),
  ('10b', '10', 27.7000, 85.3340, 'Putalisadak'),
  -- Sekuwa
  ('11a', '11', 27.6810, 85.3210, 'Bhotahiti'),
  ('11b', '11', 27.7142, 85.3120, 'Thamel'),
  -- Choila
  ('12a', '12', 27.6644, 85.3247, 'Patan'),
  ('12b', '12', 27.6710, 85.4297, 'Bhaktapur'),
  -- Sukuti
  ('13a', '13', 27.7058, 85.3138, 'New Road'),
  ('13b', '13', 27.7090, 85.3100, 'Asan'),
  -- Dhido
  ('14a', '14', 27.6779, 85.2795, 'Kirtipur'),
  ('14b', '14', 27.6843, 85.3155, 'Kalimati'),
  -- Juju Dhau
  ('15a', '15', 27.6710, 85.4297, 'Bhaktapur'),
  ('15b', '15', 27.6733, 85.4308, 'Dattatreya'),
  -- Aloo Achar
  ('16a', '16', 27.7088, 85.3106, 'Asan'),
  ('16b', '16', 27.6920, 85.3390, 'Baneshwor')
ON CONFLICT (id) DO NOTHING;
