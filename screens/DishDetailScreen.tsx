import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme';
import { getCuisine } from '../cuisines';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav  = NativeStackNavigationProp<RootStackParamList, 'DishDetail'>;
type Route = RouteProp<RootStackParamList, 'DishDetail'>;

export default function DishDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const dish = getCuisine(params.cuisineId);

  if (!dish) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dish not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  function openOnMap() {
    navigation.navigate('Tabs');
    // Small delay lets the tab navigator mount before we switch tabs
    setTimeout(() => {
      (navigation as any).navigate('Map', { cuisineId: dish!.id });
    }, 50);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: dish.accent + '1A' }]}>
          <Text style={styles.heroEmoji}>{dish.emoji}</Text>
        </View>

        {/* Name + category */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{dish.name}</Text>
          <View style={[styles.catBadge, { backgroundColor: dish.accent + '22' }]}>
            <Text style={[styles.catBadgeText, { color: dish.accent }]}>{dish.category}</Text>
          </View>
        </View>

        {/* Tags */}
        {dish.tags.length > 0 && (
          <View style={styles.tagRow}>
            {dish.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{dish.description}</Text>
        </View>

        {/* Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Where to find it
            <Text style={styles.sectionCount}> · {dish.locations.length} spots</Text>
          </Text>
          <View style={styles.locationsCard}>
            {dish.locations.map((loc, i) => (
              <View
                key={loc.id}
                style={[styles.locRow, i < dish.locations.length - 1 && styles.locDivider]}
              >
                <View style={[styles.locIconBox, { backgroundColor: dish.accent + '18' }]}>
                  <Ionicons name="location" size={16} color={dish.accent} />
                </View>
                <View style={styles.locInfo}>
                  <Text style={styles.locArea}>{loc.area}</Text>
                  <Text style={styles.locCoords}>
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* View on Map CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: dish.accent }]}
          activeOpacity={0.85}
          onPress={openOnMap}
        >
          <Ionicons name="map" size={18} color="#fff" />
          <Text style={styles.ctaBtnText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  backBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingBottom: 110 },

  // Hero
  hero: {
    marginHorizontal: 16,
    marginVertical: 12,
    height: 200,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 90 },

  // Name row
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  name: { fontSize: 28, fontWeight: '800', color: colors.text, flexShrink: 1 },
  catBadge:     { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5, flexShrink: 0 },
  catBadgeText: { fontSize: 13, fontWeight: '700' },

  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors.surface + '88',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },

  // Sections
  section:      { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  sectionCount: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  description:  { fontSize: 15, color: colors.textMuted, lineHeight: 24 },

  // Locations
  locationsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  locRow:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  locDivider: { borderBottomWidth: 1, borderBottomColor: colors.surface },
  locIconBox: {
    width: 36, height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locInfo:   { flex: 1 },
  locArea:   { fontSize: 14, fontWeight: '700', color: colors.text },
  locCoords: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Not found
  notFound:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: colors.textMuted },

  // CTA bar
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
