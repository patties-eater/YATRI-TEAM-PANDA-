import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";

import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#555" />
        </TouchableOpacity>

        <Text style={styles.logo}>Yatri</Text>

        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoryRow}>
        <TouchableOpacity style={[styles.chip, styles.activeChip]}>
          <Text style={styles.activeChipText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip}>
          <Text>Food</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip}>
          <Text>Temples</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip}>
          <Text>Hidden Gems</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#777" />

        <TextInput
          placeholder="Where to, explore?"
          style={styles.searchInput}
        />

        <MaterialIcons name="tune" size={22} color="#666" />
      </View>

      {/* Map Area */}
      <View style={styles.mapArea}>
        <View style={styles.pin}>
          <MaterialIcons name="restaurant" size={18} color="#fff" />
        </View>

        <View style={styles.locationLabel}>
          <Text>Patan Durbar Square</Text>
        </View>

        <TouchableOpacity style={styles.magicBtn}>
          <Ionicons name="sparkles" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Card */}
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
          }}
          style={styles.cardImage}
        />

        <View style={styles.cardContent}>
          <Text style={styles.hiddenGem}>✨ HIDDEN GEM</Text>

          <Text style={styles.title}>Patan Durbar Square</Text>

          <Text style={styles.description}>
            UNESCO World Heritage site known for its exquisite Newar
            architecture.
          </Text>

          <Text style={styles.distance}>📍 1.2 km away</Text>

          <TouchableOpacity style={styles.directionBtn}>
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text style={styles.directionText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="flash" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItemActive}>
          <Ionicons name="compass" size={22} color="#4E6B4A" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={22} color="#666" />
          <Text style={styles.navText}>Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="scan-outline" size={22} color="#666" />
          <Text style={styles.navText}>Lens</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="shield-outline" size={22} color="#666" />
          <Text style={styles.navText}>Safety</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2EC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  logo: {
    fontSize: 26,
    fontWeight: "700",
    color: "#566C53",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  categoryRow: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 10,
  },

  chip: {
    backgroundColor: "#F2EFE8",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  activeChip: {
    backgroundColor: "#566C53",
  },

  activeChipText: {
    color: "#fff",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 55,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
  },

  mapArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  pin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#70856A",
    justifyContent: "center",
    alignItems: "center",
  },

  locationLabel: {
    marginTop: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  magicBtn: {
    marginTop: 25,
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#B8D0B0",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 20,
    padding: 12,
    elevation: 3,
  },

  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
  },

  hiddenGem: {
    color: "#888",
    fontSize: 11,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
  },

  description: {
    color: "#666",
    marginTop: 4,
  },

  distance: {
    marginTop: 8,
    color: "#6B7F66",
  },

  directionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#566C53",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },

  directionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },

  fab: {
    position: "absolute",
    bottom: 95,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#566C53",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomNav: {
    height: 80,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
  },

  navItemActive: {
    alignItems: "center",
    backgroundColor: "#DDE8D5",
    padding: 10,
    borderRadius: 12,
  },

  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});