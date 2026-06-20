import { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Text, Image, Animated, ActivityIndicator,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CUISINES, { type Cuisine, type CuisineLocation } from '../cuisines';
import { type TabParamList } from '../navigation/TabNavigator';
import { colors, radius } from '../theme';

const CATEGORIES = [
  'All', 'Street Food', 'Main Course', 'Snack',
  'Soup', 'Dessert', 'Curry', 'Side Dish',
];

type Selected = { cuisine: Cuisine; location: CuisineLocation };
type LatLng   = { latitude: number; longitude: number };

// Leaflet + OpenStreetMap map (no API key required). Talks to RN through
// window.ReactNativeWebView.postMessage and injected JS function calls.
const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #e8e4dd; }
  .pin { width: 40px; height: 40px; border-radius: 20px; border: 3px solid #fff;
         overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,.3); background:#fff; }
  .pin img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function post(o){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify(o)); } }
  var map = L.map('map', { zoomControl:false }).setView([27.7172, 85.324], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  var markers = L.layerGroup().addTo(map);
  var routeLine = null, userDot = null;

  window.renderMarkers = function(list){
    markers.clearLayers();
    list.forEach(function(m){
      var icon = L.divIcon({
        className: '',
        html: '<div class="pin" style="border-color:'+m.accent+'"><img src="'+m.image+'"/></div>',
        iconSize: [40,40], iconAnchor: [20,20]
      });
      L.marker([m.lat, m.lng], { icon: icon }).addTo(markers)
        .on('click', function(){ post({ type:'marker', cuisineId:m.cuisineId, locId:m.locId }); });
    });
  };
  window.flyTo = function(lat,lng,z){ map.flyTo([lat,lng], z||15, { duration:0.8 }); };
  window.showUser = function(lat,lng){
    if(userDot){ map.removeLayer(userDot); }
    userDot = L.circleMarker([lat,lng], { radius:7, weight:3, color:'#fff', fillColor:'#2D6A9F', fillOpacity:1 }).addTo(map);
  };
  window.drawRoute = function(coords){
    if(routeLine){ map.removeLayer(routeLine); }
    routeLine = L.polyline(coords, { color:'#2D6A9F', weight:5 }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding:[70,70] });
  };
  window.clearRoute = function(){ if(routeLine){ map.removeLayer(routeLine); routeLine = null; } };

  map.on('click', function(){ post({ type:'mapPress' }); });
  post({ type:'ready' });
