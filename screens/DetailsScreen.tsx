import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, font, gradients } from '../theme';
import { useCuisines } from '../data/cuisines';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES: string[] = [
  'All',
  'Veg',
  'Non Veg',
  'Street Food',
  'Main Course',
  'Snack',
  'Soup',
  'Dessert',
  'Curry',
  'Side Dish',
];

const H_PAD = 16;
const COL_GAP = 12;
const MAX_CONTENT_WIDTH = 720;

function getColumns(width: number) {
  if (width >= 920) return 3;
  if (width >= 600) return 2;
  return 1;
}

function smoothNext() {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(
      260,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity,
    ),
  );
}

function DishCard({
  item,
  index,
  onPress,
  cardWidth,
}: {
  item: any;
  index: number;
  onPress: () => void;
  cardWidth: number;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index, 9) * 65,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();

  return (
    <Animated.View
      style={{
        width: cardWidth,
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [22, 0],
            }),
          },
          { scale },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        <View style={styles.imgWrap}>
          <Image
            source={{ uri: item.image }}
            style={styles.img}
            resizeMode="cover"
          />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[styles.catBadge, { backgroundColor: item.accent + '22' }]}
            >
              <Text style={[styles.catBadgeText, { color: item.accent }]}>
                {item.category}
              </Text>
            </View>
          </View>

          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.locHint}>
              <Ionicons
                name="location-outline"
                size={11}
                color={colors.textMuted}
              />
              <Text style={styles.locText}>{item.locations.length} spots</Text>
            </View>
            {item.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chevron}>
          <Ionicons
            name="chevron-forward"
            size={15}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DetailsScreen() {
  const navigation = useNavigation<any>();
  const { cuisines: CUISINES, loading, error } = useCuisines();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const numColumns = getColumns(width);
  const available = contentWidth - H_PAD * 2;
  const cardWidth =
    numColumns === 1
      ? available
      : (available - COL_GAP * (numColumns - 1)) / numColumns;

  const intro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const filtered = CUISINES.filter(c => {
    const matchCat =
      category === 'All' ||
      c.category === category ||
      c.diet === category;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function onSelectCategory(label: string) {
    smoothNext();
    setCategory(label);
  }

  function onChangeSearch(text: string) {
    smoothNext();
    setSearch(text);
  }

  const ListHeader = (
    <Animated.View
      style={{
        opacity: intro,
        transform: [
          {
            translateY: intro.interpolate({
              inputRange: [0, 1],
              outputRange: [-16, 0],
            }),
          },
        ],
      }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Local Cuisine</Text>
        
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={onChangeSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onChangeSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map(label => {
          const active = label === category;
          return (
            <TouchableOpacity
              key={label}
              style={styles.catChipWrap}
              onPress={() => onSelectCategory(label)}
              activeOpacity={0.8}
            >
              {active ? (
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.catChip, styles.catChipActive]}
                >
                  <Text style={[styles.catText, styles.catTextActive]}>
                    {label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.catChip}>
                  <Text style={styles.catText}>{label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filtered.length} dishes</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        key={`cols-${numColumns}`}
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        columnWrapperStyle={
          numColumns > 1 ? { gap: COL_GAP } : undefined
        }
        contentContainerStyle={[
          styles.list,
          { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.emptySubtitle}>Loading dishes…</Text>
            </View>
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={40} color={colors.surface} />
              <Text style={styles.emptyTitle}>Couldn't load dishes</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.surface} />
              <Text style={styles.emptyTitle}>No dishes found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or category
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <DishCard
            item={item}
            index={index}
            cardWidth={cardWidth}
            onPress={() =>
              navigation.navigate('DishDetail', { cuisineId: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: font.sizes.body, color: colors.text },

  catRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  catChipWrap: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  catChipActive: {
    borderColor: 'transparent',
  },
  catText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.1,
  },
  catTextActive: { color: '#fff' },

  resultsRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  list: { paddingHorizontal: 16, paddingBottom: 28 },
  separator: { height: 12 },

  empty: { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  emptySubtitle: { fontSize: 13, color: colors.textMuted },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    gap: 13,
    borderWidth: 1,
    borderColor: colors.surface + 'AA',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  imgWrap: {
    width: 82,
    height: 82,
    borderRadius: radius.md,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  img: { width: '100%', height: '100%' },

  info: { flex: 1, gap: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },

  catBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    flexShrink: 0,
  },
  catBadgeText: { fontSize: 10, fontWeight: '700' },

  desc: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 1,
  },
  tag: {
    backgroundColor: colors.surface + '80',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  locHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surface + '40',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  locText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  chevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
