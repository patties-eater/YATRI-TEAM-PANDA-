import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Easing,
  PanResponder,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme';
import { useCuisines } from '../data/cuisines';
import { dishImageSource, dishImageUri } from '../data/dishImages';
import type { Cuisine } from '../cuisines';

type Place = {
  name: string;
  lat: number;
  lng: number;
  description: string;
  emoji: string;
  areaKeys: string[];
};

const PLACES: Place[] = [
  { name: 'Bhaktapur',  lat: 27.6722, lng: 85.4298, description: 'Medieval Newar city — home of Juju Dhau and Yomari.', emoji: '🏛️', areaKeys: ['Bhaktapur'] },
  { name: 'Patan',      lat: 27.6726, lng: 85.3239, description: 'City of artisans and authentic Newari feast food.', emoji: '🕌', areaKeys: ['Patan', 'Patan Durbar'] },
  { name: 'Kathmandu', lat: 27.7045, lng: 85.3076, description: "The capital's old quarters — where Nepal's street and festival foods gather.", emoji: '🏯', areaKeys: ['Kathmandu', 'Basantapur', 'Asan'] },
  { name: 'Kirtipur',  lat: 27.6779, lng: 85.2795, description: 'Hilltop Newar town known for rustic hill staples.', emoji: '⛰️', areaKeys: ['Kirtipur'] },
  { name: 'Tokha',     lat: 27.7820, lng: 85.3290, description: 'Northern Valley town famed for winter chaku.', emoji: '🍬', areaKeys: ['Tokha'] },
];

function cuisinesFor(place: Place, all: Cuisine[]) {
  return all.filter(c =>
    c.locations.some(l => l.isOrigin && place.areaKeys.includes(l.area)),
  );
}

// Continuously scrolls its children right → left (auto marquee, single row).
function Marquee({ children }: { children: ReactNode }) {
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    const anim = Animated.loop(
      Animated.timing(x, {
        toValue: -w,
        duration: w * 22,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [w]);

  return (
    <View style={styles.marqueeWrap}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: x }] }}>
        <View style={styles.marqueeRow} onLayout={e => setW(e.nativeEvent.layout.width)}>
          {children}
        </View>
        <View style={styles.marqueeRow}>{children}</View>
      </Animated.View>
    </View>
  );
}

function PlaceCard({
  place,
  dishes,
  active,
  onTap,
  onOpenMap,
}: {
  place: Place;
  dishes: Cuisine[];
  active: boolean;
  onTap: () => void;
  onOpenMap: () => void;
}) {
  const tx = useRef(new Animated.Value(0)).current;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => tx.setValue(Math.min(0, Math.max(g.dx, -130))),
      onPanResponderRelease: (_, g) => {
        Animated.spring(tx, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        if (g.dx < -100) onOpenMap();
      },
      onPanResponderTerminate: () =>
        Animated.spring(tx, { toValue: 0, useNativeDriver: true }).start(),
    }),
  ).current;

  const hintOpacity = tx.interpolate({
    inputRange: [-70, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.placeRow}>
      <Animated.View style={[styles.swipeHint, { opacity: hintOpacity }]} pointerEvents="none">
        <Ionicons name="restaurant" size={16} color={colors.primary} />
        <Text style={styles.swipeHintText}>View dishes</Text>
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
                {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
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

          {dishes.length > 0 && (
            <Marquee>
              {dishes.map(d => (
                <View key={d.id} style={styles.itemChip}>
                  <Image source={dishImageSource(d.id, d.image)} style={styles.itemImg} />
                  <Text style={styles.itemName} numberOfLines={1}>{d.name}</Text>
                </View>
              ))}
            </Marquee>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const MINI_MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height:100%; margin:0; padding:0; background:#e8e4dd; }
  .pin { width:34px; height:34px; border:2.5px solid #fff; background:#fff;
         border-radius:50% 50% 50% 0; transform: rotate(-45deg);
         box-shadow:0 2px 5px rgba(0,0,0,.4); overflow:hidden; }
  .pin img { width:100%; height:100%; object-fit:cover; display:block;
             transform: rotate(45deg) scale(1.45); }
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
        iconSize: [34,34], iconAnchor: [17,34]
      });
      L.marker([d.lat, d.lng], { icon: icon }).addTo(foods);
    });
  };
  window.flyTo = function(lat,lng){ map.setView([lat,lng], 14, { animate:true }); };
  post({ type:'ready' });
