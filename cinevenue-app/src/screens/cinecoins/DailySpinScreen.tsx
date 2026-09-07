import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { cineCoinApi } from '../../api/services';

const PRIZES = [10, 25, 5, 50, 15, 100, 20, 200];

export const DailySpinScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [spinning, setSpinning] = useState(false);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [spinAnim] = useState(new Animated.Value(0));

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setWonAmount(null);

    // Pick random prize index
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const chosenPrize = PRIZES[prizeIndex];

    // Spin animation rotations
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 8 + prizeIndex / PRIZES.length,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      setSpinning(false);
      setWonAmount(chosenPrize);
      try {
        await cineCoinApi.claimDailyBonus();
      } catch (e) {
        // Ignored
      }
      Alert.alert('Congratulations! 🎰', `You won ${chosenPrize} CineCoins!`);
    });
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Header title="Daily Spin & Win" subtitle="Spin the lucky wheel for bonus CineCoins" showBack />

      <View style={styles.content}>
        {/* Wheel Graphic Container */}
        <View style={styles.wheelWrapper}>
          <View style={styles.pointerTriangle} />
          <Animated.View
            style={[
              styles.wheelCircle,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
          >
            {PRIZES.map((prize, idx) => {
              const angle = (idx * 360) / PRIZES.length;
              return (
                <View
                  key={idx}
                  style={[
                    styles.wheelSegment,
                    { transform: [{ rotate: `${angle}deg` }] },
                  ]}
                >
                  <Text style={styles.segmentText}>{prize}</Text>
                </View>
              );
            })}
            <View style={styles.wheelCenterHub}>
              <Ionicons name="sparkles" size={24} color={Colors.gold} />
            </View>
          </Animated.View>
        </View>

        {/* Status / Win Details */}
        {wonAmount !== null && (
          <View style={styles.winBanner}>
            <Text style={styles.winLabel}>YOU WON</Text>
            <Text style={styles.winNumber}>+{wonAmount} CINECOINS</Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <Button
            title={spinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
            onPress={handleSpin}
            disabled={spinning}
            loading={spinning}
            icon={<Ionicons name="gift-outline" size={20} color="#000" />}
          />
          <Text style={styles.footerNote}>
            1 free spin every 24 hours. Extra spins with every movie booking!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  pointerTriangle: {
    position: 'absolute',
    top: -16,
    zIndex: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.gold,
  },
  wheelCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 6,
    borderColor: Colors.gold,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wheelSegment: {
    position: 'absolute',
    top: 14,
    alignItems: 'center',
  },
  segmentText: {
    ...Typography.h3,
    color: Colors.gold,
    fontWeight: '900',
  },
  wheelCenterHub: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 3,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  winBanner: {
    alignItems: 'center',
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  winLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    letterSpacing: 1,
    fontWeight: '800',
  },
  winNumber: {
    ...Typography.h1,
    color: Colors.gold,
    marginTop: 2,
  },
  actionContainer: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  footerNote: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
