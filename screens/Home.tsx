import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme';
import { useCuisines } from '../data/cuisines';
import type { Cuisine } from '../cuisines';

const SCREEN_W = Dimensions.get('window').width;

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
  { name: 'Bhaktapur',  lat: 27.6710, lng: 85.4297, description: 'Ancient Newari city famed for Juju Dhau, sel roti and kwati.', emoji: '🏛️', areaKeys: ['Bhaktapur'] },
  { name: 'Thamel',     lat: 27.7154, lng: 85.3123, description: "Kathmandu's liveliest hub — steaming momos on every corner.", emoji: '🏘️', areaKeys: ['Thamel'] },
  { name: 'Patan',      lat: 27.6664, lng: 85.3247, description: 'UNESCO heritage city with authentic Newari bara and chatamari.', emoji: '🕌', areaKeys: ['Patan', 'Patan Durbar'] },
  { name: 'Boudha',     lat: 27.7215, lng: 85.3621, description: 'Tibetan quarter famous for hearty thukpa and butter tea.', emoji: '🔵', areaKeys: ['Boudha'] },
  { name: 'Asan Bazaar',lat: 27.7088, lng: 85.3106, description: 'Old Kathmandu market brimming with dal bhat and kwati stalls.', emoji: '🛒', areaKeys: ['Asan'] },
  { name: 'Kirtipur',   lat: 27.6779, lng: 85.2795, description: 'Hilltop Newari town known for crispy sel roti and local snacks.', emoji: '⛰️', areaKeys: ['Kirtipur'] },
  { name: 'Jhamsikhel', lat: 27.6766, lng: 85.3074, description: "Lalitpur's trendy food street — chow mein, sikarni and café culture.", emoji: '🍢', areaKeys: ['Jhamsikhel'] },
  { name: 'Lazimpat',   lat: 27.7245, lng: 85.3206, description: 'Leafy diplomatic strip lined with tea houses and Tibetan bites.', emoji: '🍵', areaKeys: ['Lazimpat'] },
  { name: 'Jawalakhel', lat: 27.6730, lng: 85.3120, description: 'Patan neighbourhood loved for creamy kheer and chukauni.', emoji: '🍚', areaKeys: ['Jawalakhel'] },
  { name: 'Chabahil',   lat: 27.7172, lng: 85.3470, description: 'Busy junction near Boudha famous for fiery laphing.', emoji: '🌶️', areaKeys: ['Chabahil'] },
];

function cuisinesFor(place: Place, all: Cuisine[]) {
  return all.filter(c => c.locations.some(l => place.areaKeys.includes(l.area)));
}

// ── Swipeable place card (swipe left→right to open it on the map) ─────────────
function PlaceCard({
  place,
  dishCount,
  active,
  onTap,
  onOpenMap,
}: {
  place: Place;
  dishCount: number;
  active: boolean;
  onTap: () => void;
  onOpenMap: () => void;
}) {
  const tx = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => tx.setValue(Math.max(0, g.dx)),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 120) {
          Animated.timing(tx, {
            toValue: SCREEN_W,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            tx.setValue(0);
            onOpenMap();
          });
        } else {
          Animated.spring(tx, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () =>
        Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start(),
    }),
  ).current;

  const hintOpacity = tx.interpolate({
    inputRange: [0, 70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.placeRow}>
      <Animated.View style={[styles.swipeHint, { opacity: hintOpacity }]} pointerEvents="none">
        <Ionicons name="map" size={16} color={colors.primary} />
        <Text style={styles.swipeHintText}>Open in map</Text>
      </Animated.View>

      <Animated.View style={{ transform: [{ translateX: tx }] }} {...pan.panHandlers}>
        <TouchableOpacity
          style={[styles.placeCard, active && styles.placeCardActive]}
          onPress={onTap}
          activeOpacity={0.85}
        >
          {active && <View style={styles.activeBar} />}
          <View style={styles.placeCardHead}>
            <View style={styles.placeMetaCol}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeCount}>
                {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
              </Text>
            </View>
            <View style={[styles.placeChevron, active && styles.placeChevronActive]}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={active ? '#fff' : colors.textMuted}
              />
            </View>
          </View>
          <Text style={styles.placeDesc} numberOfLines={1}>{place.description}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// Leaflet + OpenStreetMap preview (no API key).
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
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState('');

  const FOOD_MARKERS = CUISINES.flatMap(c =>
    c.locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      accent: c.accent,
      image: c.image,
    })),
  );

  const { height } = useWindowDimensions();
  const mapHeight = Math.round(Math.min(Math.max(height * 0.4, 240), 460));

  const run = (js: string) => webRef.current?.injectJavaScript(js + ';true;');

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

  // Tap a place → fly the mini-map preview there + highlight it.
  function selectPlace(i: number) {
    setIdx(i);
    run(`window.flyTo(${PLACES[i].lat},${PLACES[i].lng})`);
  }

  // Swipe a place → open it on the full Map page.
  function openPlaceOnMap(p: Place) {
    navigation.navigate('Map', { latitude: p.lat, longitude: p.lng });
  }

  const q = query.trim().toLowerCase();
  const filteredPlaces = q
    ? PLACES.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          cuisinesFor(p, CUISINES).some(c => c.name.toLowerCase().includes(q)),
      )
    : PLACES;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Local cuisine around Nepal</Text>
      </View>

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

          {/* Tap overlay — opens the full map */}
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

        {/* ── Search bar (between map and places) ── */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a place…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Places ── */}
        <ScrollView
          style={styles.placeListWrap}
          contentContainerStyle={styles.placeList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredPlaces.length === 0 ? (
            <Text style={styles.noMatch}>No places match “{query}”.</Text>
          ) : (
            filteredPlaces.map(p => {
              const realIndex = PLACES.indexOf(p);
              return (
                <PlaceCard
                  key={p.name}
                  place={p}
                  dishCount={cuisinesFor(p, CUISINES).length}
                  active={realIndex === idx}
                  onTap={() => selectPlace(realIndex)}
                  onOpenMap={() => openPlaceOnMap(p)}
                />
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  body: { flex: 1, paddingBottom: 12 },

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

  // Search bar (between map and list)
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  // Place list
  placeListWrap: { flex: 1, marginTop: 10 },
  placeList: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  placeRow: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  swipeHint: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 20,
    backgroundColor: colors.primary + '14',
    borderRadius: radius.md,
  },
  swipeHintText: { color: colors.primary, fontSize: 13, fontWeight: '700' },

  placeCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.surface,
    gap: 4,
    overflow: 'hidden',
  },
  placeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '0D',
  },
  activeBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
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

  placeChevron: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface + '66',
  },
  placeChevronActive: { backgroundColor: colors.primary },

  noMatch: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: 28,
  },
});
