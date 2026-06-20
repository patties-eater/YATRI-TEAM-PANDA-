import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, gradients } from '../theme';
import { getCuisine } from '../cuisines';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DishDetail'>;
type Route = RouteProp<RootStackParamList, 'DishDetail'>;

export default function DishDetailScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<Route>();
  const dish = getCuisine(params.cuisineId);

  if (!dish) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TouchableOpacity
          style={styles.backBtnPlain}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dish not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  function openOnMap() {
    navigation.navigate('Tabs', {
      screen: 'Map',
      params: { cuisineId: dish!.id },
    });
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{ uri: dish.image }}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <View style={styles.heroShade} />
        </View>

        {/* Content sheet */}
        <View style={styles.sheet}>
          {/* Emoji badge straddling the hero edge */}
          <View style={[styles.emojiBadge, { backgroundColor: dish.accent }]}>
            <Text style={styles.emojiBadgeText}>{dish.emoji}</Text>
          </View>

          <Text style={styles.name}>{dish.name}</Text>

          {/* Meta pills */}
          <View style={styles.metaRow}>
            <View
              style={[styles.metaPill, { backgroundColor: dish.accent + '1F' }]}
            >
              <Ionicons
                name="restaurant-outline"
                size={13}
                color={dish.accent}
              />
              <Text style={[styles.metaPillText, { color: dish.accent }]}>
                {dish.category}
              </Text>
            </View>
            <View style={styles.metaPillMuted}>
              <Ionicons
                name="location-outline"
                size={13}
                color={colors.textMuted}
              />
              <Text style={styles.metaPillMutedText}>
                {dish.locations.length} spots
              </Text>
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

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{dish.description}</Text>
          </View>

          {/* Locations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Where to find it
              <Text style={styles.sectionCount}>
                {'  '}·{'  '}{dish.locations.length} spots
              </Text>
            </Text>
            <View style={styles.locationsCard}>
              {dish.locations.map((loc, i) => (
                <View
                  key={loc.id}
                  style={[
                    styles.locRow,
                    i < dish.locations.length - 1 && styles.locDivider,
                  ]}
                >
                  <View
                    style={[
                      styles.locIconBox,
                      { backgroundColor: dish.accent + '18' },
                    ]}
                  >
                    <Ionicons name="location" size={16} color={dish.accent} />
                  </View>
                  <View style={styles.locInfo}>
                    <Text style={styles.locArea}>{loc.area}</Text>
                    <Text style={styles.locCoords}>
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={colors.textMuted}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating back button */}
      <TouchableOpacity
        style={[styles.backFloat, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* View on Map CTA */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={openOnMap}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Ionicons name="map" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>View on Map</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HERO_HEIGHT = 320;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  scroll: { paddingBottom: 130 },

  // Floating back button
  backFloat: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  backBtnPlain: {
    marginHorizontal: 16,
    marginTop: 8,
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: colors.surface,
  },
  heroImg: { width: '100%', height: '100%' },
  heroShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  // Content sheet
  sheet: {
    marginTop: -28,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 30,
    minHeight: 360,
  },

  emojiBadge: {
    position: 'absolute',
    top: -32,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  emojiBadgeText: { fontSize: 30 },

  name: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
    paddingRight: 72,
  },

  // Meta pills
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaPillText: { fontSize: 12.5, fontWeight: '700' },
  metaPillMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.surface + '55',
  },
  metaPillMutedText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMuted,
  },

  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },

  // Sections
  section: { marginTop: 26 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionCount: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  description: { fontSize: 15, color: colors.textMuted, lineHeight: 25 },

  // Locations
  locationsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface + 'AA',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 13 },
  locDivider: { borderBottomWidth: 1, borderBottomColor: colors.surface + '99' },
  locIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locInfo: { flex: 1 },
  locArea: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  locCoords: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: colors.textMuted },

  // CTA bar
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surface + '99',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