</script>
</body>
</html>`;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { cuisines: CUISINES, loading, error } = useCuisines();
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');

  // Bouncing "scroll for more" arrow
  const bounce = useRef(new Animated.Value(0)).current;
  const [atBottom, setAtBottom] = useState(false);
  const listRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const listLayoutH = useRef(0);
  function scrollDown() {
    const next = scrollY.current + Math.max(listLayoutH.current * 0.8, 220);
    listRef.current?.scrollTo({ y: next, animated: true });
  }
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 6, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const FOOD_MARKERS = CUISINES.flatMap(c =>
    c.locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      accent: c.accent,
      image: dishImageUri(c.id, c.image),
    })),
  );

  const { height } = useWindowDimensions();
  const mapHeight = Math.round(Math.min(Math.max(height * 0.4, 240), 460));

  const run = (js: string) => webRef.current?.injectJavaScript(js + ';true;');

  useEffect(() => {
    if (!ready || FOOD_MARKERS.length === 0) return;
    run(`window.renderMarkers(${JSON.stringify(FOOD_MARKERS)})`);
    run(`window.flyTo(${PLACES[0].lat},${PLACES[0].lng})`);
  }, [ready, CUISINES.length]);

  function onMessage(e: WebViewMessageEvent) {
    try {
      if (JSON.parse(e.nativeEvent.data)?.type === 'ready') setReady(true);
    } catch {}
  }

  function openPlacePage(p: Place) {
    navigation.navigate('Place', {
      name: p.name,
      description: p.description,
      lat: p.lat,
      lng: p.lng,
      areaKeys: p.areaKeys,
    });
  }

  const q = query.trim().toLowerCase();
  const filteredPlaces = PLACES.filter(p => {
    if (cuisinesFor(p, CUISINES).length === 0) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      cuisinesFor(p, CUISINES).some(c => c.name.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Local cuisine around Nepal</Text>
      </View>

      <View style={styles.body}>
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

        <ScrollView
          ref={listRef}
          style={styles.placeListWrap}
          contentContainerStyle={styles.placeList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onLayout={e => { listLayoutH.current = e.nativeEvent.layout.height; }}
          onScroll={e => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            scrollY.current = contentOffset.y;
            setAtBottom(contentOffset.y + layoutMeasurement.height >= contentSize.height - 24);
          }}
        >
          {loading && CUISINES.length === 0 ? (
            <View style={styles.statusBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.noMatch}>Loading places…</Text>
            </View>
          ) : error ? (
            <Text style={styles.noMatch}>Couldn't load food: {error}</Text>
          ) : filteredPlaces.length === 0 ? (
            <Text style={styles.noMatch}>No places match “{query}”.</Text>
          ) : (
            filteredPlaces.map(p => (
              <PlaceCard
                key={p.name}
                place={p}
                dishes={cuisinesFor(p, CUISINES)}
                active={false}
                onTap={() => openPlacePage(p)}
                onOpenMap={() => openPlacePage(p)}
              />
            ))
          )}
        </ScrollView>

        {filteredPlaces.length > 1 && !atBottom && (
          <View style={styles.scrollArrowWrap} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.scrollArrow}
              onPress={scrollDown}
              activeOpacity={0.85}
            >
              <Animated.View style={{ transform: [{ translateY: bounce }] }}>
                <Ionicons name="chevron-down" size={22} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  body: { flex: 1, paddingBottom: 12 },

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
    justifyContent: 'flex-end',
    gap: 6,
    paddingRight: 20,
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

  marqueeWrap: { overflow: 'hidden', marginTop: 10 },
  marqueeRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: 3,
    paddingRight: 10,
    paddingVertical: 3,
  },
  itemImg: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface },
  itemName: { fontSize: 12, fontWeight: '600', color: colors.text, maxWidth: 110 },
  moreChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface + '88',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  moreText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },

  placeChevron: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface + '66',
  },
  placeChevronActive: { backgroundColor: colors.primary },

  statusBox: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  noMatch: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: 28,
  },

  scrollArrowWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 12,
    alignItems: 'center',
  },
  scrollArrow: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
});
