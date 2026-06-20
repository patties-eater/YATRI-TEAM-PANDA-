-- ============================================================================
-- YATRI — Supabase schema + seed
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run: it drops and recreates the tables.
-- ============================================================================

drop table if exists public.cuisine_locations cascade;
drop table if exists public.cuisines cascade;

-- ── Dishes ──────────────────────────────────────────────────────────────────
create table public.cuisines (
  id          text primary key,
  name        text not null,
  description text not null,
  category    text not null,
  diet        text not null check (diet in ('Veg', 'Non Veg')),
  tags        text[] not null default '{}',
  accent      text not null,
  emoji       text not null,
  image       text not null,
  featured    boolean not null default false,
  sort_order  int not null default 0
);

-- ── Where to find each dish ─────────────────────────────────────────────────
create table public.cuisine_locations (
  id         text primary key,
  cuisine_id text not null references public.cuisines(id) on delete cascade,
  latitude   double precision not null,
  longitude  double precision not null,
  area       text not null
);

create index on public.cuisine_locations (cuisine_id);

-- ── Row Level Security: allow public (anon) read-only access ─────────────────
alter table public.cuisines          enable row level security;
alter table public.cuisine_locations enable row level security;

create policy "public read cuisines"
  on public.cuisines for select using (true);

create policy "public read cuisine_locations"
  on public.cuisine_locations for select using (true);

-- ── Seed: dishes ────────────────────────────────────────────────────────────
insert into public.cuisines (id, name, description, category, diet, tags, accent, emoji, image, sort_order) values
('1','Momo','Steamed or fried dumplings filled with spiced minced meat or vegetables.','Street Food','Non Veg',array['Spicy','Popular'],'#E07A5F','🥟','https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',1),
('2','Dal Bhat','The national dish — lentil soup served with steamed rice, vegetables and pickles.','Main Course','Veg',array['Vegetarian','Traditional'],'#F2CC8F','🍛','https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80',2),
('3','Sel Roti','Traditional homemade ring-shaped rice bread, crispy outside and soft inside.','Snack','Veg',array['Sweet','Festive'],'#C4813A','🍩','https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',3),
('4','Thukpa','Hearty noodle soup loaded with vegetables or meat, perfect for cold days.','Soup','Non Veg',array['Warm','Filling'],'#81B29A','🍜','https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80',4),
('5','Chatamari','Newari rice crepe topped with minced meat, egg and spices — the Nepali pizza.','Street Food','Non Veg',array['Savory','Newari'],'#3D405B','🫓','https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',5),
('6','Yomari','Sweet steamed dumplings made of rice flour with a chaku filling inside.','Dessert','Veg',array['Sweet','Newari'],'#9C6B4E','🍡','https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=400&q=80',6),
('7','Bara','Savory lentil patties, pan-fried and often topped with egg or minced meat.','Snack','Non Veg',array['Savory','Newari'],'#6B7F66','🫔','https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80',7),
('8','Gundruk','Fermented leafy green vegetable — a tangy Nepali superfood side dish.','Side Dish','Veg',array['Fermented','Traditional'],'#5C7A4E','🥬','https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',8),
('9','Kwati','Mixed bean soup with nine types of sprouted beans, rich in protein.','Soup','Veg',array['Protein','Festival'],'#7B5EA7','🫘','https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',9),
('10','Aloo Tama','Tangy curry made from bamboo shoots and potatoes — a Nepali comfort classic.','Curry','Veg',array['Tangy','Vegetarian'],'#D4A853','🥘','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',10),
('11','Sekuwa','Smoky charcoal-grilled meat marinated in Himalayan herbs and spices.','Street Food','Non Veg',array['Grilled','Smoky'],'#B5562E','🍢','https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80',11),
('12','Choila','Spicy Newari dish of flame-grilled buff tossed with mustard oil and chillies.','Snack','Non Veg',array['Spicy','Newari'],'#8C3B2E','🍖','https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?auto=format&fit=crop&w=400&q=80',12),
('13','Sukuti','Dried spiced meat jerky, stir-fried with onion, garlic and timur pepper.','Snack','Non Veg',array['Dried','Savory'],'#6E4630','🥩','https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=400&q=80',13),
('14','Dhido','Traditional thick buckwheat or millet porridge, eaten with curry and greens.','Main Course','Veg',array['Healthy','Traditional'],'#7A6A4F','🍲','https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80',14),
('15','Juju Dhau','The "king of yogurts" — rich, creamy sweet curd set in clay pots from Bhaktapur.','Dessert','Veg',array['Sweet','Creamy'],'#C9A24B','🍮','https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',15),
('16','Aloo Achar','Tangy cold potato salad tossed with sesame, lemon and fenugreek tempering.','Side Dish','Veg',array['Tangy','Refreshing'],'#9C8A3E','🥗','https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=400&q=80',16);

-- ── Seed: locations ─────────────────────────────────────────────────────────
insert into public.cuisine_locations (id, cuisine_id, latitude, longitude, area) values
('1a','1',27.7154,85.3123,'Thamel'),
('1b','1',27.7011,85.3079,'Freak Street'),
('1c','1',27.7215,85.3621,'Boudha'),
('2a','2',27.7088,85.3106,'Asan'),
('2b','2',27.6655,85.3249,'Patan'),
('2c','2',27.6922,85.3392,'Baneshwor'),
('3a','3',27.6710,85.4297,'Bhaktapur'),
('3b','3',27.6779,85.2795,'Kirtipur'),
('4a','4',27.7220,85.3630,'Boudha'),
('4b','4',27.7175,85.3140,'Thamel'),
('5a','5',27.6644,85.3220,'Patan Durbar'),
('5b','5',27.7044,85.3068,'Kathmandu Durbar'),
('6a','6',27.6688,85.3193,'Patan'),
('6b','6',27.6733,85.4308,'Bhaktapur'),
('7a','7',27.7058,85.3138,'New Road'),
('7b','7',27.6644,85.3247,'Patan'),
('8a','8',27.6843,85.3155,'Kalimati'),
('8b','8',27.7147,85.2904,'Swayambhu'),
('9a','9',27.6710,85.4297,'Bhaktapur'),
('9b','9',27.7090,85.3100,'Asan'),
('10a','10',27.6920,85.3390,'Baneshwor'),
('10b','10',27.7000,85.3340,'Putalisadak'),
('11a','11',27.6810,85.3210,'Bhotahiti'),
('11b','11',27.7142,85.3120,'Thamel'),
('12a','12',27.6644,85.3247,'Patan'),
('12b','12',27.6710,85.4297,'Bhaktapur'),
('13a','13',27.7058,85.3138,'New Road'),
('13b','13',27.7090,85.3100,'Asan'),
('14a','14',27.6779,85.2795,'Kirtipur'),
('14b','14',27.6843,85.3155,'Kalimati'),
('15a','15',27.6710,85.4297,'Bhaktapur'),
('15b','15',27.6733,85.4308,'Dattatreya'),
('16a','16',27.7088,85.3106,'Asan'),
('16b','16',27.6920,85.3390,'Baneshwor');
