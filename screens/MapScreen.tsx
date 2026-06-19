import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { type TabParamList } from '../navigation/TabNavigator';
import CUISINES, { type Cuisine } from '../cuisines';
import { colors, radius } from '../theme';

const { width } = Dimensions.get('window');

const KATHMANDU: Region = {
  latitude:      27.7172,
  longitude:     85.3240,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<RouteProp<TabParamList, 'Map'>>();
  const insets     = useSafeAreaInsets();
  const mapRef     = useRef<MapView>(null);
  const slideAnim  = useRef(new Animated.Value(0)).current;

  const [selected, setSelected] = useState<Cuisine | null>(null);

  const cuisineId = route.params?.cuisineId;

  // Respond to incoming navigation param
  useEffect(() => {
    if (!cuisineId) return;
    const found = CUISINES.find(c => c.id === cuisineId) ?? null;
    selectCuisine(found);
  }, [cuisineId]);

  function selectCuisine(cuisine: Cuisine | null) {
    setSelected(cuisine);

    // Animate card in/out
    Animated.spring(slideAnim, {
      toValue: cuisine ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();

    // Fly map to first location
    if (cuisine) {
      const loc = cuisine.locations[0];
      mapRef.current?.animateToRegion(
        {
          latitude:      loc.latitude,
          longitude:     loc.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        700,
      );
    } else {
      mapRef.current?.animateToRegion(KATHMANDU, 700);
    }
  }

  function handleMarkerPress(cuisine: Cuisine) {
    selectCuisine(cuisine === selected ? null : cuisine);
  }

  const cardTranslate = slideAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [240, 0],
  });

  const CARD_BOTTOM = insets.bottom + 16;

  return (
    <View style={styles.root}>

      {/* ── Map ── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={KATHMANDU}
        showsUserLocation
        showsCompass={false}
        onPress={() => selectCuisine(null)}
      >
        {CUISINES.map(cuisine =>
          cuisine.locations.map(loc => {
            const isSelected = selected?.id === cuisine.id;
            return (
              <Marker
                key={loc.id}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                onPress={e => { e.stopPropagation(); handleMarkerPress(cuisine); }}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={[styles.pin, isSelected && styles.pinSelected]}>
                  <Text style={[styles.pinEmoji, isSelected && styles.pinEmojiSelected]}>
                    {cuisine.emoji}
                  </Text>
                  {isSelected && (
                    <Text style={styles.pinLabel} numberOfLines={1}>
                      {cuisine.name}
                    </Text>
                  )}
                </View>
                {/* Tail */}
                <View style={[styles.pinTail, { borderTopColor: isSelected ? cuisine.accent : colors.card }]} />
              </Marker>
            );
          })
        )}
      </MapView>

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={styles.topTitle}>
          <Ionicons name="restaurant-outline" size={16} color={colors.primary} />
          <Text style={styles.topTitleText}>
            {selected ? selected.name : 'All Cuisines'}
          </Text>
        </View>
        {selected && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => selectCuisine(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={16} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Spots count pill ── */}
      {selected && (
        <View style={[styles.spotsPill, { top: insets.top + 54 }]}>
          <Ionicons name="location" size={13} color={selected.accent} />
          <Text style={[styles.spotsText, { color: selected.accent }]}>
            {selected.locations.length} spot{selected.locations.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      )}

      {/* ── Cuisine info card ── */}
      <Animated.View
        style={[
          styles.card,
          { bottom: CARD_BOTTOM, transform: [{ translateY: cardTranslate }] },
        ]}
        pointerEvents={selected ? 'box-none' : 'none'}
      >
        {selected && (
          <>
            <View style={styles.cardHeader}>
              <View style={[styles.emojiBox, { backgroundColor: selected.accent + '22' }]}>
                <Text style={styles.cardEmoji}>{selected.emoji}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.cardName}>{selected.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: selected.accent + '22' }]}>
                  <Text style={[styles.catBadgeText, { color: selected.accent }]}>
                    {selected.category}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.cardDesc}>{selected.description}</Text>

            <View style={styles.areaRow}>
              {selected.locations.map(loc => (
                <View key={loc.id} style={styles.areaChip}>
                  <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                  <Text style={styles.areaText}>{loc.area}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tagRow}>
              {selected.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => navigation.navigate('Details')}
              activeOpacity={0.85}
            >
              <Text style={styles.detailsBtnText}>Back to list</Text>
              <Ionicons name="list" size={15} color={colors.white} />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map:  { ...StyleSheet.absoluteFillObject },

  // ── Markers ──
  pin: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pinSelected: {
    backgroundColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  pinEmoji:         { fontSize: 18 },
  pinEmojiSelected: { fontSize: 22 },
  pinLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    maxWidth: 90,
  },
  pinTail: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.card,
  },

  // ── Top bar ──
  topBar: {
    position: 'absolute',
    left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  topTitle:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topTitleText: { fontSize: 14, fontWeight: '700', color: colors.text },
  clearBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  spotsPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  spotsText: { fontSize: 12, fontWeight: '700' },

  // ── Info card ──
  card: {
    position: 'absolute',
    left: 16, right: 16,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiBox: {
    width: 54, height: 54, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardMeta:  { flex: 1, gap: 6 },
  cardName:  { fontSize: 18, fontWeight: '800', color: colors.text },
  catBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  catBadgeText: { fontSize: 11, fontWeight: '700' },

  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },

  areaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  areaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  areaText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

  tagRow: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: colors.surface + '88',
    borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

  detailsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md, paddingVertical: 12,
  },
  detailsBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
