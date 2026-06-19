import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme';

type Props = { size?: number; color?: string };

export default function YatriLogo({ size = 30, color = colors.white }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* sun */}
      <Circle cx="40" cy="22" r="7" fill={color} opacity={0.9} />
      {/* back mountain */}
      <Path d="M6 50 L26 22 L40 50 Z" fill={color} opacity={0.55} />
      {/* front peak */}
      <Path d="M28 50 L44 26 L58 50 Z" fill={color} />
    </Svg>
  );
}
