import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { authApi } from '../../api/authApi';

export interface GlassyOtpVerificationProps {
  identifier: string;
  onSuccess: (data: { verified: boolean; identifier: string }) => void;
  onCancel?: () => void;
  initialDevCode?: string;
  type?: string;
  title?: string;
  subtitle?: string;
}

type AnimationPhase = 'input' | 'verifying' | 'orbiting' | 'converging' | 'burst' | 'verified';

export const GlassyOtpVerification: React.FC<GlassyOtpVerificationProps> = ({
  identifier,
  onSuccess,
  onCancel,
  initialDevCode = '',
  type = 'LOGIN',
  title = 'Verification Code',
  subtitle,
}) => {
  const [digits, setDigits] = useState<string[]>(() => {
    if (initialDevCode && initialDevCode.length === 4) {
      return initialDevCode.split('');
    }
    return ['', '', '', ''];
  });

  const [phase, setPhase] = useState<AnimationPhase>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [devCode, setDevCode] = useState<string>(initialDevCode);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Animated values for choreography
  const orbitProgress = useRef(new Animated.Value(0)).current; // 0 -> 1 (angle 0 -> 2pi)
  const radiusAnim = useRef(new Animated.Value(55)).current; // 55 -> 0
  const boxScaleAnim = useRef(new Animated.Value(1)).current; // 1 -> 0.3
  const sphereScale = useRef(new Animated.Value(0)).current; // 0 -> 1.2 -> 1
  const spherePulse = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current; // 0 -> 1
  const successOpacity = useRef(new Animated.Value(0)).current; // 0 -> 1
  const buttonWidth = useRef(new Animated.Value(0)).current; // 0 -> 1

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle single digit input
  const handleDigitChange = (index: number, value: string) => {
    setErrorMessage(null);
    const cleaned = value.replace(/\D/g, '');

    // Pasting multiple digits
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 4).split('');
      const next = ['', '', '', ''];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      setDigits(next);
      if (chars.length === 4) {
        inputRefs[3]?.current?.blur();
        executeVerification(cleaned.slice(0, 4));
      } else {
        inputRefs[chars.length]?.current?.focus();
      }
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    // Auto-advance
    if (cleaned && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }

    // Auto-submit if all 4 digits completed
    if (cleaned && index === 3 && next.every((d) => d !== '')) {
      executeVerification(next.join(''));
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await authApi.sendOtp(identifier, type);
      if (res?.code || res?.devCode) {
        setDevCode(res.code || res.devCode);
      }
      setResendCooldown(30);
      setDigits(['', '', '', '']);
      inputRefs[0]?.current?.focus();
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Start the Signature 8-Phase Animation
  const startCelebrationSequence = () => {
    setPhase('orbiting');

    // Trigger haptic
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Step 1: Continuous circular rotation for 1100ms
    Animated.timing(orbitProgress, {
      toValue: 2,
      duration: 1100,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    // Step 2: Converge inward to (0,0) starting at 1000ms
    setTimeout(() => {
      setPhase('converging');
      Animated.parallel([
        Animated.timing(radiusAnim, {
          toValue: 0,
          duration: 650,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(boxScaleAnim, {
          toValue: 0.2,
          duration: 650,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);

    // Step 3: Burst into glowing verification sphere
    setTimeout(() => {
      setPhase('burst');
      Animated.spring(sphereScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(spherePulse, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(spherePulse, {
            toValue: 1.0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1650);

    // Step 4: Reveal Green Checkmark & Success Messaging
    setTimeout(() => {
      setPhase('verified');
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonWidth, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: false,
        }),
      ]).start();
    }, 2000);

    // Step 5: Notify parent after celebration
    setTimeout(() => {
      onSuccess({ verified: true, identifier });
    }, 3500);
  };

  // Backend verification check
  const executeVerification = async (codeOverride?: string) => {
    const code = codeOverride || digits.join('');
    if (code.length !== 4) {
      setErrorMessage('Please enter all 4 digits of your OTP code.');
      return;
    }

    setPhase('verifying');
    setErrorMessage(null);

    try {
      const res = await authApi.verifyOtp(identifier, code);
      if (res?.verified || res?.success) {
        startCelebrationSequence();
      } else {
        throw new Error(res?.message || 'Verification could not be confirmed.');
      }
    } catch (err: any) {
      setPhase('input');
      setErrorMessage(err.message || 'Invalid or expired verification code.');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Interpolated orbit calculations for the 4 boxes (90° offsets)
  // Box 0: theta
  const translateX0 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [55, 0, -55, 0, 55, 0, -55, 0, 55],
  });
  const translateY0 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [0, 55, 0, -55, 0, 55, 0, -55, 0],
  });

  // Box 1: theta + 90
  const translateX1 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [0, -55, 0, 55, 0, -55, 0, 55, 0],
  });
  const translateY1 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [55, 0, -55, 0, 55, 0, -55, 0, 55],
  });

  // Box 2: theta + 180
  const translateX2 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [-55, 0, 55, 0, -55, 0, 55, 0, -55],
  });
  const translateY2 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [0, -55, 0, 55, 0, -55, 0, 55, 0],
  });

  // Box 3: theta + 270
  const translateX3 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [0, 55, 0, -55, 0, 55, 0, -55, 0],
  });
  const translateY3 = orbitProgress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    outputRange: [-55, 0, 55, 0, -55, 0, 55, 0, -55],
  });

  const isAnimating = phase === 'orbiting' || phase === 'converging' || phase === 'burst' || phase === 'verified';

  return (
    <View style={styles.outerContainer}>
      {/* Frosted Glass Card Container */}
      <LinearGradient
        colors={['rgba(28, 25, 23, 0.85)', 'rgba(12, 10, 9, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Subtle Gold / Bronze Border Highlight */}
        <View style={styles.goldGlowBorder} pointerEvents="none" />

        {/* Header Icon */}
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={phase === 'verified' ? ['#059669', '#10B981'] : ['#D4AF37', '#997D22']}
            style={styles.headerIconGlow}
          >
            <Ionicons
              name={phase === 'verified' ? 'shield-checkmark' : 'lock-closed'}
              size={24}
              color="#000000"
            />
          </LinearGradient>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle || `Sent to ${identifier}`}
        </Text>

        {/* Dev Code Auto-Fill Pill */}
        {devCode ? (
          <TouchableOpacity
            style={styles.devPill}
            onPress={() => {
              if (devCode.length === 4) {
                setDigits(devCode.split(''));
                executeVerification(devCode);
              }
            }}
          >
            <Ionicons name="sparkles" size={14} color={Colors.gold} />
            <Text style={styles.devPillText}>
              Dev OTP Code: <Text style={styles.devPillCode}>{devCode}</Text>
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Error Banner */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* 4 Animated OTP Boxes OR Center Verification Core */}
        <View style={styles.stageArea}>
          {!isAnimating ? (
            // STATIC INPUT STAGE
            <View style={styles.boxesRow}>
              {digits.map((digit, index) => (
                <View key={index} style={styles.digitBoxWrapper}>
                  <LinearGradient
                    colors={
                      digit
                        ? ['rgba(212, 175, 55, 0.25)', 'rgba(212, 175, 55, 0.08)']
                        : ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)']
                    }
                    style={[
                      styles.digitBox,
                      digit ? styles.digitBoxActive : null,
                    ]}
                  >
                    <TextInput
                      ref={inputRefs[index]}
                      value={digit}
                      onChangeText={(val) => handleDigitChange(index, val)}
                      onKeyPress={(e) => handleKeyPress(index, e)}
                      keyboardType="number-pad"
                      maxLength={index === 0 ? 4 : 1}
                      selectTextOnFocus
                      style={styles.digitInput}
                      placeholder="•"
                      placeholderTextColor="rgba(255, 255, 255, 0.2)"
                    />
                  </LinearGradient>
                </View>
              ))}
            </View>
          ) : (
            // DYNAMIC CHOREOGRAPHY STAGE
            <View style={styles.choreographyCenter}>
              {/* 4 Orbiting & Converging Boxes */}
              {(phase === 'orbiting' || phase === 'converging') && (
                <>
                  {/* Box 0 */}
                  <Animated.View
                    style={[
                      styles.orbitBox,
                      {
                        transform: [
                          { translateX: translateX0 },
                          { translateY: translateY0 },
                          { scale: boxScaleAnim },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.orbitBoxText}>{digits[0] || '•'}</Text>
                  </Animated.View>

                  {/* Box 1 */}
                  <Animated.View
                    style={[
                      styles.orbitBox,
                      {
                        transform: [
                          { translateX: translateX1 },
                          { translateY: translateY1 },
                          { scale: boxScaleAnim },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.orbitBoxText}>{digits[1] || '•'}</Text>
                  </Animated.View>

                  {/* Box 2 */}
                  <Animated.View
                    style={[
                      styles.orbitBox,
                      {
                        transform: [
                          { translateX: translateX2 },
                          { translateY: translateY2 },
                          { scale: boxScaleAnim },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.orbitBoxText}>{digits[2] || '•'}</Text>
                  </Animated.View>

                  {/* Box 3 */}
                  <Animated.View
                    style={[
                      styles.orbitBox,
                      {
                        transform: [
                          { translateX: translateX3 },
                          { translateY: translateY3 },
                          { scale: boxScaleAnim },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.orbitBoxText}>{digits[3] || '•'}</Text>
                  </Animated.View>
                </>
              )}

              {/* Glowing Verification Sphere (Merged Core) */}
              {(phase === 'burst' || phase === 'verified') && (
                <Animated.View
                  style={[
                    styles.verificationSphere,
                    {
                      transform: [{ scale: sphereScale }, { scale: spherePulse }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669', '#047857']}
                    style={styles.sphereGradient}
                  >
                    <Animated.View
                      style={{
                        transform: [{ scale: checkmarkScale }],
                      }}
                    >
                      <Ionicons name="checkmark" size={38} color="#FFFFFF" />
                    </Animated.View>
                  </LinearGradient>
                </Animated.View>
              )}
            </View>
          )}
        </View>

        {/* Verification Success Messaging */}
        {phase === 'verified' && (
          <Animated.View style={[styles.successMessageBox, { opacity: successOpacity }]}>
            <Text style={styles.successHeading}>Verified Successfully</Text>
            <Text style={styles.successSubheading}>
              Your account has been securely verified.
            </Text>
          </Animated.View>
        )}

        {/* Action Button */}
        {phase !== 'verified' ? (
          <TouchableOpacity
            style={[
              styles.verifyButton,
              phase === 'verifying' ? styles.verifyButtonDisabled : null,
            ]}
            disabled={phase === 'verifying' || isAnimating}
            onPress={() => executeVerification()}
          >
            <LinearGradient
              colors={['#E5C158', '#D4AF37', '#997D22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {phase === 'verifying' ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Proceed</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.verifiedButton}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.verifiedButtonText}>Verified & Secured</Text>
            </LinearGradient>
          </View>
        )}

        {/* Resend OTP & Cancel Footer */}
        {phase === 'input' && (
          <View style={styles.footerRow}>
            {onCancel ? (
              <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleResend}
              disabled={resendCooldown > 0 || isResending}
              style={styles.resendBtn}
            >
              <Text
                style={[
                  styles.resendText,
                  resendCooldown > 0 ? styles.resendTextDisabled : null,
                ]}
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : 'Resend Verification OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xl || 24,
    padding: Spacing.xxl || 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  goldGlowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl || 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerIconContainer: {
    marginBottom: Spacing.md,
  },
  headerIconGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  devPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: BorderRadius.full || 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
    gap: 6,
  },
  devPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  devPillCode: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: BorderRadius.md || 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: 8,
    width: '100%',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    flex: 1,
  },
  stageArea: {
    height: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  digitBoxWrapper: {
    width: 60,
    height: 64,
  },
  digitBox: {
    flex: 1,
    borderRadius: BorderRadius.lg || 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 20, 24, 0.6)',
  },
  digitBoxActive: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  digitInput: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  choreographyCenter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitBox: {
    position: 'absolute',
    width: 44,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  orbitBoxText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.goldLight,
  },
  verificationSphere: {
    width: 76,
    height: 76,
    borderRadius: 38,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  sphereGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34D399',
  },
  successMessageBox: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  successHeading: {
    ...Typography.h3,
    color: '#34D399',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  successSubheading: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifyButton: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.lg || 12,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifiedButton: {
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.lg || 12,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  verifiedButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    paddingVertical: Spacing.xs,
  },
  cancelText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  resendBtn: {
    paddingVertical: Spacing.xs,
  },
  resendText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: Colors.textMuted,
  },
});

