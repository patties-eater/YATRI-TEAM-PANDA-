import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme';
import { useCuisines } from '../data/cuisines';
import { dishImageSource } from '../data/dishImages';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DishDetail'>;
type Route = RouteProp<RootStackParamList, 'DishDetail'>;

export default function DishDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { getCuisine } = useCuisines();
  const dish = getCuisine(params.cuisineId);
  const [speaking, setSpeaking] = useState(false);
  const [showFull, setShowFull] = useState(false);

  // Stop any narration when leaving the screen.
  useEffect(() => () => { Speech.stop(); }, []);

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

  function openOnMap(lat?: number, lng?: number) {
    navigation.navigate('Tabs', {
      screen: 'Map',
      params: {
        cuisineId: dish!.id,
        latitude: lat,
        longitude: lng,
      },
    });
  }

  function toggleSpeak() {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    const body = showFull && dish!.storyLong ? dish!.storyLong : dish!.story;
    const parts = [dish!.name, dish!.description, dish!.whyFamous, body].filter(Boolean);
    const text = parts.join('. ');
    try {
      Speech.stop();
      Speech.speak(text, {
        rate: 0.95,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => {
          setSpeaking(false);
          Alert.alert('Voice unavailable', 'Text-to-speech is not available on this device.');
        },
      });
      setSpeaking(true);
    } catch {
      setSpeaking(false);
      Alert.alert('Voice unavailable', 'Text-to-speech is not available on this device.');
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.hero}>
          <Image source={dishImageSource(dish.id, dish.image)} style={styles.heroImg} resizeMode="cover" />
          <View style={[styles.emojiBadge, { backgroundColor: dish.accent }]}>
            <Text style={styles.emojiBadgeText}>{dish.emoji}</Text>
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{dish.name}</Text>
          <View style={[styles.catBadge, { backgroundColor: dish.accent + '22' }]}>
            <Text style={[styles.catBadgeText, { color: dish.accent }]}>{dish.category}</Text>
          </View>
        </View>

        {dish.tags.length > 0 && (
          <View style={styles.tagRow}>
            {dish.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>About</Text>
            <TouchableOpacity
              style={[styles.listenBtn, speaking && styles.listenBtnActive]}
              onPress={toggleSpeak}
              activeOpacity={0.85}
            >
              <Ionicons
                name={speaking ? 'stop' : 'volume-high'}
                size={14}
                color={speaking ? '#fff' : colors.primary}
              />
              <Text style={[styles.listenText, speaking && styles.listenTextActive]}>
                {speaking ? 'Stop' : 'Listen'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{dish.description}</Text>
        </View>

        {dish.whyFamous ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why it's famous</Text>
            <Text style={styles.description}>{dish.whyFamous}</Text>
          </View>
        ) : null}

        {(dish.story || dish.storyLong) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The story</Text>
            <Text style={styles.description}>
              {showFull && dish.storyLong ? dish.storyLong : dish.story ?? dish.storyLong}
            </Text>
            {dish.storyLong && dish.story ? (
              <TouchableOpacity
                style={styles.moreLink}
                onPress={() => setShowFull(v => !v)}
                activeOpacity={0.7}
              >
                <Text style={styles.moreLinkText}>
                  {showFull ? 'Show summary' : 'Read full story'}
                </Text>
                <Ionicons
                  name={showFull ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Where to find it
            <Text style={styles.sectionCount}> · {dish.locations.length} spots</Text>
          </Text>

          <View style={styles.locationsCard}>
            {dish.locations.map((loc, i) => (
              
              <TouchableOpacity
                key={loc.id}
                activeOpacity={0.7}
                onPress={() => openOnMap(loc.latitude, loc.longitude)}
                style={[
                  styles.locRow,
                  i < dish.locations.length - 1 && styles.locDivider,
                ]}
              >
                <View style={[styles.locIconBox, { backgroundColor: dish.accent + '18' }]}>
                  <Ionicons name="location" size={16} color={dish.accent} />
                </View>

                <View style={styles.locInfo}>
                  <Text style={styles.locAreaLarge}>{loc.area}</Text>
                </View>

                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: dish.accent }]}
          onPress={() => openOnMap()}
          activeOpacity={0.85}
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

  hero: {
    marginHorizontal: 16,
    marginVertical: 12,
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  heroImg: { width: '100%', height: '100%' },

  emojiBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiBadgeText: { fontSize: 24 },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  name: { fontSize: 28, fontWeight: '800', color: colors.text },

  catBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  catBadgeText: { fontSize: 13, fontWeight: '700' },

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

  tagText: { fontSize: 12, color: colors.textMuted },

  section: { paddingHorizontal: 16, marginBottom: 20 },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listenBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  listenText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  listenTextActive: { color: '#fff' },

  moreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  moreLinkText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  sectionTitle: { fontSize: 15, fontWeight: '700' },

  sectionCount: { fontSize: 13, color: colors.textMuted },

  description: { fontSize: 15, color: colors.textMuted, lineHeight: 24 },

  locationsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface,
    overflow: 'hidden',
  },

  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },

  locDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },

  locIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locInfo: { flex: 1 },

  locAreaLarge: {
    fontSize: 16,
    fontWeight: '700',
  },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  notFoundText: { fontSize: 16, color: colors.textMuted },

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
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: radius.md,
    gap: 8,
  },

  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});