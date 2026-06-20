import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme';
import { useCuisines } from '../data/cuisines';
import type { Cuisine } from '../cuisines';

// ─── Places ──────────────────────────────────────────────────────────────────
type Place = {
  name: string;
  lat: number;
  lng: number;
  description: string;
  emoji: string;
  areaKeys: string[];
};

const PLACES: Place[] = [
  {
    name: 'Bhaktapur',
    lat: 27.6710, lng: 85.4297,
    description: 'Ancient Newari city famed for Juju Dhau, sel roti and kwati.',
    emoji: '🏛️',
    areaKeys: ['Bhaktapur'],
  },
  {
    name: 'Thamel',
    lat: 27.7154, lng: 85.3123,
    description: "Kathmandu's liveliest hub — steaming momos on every corner.",
    emoji: '🏘️',
    areaKeys: ['Thamel'],
  },
  {
    name: 'Patan',
    lat: 27.6664, lng: 85.3247,
    description: 'UNESCO heritage city with authentic Newari bara and chatamari.',
    emoji: '🕌',
    areaKeys: ['Patan', 'Patan Durbar'],
  },
  {
    name: 'Boudha',
    lat: 27.7215, lng: 85.3621,
    description: 'Tibetan quarter famous for hearty thukpa and butter tea.',
    emoji: '🔵',
    areaKeys: ['Boudha'],
  },
  {
    name: 'Asan Bazaar',
    lat: 27.7088, lng: 85.3106,
    description: 'Old Kathmandu market brimming with dal bhat and kwati stalls.',
    emoji: '🛒',
    areaKeys: ['Asan'],
  },
  {
    name: 'Kirtipur',
    lat: 27.6779, lng: 85.2795,
    description: 'Hilltop Newari town known for crispy sel roti and local snacks.',
    emoji: '⛰️',
    areaKeys: ['Kirtipur'],
  },
];

function cuisinesFor(place: Place, all: Cuisine[]) {
  return all.filter(c =>
    c.locations.some(l => place.areaKeys.includes(l.area))
  );
}

// Leaflet + OpenStreetMap preview (no API key). Interaction is disabled — the
// RN overlay on top intercepts taps to open the full map.
const MINI_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height:100%; margin:0; padding:0; background:#e8e4dd; }
  .pin { width:30px; height:30px; border-radius:15px; border:2.5px solid #fff;
         overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.35); background:#fff; }
  .pin img { width:100%; height:100%; object-fit:cover; display:block; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function post(o){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify(o)); } }
  var map = L.map('map', {
    zoomControl:false, attributionControl:false,
    dragging:false, scrollWheelZoom:false, doubleClickZoom:false,
    boxZoom:false, keyboard:false, tap:false, touchZoom:false
  }).setView([27.7172, 85.324], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);
  var foods = L.layerGroup().addTo(map);
  window.renderMarkers = function(list){
    foods.clearLayers();
    list.forEach(function(d){
      var icon = L.divIcon({
        className: '',
        html: '<div class="pin" style="border-color:'+d.accent+'"><img src="'+d.image+'"/></div>',
        iconSize: [30,30], iconAnchor: [15,15]
      });
      L.marker([d.lat, d.lng], { icon: icon }).addTo(foods);
    });
  };
  window.flyTo = function(lat,lng){ map.setView([lat,lng], 14, { animate:true }); };
  post({ type:'ready' });
</script>
</body>
</html>`;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { cuisines: CUISINES } = useCuisines();
  const webRef     = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [idx, setIdx] = useState(0);

  const FOOD_MARKERS = CUISINES.flatMap(c =>
    c.locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      accent: c.accent,
      image: c.image,
    })),
  );

  // Responsive map height — scales with the screen, clamped to sane bounds.
  const { height } = useWindowDimensions();
  const mapHeight = Math.round(Math.min(Math.max(height * 0.4, 240), 460));

  const run = (js: string) => webRef.current?.injectJavaScript(js + ';true;');

  // Draw all food markers once the map is ready AND data has loaded; re-runs
  // when the Supabase data arrives.
  useEffect(() => {
    if (!ready || FOOD_MARKERS.length === 0) return;
    run(`window.renderMarkers(${JSON.stringify(FOOD_MARKERS)})`);
    run(`window.flyTo(${PLACES[idx].lat},${PLACES[idx].lng})`);
  }, [ready, CUISINES.length]);

  function onMessage(e: WebViewMessageEvent) {
    try {
      if (JSON.parse(e.nativeEvent.data)?.type === 'ready') setReady(true);
    } catch {}
  }

  // Tap a place in the list to fly the map preview there.
  function selectPlace(i: number) {
    setIdx(i);
    run(`window.flyTo(${PLACES[i].lat},${PLACES[i].lng})`);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Local cuisine around Nepal</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => navigation.navigate('Cuisine')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Flexible body (map + card grow/shrink together) ── */}
      <View style={styles.body}>

      {/* ── Mini map ── */}
      <View style={[styles.mapWrap, { height: mapHeight }]}>
        <WebView
          ref={webRef}
          source={{ html: MINI_MAP_HTML }}
          style={styles.miniMap}
          originWhitelist={['*']}
          javaScriptEnabled
          scrollEnabled={false}
          onMessage={onMessage}
          pointerEvents="none"
        />
        {/* Tap overlay — intercepts all touches */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.9}
        >
          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={13} color="#fff" />
            <Text style={styles.expandText}>Open full map</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── All places, listed ── */}
      <ScrollView
        style={styles.placeListWrap}
        contentContainerStyle={styles.placeList}
        showsVerticalScrollIndicator={false}
      >
        {PLACES.map((p, i) => {
          const active = i === idx;
          const list = cuisinesFor(p, CUISINES);
          return (
            <TouchableOpacity
              key={p.name}
              style={[styles.placeCard, active && styles.placeCardActive]}
              onPress={() => selectPlace(i)}
              activeOpacity={0.7}
            >
              <View style={styles.placeCardHead}>
                <View style={styles.placeMetaCol}>
                  <Text style={styles.placeName}>{p.name}</Text>
                  <Text style={styles.placeCount}>
                    {list.length} {list.length === 1 ? 'dish' : 'dishes'}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={active ? colors.primary : colors.textMuted}
                />
              </View>
              <Text style={styles.placeDesc} numberOfLines={1}>{p.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      </View>{/* body */}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title:    { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  body: {
    flex: 1,
    paddingBottom: 12,
  },

  // Map
  mapWrap: {
    marginHorizontal: 16,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surface,
  },
  miniMap: { flex: 1 },
  expandHint: {
    position: 'absolute',
    bottom: 10, right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  expandText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  // Place list
  placeListWrap: { flex: 1, marginTop: 12 },
  placeList: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  placeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.surface,
    gap: 4,
  },
  placeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '0D',
  },
  placeCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  placeMetaCol: { flex: 1 },

  placeName: { fontSize: 16, fontWeight: '700', color: colors.text },
  placeCount: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  placeDesc: { fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
});
