# 🍲 JoJo — Authentic Nepali Food Discovery

JoJo helps you discover the **authentic, origin foods of the Kathmandu Valley** — not just "popular" restaurants. Every dish shows where it truly comes from, its cultural story, and where to eat it, on an interactive map.

> _Taste Nepal. Discover Stories. Explore Safely._

Built with **Expo / React Native** and **Supabase**.

---

## ✨ Features

- **Home** — Valley places (Bhaktapur, Patan, Kathmandu, Kirtipur, Tokha) with a live food marquee and a mini-map preview.
- **Cuisine** — searchable dish list with Veg / Non-Veg / category filters.
- **Map** — OpenStreetMap (Leaflet, no API key) with food-photo pins, locate-me, shortest-path directions (OSRM) and Google-style live navigation.
- **Dish detail** — image, tags, "Why it's famous", short + full **story**, "Where to find it", and a **Listen** (text-to-speech) button.
- **Authenticity model** — each dish has a true `origin_place`, `origin_culture` and `authenticity` (Indigenous / Traditional / Adopted).
- **SOS** — emergency numbers + share-your-location.

---

## 🧱 Tech Stack

| Area | Tech |
|------|------|
| App | Expo SDK 56, React Native 0.85, TypeScript |
| Navigation | React Navigation (stack + bottom tabs) |
| Data | Supabase (PostgREST) |
| Maps | `react-native-webview` + Leaflet + OpenStreetMap |
| Location / Voice | `expo-location`, `expo-speech` |
| UI | `expo-linear-gradient`, `react-native-svg`, local images in `assets/images` |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment — create a .env file:
#    EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
#    EXPO_PUBLIC_SUPABASE_KEY=<your-anon/publishable key>

# 3. Set up the database
#    Open Supabase → SQL Editor → run the contents of supabase/schema.sql

# 4. Verify the data
npm run test:data        # → "Fetched 20 dishes from Supabase"

# 5. Run the app (clean cache)
npx expo start -c
```

Open in **Expo Go** (Android/iOS) or an emulator.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run android` / `ios` / `web` | Run on a target platform |
| `npm run test:data` | Check the Supabase connection + dish count |
| `npm run rehost:images` | Copy remote dish images into Supabase Storage (needs `SUPABASE_SERVICE_KEY`) |

---

## 📁 Structure

```
App.tsx                 # root: providers, font patch, splash
navigation/             # RootNavigator (stack) + TabNavigator
screens/                # Home, DetailsScreen (Cuisine), MapScreen, DishDetailScreen, PlaceScreen, SOSScreen
data/                   # CuisinesProvider (Supabase fetch) + dishImages map
components/             # SplashScreen, JoJoLogo, Notification, …
lib/supabase.ts         # Supabase client
cuisines.ts             # shared types
theme.ts                # colors, gradient, fonts
assets/images/          # local dish photos
supabase/schema.sql     # tables + seed data
scripts/                # test-supabase.mjs, rehost-images.mjs
```

---

## 🗄️ Data Model (Supabase)

- **`cuisines`** — `id, name, description, category, diet, tags[], accent, emoji, image, origin_place, origin_culture, authenticity, why_famous, story, story_long, where_to_find, featured, sort_order`
- **`cuisine_locations`** — `id, cuisine_id, latitude, longitude, area, is_origin`

`is_origin` marks each dish's true home place, which drives the Home grouping (one food → one place).

---

_Made for discovering Nepal's authentic flavours._ 🇳🇵
