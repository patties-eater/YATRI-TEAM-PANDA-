import { Image, type ImageSourcePropType } from 'react-native';

const MODULES: Record<string, any> = {
  '1': require('../assets/images/yomari.webp'),
  '2': require('../assets/images/juju dhau.jpg'),
  '3': require('../assets/images/chatamari.webp'),
  '4': require('../assets/images/bara wo.jpg'),
  '5': require('../assets/images/choila.jpg'),
  '6': require('../assets/images/Paalcha-Samay-Baji.jpg'),
  '7': require('../assets/images/sapu mhicha.jpg'),
  '8': require('../assets/images/kachila.webp'),
  '9': require('../assets/images/aloo tama.jpg'),
  '10': require('../assets/images/haku.jpg'),
  '11': require('../assets/images/sukuti.jpg'),
  '12': require('../assets/images/kwati.jpg'),
  '13': require('../assets/images/sellroti.jpg'),
  '14': require('../assets/images/dhido.jpg'),
  '15': require('../assets/images/gundruk.jpg'),
  '16': require('../assets/images/lakhamari.jpg'),
  '17': require('../assets/images/chaku.jpg'),
  '18': require('../assets/images/masaura.jpg'),
  '19': require('../assets/images/bhakka.jpg'),
  '20': require('../assets/images/sekwa.jpg'),
};

// For <Image> components — returns the bundled asset, or a remote fallback.
export function dishImageSource(id: string, fallback?: string): ImageSourcePropType {
  const m = MODULES[id];
  return m != null ? m : { uri: fallback ?? '' };
}

// For the WebView maps — resolves the bundled asset to a URI string.
export function dishImageUri(id: string, fallback?: string): string {
  const m = MODULES[id];
  if (m != null) {
    const resolved = Image.resolveAssetSource(m);
    if (resolved?.uri) return resolved.uri;
  }
  return fallback ?? '';
}
