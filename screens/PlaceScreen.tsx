import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme';
import { useCuisines } from '../data/cuisines';
import { dishImageSource } from '../data/dishImages';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Place'>;
type Route = RouteProp<RootStackParamList, 'Place'>;

export default function PlaceScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { cuisines, loading } = useCuisines();

  const dishes = cuisines.filter(c =>
    c.locations.some(l => l.isOrigin && params.areaKeys.includes(l.area)),
  );

  function openDish(cuisineId: string) {
    navigation.navigate('DishDetail', { cuisineId });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{params.name}</Text>
          <Text style={styles.subtitle}>{dishes.length} dishes to try here</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loading && dishes.length === 0 ? (
          <View style={styles.empty}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : dishes.length === 0 ? (
          <Text style={styles.emptyText}>No dishes listed here yet.</Text>
        ) : (
          dishes.map(d => (
            <TouchableOpacity
              key={d.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => openDish(d.id)}
            >
              <Image source={dishImageSource(d.id, d.image)} style={styles.img} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{d.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {d.category}
                  {d.originPlace ? ` · ${d.originPlace}` : ''}
                </Text>
              </View>
              <View style={styles.mapBtn}>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  list: { paddingHorizontal: 16, paddingBottom: 28, gap: 12 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  img: {
    width: 60, height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  mapBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: 28,
  },
});
