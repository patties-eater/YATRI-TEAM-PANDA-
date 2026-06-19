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

type Suggestion = {
  id: string;
  title: string;
  description: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    title: 'Explore Patan Durbar',
    description: 'Historically rich architecture and hidden cafes within the square.',
  },
];

const QUICK_REPLIES = [
  'Plan my 2 days',
  'Best momo near me',
  'Best rated hotel',
  'Hidden gems',
  'Top trekking routes',
  'Local festivals',
];

export default function Plan() {
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yatri</Text>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={colors.white} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        {/* Conversation */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.chat}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.botRow}>
            <View style={styles.botBadge}>
              <Ionicons name="leaf" size={13} color={colors.white} />
            </View>
            <Text style={styles.botName}>Yatri</Text>
          </View>

          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Namaste! I can help you plan your Kathmandu adventure. What are you looking for?
            </Text>
          </View>
          <Text style={styles.timestamp}>Just now</Text>

          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s.id} style={styles.suggestion} activeOpacity={0.85}>
              <View style={styles.suggestionImage}>
                <Ionicons name="business-outline" size={26} color={colors.primary} />
              </View>
              <View style={styles.suggestionBody}>
                <Text style={styles.suggestionTitle}>{s.title}</Text>
                <Text style={styles.suggestionDesc}>{s.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick replies */}
        <View style={styles.quickWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_REPLIES.map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.chip}
                activeOpacity={0.8}
                onPress={() => setMessage(q)}
              >
                <Text style={styles.chipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.addBtn} hitSlop={6}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message Yatri..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            activeOpacity={0.85}
            disabled={!message.trim()}
            onPress={() => setMessage('')}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: font.family,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginLeft: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },

  chat: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  botRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  botBadge: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  botName: {
    fontFamily: font.family,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },

  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bubbleText: {
    fontFamily: font.family,
    fontSize: font.sizes.body,
    color: colors.white,
    lineHeight: 22,
  },
  timestamp: {
    fontFamily: font.family,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 18,
  },

  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  suggestionImage: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionBody: { flex: 1 },
  suggestionTitle: {
    fontFamily: font.family,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  suggestionDesc: {
    fontFamily: font.family,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },

  quickWrap: { flexGrow: 0, flexShrink: 0 },
  quickRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  chip: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    height: 30,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: font.family,
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: font.family,
    fontSize: font.sizes.body,
    color: colors.text,
    maxHeight: 100,
    paddingHorizontal: 4,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },

});
