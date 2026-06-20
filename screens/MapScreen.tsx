import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CUISINES from '../cuisines';
import { type TabParamList } from '../navigation/TabNavigator';
import { colors, radius } from '../theme';

const KATHMANDU: [number, number] = [27.7172, 85.324];

const CATEGORIES = ['All', 'Street Food', 'Main Course', 'Snack', 'Soup', 'Dessert', 'Curry', 'Side Dish'];

export default function MapScreen() {
  const route  = useRoute<RouteProp<TabParamList, 'Map'>>();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const ready  = useRef(false);
  const queue  = useRef<string[]>([]);

  const cuisineId = route.params?.cuisineId;
  const [filterCat, setFilterCat] = useState('All');

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

  useEffect(() => {
    if (cuisineId) inject(`focusCuisine(${JSON.stringify(cuisineId)})`);
  }, [cuisineId]);

  useEffect(() => {
    inject(`filterCategory(${JSON.stringify(filterCat)})`);
  }, [filterCat]);

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
        source={{ html: MAP_HTML, baseUrl: 'https://openstreetmap.org' }}
        style={styles.web}
        onLoadEnd={onLoadEnd}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowUniversalAccessFromFileURLs
      />

      {/* Category filter chips — float over the map */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map(cat => {
            const active = cat === filterCat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilterCat(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

// ── Cuisine data serialised once at module load ─────────────────────────────
const CUISINE_DATA = JSON.stringify(
  CUISINES.map(c => ({
    id:          c.id,
    name:        c.name,
    emoji:       c.emoji,
    image:       c.image,
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

const LOC_LOOKUP = JSON.stringify(
  CUISINES.reduce<Record<string, { lat: number; lng: number; name: string }>>(
    (acc, c) => {
      c.locations.forEach(l => {
        acc[l.id] = { lat: l.latitude, lng: l.longitude, name: c.name };
      });
      return acc;
    },
    {}
  )
);

// ── Static HTML ─────────────────────────────────────────────────────────────
const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%}
    .leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 4px 16px rgba(0,0,0,.15)}
    .leaflet-popup-content{font-family:-apple-system,Helvetica,sans-serif;margin:12px 14px}
    .pn{font-size:15px;font-weight:700;color:#3A3A35;margin-bottom:3px}
    .pc{font-size:11px;font-weight:600;color:#778873;margin-bottom:5px}
    .pa{font-size:11px;color:#8A8577}
    .pd{font-size:12px;color:#555;margin-top:6px;line-height:1.5;margin-bottom:10px}
    .db{
      display:block;width:100%;padding:9px 0;
      background:#2D6A9F;color:#fff;
      border:none;border-radius:10px;
      font-size:13px;font-weight:700;cursor:pointer;text-align:center
    }
    .db:active{opacity:.75}
    #toast{
      position:fixed;bottom:18px;left:50%;transform:translateX(-50%);
      background:rgba(26,35,50,.9);color:#fff;
      padding:9px 20px;border-radius:20px;
      font-size:12px;font-weight:600;white-space:nowrap;
      opacity:0;transition:opacity .3s;z-index:9999;pointer-events:none
    }
  </style>
</head>
<body>
<div id="map"></div>
<div id="toast"></div>
<script>
  var CUISINES   = ${CUISINE_DATA};
  var LOC_LOOKUP = ${LOC_LOOKUP};
  var DEFAULT    = [${KATHMANDU[0]},${KATHMANDU[1]}];

  var map = L.map('map',{zoomControl:true}).setView(DEFAULT,13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  var userLat=${KATHMANDU[0]}, userLng=${KATHMANDU[1]};
  var routeOuter=null, routeInner=null;
  var markerIndex={};
  var categoryGroups={};
  var toastTimer=null;

  /* ── Toast ── */
  function showToast(msg){
    var el=document.getElementById('toast');
    el.textContent=msg;
    el.style.opacity='1';
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){el.style.opacity='0';},3500);
  }

  /* ── Clear route polylines ── */
  function clearRoute(){
    if(routeOuter){map.removeLayer(routeOuter);routeOuter=null;}
    if(routeInner){map.removeLayer(routeInner);routeInner=null;}
  }

  /* ── Show / hide categories (called from RN filter chips) ── */
  function filterCategory(cat){
    Object.keys(categoryGroups).forEach(function(key){
      var grp=categoryGroups[key];
      if(cat==='All'||key===cat){
        if(!map.hasLayer(grp))map.addLayer(grp);
      } else {
        if(map.hasLayer(grp))map.removeLayer(grp);
      }
    });
  }

  /* ── Directions via OSRM (free, no API key) ── */
  function getDirections(locId){
    var dest=LOC_LOOKUP[locId];
    if(!dest)return;
    clearRoute();
    showToast('Finding route...');
    var url='https://router.project-osrm.org/route/v1/driving/'
      +userLng+','+userLat+';'
      +dest.lng+','+dest.lat
      +'?overview=full&geometries=geojson';
    fetch(url)
      .then(function(r){return r.json();})
      .then(function(data){
        if(!data.routes||!data.routes[0]){showToast('No route found');return;}
        var coords=data.routes[0].geometry.coordinates;
        var lls=coords.map(function(c){return[c[1],c[0]];});
        var dist=(data.routes[0].distance/1000).toFixed(1);
        var mins=Math.round(data.routes[0].duration/60);
        routeInner=L.polyline(lls,{color:'#fff',weight:7,opacity:.55,interactive:false}).addTo(map);
        routeOuter=L.polyline(lls,{color:'#2D6A9F',weight:4,opacity:.9,dashArray:'10 6'}).addTo(map);
        map.fitBounds(routeOuter.getBounds(),{padding:[50,50]});
        showToast(dist+' km  ~'+mins+' min to '+dest.name);
      })
      .catch(function(){showToast('Could not load route');});
  }

  /* ── Cuisine markers grouped by category ── */
  CUISINES.forEach(function(c){
    markerIndex[c.id]=[];
    if(!categoryGroups[c.category]){
      categoryGroups[c.category]=L.layerGroup().addTo(map);
    }
    c.locations.forEach(function(loc){
      var icon=L.divIcon({
        html:'<div style="width:42px;height:42px;border-radius:50%;overflow:hidden;'
          +'box-shadow:0 2px 10px rgba(0,0,0,.28);border:3px solid '+c.accent+';">'
          +'<img src="'+c.image+'" style="width:100%;height:100%;object-fit:cover;" />'
          +'</div>',
        iconSize:[42,42],iconAnchor:[21,21],className:'',
      });
      var pop='<div style="margin:-1px -1px 10px;border-radius:10px 10px 0 0;overflow:hidden;height:96px;">'
          +'<img src="'+c.image+'" style="width:100%;height:100%;object-fit:cover;" /></div>'
        +'<div class="pn">'+c.name+'</div>'
        +'<div class="pc">'+c.category+'</div>'
        +'<div class="pa">&#128205; '+loc.area+'</div>'
        +'<div class="pd">'+c.description+'</div>'
        +'<button class="db" data-id="'+loc.id+'">&#128694; Get Directions</button>';
      var m=L.marker([loc.lat,loc.lng],{icon:icon})
        .bindPopup(pop,{maxWidth:240});
      categoryGroups[c.category].addLayer(m);

      m.on('popupopen',function(e){
        clearRoute();
        var btn=e.popup.getElement().querySelector('[data-id]');
        if(!btn)return;
        L.DomEvent.on(btn,'click',function(ev){
          L.DomEvent.stopPropagation(ev);
          getDirections(btn.getAttribute('data-id'));
        });
      });

      markerIndex[c.id].push(m);
    });
  });

  /* ── User location ── */
  function addUserMarker(lat,lng){
    userLat=lat; userLng=lng;
    var html='<div style="width:18px;height:18px;background:#2D6A9F;border-radius:50%;'
      +'border:3px solid #fff;box-shadow:0 0 0 4px rgba(45,106,159,.28);"></div>';
    var icon=L.divIcon({html:html,iconSize:[18,18],iconAnchor:[9,9],className:''});
    L.marker([lat,lng],{icon:icon,zIndexOffset:1000})
      .addTo(map)
      .bindPopup('<b>You are here</b>');
    map.setView([lat,lng],14);
  }

  /* ── Focus cuisine from Details tab ── */
  function focusCuisine(id){
    clearRoute();
    var c=CUISINES.find(function(x){return x.id===id;});
    if(!c||!c.locations.length)return;
    /* ensure the cuisine's category group is visible */
    if(categoryGroups[c.category]&&!map.hasLayer(categoryGroups[c.category])){
      map.addLayer(categoryGroups[c.category]);
    }
    var f=c.locations[0];
    map.flyTo([f.lat,f.lng],16,{duration:1.0});
    setTimeout(function(){
      var ms=markerIndex[id];
      if(ms&&ms[0])ms[0].openPopup();
    },1100);
  }
<\/script>
</body>
</html>`;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F2EC' },
  web:  { flex: 1 },

  filterBar: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextActive: {
    color: '#fff',
  },
});
