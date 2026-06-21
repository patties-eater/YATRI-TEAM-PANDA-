import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { gradients } from '../theme';

type Props = {
  size?: number;
  onDark?: boolean;
};

// "JoJo" brand mark: a rounded badge with a stylised "J".
export default function JoJoLogo({ size = 64, onDark = false }: Props) {
  const badgeFill = onDark ? '#FFFFFF' : 'url(#jojoGrad)';
  const letterFill = onDark ? 'url(#jojoGrad)' : '#FFFFFF';
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="jojoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={gradients.primary[0]} />
          <Stop offset="1" stopColor={gradients.primary[1]} />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="56" height="56" rx="18" fill={badgeFill} />
      <SvgText
        x="32"
        y="45"
        fontSize="36"
        fontWeight="bold"
        fill={letterFill}
        textAnchor="middle"
      >
        J
      </SvgText>
    </Svg>
  );
}
