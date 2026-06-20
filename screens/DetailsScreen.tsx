import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, font } from '../theme';
import CUISINES from '../cuisines';

type Category = { label: string; emoji: string };

const CATEGORIES: Category[] = [
  { label: 'All',         emoji: '🍽' },
  { label: 'Street Food', emoji: '🥡' },
  { label: 'Main Course', emoji: '🍛' },
  { label: 'Snack',       emoji: '🍿' },
  { label: 'Soup',        emoji: '🍲' },
  { label: 'Dessert',     emoji: '🍮' },
  { label: 'Curry',       emoji: '🫕' },
  { label: 'Side Dish',   emoji: '🥗' },
];

export default function DetailsScreen() {
  const navigation = useNavigation<any>();
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');

  const filtered = CUISINES.filter(c => {
    const matchCat    = category === 'All' || c.category === category;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function countFor(label: string) {
    if (label === 'All') return CUISINES.length;
    return CUISINES.filter(c => c.category === label).length;
  }

  const ListHeader = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Local Cuisine</Text>
        <Text style={styles.subtitle}>Explore Nepal's finest dishes</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map(cat => {
          const active = cat.label === category;
          const count  = countFor(cat.label);
          return (
            <TouchableOpacity
              key={cat.label}
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => setCategory(cat.label)}
              activeOpacity={0.75}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catText, active && styles.catTextActive]}>
                {cat.label}
              </Text>
              <View style={[styles.catCount, active && styles.catCountActive]}>
                <Text style={[styles.catCountText, active && styles.catCountTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results label */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filtered.length} dishes</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.surface} />
            <Text style={styles.emptyTitle}>No dishes found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.82}
            onPress={() => navigation.navigate('DishDetail', { cuisineId: item.id })}
          >
            {/* Dish image */}
            <View style={styles.imgWrap}>
              <Image
                source={{ uri: item.image }}
                style={styles.img}
                resizeMode="cover"
              />
            </View>

            {/* Info */}
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: item.accent + '22' }]}>
                  <Text style={[styles.catBadgeText, { color: item.accent }]}>
                    {item.category}
                  </Text>
                </View>
              </View>

              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.metaRow}>
                {item.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                <View style={styles.locHint}>
                  <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                  <Text style={styles.locText}>{item.locations.length} spots</Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={15} color={colors.surface} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title:    { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  searchInput: { flex: 1, fontSize: font.sizes.body, color: colors.text },

  // Category chips
  catRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catEmoji: { fontSize: 14 },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  catTextActive: { color: '#fff' },
  catCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  catCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  catCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  catCountTextActive: { color: '#fff' },

  resultsRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  list:      { paddingHorizontal: 16, paddingBottom: 28 },
  separator: { height: 10 },

  empty: { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyTitle:    { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  imgWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: colors.surface,
  },
  img: { width: '100%', height: '100%' },

  info:    { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:    { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },

  catBadge:     { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },

  desc: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  metaRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', alignItems: 'center' },
  tag: {
    backgroundColor: colors.surface + '99',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },

  locHint: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  locText:  { fontSize: 10, color: colors.textMuted },
});
