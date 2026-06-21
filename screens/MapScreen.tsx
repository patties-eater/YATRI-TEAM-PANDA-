import { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Text, Image, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCuisines } from '../data/cuisines';
import { dishImageSource, dishImageUri } from '../data/dishImages';
import { type Cuisine, type CuisineLocation } from '../cuisines';
import { type TabParamList } from '../navigation/TabNavigator';
import { colors, radius } from '../theme';

const CATEGORIES = [
  'All', 'Street Food', 'Main Course', 'Snack',
  'Soup', 'Dessert', 'Curry', 'Side Dish',
];

const FALLBACK_ORIGIN = { latitude: 27.7172, longitude: 85.324 };

function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type Selected = { cuisine: Cuisine; location: CuisineLocation };
type LatLng   = { latitude: number; longitude: number };

const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #e8e4dd; }
  .pin { width: 42px; height: 42px; border: 3px solid #fff; background:#fff;
         border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
         box-shadow: 0 3px 6px rgba(0,0,0,.4); overflow: hidden; }
  .pin img { width: 100%; height: 100%; object-fit: cover; display: block;
             transform: rotate(45deg) scale(1.45); }
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
        iconSize: [42,42], iconAnchor: [21,42]
      });
      L.marker([m.lat, m.lng], { icon: icon }).addTo(markers)
        .on('click', function(){ post({ type:'marker', cuisineId:m.cuisineId, locId:m.locId }); });
    });
  };
  window.flyTo = function(lat,lng,z){ map.flyTo([lat,lng], z||15, { duration:0.8 }); };
  window.follow = function(lat,lng,z){ map.setView([lat,lng], z||17, { animate:true, duration:0.5 }); };
  window.showUser = function(lat,lng){
    if(userDot){ map.removeLayer(userDot); }
    userDot = L.circleMarker([lat,lng], { radius:8, weight:3, color:'#fff', fillColor:'#2D6A9F', fillOpacity:1 }).addTo(map);
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
  const { cuisines: CUISINES } = useCuisines();

  const cuisineId = navRoute.params?.cuisineId;
  const paramLat  = navRoute.params?.latitude;
  const paramLng  = navRoute.params?.longitude;
  const [ready,     setReady]     = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [isolating, setIsolating] = useState(false);
  const [userCoord,  setUserCoord]  = useState<LatLng | null>(null);
  const [selected,   setSelected]   = useState<Selected | null>(null);
  const [routing,    setRouting]    = useState(false);
  const [hasRoute,   setHasRoute]   = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [trip,       setTrip]       = useState<{ km: string; min: number } | null>(null);
  const panelY  = useRef(new Animated.Value(320)).current;
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => () => { watchRef.current?.remove(); }, []);

  const run = (js: string) => webRef.current?.injectJavaScript(js + ';true;');

  const visibleCuisines = isolating && cuisineId
    ? CUISINES.filter(c => c.id === cuisineId)
    : filterCat === 'All'
    ? CUISINES
    : CUISINES.filter(c => c.category === filterCat);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoord({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data = visibleCuisines.flatMap(c =>
      c.locations.map(loc => ({
        cuisineId: c.id,
        locId: loc.id,
        lat: loc.latitude,
        lng: loc.longitude,
        image: dishImageUri(c.id, c.image),
        accent: c.accent,
      })),
    );
    run(`window.renderMarkers(${JSON.stringify(data)})`);
  }, [ready, filterCat, isolating, cuisineId, CUISINES.length]);

  useEffect(() => {
    if (!ready || !userCoord) return;
    run(`window.showUser(${userCoord.latitude},${userCoord.longitude})`);
    if (!cuisineId && paramLat === undefined) {
      run(`window.flyTo(${userCoord.latitude},${userCoord.longitude},14)`);
    }
  }, [ready, userCoord]);

  useEffect(() => {
    if (!ready || cuisineId) return;
    if (paramLat !== undefined && paramLng !== undefined) {
      run(`window.flyTo(${paramLat},${paramLng},14)`);
    }
  }, [ready, paramLat, paramLng]);

  useEffect(() => {
    if (!ready || !cuisineId) return;
    setIsolating(true);
    const cuisine = CUISINES.find(c => c.id === cuisineId);
    if (!cuisine) return;

    let loc = cuisine.locations.find(l => (
      paramLat !== undefined && paramLng !== undefined &&
      l.latitude === paramLat && l.longitude === paramLng
    ));

    if (!loc) loc = cuisine.locations[0];

    if (!loc) return;
    run(`window.flyTo(${loc.latitude},${loc.longitude},16)`);
    const t = setTimeout(() => openPanel({ cuisine, location: loc! }), 700);
    return () => clearTimeout(t);
  }, [ready, cuisineId]);

  function onMessage(e: WebViewMessageEvent) {
    let msg: any;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg.type === 'ready') {
      setReady(true);
    } else if (msg.type === 'marker') {
      if (navigating) return;
      const cuisine = CUISINES.find(c => c.id === msg.cuisineId);
      const location = cuisine?.locations.find(l => l.id === msg.locId);
      if (cuisine && location) openPanel({ cuisine, location });
    } else if (msg.type === 'mapPress') {
      if (selected && !navigating) closePanel();
    }
  }

  function openPanel(item: Selected) {
    run('window.clearRoute()');
    setHasRoute(false);
    setTrip(null);
    setSelected(item);
    Animated.spring(panelY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }

  function closePanel() {
    run('window.clearRoute()');
    setHasRoute(false);
    setTrip(null);
    Animated.spring(panelY, { toValue: 320, useNativeDriver: true, speed: 25, bounciness: 0 })
      .start(() => setSelected(null));
  }

  async function ensureOrigin(): Promise<LatLng | null> {
    if (userCoord) return userCoord;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserCoord(c);
      return c;
    } catch {
      return null;
    }
  }

  async function getDirections() {
    if (!selected || routing) return;
    const dest = selected.location;
    setRouting(true);
    try {
      const gps = await ensureOrigin();
      const origin = gps ?? FALLBACK_ORIGIN;

      let coords: number[][] | null = null;
      let meta: { distance: number; duration: number } | null = null;
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/` +
          `${origin.longitude},${origin.latitude};` +
          `${dest.longitude},${dest.latitude}` +
          `?overview=full&geometries=geojson&alternatives=false`,
        );
        const data = await res.json();
        if (data.routes?.[0]) {
          coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: number[]) => [lat, lng],
          );
          meta = { distance: data.routes[0].distance, duration: data.routes[0].duration };
        }
      } catch {
      }

      if (!coords || coords.length < 2) {
        coords = [
          [origin.latitude, origin.longitude],
          [dest.latitude, dest.longitude],
        ];
      }

      if (meta) {
        setTrip({
          km: (meta.distance / 1000).toFixed(1),
          min: Math.max(1, Math.round(meta.duration / 60)),
        });
      } else {
        const d = haversineKm(origin, dest);
        setTrip({ km: d.toFixed(1), min: Math.max(1, Math.round((d / 25) * 60)) });
      }

      run(`window.drawRoute(${JSON.stringify(coords)})`);
      setHasRoute(true);

      if (!gps) {
        Alert.alert(
          'Location unavailable',
          'Showing the route from Kathmandu city centre. Enable location access to get directions from where you are.',
        );
      }
    } finally {
      setRouting(false);
    }
  }

  async function startNavigation() {
    const origin = await ensureOrigin();
    if (!origin) {
      Alert.alert('Location needed', 'Enable location access to start navigation.');
      return;
    }
    setNavigating(true);
    run(`window.showUser(${origin.latitude},${origin.longitude});window.follow(${origin.latitude},${origin.longitude},17)`);
    try {
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 8, timeInterval: 2000 },
        pos => {
          const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserCoord(c);
          run(`window.showUser(${c.latitude},${c.longitude});window.follow(${c.latitude},${c.longitude},17)`);
        },
      );
    } catch {
      Alert.alert('Navigation error', 'Could not track your location.');
      setNavigating(false);
    }
  }

  function stopNavigation() {
    watchRef.current?.remove();
    watchRef.current = null;
    setNavigating(false);
    closePanel();
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

      <TouchableOpacity
        style={[styles.locateBtn, { bottom: insets.bottom + 24 }]}
        onPress={async () => {
          const c = await ensureOrigin();
          if (c) run(`window.showUser(${c.latitude},${c.longitude});window.flyTo(${c.latitude},${c.longitude},15)`);
          else Alert.alert('Location unavailable', 'Enable location access to center the map on your position.');
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={22} color="#2D6A9F" />
      </TouchableOpacity>

      {selected && !navigating && (
  <Animated.View
    style={[
      styles.panel,
      {
        bottom: insets.bottom + 90,
        transform: [{ translateY: panelY }],
      },
    ]}
  >
          <View style={styles.panelHandle} />
          <View style={styles.panelRow}>
            <Image source={dishImageSource(selected.cuisine.id, selected.cuisine.image)} style={styles.panelImg} />
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

          {hasRoute && trip && (
            <View style={styles.tripRow}>
              <Ionicons name="car-outline" size={15} color={colors.text} />
              <Text style={styles.tripText}>{trip.km} km</Text>
              <Text style={styles.tripDot}>•</Text>
              <Ionicons name="time-outline" size={15} color={colors.text} />
              <Text style={styles.tripText}>{trip.min} min</Text>
            </View>
          )}

          <View style={styles.panelActions}>
            {!hasRoute ? (
              <TouchableOpacity
                style={[styles.dirBtn, routing && styles.dirBtnDisabled]}
                onPress={getDirections}
                activeOpacity={0.85}
                disabled={routing}
              >
                {routing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="navigate" size={15} color="#fff" />
                )}
                <Text style={styles.dirBtnText}>
                  {routing ? 'Finding route…' : 'Get Directions'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={startNavigation}
                activeOpacity={0.85}
              >
                <Ionicons name="navigate-circle" size={18} color="#fff" />
                <Text style={styles.dirBtnText}>Start</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={closePanel} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {navigating && selected && (
        <View style={[styles.navBar, { bottom: insets.bottom + 16 }]}>
          <View style={styles.navIconBox}>
            <Ionicons name="navigate" size={20} color="#fff" />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTo} numberOfLines={1}>
              To {selected.cuisine.name} · {selected.location.area}
            </Text>
            {trip && (
              <Text style={styles.navEta}>{trip.km} km • {trip.min} min</Text>
            )}
          </View>
          <TouchableOpacity style={styles.endBtn} onPress={stopNavigation} activeOpacity={0.85}>
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map:  { flex: 1 },

  loading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
  title:    { fontSize: 26, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
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
  dirBtnDisabled: { opacity: 0.7 },
  dirBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: '#1E9E5A',
    borderRadius: radius.md, paddingVertical: 11,
  },

  tripRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surface + '55',
    borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  tripText: { fontSize: 13, fontWeight: '700', color: colors.text },
  tripDot:  { fontSize: 13, color: colors.textMuted, marginHorizontal: 2 },

  navBar: {
    position: 'absolute',
    left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surface,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 }, elevation: 8,
  },
  navIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1E9E5A',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  navInfo: { flex: 1 },
  navTo:  { fontSize: 14, fontWeight: '700', color: colors.text },
  navEta: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginTop: 2 },
  endBtn: {
    backgroundColor: '#E23B3B',
    borderRadius: radius.pill,
    paddingHorizontal: 16, paddingVertical: 9,
    flexShrink: 0,
  },
  endBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  closeBtn: {
    width: 44, height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
});
