import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../store/AuthContext';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(insets.top, 20), paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Ionicons name="film" size={32} color={Colors.gold} />
          </View>
          <Text style={styles.brandTitle}>CINEVENUE</Text>
          <Text style={styles.brandTagline}>LUXURY ENTERTAINMENT & CINEMAS</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>
            Access your bookings, CineCoins VIP rewards, and passes
          </Text>

          <Input
            label="Email Address"
            placeholder="you@domain.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.forgotPassBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="SIGN IN"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {/* Social / Google & Guest Logins */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            variant="outline"
            onPress={() => {
              Alert.alert(
                'Google Sign-In',
                'Google Play Authentication for package com.cinevenue.app will initiate with your linked Google account.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Continue',
                    onPress: () => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        navigation.replace('MainTabs');
                      }, 1000);
                    },
                  },
                ]
              );
            }}
            icon={<Ionicons name="logo-google" size={18} color={Colors.gold} />}
            style={styles.googleBtn}
          />

          <Button
            title="Continue as Guest"
            variant="outline"
            onPress={() => navigation.replace('MainTabs')}
            style={styles.guestBtn}
          />
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up & Get 100 CineCoins</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  brandTitle: {
    ...Typography.h1,
    letterSpacing: 2,
    color: Colors.gold,
  },
  brandTagline: {
    ...Typography.caption,
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    ...Typography.h2,
    marginBottom: 4,
  },
  formSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  forgotPassText: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
  },
  loginBtn: {
    marginBottom: Spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
  },
  googleBtn: {
    marginBottom: Spacing.sm,
  },
  guestBtn: {
    marginBottom: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    flexWrap: 'wrap',
  },
  footerText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  registerLink: {
    ...Typography.body2,
    color: Colors.gold,
    fontWeight: '700',
  },
});