</script>
</body>
</html>`;

export default function MapScreen() {
  const navRoute = useRoute<RouteProp<TabParamList, 'Map'>>();
  const insets   = useSafeAreaInsets();
  const webRef   = useRef<WebView>(null);

  const cuisineId = navRoute.params?.cuisineId;
  const [ready,     setReady]     = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [isolating, setIsolating] = useState(false);
  const [userCoord, setUserCoord] = useState<LatLng | null>(null);
  const [selected,  setSelected]  = useState<Selected | null>(null);
  const panelY = useRef(new Animated.Value(320)).current;

  const run = (js: string) => webRef.current?.injectJavaScript(js + ';true;');

  // ── Visible markers ─────────────────────────────────────────────────────────
  const visibleCuisines = isolating && cuisineId
    ? CUISINES.filter(c => c.id === cuisineId)
    : filterCat === 'All'
    ? CUISINES
    : CUISINES.filter(c => c.category === filterCat);

  // ── Location ────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })();
  }, []);

  // ── Push markers whenever the filter / data changes ─────────────────────────
  useEffect(() => {
    if (!ready) return;
    const data = visibleCuisines.flatMap(c =>
      c.locations.map(loc => ({
        cuisineId: c.id,
        locId: loc.id,
        lat: loc.latitude,
        lng: loc.longitude,
        image: c.image,
        accent: c.accent,
      })),
    );
    run(`window.renderMarkers(${JSON.stringify(data)})`);
  }, [ready, filterCat, isolating, cuisineId]);

  // ── Show user dot (and center on first fix when not isolating) ──────────────
  useEffect(() => {
    if (!ready || !userCoord) return;
    run(`window.showUser(${userCoord.latitude},${userCoord.longitude})`);
    if (!cuisineId) {
      run(`window.flyTo(${userCoord.latitude},${userCoord.longitude},14)`);
    }
  }, [ready, userCoord]);

  // ── Isolate dish when coming from DishDetail ────────────────────────────────
  useEffect(() => {
    if (!ready || !cuisineId) return;
    setIsolating(true);
    const cuisine = CUISINES.find(c => c.id === cuisineId);
    const loc = cuisine?.locations[0];
    if (!cuisine || !loc) return;
    run(`window.flyTo(${loc.latitude},${loc.longitude},16)`);
    const t = setTimeout(() => openPanel({ cuisine, location: loc }), 700);
    return () => clearTimeout(t);
  }, [ready, cuisineId]);

  // ── WebView messages ────────────────────────────────────────────────────────
  function onMessage(e: WebViewMessageEvent) {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg.type === 'ready') {
      setReady(true);
    } else if (msg.type === 'marker') {
      const cuisine = CUISINES.find(c => c.id === msg.cuisineId);
      const location = cuisine?.locations.find(l => l.id === msg.locId);
      if (cuisine && location) openPanel({ cuisine, location });
    } else if (msg.type === 'mapPress') {
      if (selected) closePanel();
    }
  }

  // ── Panel helpers ───────────────────────────────────────────────────────────
  function openPanel(item: Selected) {
    run('window.clearRoute()');
    setSelected(item);
    Animated.spring(panelY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }

  function closePanel() {
    run('window.clearRoute()');
    Animated.spring(panelY, { toValue: 320, useNativeDriver: true, speed: 25, bounciness: 0 })
      .start(() => setSelected(null));
  }

  // ── Directions via OSRM ─────────────────────────────────────────────────────
  async function getDirections() {
    if (!selected || !userCoord) return;
    const { location } = selected;
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userCoord.longitude},${userCoord.latitude};` +
        `${location.longitude},${location.latitude}` +
        `?overview=full&geometries=geojson`,
      );
      const data = await res.json();
      if (!data.routes?.[0]) return;
      const coords = data.routes[0].geometry.coordinates.map(
        ([lng, lat]: number[]) => [lat, lng],
      );
      run(`window.drawRoute(${JSON.stringify(coords)})`);
    } catch {}
  }

  return (
    <View style={styles.root}>
      <WebView
        ref={webRef}
        source={{ html: MAP_HTML }}
        style={styles.map}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      />

      {/* Header + category chips */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Map</Text>
          <Text style={styles.subtitle}>Discover dishes across Nepal</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {CATEGORIES.map(cat => {
            const active = cat === filterCat && !isolating;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => { setIsolating(false); setFilterCat(cat); closePanel(); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Locate-me button */}
      <TouchableOpacity
        style={[styles.locateBtn, { bottom: insets.bottom + 24 }]}
        onPress={() => {
          if (userCoord) run(`window.flyTo(${userCoord.latitude},${userCoord.longitude},15)`);
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={22} color="#2D6A9F" />
      </TouchableOpacity>

      {/* Bottom detail panel */}
      {selected && (
        <Animated.View style={[styles.panel, { bottom: insets.bottom + 16, transform: [{ translateY: panelY }] }]}>
          <View style={styles.panelHandle} />
          <View style={styles.panelRow}>
            <Image source={{ uri: selected.cuisine.image }} style={styles.panelImg} />
            <View style={styles.panelInfo}>
              <Text style={styles.panelName}>{selected.cuisine.name}</Text>
              <View style={[styles.panelBadge, { backgroundColor: selected.cuisine.accent + '22' }]}>
                <Text style={[styles.panelBadgeText, { color: selected.cuisine.accent }]}>
                  {selected.cuisine.category}
                </Text>
              </View>
              <Text style={styles.panelArea}>📍 {selected.location.area}</Text>
              <Text style={styles.panelDesc} numberOfLines={2}>{selected.cuisine.description}</Text>
            </View>
          </View>
          <View style={styles.panelActions}>
            <TouchableOpacity style={styles.dirBtn} onPress={getDirections} activeOpacity={0.85}>
              <Ionicons name="navigate" size={15} color="#fff" />
              <Text style={styles.dirBtnText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={closePanel} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map:  { flex: 1 },

  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },

  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    backgroundColor: colors.background,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title:    { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { fontSize: 12, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },

  locateBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 46, height: 46,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },

  panel: {
    position: 'absolute',
    left: 16, right: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 }, elevation: 8,
    borderWidth: 1, borderColor: colors.surface,
  },
  panelHandle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
    alignSelf: 'center',
    marginBottom: 4,
  },
  panelRow:  { flexDirection: 'row', gap: 12 },
  panelImg:  { width: 80, height: 80, borderRadius: radius.sm, flexShrink: 0 },
  panelInfo: { flex: 1, gap: 4 },
  panelName: { fontSize: 16, fontWeight: '800', color: colors.text },
  panelBadge:     { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  panelBadgeText: { fontSize: 10, fontWeight: '700' },
  panelArea: { fontSize: 12, color: colors.textMuted },
  panelDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  panelActions: { flexDirection: 'row', gap: 10 },
  dirBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: '#2D6A9F',
    borderRadius: radius.md, paddingVertical: 11,
  },
  dirBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  closeBtn: {
    width: 44, height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
});
