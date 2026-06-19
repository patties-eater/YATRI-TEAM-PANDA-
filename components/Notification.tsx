import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';

type NotifType = 'success' | 'error' | 'info';

type NotifOptions = {
  title: string;
  message?: string;
  type?: NotifType;
  /** auto-dismiss after this many ms (default 3500) */
  duration?: number;
};

type NotifContextValue = {
  notify: (opts: NotifOptions) => void;
};

const NotificationContext = createContext<NotifContextValue | null>(null);

/** Hook to fire a native-style in-app notification banner. */
export function useNotification(): NotifContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside <NotificationProvider>');
  return ctx;
}

const ICONS: Record<NotifType, { name: keyof typeof Ionicons.glyphMap; tint: string }> = {
  success: { name: 'checkmark-circle', tint: colors.primary },
  error: { name: 'alert-circle', tint: '#D9534F' },
  info: { name: 'information-circle', tint: colors.secondary },
};

const TOP_OFFSET = (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 52) + 8;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NotifOptions | null>(null);
  const translateY = useRef(new Animated.Value(-160)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.timing(translateY, {
      toValue: -160,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setData(null));
  }, [translateY]);

  const notify = useCallback(
    (opts: NotifOptions) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setData(opts);
      translateY.setValue(-160);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
        speed: 14,
      }).start();
      hideTimer.current = setTimeout(hide, opts.duration ?? 3500);
    },
    [hide, translateY],
  );

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  // Swipe up to dismiss, like a real notification.
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dy < -6,
      onPanResponderMove: (_e, g) => {
        if (g.dy < 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy < -40) hide();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
      },
    }),
  ).current;

  const icon = data ? ICONS[data.type ?? 'info'] : ICONS.info;

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {data && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrap, { transform: [{ translateY }] }]}
          {...pan.panHandlers}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={hide} style={styles.banner}>
            <View style={[styles.iconWrap, { backgroundColor: icon.tint + '22' }]}>
              <Ionicons name={icon.name} size={22} color={icon.tint} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.title} numberOfLines={1}>
                {data.title}
              </Text>
              {!!data.message && (
                <Text style={styles.message} numberOfLines={2}>
                  {data.message}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.grabber} />
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: TOP_OFFSET,
    left: 12,
    right: 12,
    zIndex: 1000,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: { flex: 1 },
  title: {
    fontFamily: font.family,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontFamily: font.family,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
    marginTop: 6,
  },
});
