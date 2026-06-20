
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

-- ── More dishes ─────────────────────────────────────────────────────────────
insert into public.cuisines (id, name, description, category, diet, tags, accent, emoji, image, sort_order) values
('17','Chow Mein','Stir-fried noodles tossed with vegetables, egg and tender strips of meat.','Street Food','Non Veg',array['Stir-fried','Popular'],'#C0622E','🍜','https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80',17),
('18','Laphing','Chilled, slippery mung-bean noodles drenched in fiery chilli sauce.','Street Food','Veg',array['Spicy','Cold'],'#B23A48','🌶️','https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',18),
('19','Chatpate','Puffed rice tossed with spices, lemon and crunchy bits — a tangy street snack.','Street Food','Veg',array['Spicy','Tangy'],'#D08C2A','🥗','https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80',19),
('20','Samay Baji','A ceremonial Newari platter of beaten rice, meat, egg, beans and pickles.','Main Course','Non Veg',array['Newari','Festive'],'#4A6FA5','🍱','https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80',20),
('21','Kheer','Slow-cooked creamy rice pudding scented with cardamom and nuts.','Dessert','Veg',array['Sweet','Creamy'],'#D9A441','🍚','https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=400&q=80',21),
('22','Sikarni','Thick spiced sweet yogurt whipped with dry fruits and cardamom.','Dessert','Veg',array['Sweet','Spiced'],'#C98A5E','🍨','https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=400&q=80',22),
('23','Sha Phaley','Crispy Tibetan bread pockets stuffed with seasoned minced meat.','Snack','Non Veg',array['Tibetan','Fried'],'#A85C32','🥟','https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80',23),
('24','Pulao','Aromatic spiced rice cooked with peas, nuts and warm whole spices.','Main Course','Veg',array['Aromatic','Festive'],'#C9A24B','🍛','https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80',24),
('25','Chukauni','Lalitpur-style potato salad folded into spiced creamy yogurt.','Side Dish','Veg',array['Tangy','Creamy'],'#B7A23E','🥔','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',25),
('26','Masala Chiya','Nepali spiced milk tea brewed with ginger, cardamom and cloves.','Snack','Veg',array['Warm','Spiced'],'#9C6B4E','🍵','https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=400&q=80',26),
('27','Khasi ko Masu','Slow-cooked goat curry in a rich, spicy Nepali gravy.','Curry','Non Veg',array['Spicy','Hearty'],'#8C3B2E','🍖','https://images.unsplash.com/photo-1631292784640-2b24be784d5d?auto=format&fit=crop&w=400&q=80',27),
('28','Sandheko Wai Wai','Crunchy instant noodles tossed raw with onion, chilli and lemon.','Street Food','Veg',array['Spicy','Quick'],'#C0622E','🍜','https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80',28),
('29','Bhatmas Sandeko','Spiced soybean salad tossed with onion, chilli, ginger and mustard oil.','Snack','Veg',array['Crunchy','Savory'],'#6E7F4E','🫘','https://images.unsplash.com/photo-1547928576-b822bc410bdf?auto=format&fit=crop&w=400&q=80',29),
('30','Phapar Roti','Rustic buckwheat pancake from the hills, served with chutney or honey.','Snack','Veg',array['Healthy','Rustic'],'#7A6A4F','🥞','https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80',30);

-- ── More locations (incl. new areas: Jhamsikhel, Lazimpat, Jawalakhel, Chabahil) ──
insert into public.cuisine_locations (id, cuisine_id, latitude, longitude, area) values
('17a','17',27.7154,85.3123,'Thamel'),
('17b','17',27.6766,85.3074,'Jhamsikhel'),
('18a','18',27.7215,85.3621,'Boudha'),
('18b','18',27.7172,85.3470,'Chabahil'),
('19a','19',27.7058,85.3138,'New Road'),
('19b','19',27.7088,85.3106,'Asan'),
('20a','20',27.6664,85.3247,'Patan'),
('20b','20',27.6710,85.4297,'Bhaktapur'),
('21a','21',27.7088,85.3106,'Asan'),
('21b','21',27.6730,85.3120,'Jawalakhel'),
('22a','22',27.6710,85.4297,'Bhaktapur'),
('22b','22',27.6766,85.3074,'Jhamsikhel'),
('23a','23',27.7215,85.3621,'Boudha'),
('23b','23',27.7245,85.3206,'Lazimpat'),
('24a','24',27.6922,85.3392,'Baneshwor'),
('24b','24',27.7245,85.3206,'Lazimpat'),
('25a','25',27.6664,85.3247,'Patan'),
('25b','25',27.6730,85.3120,'Jawalakhel'),
('26a','26',27.7154,85.3123,'Thamel'),
('26b','26',27.7245,85.3206,'Lazimpat'),
('27a','27',27.6922,85.3392,'Baneshwor'),
('27b','27',27.6766,85.3074,'Jhamsikhel'),
('28a','28',27.7058,85.3138,'New Road'),
('28b','28',27.7172,85.3470,'Chabahil'),
('29a','29',27.7088,85.3106,'Asan'),
('29b','29',27.6779,85.2795,'Kirtipur'),
('30a','30',27.6779,85.2795,'Kirtipur'),
('30b','30',27.6766,85.3074,'Jhamsikhel');

-- ── Real dish photos (Wikimedia Commons) — overrides generic stock images ────
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/a/a1/Momo_nepal.jpg' where id='1';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Dal_bhat.jpg/960px-Dal_bhat.jpg' where id='2';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/c/c0/Sel_Roti.jpg' where id='3';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/7/7f/Thukpa%2C_Tibetan_noodle_in_Osaka%2C_Japan.jpg' where id='4';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/e/e9/Meat_Chatamari.jpg' where id='5';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/e/e5/Yomari_double.jpg' where id='6';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/c/cd/Woh.jpg' where id='7';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/5/5f/Gundruk_NP.jpg' where id='8';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Kwati.jpg/960px-Kwati.jpg' where id='9';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Aalu_Bodi_Tama_3.jpg/960px-Aalu_Bodi_Tama_3.jpg' where id='10';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Sekuwa.jpg/960px-Sekuwa.jpg' where id='11';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/2/26/Choila.jpg' where id='12';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Sukuti.jpg/960px-Sukuti.jpg' where id='13';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/f/fe/Dhindo_by_Ganesh.jpeg' where id='14';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Juju_Dhau.jpg/960px-Juju_Dhau.jpg' where id='15';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Homemade_Chow_mein_with_shrimps_and_meat_with_a_choy_and_Choung.jpg/960px-Homemade_Chow_mein_with_shrimps_and_meat_with_a_choy_and_Choung.jpg' where id='17';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Laphing.jpg/960px-Laphing.jpg' where id='18';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Chatpate.jpg/960px-Chatpate.jpg' where id='19';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/4/46/Kheer.jpg' where id='21';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/d/dd/Afghan_Palo.jpg' where id='24';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Chukauni.jpg/960px-Chukauni.jpg' where id='25';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/8/89/Chai_In_Sakora.jpg' where id='26';
update public.cuisines set image='https://upload.wikimedia.org/wikipedia/commons/9/9f/Curry_Goat_and_Rice.jpg' where id='27';
