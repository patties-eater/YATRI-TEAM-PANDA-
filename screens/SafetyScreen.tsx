import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SafetyScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.label}>Safety</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F2EC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 20, fontWeight: '700', color: '#3A3A35' },
});
