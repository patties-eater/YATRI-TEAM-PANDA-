import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, font } from '../theme';
import CUISINES, { type Cuisine } from '../cuisines';

const CATEGORIES = ['All', 'Street Food', 'Main Course', 'Snack', 'Soup', 'Dessert', 'Curry', 'Side Dish'];

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

  function handlePress(item: Cuisine) {
    navigation.navigate('Map', { cuisineId: item.id });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Local Cuisine</Text>
        <Text style={styles.subtitle}>{filtered.length} dishes found</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        renderItem={({ item }) => {
          const active = item === category;
          return (
            <TouchableOpacity
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => setCategory(item)}
              activeOpacity={0.75}
            >
              <Text style={[styles.catText, active && styles.catTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Cuisine list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No dishes found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.82}
            onPress={() => handlePress(item)}
          >
            {/* Emoji tile */}
            <View style={[styles.emojiBox, { backgroundColor: item.accent + '22' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: item.accent + '22' }]}>
                  <Text style={[styles.catBadgeText, { color: item.accent }]}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.tagRow}>
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

            <Ionicons name="map-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  title:    { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

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

  catRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText:       { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  catTextActive: { color: colors.white },

  list:      { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 10 },
  empty:     { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.textMuted, fontSize: 15 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  emojiBox: {
    width: 58, height: 58, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  emoji: { fontSize: 28 },

  info:    { flex: 1, gap: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name:    { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },

  catBadge:     { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },

  desc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },

  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  tag: {
    backgroundColor: colors.surface + '88',
    borderRadius: radius.pill,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  tagText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

  locHint: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 2 },
  locText:  { fontSize: 11, color: colors.textMuted },
});
