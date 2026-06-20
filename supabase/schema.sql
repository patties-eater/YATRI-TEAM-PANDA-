-- ============================================================================
-- YATRI — Authentic Foods of Kathmandu Valley (10 dishes)
-- Run in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- After running, run `npm run rehost:images` to move images into Storage.
-- ============================================================================

drop table if exists public.cuisine_sources cascade;
drop table if exists public.cuisine_locations cascade;
drop table if exists public.cuisines cascade;

create table public.cuisines (
  id            text primary key,
  name          text not null,
  description   text not null,
  category      text not null,
  diet          text not null check (diet in ('Veg', 'Non Veg')),
  tags          text[] not null default '{}',
  accent        text not null,
  emoji         text not null,
  image         text not null,
  featured      boolean not null default false,
  sort_order    int not null default 0,
  origin_place  text,
  origin_culture text,
  authenticity  text check (authenticity in ('Indigenous','Traditional','Adopted')),
  heritage      text,
  why_famous    text,
  story         text,
  where_to_find text
);

create table public.cuisine_locations (
  id         text primary key,
  cuisine_id text not null references public.cuisines(id) on delete cascade,
  latitude   double precision not null,
  longitude  double precision not null,
  area       text not null,
  is_origin  boolean not null default false
);
create index on public.cuisine_locations (cuisine_id);

alter table public.cuisines          enable row level security;
alter table public.cuisine_locations enable row level security;
create policy "public read cuisines"          on public.cuisines          for select using (true);
create policy "public read cuisine_locations" on public.cuisine_locations for select using (true);

insert into public.cuisines
  (id, name, description, category, diet, tags, accent, emoji, image, featured, sort_order,
   origin_place, origin_culture, authenticity, heritage, why_famous, story, where_to_find) values
('1','Yomari','Steamed rice-flour dumpling filled with chaku (molasses) or khuwa.','Dessert','Veg',array['Sweet','Newari','Festive'],'#9C6B4E','🍡','https://upload.wikimedia.org/wikipedia/commons/e/e5/Yomari_double.jpg',true,1,
 'Bhaktapur & Patan','Newar','Indigenous','A Newar festival sweet prepared for generations during Yomari Punhi.',
 'Unique to the Newar community and prepared for centuries during winter festivals.',
 'Yomari is strongly associated with the Yomari Punhi harvest festival and symbolizes prosperity.',
 'Yomari Cafe Garden Restaurant; Bhaktapur Durbar Square area; traditional Newari eateries in Patan.'),

('2','Juju Dhau','Thick, creamy buffalo-milk yogurt set in clay pots — the "King of Yogurts".','Dessert','Veg',array['Sweet','Creamy','Newari'],'#C9A24B','🍮','https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Juju_Dhau.jpg/960px-Juju_Dhau.jpg',true,2,
 'Bhaktapur','Newar','Indigenous','Bhaktapur''s famed clay-pot yogurt since the Malla era.',
 'Famous for its thick, creamy texture made using buffalo milk in clay pots.',
 'Legend says Bhaktapur won a royal yogurt competition during the Malla era, earning the title ''King Yogurt''.',
 'Traditional Juju Dhau shops around Bhaktapur Durbar Square.'),

('3','Chatamari','Rice-flour crepe topped with minced meat, egg and spices — the "Newari Pizza".','Street Food','Non Veg',array['Savory','Newari'],'#3D405B','🫓','https://upload.wikimedia.org/wikipedia/commons/e/e9/Meat_Chatamari.jpg',false,3,
 'Kathmandu Valley','Newar','Indigenous','A centuries-old Newar rice crepe of the Valley.',
 'Represents centuries-old Newari culinary traditions.',
 'Often called the Newari Pizza, Chatamari is a rice-flour crepe that predates modern pizza culture in Nepal.',
 'Harati Newari Restaurant; Newa restaurants in Basantapur and Patan.'),

('4','Bara (Wo)','Traditional lentil pancake, high in protein, served at festivals.','Snack','Veg',array['Savory','Newari','Protein'],'#6B7F66','🫔','https://upload.wikimedia.org/wikipedia/commons/c/cd/Woh.jpg',false,4,
 'Kathmandu Valley','Newar','Indigenous','A festive Newar lentil patty served for generations.',
 'Famous for its simple ingredients and high protein content.',
 'A traditional lentil pancake served during festivals and family gatherings.',
 'Newari restaurants in Patan, Kirtipur and Basantapur.'),

('5','Choila','Smoky spiced grilled buffalo meat — a Newari classic.','Snack','Non Veg',array['Spicy','Smoky','Newari'],'#8C3B2E','🍖','https://upload.wikimedia.org/wikipedia/commons/2/26/Choila.jpg',false,5,
 'Kathmandu Valley','Newar','Indigenous','A smoky Newar grilled-meat delicacy of the Valley.',
 'Famous for its smoky flavour and traditional spice preparation.',
 'Choila originated among the Newars and was traditionally prepared by roasting meat over open fire.',
 'Honacha (Patan); Harati Newari Restaurant.'),

