import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getTrail } from '../data';

const { width } = Dimensions.get('window');

const SLATE       = '#1A2332';
const SUMMIT_BLUE = '#2D6A9F';
const ALERT_RED   = '#E23B3B';
const HERO_H      = 260;
const BAR_H       = 148;

const DIFF_COLOR = {
  Easy:     '#4CAF50',
  Moderate: '#FF9800',
  Hard:     ALERT_RED,
} as const;

type DLState = 'idle' | 'loading' | 'done';

export default function TrailDetailScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const insets     = useSafeAreaInsets();

  const trailId = route.params?.trailId ?? 'ebc';
  const trail   = getTrail(trailId) ?? getTrail('ebc')!;

  const [bookmarked, setBookmarked] = useState(false);
  const [dlState,    setDlState]    = useState<DLState>('idle');
  const [modal,      setModal]      = useState(false);
  const [toast,      setToast]      = useState(false);

  function handleDownload() {
    if (dlState !== 'idle') return;
    setDlState('loading');
    setTimeout(() => setDlState('done'), 2000);
  }

  function handleConfirm() {
    setModal(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  const diffColor = DIFF_COLOR[trail.difficulty];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={SLATE} />

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: BAR_H + insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('../assets/trail-hero.png')}
            style={styles.heroImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(26,35,50,0.65)', 'rgba(26,35,50,0.97)']}
            locations={[0.25, 0.6, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Back */}
          <TouchableOpacity
            style={[styles.floatBtn, { top: insets.top + 10, left: 14 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Bookmark */}
          <TouchableOpacity
            style={[styles.floatBtn, { top: insets.top + 10, right: 14 }]}
            onPress={() => setBookmarked(b => !b)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={bookmarked ? '#64B5F6' : '#fff'}
            />
          </TouchableOpacity>

          {/* Name + region */}
          <View style={styles.heroLabels}>
            <Text style={styles.trailName}>{trail.name}</Text>
            <View style={styles.regionRow}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.regionText}>{trail.region}</Text>
            </View>
          </View>
        </View>

        {/* ── Quick stats ── */}
        <View style={styles.statsCard}>
          <View style={[styles.diffPill, { backgroundColor: diffColor + '22', borderColor: diffColor }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{trail.difficulty}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={15} color={SUMMIT_BLUE} />
            <Text style={styles.statText}>{trail.days}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Ionicons name="trending-up-outline" size={15} color={SUMMIT_BLUE} />
            <Text style={styles.statText}>{trail.maxAltitude}</Text>
          </View>
        </View>

        {/* ── Elevation profile ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Elevation Profile</Text>
          <Image
            source={require('../assets/elevation.png')}
            style={styles.elevImg}
            resizeMode="cover"
          />
        </View>

        {/* ── About ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{trail.description}</Text>
        </View>

        {/* ── Offline access ── */}
        <View style={[styles.card, { marginBottom: 4 }]}>
          <Text style={styles.sectionTitle}>Offline Access</Text>
          <TouchableOpacity
            style={[styles.dlBtn, dlState === 'done' && styles.dlBtnDone]}
            onPress={handleDownload}
            activeOpacity={0.75}
            disabled={dlState !== 'idle'}
          >
            <Ionicons
              name={
                dlState === 'idle'    ? 'cloud-download-outline' :
                dlState === 'loading' ? 'hourglass-outline' :
                'checkmark-circle-outline'
              }
              size={18}
              color={dlState === 'done' ? '#4CAF50' : SUMMIT_BLUE}
            />
            <Text style={[styles.dlText, dlState === 'done' && styles.dlTextDone]}>
              {dlState === 'idle'    ? 'Download offline map' :
               dlState === 'loading' ? 'Downloading…' :
               'Downloaded ✓'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── Toast ── */}
      {toast && (
        <View style={[styles.toast, { bottom: BAR_H + insets.bottom + 14 }]}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.toastText}>Porter request sent ✓</Text>
        </View>
      )}

      {/* ── Fixed bottom action bar ── */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.actionRow}>
          <Text style={styles.priceLabel}>{trail.porterPrice}</Text>
          <TouchableOpacity
            style={styles.porterBtn}
            onPress={() => setModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.porterBtnText}>Book a Porter</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('ActiveTrek')}
          activeOpacity={0.85}
        >
          <Ionicons name="walk" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Start Trek</Text>
        </TouchableOpacity>
      </View>

      {/* ── Porter modal ── */}
      <Modal
        visible={modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIcon}>
              <Ionicons name="person" size={22} color={SUMMIT_BLUE} />
            </View>
            <Text style={styles.modalTitle}>Request a Porter</Text>
            <Text style={styles.modalBody}>
              Request a porter for this trek?{'\n'}
              A local guide will be assigned within 24 hours.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: SLATE },
  scroll: { flex: 1 },

  // ── Hero ──
  hero: { height: HERO_H, overflow: 'hidden' },
  heroImg: { width, height: HERO_H },
  floatBtn: {
    position: 'absolute',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroLabels: { position: 'absolute', bottom: 18, left: 18, right: 18 },
  trailName: {
    color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: 0.2,
  },
  regionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  regionText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },

  // ── Stats ──
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E2E42',
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16,
    gap: 14,
  },
  diffPill: {
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  diffText: { fontSize: 12, fontWeight: '700' },
  statDivider: { width: 1, height: 20, backgroundColor: '#2D4060' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  statText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600', flexShrink: 1 },

  // ── Cards ──
  card: {
    backgroundColor: '#1E2E42',
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, padding: 20,
  },
  sectionTitle: {
    color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 14,
  },

  // ── Elevation ──
  elevImg: { width: '100%', height: 150, borderRadius: 12, overflow: 'hidden' },

  // ── About ──
  description: { color: '#94A3B8', fontSize: 14, lineHeight: 22 },

  // ── Download ──
  dlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: SUMMIT_BLUE,
    borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16,
  },
  dlBtnDone:  { borderColor: '#4CAF50' },
  dlText:     { color: SUMMIT_BLUE, fontSize: 14, fontWeight: '600' },
  dlTextDone: { color: '#4CAF50' },

  // ── Toast ──
  toast: {
    position: 'absolute', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1E3A2F',
    borderRadius: 24, paddingHorizontal: 20, paddingVertical: 11,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 10,
  },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // ── Action bar ──
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#182638',
    borderTopWidth: 1, borderTopColor: '#253649',
    paddingHorizontal: 16, paddingTop: 14, gap: 10,
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  porterBtn: {
    backgroundColor: SUMMIT_BLUE,
    borderRadius: 22, paddingHorizontal: 20, paddingVertical: 10,
  },
  porterBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1E5B8F',
    borderRadius: 16, paddingVertical: 14,
  },
  startBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ── Modal ──
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#1E2E42', borderRadius: 24,
    padding: 26, width: width - 48,
    shadowColor: '#000', shadowOpacity: 0.5,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    elevation: 20,
  },
  modalIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: SUMMIT_BLUE + '22',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  modalBody:  { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 26 },
  modalBtns:  { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#2D4060',
    borderRadius: 14, paddingVertical: 13, alignItems: 'center',
  },
  cancelText:  { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 1, backgroundColor: SUMMIT_BLUE,
    borderRadius: 14, paddingVertical: 13, alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
