import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import theme from '@/utils/theme';
const { width, height } = Dimensions.get('window');
const C = theme.colors;
const F = {
  light: Platform.OS === 'ios' ? 'Inter-Light' : 'inter',
  medium: Platform.OS === 'ios' ? 'Inter-Medium' : 'inter',
  bold: Platform.OS === 'ios' ? 'Inter-Bold' : 'inter',
  black: Platform.OS === 'ios' ? 'Inter-Black' : 'inter',
};
const LogoIcon = () => (
  <Svg width={46} height={46} viewBox="0 0 46 46" fill="none">
    <Path
      d="M8 35L17 21L24 29L32 16L39 24"
      stroke="white"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={17} cy={21} r={2.4} fill="white" fillOpacity={0.9} />
    <Circle cx={24} cy={29} r={2.4} fill={C.secondary} />
    <Circle cx={32} cy={16} r={2.4} fill="white" fillOpacity={0.75} />
    <Rect
      x={33} y={30} width={8} height={8} rx={2}
      fill="white" fillOpacity={0.15}
      stroke="white" strokeOpacity={0.4} strokeWidth={1}
    />
    <Path
      d="M34.5 36.5L36 34.5L38 36L40 32"
      stroke="white" strokeWidth={1.2}
      strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M9 12H14M9 12V17M9 12L14 17"
      stroke="white" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round"
      opacity={0.6}
    />
  </Svg>
);
interface StatChipProps {
  dotColor: string;
  label: string;
  anim: Animated.Value;
}
const StatChip: React.FC<StatChipProps> = ({ dotColor, label, anim }) => {
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  return (
    <Animated.View style={[styles.chip, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
      <Text style={styles.chipLabel}>{label}</Text>
    </Animated.View>
  );
};
interface SplashScreenProps {
  onFinish?: () => void;
}
export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameY = useRef(new Animated.Value(16)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(10)).current;
  const chipsAnim = useRef(new Animated.Value(0)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;
  const versionAnim = useRef(new Animated.Value(0)).current;
  const makeRing = (
    scale: Animated.Value,
    opacity: Animated.Value,
    delay: number
  ) =>
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1, duration: 2200, delay, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5, duration: 1540, delay, useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0, duration: 660, useNativeDriver: true,
        }),
      ]),
    ]);
  useEffect(() => {
    Animated.parallel([
      makeRing(ring1Scale, ring1Opacity, 150),
      makeRing(ring2Scale, ring2Opacity, 450),
      makeRing(ring3Scale, ring3Opacity, 750),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1, tension: 80, friction: 8, delay: 200, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 500, delay: 200, useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1, duration: 650, delay: 450, useNativeDriver: true,
        }),
        Animated.timing(nameY, {
          toValue: 0, duration: 650, delay: 450, useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1, duration: 620, delay: 620, useNativeDriver: true,
        }),
        Animated.timing(tagY, {
          toValue: 0, duration: 620, delay: 620, useNativeDriver: true,
        }),
      ]),
      Animated.timing(chipsAnim, {
        toValue: 1, duration: 650, delay: 820, useNativeDriver: true,
      }),
      Animated.timing(versionAnim, {
        toValue: 1, duration: 400, delay: 1800, useNativeDriver: true,
      }),
      Animated.timing(loaderWidth, {
        toValue: 112, duration: 2400, delay: 1300, useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoFloat, {
            toValue: -7, duration: 1500, delay: 1400, useNativeDriver: true,
          }),
          Animated.timing(logoFloat, {
            toValue: 0, duration: 1500, useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
    const timer = setTimeout(() => onFinish?.(), 4200);
    return () => clearTimeout(timer);
  }, []);
  const rings = [
    { scale: ring1Scale, opacity: ring1Opacity, size: 130, color: 'rgba(0,97,255,0.3)' },
    { scale: ring2Scale, opacity: ring2Opacity, size: 200, color: 'rgba(0,97,255,0.15)' },
    { scale: ring3Scale, opacity: ring3Opacity, size: 270, color: 'rgba(255,147,24,0.18)' },
  ];
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      { }
      <View style={[styles.blob, { width: 260, height: 260, top: -60, right: -60, backgroundColor: 'rgba(0,97,255,0.06)' }]} />
      <View style={[styles.blob, { width: 180, height: 180, bottom: 40, left: -40, backgroundColor: 'rgba(255,147,24,0.07)' }]} />
      <View style={[styles.blob, { width: 140, height: 140, bottom: 160, right: 20, backgroundColor: 'rgba(0,97,255,0.04)' }]} />
      { }
      {rings.map((r, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: r.size,
              height: r.size,
              borderRadius: r.size / 2,
              borderColor: r.color,
              opacity: r.opacity,
              transform: [{ scale: r.scale }],
            },
          ]}
        />
      ))}
      { }
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }, { translateY: logoFloat }],
        }}
      >
        <View style={styles.logoIcon}>
          <LogoIcon />
        </View>
      </Animated.View>
      { }
      <Animated.View style={{ opacity: nameOpacity, transform: [{ translateY: nameY }] }}>
        <Text style={styles.appName}>
          {'DS_'}<Text style={{ color: C.primary }}>{'ASA'}</Text>
        </Text>
      </Animated.View>
      { }
      <Animated.View style={{ opacity: tagOpacity, transform: [{ translateY: tagY }] }}>
        <Text style={styles.tagline}>GERENCIADOR FINANCEIRO</Text>
      </Animated.View>
      { }
      {/* <View style={styles.chips}>
        <StatChip dotColor={C.success} label="Receitas" anim={chipsAnim} />
        <StatChip dotColor={C.error} label="Despesas" anim={chipsAnim} />
        <StatChip dotColor={C.primary} label="Saldo" anim={chipsAnim} />
      </View> */}
      { }
      <View style={styles.loaderTrack}>
        <Animated.View style={{ width: loaderWidth, height: '100%', borderRadius: 99, overflow: 'hidden' }}>
          <LinearGradient
            colors={[C.primary, C.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
      { }
      <Animated.Text style={[styles.version, { opacity: versionAnim }]}>
        v1.0.0
      </Animated.Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    alignSelf: 'center',
  },
  logoIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },
  appName: {
    marginTop: 20,
    fontSize: 28,
    fontFamily: F.black,
    fontWeight: '900',
    color: C.primaryText,
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: 7,
    fontSize: 11,
    fontFamily: F.medium,
    color: C.secondaryText,
    letterSpacing: 1.4,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 44,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.foreground,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 11,
    fontFamily: F.medium,
    color: C.secondaryText,
  },
  loaderTrack: {
    marginTop: 50,
    width: 112,
    height: 3,
    backgroundColor: C.formsBackground,
    borderRadius: 99,
    overflow: 'hidden',
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: 10,
    fontFamily: F.light,
    color: C.border,
    letterSpacing: 0.5,
  },
});
