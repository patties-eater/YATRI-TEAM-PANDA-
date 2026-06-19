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
    </View>
  );
}

// ── Cuisine data serialised once at module load ─────────────────────────────
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

// Flat lookup keyed by location id (e.g. "1a") — used by getDirections
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

  /* Default to Kathmandu centre; overwritten when real GPS arrives */
  var userLat=${KATHMANDU[0]}, userLng=${KATHMANDU[1]};
  var routeOuter=null, routeInner=null;
  var markerIndex={};
  var toastTimer=null;

  /* ── Toast banner ── */
  function showToast(msg){
    var el=document.getElementById('toast');
    el.textContent=msg;
    el.style.opacity='1';
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){el.style.opacity='0';},3500);
  }

  /* ── Remove route polylines ── */
  function clearRoute(){
    if(routeOuter){map.removeLayer(routeOuter);routeOuter=null;}
    if(routeInner){map.removeLayer(routeInner);routeInner=null;}
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

  /* ── Cuisine markers ── */
  CUISINES.forEach(function(c){
    markerIndex[c.id]=[];
    c.locations.forEach(function(loc){
      var icon=L.divIcon({
        html:'<div style="width:38px;height:38px;background:#fff;border-radius:50%;'
          +'display:flex;align-items:center;justify-content:center;font-size:19px;'
          +'box-shadow:0 2px 8px rgba(0,0,0,.22);border:2.5px solid '+c.accent+';">'
          +c.emoji+'</div>',
        iconSize:[38,38],iconAnchor:[19,19],className:'',
      });
      var pop='<div class="pn">'+c.emoji+'  '+c.name+'</div>'
        +'<div class="pc">'+c.category+'</div>'
        +'<div class="pa">&#128205; '+loc.area+'</div>'
        +'<div class="pd">'+c.description+'</div>'
        +'<button class="db" data-id="'+loc.id+'">&#128694; Get Directions</button>';
      var m=L.marker([loc.lat,loc.lng],{icon:icon})
        .addTo(map)
        .bindPopup(pop,{maxWidth:240});

      /* Leaflet stops click propagation on popups, so attach directly on open */
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

  /* ── User location (injected from RN after GPS permission) ── */
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

  /* ── Focus cuisine (injected from RN when coming from Details) ── */
  function focusCuisine(id){
    clearRoute();
    var c=CUISINES.find(function(x){return x.id===id;});
    if(!c||!c.locations.length)return;
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
});