('6','Samay Baji','A ceremonial Newari platter of beaten rice, meat, egg, beans and pickles.','Main Course','Non Veg',array['Newari','Festive','Platter'],'#4A6FA5','🍱','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Samay_Baji_-_Newar_Culture.jpg/960px-Samay_Baji_-_Newar_Culture.jpg',true,6,
 'Kathmandu Valley','Newar','Indigenous','The ceremonial Newar platter at the heart of every Valley feast.',
 'Served in festivals, rituals and family ceremonies.',
 'Originally carried by Newari farmers as a practical meal while working in distant fields.',
 'Traditional Newari restaurants throughout Kathmandu Valley.'),

('7','Sapu Mhicha','Buffalo tripe pouch stuffed with bone marrow — a rare Newari delicacy.','Snack','Non Veg',array['Newari','Rare','Delicacy'],'#6E4630','🥟','https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Sapu_mhicha_leaf_tripe.jpg/960px-Sapu_mhicha_leaf_tripe.jpg',false,7,
 'Bhaktapur & Patan','Newar','Indigenous','A rare Newar offal delicacy showing zero-waste tradition.',
 'Demonstrates the Newari tradition of minimizing food waste.',
 'A rare delicacy made from buffalo tripe stuffed with bone marrow.',
 'Specialized Newari restaurants.'),

('8','Kachila','Ceremonial spiced minced raw buffalo meat, served at feasts.','Snack','Non Veg',array['Newari','Ceremonial','Raw'],'#A85C32','🥩','https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Lunch_Platter%2C_Nepali_Lunch%2C_La_Cocina_Food_Conference.jpg/960px-Lunch_Platter%2C_Nepali_Lunch%2C_La_Cocina_Food_Conference.jpg',false,8,
 'Kathmandu Valley','Newar','Indigenous','A ceremonial Newar raw-meat dish served at feasts.',
 'Famous for its distinctive preparation and cultural significance.',
 'A ceremonial minced buffalo meat dish often served during feasts.',
 'Authentic Newari eateries in Patan and Bhaktapur.'),

('9','Aloo Tama','Sour curry of potatoes and fermented bamboo shoots.','Curry','Veg',array['Tangy','Fermented','Traditional'],'#D4A853','🥘','https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Aalu_Bodi_Tama_3.jpg/960px-Aalu_Bodi_Tama_3.jpg',false,9,
 'Kathmandu Valley','Newar','Indigenous','A fermented bamboo-shoot curry rooted in Newar kitchens.',
 'Famous for its sour flavour and traditional preservation techniques.',
 'Combines potatoes and fermented bamboo shoots, reflecting Nepal''s ancient fermentation traditions.',
 'Traditional Nepali and Newari restaurants.'),

('10','Haku Choila','A darker, more traditional choila grilled over direct flame.','Snack','Non Veg',array['Smoky','Traditional','Newari'],'#5C4033','🔥','https://upload.wikimedia.org/wikipedia/commons/2/26/Choila.jpg',false,10,
 'Kathmandu Valley','Newar','Indigenous','The oldest, flame-charred form of Newar choila.',
 'Preserves older cooking methods used for generations.',
 'A darker, more traditional form of Choila prepared over direct flame.',
 'Traditional Newari eateries.');

insert into public.cuisine_locations (id, cuisine_id, latitude, longitude, area, is_origin) values
('1a','1',27.6722,85.4298,'Bhaktapur',true),
('1b','1',27.6726,85.3239,'Patan',false),
('2a','2',27.6722,85.4298,'Bhaktapur',true),
('2b','2',27.6716,85.4350,'Dattatreya',false),
('3a','3',27.7042,85.3070,'Basantapur',true),
('3b','3',27.6726,85.3239,'Patan',false),
('4a','4',27.6726,85.3239,'Patan',true),
('4b','4',27.6779,85.2795,'Kirtipur',false),
('5a','5',27.6733,85.3248,'Patan',true),
('5b','5',27.7042,85.3070,'Basantapur',false),
('6a','6',27.6726,85.3239,'Patan',true),
('6b','6',27.6722,85.4298,'Bhaktapur',false),
('7a','7',27.6722,85.4298,'Bhaktapur',true),
('7b','7',27.6726,85.3239,'Patan',false),
('8a','8',27.6726,85.3239,'Patan',true),
('8b','8',27.6722,85.4298,'Bhaktapur',false),
('9a','9',27.6726,85.3239,'Patan',true),
('9b','9',27.7042,85.3070,'Basantapur',false),
('10a','10',27.6733,85.3248,'Patan',true),
('10b','10',27.6779,85.2795,'Kirtipur',false);
