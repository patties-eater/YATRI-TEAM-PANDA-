import { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  Text, Image, Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CUISINES, { type Cuisine, type CuisineLocation } from '../cuisines';
import { type TabParamList } from '../navigation/TabNavigator';
import { colors, radius } from '../theme';

const KATHMANDU = { latitude: 27.7172, longitude: 85.324, latitudeDelta: 0.08, longitudeDelta: 0.08 };

const CATEGORIES = [
  'All', 'Street Food', 'Main Course', 'Snack',
  'Soup', 'Dessert', 'Curry', 'Side Dish',
];

type Selected = { cuisine: Cuisine; location: CuisineLocation };
type LatLng   = { latitude: number; longitude: number };

export default function MapScreen() {
  const navRoute  = useRoute<RouteProp<TabParamList, 'Map'>>();
  const insets    = useSafeAreaInsets();
  const mapRef    = useRef<MapView>(null);

  const cuisineId = navRoute.params?.cuisineId;
  const [filterCat,   setFilterCat]   = useState('All');
  const [isolating,   setIsolating]   = useState(false);
  const [userCoord,   setUserCoord]   = useState<LatLng | null>(null);
  const [selected,    setSelected]    = useState<Selected | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const panelY = useRef(new Animated.Value(320)).current;

  // ── Location ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coord = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserCoord(coord);
      mapRef.current?.animateToRegion({ ...coord, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 800);
    })();
  }, []);

  // ── Category filter — runs first so isolation below always wins ───────────
  useEffect(() => {
    if (!isolating) setRouteCoords([]);
  }, [filterCat, isolating]);

  // ── Isolate dish when coming from DishDetail ─────────────────────────────
  useEffect(() => {
    if (!cuisineId) return;
    setIsolating(true);
    const cuisine = CUISINES.find(c => c.id === cuisineId);
    if (!cuisine?.locations.length) return;
    const loc = cuisine.locations[0];
    mapRef.current?.animateToRegion(
      { latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.015, longitudeDelta: 0.015 },
      1000,
    );
    setTimeout(() => openPanel({ cuisine, location: loc }), 900);
  }, [cuisineId]);

  // ── Panel helpers ─────────────────────────────────────────────────────────
  function openPanel(item: Selected) {
    setRouteCoords([]);
    setSelected(item);
    Animated.spring(panelY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }

  function closePanel() {
    Animated.spring(panelY, { toValue: 320, useNativeDriver: true, speed: 25, bounciness: 0 })
      .start(() => { setSelected(null); setRouteCoords([]); });
  }

  // ── Directions via OSRM ───────────────────────────────────────────────────
  async function getDirections() {
    if (!selected || !userCoord) return;
    const { location } = selected;
    try {
      const res  = await fetch(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userCoord.longitude},${userCoord.latitude};` +
        `${location.longitude},${location.latitude}` +
        `?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (!data.routes?.[0]) return;
      const coords: LatLng[] = data.routes[0].geometry.coordinates.map(
        ([lng, lat]: number[]) => ({ latitude: lat, longitude: lng })
      );
      setRouteCoords(coords);
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 40, bottom: 340, left: 40 },
        animated: true,
      });
    } catch {}
  }

  // ── Visible markers ───────────────────────────────────────────────────────
  const visibleCuisines = isolating && cuisineId
    ? CUISINES.filter(c => c.id === cuisineId)
    : filterCat === 'All'
    ? CUISINES
    : CUISINES.filter(c => c.category === filterCat);

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={KATHMANDU}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => selected && closePanel()}
      >
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#2D6A9F" strokeWidth={4} />
        )}

        {visibleCuisines.flatMap(c =>
          c.locations.map(loc => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              tracksViewChanges={false}
              onPress={() => openPanel({ cuisine: c, location: loc })}
            >
              <View style={[styles.markerRing, { borderColor: c.accent }]}>
                <Image source={{ uri: c.image }} style={styles.markerImg} />
              </View>
            </Marker>
          ))
        )}
      </MapView>

      {/* Category chips */}
      <View style={[styles.filterBar, { top: insets.top + 8 }]}>
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
          if (userCoord) mapRef.current?.animateToRegion(
            { ...userCoord, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800
          );
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

  markerRing: {
    width: 42, height: 42,
    borderRadius: 21,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerImg: { width: '100%', height: '100%' },

  filterBar: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 10,
  },
  filterContent: { paddingHorizontal: 12, gap: 8 },
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
