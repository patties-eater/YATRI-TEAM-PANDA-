import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, radius } from '../theme';

const EMERGENCY_SERVICES = [
  { id: 'police', label: 'Nepal Police', number: '100', icon: 'shield-checkmark' as const, color: '#3B6FE2' },
  { id: 'ambulance', label: 'Ambulance', number: '102', icon: 'medkit' as const, color: '#E23B3B' },
  { id: 'fire', label: 'Fire Brigade', number: '101', icon: 'flame' as const, color: '#E2873B' },
  { id: 'tourist_police', label: 'Tourist Police', number: '1144', icon: 'people' as const, color: '#778873' },
];

export default function SOSScreen() {
  const pulse = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const [locationText, setLocationText] = useState<string | null>(null);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  function callNumber(number: string, label: string) {
    Alert.alert(
      `Call ${label}`,
      `Dial ${number} now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${number}`,
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${number}`),
        },
      ]
    );
  }

  async function shareLocation() {
    setFetchingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location access to share your position.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      setLocationText(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      await Linking.openURL(
        Platform.OS === 'ios'
          ? `sms:&body=My location: ${mapsUrl}`
          : `sms:?body=My location: ${mapsUrl}`
      );
    } catch {
      Alert.alert('Error', 'Could not fetch location. Please try again.');
    } finally {
      setFetchingLoc(false);
    }
  }

  function handleSOS() {
    Alert.alert(
      'Send SOS',
      'This will call Tourist Police (1144) — the emergency line for travellers in Nepal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:1144'),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>Stay calm — help is available 24/7</Text>
        </View>

        <View style={styles.sosWrapper}>
          <Animated.View style={[styles.sosRing, { opacity: ringOpacity }]} />
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <TouchableOpacity
              style={styles.sosButton}
              activeOpacity={0.85}
              onPress={handleSOS}
            >
              {/* CHANGED: Swapped "warning" for "location" pin icon */}
              <Ionicons name="location" size={36} color="#fff" />
              <Text style={styles.sosLabel}>SOS</Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.sosMeta}>Tap to call Tourist Police (1144)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
          <View style={styles.servicesGrid}>
            {EMERGENCY_SERVICES.map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={styles.serviceCard}
                activeOpacity={0.8}
                onPress={() => callNumber(svc.number, svc.label)}
              >
                <View style={[styles.serviceIconBox, { backgroundColor: svc.color + '18' }]}>
                  <Ionicons name={svc.icon} size={26} color={svc.color} />
                </View>
                <Text style={styles.serviceLabel}>{svc.label}</Text>
                <View style={[styles.numberBadge, { backgroundColor: svc.color + '14' }]}>
                  <Text style={[styles.serviceNumber, { color: svc.color }]}>{svc.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share My Location</Text>
          <TouchableOpacity
            style={styles.locationCard}
            activeOpacity={0.82}
            onPress={shareLocation}
            disabled={fetchingLoc}
          >
            <View style={styles.locationIconBox}>
              <Ionicons name="location" size={22} color={colors.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>
                {fetchingLoc ? 'Getting location…' : 'Send via SMS'}
              </Text>
              <Text style={styles.locationSub}>
                {locationText ?? 'Opens your messaging app with a Google Maps link'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.disclaimer, { color: '#222', opacity: 1 }]}>
          Powered By JOJO
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
  paddingBottom: 120,
  flexGrow: 1,
},

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 3 },

  sosWrapper: { alignItems: 'center', paddingVertical: 36, position: 'relative' },
  sosRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    borderColor: '#E23B3B',
    top: 36 - 17,
  },
  sosButton: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: '#E23B3B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#E23B3B',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  sosLabel: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  sosMeta: { marginTop: 18, fontSize: 13, color: colors.textMuted, fontWeight: '500' },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  serviceCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.surface,
  },

  serviceIconBox: {
    width: 52, height: 52,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceLabel: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center' },

  numberBadge: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },

  serviceNumber: { fontSize: 14, fontWeight: '800' },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.surface,
  },

  locationIconBox: {
    width: 46, height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationInfo: { flex: 1, gap: 3 },

  locationTitle: { fontSize: 15, fontWeight: '700', color: colors.text },

  locationSub: { fontSize: 12, color: colors.textMuted, lineHeight: 16 },

  disclaimer: {
    marginHorizontal: 20,
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    opacity: 0.8,
  },
});