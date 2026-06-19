import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme';
import CUISINES from '../cuisines';

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

function cuisinesFor(place: Place) {
  return CUISINES.filter(c =>
    c.locations.some(l => place.areaKeys.includes(l.area))
  );
}

// ─── Mini-map HTML (built once, all markers, pan via injection) ───────────────
const ALL_MARKERS = JSON.stringify(
  CUISINES.flatMap(c =>
    c.locations.map(l => ({
      lat:    l.latitude,
      lng:    l.longitude,
      emoji:  c.emoji,
      accent: c.accent,
    }))
  )
);

const MINI_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body,#map{width:100%;height:100%;}
    .leaflet-control-attribution,.leaflet-control-zoom{display:none!important;}
  </style>
</head>
<body><div id="map"></div>
<script>
  var map=L.map('map',{zoomControl:false,attributionControl:false,
    dragging:false,scrollWheelZoom:false,doubleClickZoom:false,
    boxZoom:false,keyboard:false,tap:false})
    .setView([${PLACES[0].lat},${PLACES[0].lng}],15);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
    maxZoom:19,
    attribution:'&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);

  var markers=${ALL_MARKERS};
  markers.forEach(function(m){
    var icon=L.divIcon({
      html:'<div style="width:30px;height:30px;background:#fff;border-radius:50%;'
        +'display:flex;align-items:center;justify-content:center;font-size:15px;'
        +'box-shadow:0 2px 6px rgba(0,0,0,0.18);border:2px solid '+m.accent+'">'+m.emoji+'</div>',
      iconSize:[30,30],iconAnchor:[15,15],className:'',
    });
    L.marker([m.lat,m.lng],{icon:icon}).addTo(map);
  });

  function panToPlace(lat,lng){
    map.flyTo([lat,lng],15,{duration:0.75});
  }
</script>
</body></html>`;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const webRef     = useRef<WebView>(null);
  const ready      = useRef(false);
  const [idx, setIdx] = useState(0);

  const place    = PLACES[idx];
  const cuisines = cuisinesFor(place);

  function inject(js: string) {
    if (ready.current) webRef.current?.injectJavaScript(js + '; true;');
  }

  function onLoadEnd() {
    ready.current = true;
    inject(`panToPlace(${PLACES[0].lat},${PLACES[0].lng})`);
  }

  function go(dir: 1 | -1) {
    const next = (idx + dir + PLACES.length) % PLACES.length;
    setIdx(next);
    inject(`panToPlace(${PLACES[next].lat},${PLACES[next].lng})`);
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
          onPress={() => navigation.navigate('Details')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Mini map ── */}
      <View style={styles.mapWrap}>
        <WebView
          ref={webRef}
          source={{ html: MINI_MAP_HTML }}
          style={styles.miniMap}
          onLoadEnd={onLoadEnd}
          originWhitelist={['*']}
          javaScriptEnabled
          scrollEnabled={false}
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

      {/* ── Place card ── */}
      <View style={styles.card}>

        {/* Place title row */}
        <View style={styles.placeRow}>
          <Text style={styles.placeEmoji}>{place.emoji}</Text>
          <View style={styles.placeMeta}>
            <Text style={styles.placeName}>{place.name}</Text>
            <View style={styles.countPill}>
              <Ionicons name="restaurant-outline" size={11} color={colors.primary} />
              <Text style={styles.countText}>{cuisines.length} dishes here</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.placeDesc}>{place.description}</Text>

        {/* Cuisine chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {cuisines.length > 0
            ? cuisines.map(c => (
                <View key={c.id} style={[styles.chip, { backgroundColor: c.accent + '1A' }]}>
                  <Text style={styles.chipEmoji}>{c.emoji}</Text>
                  <Text style={[styles.chipLabel, { color: c.accent }]}>{c.name}</Text>
                </View>
              ))
            : (
                <Text style={styles.noCuisine}>No listings yet for this area</Text>
              )}
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Prev / Next + CTA */}
        <View style={styles.bottomRow}>
          <View style={styles.navGroup}>
            <TouchableOpacity style={styles.navBtn} onPress={() => go(-1)} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.navIndicator}>{idx + 1} / {PLACES.length}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={() => go(1)} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('Map')}
            activeOpacity={0.85}
          >
            <Text style={styles.viewBtnText}>View cuisines</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>
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
    paddingTop: 6,
    paddingBottom: 14,
  },
  title:    { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  searchBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  // Map
  mapWrap: {
    height: 380,
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

  // Card
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 14,
  },

  placeRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeEmoji: { fontSize: 36 },
  placeMeta:  { flex: 1, gap: 5 },
  placeName:  { fontSize: 20, fontWeight: '800', color: colors.text },
  countPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary + '33',
    borderRadius: radius.pill,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  countText: { fontSize: 11, fontWeight: '700', color: colors.primary },

  placeDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },

  chips:      { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 11, paddingVertical: 6,
  },
  chipEmoji: { fontSize: 15 },
  chipLabel: { fontSize: 12, fontWeight: '700' },
  noCuisine: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic' },

  divider: { height: 1, backgroundColor: colors.surface },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  navIndicator: { fontSize: 13, fontWeight: '700', color: colors.textMuted, minWidth: 36, textAlign: 'center' },

  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 18, paddingVertical: 11,
  },
  viewBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
