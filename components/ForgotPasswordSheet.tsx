import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import { useNotification } from './Notification';

type Props = {
  visible: boolean;
  onClose: () => void;
  defaultEmail?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordSheet({ visible, onClose, defaultEmail = '' }: Props) {
  const { notify } = useNotification();
  const [rendered, setRendered] = useState(visible);
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);

  const translateY = useRef(new Animated.Value(400)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setEmail(defaultEmail);
      setRendered(true);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 14,
        }),
      ]).start();
    } else if (rendered) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 400,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setRendered(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSend = () => {
    if (!EMAIL_RE.test(email.trim())) {
      notify({
        type: 'error',
        title: 'Invalid email',
        message: 'Please enter a valid email address.',
      });
      return;
    }
    setSending(true);
    // Simulate a network request.
    setTimeout(() => {
      setSending(false);
      onClose();
      notify({
        type: 'success',
        title: 'Reset link sent',
        message: `Check ${email.trim()} for a link to reset your password.`,
      });
    }, 700);
  };

  if (!rendered) return null;

  return (
    <Modal transparent visible={rendered} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable style={styles.fill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.grabber} />

          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
          </View>

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email linked to your account and we&apos;ll send you a link to reset your
            password.
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, sending && styles.primaryBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={sending}
          >
            <Text style={styles.primaryBtnText}>
              {sending ? 'Sending…' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} hitSlop={8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    marginTop: 'auto',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 32,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
    marginBottom: 18,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: font.family,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.family,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    fontFamily: font.family,
    fontSize: font.sizes.label,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontFamily: font.family,
    fontSize: font.sizes.body,
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    fontFamily: font.family,
    color: colors.white,
    fontSize: font.sizes.button,
    fontWeight: '700',
  },
  cancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  cancelText: {
    fontFamily: font.family,
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
