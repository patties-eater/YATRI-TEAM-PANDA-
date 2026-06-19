import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CUISINES from '../cuisines';
import { type TabParamList } from '../navigation/TabNavigator';

const KATHMANDU: [number, number] = [27.7172, 85.324];

export default function MapScreen() {
  const route  = useRoute<RouteProp<TabParamList, 'Map'>>();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const ready  = useRef(false);
  const queue  = useRef<string[]>([]);

  const cuisineId = route.params?.cuisineId;

  // ── Request GPS, inject user marker when acquired ──
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      inject(`addUserMarker(${pos.coords.latitude}, ${pos.coords.longitude})`);
    })();
  }, []);

  // ── Focus cuisine when param arrives ──
  useEffect(() => {
    if (cuisineId) inject(`focusCuisine(${JSON.stringify(cuisineId)})`);
  }, [cuisineId]);

  // ── Inject helper: queues if map not ready yet ──
  function inject(js: string) {
    const cmd = js + '; true;';
    if (ready.current) {
      webRef.current?.injectJavaScript(cmd);
    } else {
      queue.current.push(cmd);
    }
  }

  function onLoadEnd() {
    ready.current = true;
    queue.current.forEach(cmd => webRef.current?.injectJavaScript(cmd));
    queue.current = [];
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <WebView
        ref={webRef}
        source={{ html: MAP_HTML }}
        style={styles.web}
        onLoadEnd={onLoadEnd}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

// ── Serialise cuisine data once at module load ──────────────────────────────
const CUISINE_DATA = JSON.stringify(
  CUISINES.map(c => ({
    id:          c.id,
    name:        c.name,
    emoji:       c.emoji,
    accent:      c.accent,
    category:    c.category,
    description: c.description,
    locations:   c.locations.map(l => ({
      id:   l.id,
      lat:  l.latitude,
      lng:  l.longitude,
      area: l.area,
    })),
  }))
);

// ── Static HTML – Leaflet + OpenStreetMap ───────────────────────────────────
const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html,body,#map { width:100%; height:100%; }
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .leaflet-popup-content {
      font-family: -apple-system, Helvetica, sans-serif;
      margin: 12px 14px;
    }
    .pop-name  { font-size:15px; font-weight:700; color:#3A3A35; margin-bottom:3px; }
    .pop-cat   { font-size:11px; font-weight:600; color:#778873; margin-bottom:5px; }
    .pop-area  { font-size:11px; color:#8A8577; }
    .pop-desc  { font-size:12px; color:#555; margin-top:6px; line-height:1.5; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var CUISINES = ${CUISINE_DATA};
  var DEFAULT  = [${KATHMANDU[0]}, ${KATHMANDU[1]}];

  var map = L.map('map', { zoomControl: true }).setView(DEFAULT, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\\u00a9 OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  /* ── Cuisine markers ── */
  var markerIndex = {};

  CUISINES.forEach(function(c) {
    markerIndex[c.id] = [];
    c.locations.forEach(function(loc) {
      var icon = L.divIcon({
        html: '<div style="'
          + 'width:38px;height:38px;'
          + 'background:#fff;'
          + 'border-radius:50%;'
          + 'display:flex;align-items:center;justify-content:center;'
          + 'font-size:19px;'
          + 'box-shadow:0 2px 8px rgba(0,0,0,0.22);'
          + 'border:2.5px solid ' + c.accent + ';'
          + '">' + c.emoji + '</div>',
        iconSize:   [38, 38],
        iconAnchor: [19, 19],
        className:  '',
      });

      var popHtml =
        '<div class="pop-name">' + c.emoji + '  ' + c.name + '</div>'
        + '<div class="pop-cat">' + c.category + '</div>'
        + '<div class="pop-area">&#128205; ' + loc.area + '</div>'
        + '<div class="pop-desc">' + c.description + '</div>';

      var m = L.marker([loc.lat, loc.lng], { icon: icon })
        .addTo(map)
        .bindPopup(popHtml, { maxWidth: 220 });

      markerIndex[c.id].push(m);
    });
  });

  /* ── User location (called from RN after GPS permission) ── */
  function addUserMarker(lat, lng) {
    var pulse = '<div style="'
      + 'width:18px;height:18px;'
      + 'background:#2D6A9F;'
      + 'border-radius:50%;'
      + 'border:3px solid #fff;'
      + 'box-shadow:0 0 0 4px rgba(45,106,159,0.28);'
      + '"></div>';
    var icon = L.divIcon({ html:pulse, iconSize:[18,18], iconAnchor:[9,9], className:'' });
    L.marker([lat, lng], { icon:icon, zIndexOffset:1000 })
      .addTo(map)
      .bindPopup('<b>\\ud83d\\udccd You are here</b>');
    map.setView([lat, lng], 14);
  }

  /* ── Focus a cuisine (called from RN when arriving from Details) ── */
  function focusCuisine(id) {
    var c = CUISINES.find(function(x){ return x.id === id; });
    if (!c || !c.locations.length) return;
    var first = c.locations[0];
    map.flyTo([first.lat, first.lng], 16, { duration: 1.0 });
    setTimeout(function() {
      var ms = markerIndex[id];
      if (ms && ms[0]) ms[0].openPopup();
    }, 1100);
  }
</script>
</body>
</html>`;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F2EC' },
  web:  { flex: 1 },
});
