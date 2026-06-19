import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';
import GoogleLogo from '../components/GoogleLogo';
import YatriLogo from '../components/YatriLogo';
import { useNotification } from '../components/Notification';

type AuthMode = 'login' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { notify } = useNotification();

  const isSignup = mode === 'signup';

  const handleSubmit = () => {
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      notify({
        type: 'error',
        title: 'Missing details',
        message: 'Please fill in all fields to continue.',
      });
      return;
    }
    notify({
      type: 'success',
      title: isSignup ? `Welcome aboard${name ? ', ' + name.trim() : ''}!` : 'Welcome back!',
      message: isSignup
        ? 'Your journey with Yatri begins now.'
        : 'Signed in successfully.',
    });
  };

  const handleSocial = (provider: string) => {
    notify({
      type: 'info',
      title: `Continue with ${provider}`,
      message: `${provider} sign-in isn't connected yet.`,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <YatriLogo size={34} color={colors.white} />
            </View>
            <Text style={styles.title}>Yatri</Text>
            <Text style={styles.tagline}>Your companion through the valley</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isSignup && styles.toggleBtnActive]}
                onPress={() => setMode('login')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, !isSignup && styles.toggleTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isSignup && styles.toggleBtnActive]}
                onPress={() => setMode('signup')}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, isSignup && styles.toggleTextActive]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>

            {isSignup && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
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
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isSignup && (
              <TouchableOpacity style={styles.forgot} hitSlop={8}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>
                {isSignup ? 'Start Your Journey' : 'Continue Journey'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                activeOpacity={0.85}
                onPress={() => handleSocial('Google')}
              >
                <GoogleLogo size={18} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialBtn}
                activeOpacity={0.85}
                onPress={() => handleSocial('Apple')}
              >
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>
            By continuing, you agree to Yatri&apos;s{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  brand: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: font.family,
    fontSize: font.sizes.title,
    fontWeight: '700',
    color: colors.text,
  },
  tagline: {
    fontFamily: font.family,
    fontSize: font.sizes.tagline,
    color: colors.primary,
    marginTop: 2,
  },

  card: {
    width: '100%',
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: 22,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleText: { fontFamily: font.family, fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  toggleTextActive: { color: colors.text, fontWeight: '700' },

  field: { marginBottom: 14 },
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
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontFamily: font.family,
    fontSize: font.sizes.body,
    color: colors.text,
  },

  forgot: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -2 },
  forgotText: { fontFamily: font.family, fontSize: 13, color: colors.secondary, fontWeight: '600' },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    fontFamily: font.family,
    color: colors.white,
    fontSize: font.sizes.button,
    fontWeight: '700',
  },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: colors.surface },
  dividerText: {
    fontFamily: font.family,
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textMuted,
  },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface,
    backgroundColor: colors.card,
  },
  socialText: { fontFamily: font.family, fontSize: 15, color: colors.text, fontWeight: '600' },

  footer: {
    fontFamily: font.family,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 24,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  footerLink: { color: colors.primary, fontWeight: '600' },
});
