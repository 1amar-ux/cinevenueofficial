import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'VIP Cinephile');
  const [email, setEmail] = useState(user?.email || 'user@cinevenue.in');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Profile Updated', 'Your profile details have been securely synchronized.');
      navigation.goBack();
    }, 800);
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" subtitle="Update your personal details and contact preferences" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar update section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={38} color={Colors.gold} />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.formSection}>
          <Input
            label="FULL NAME"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            icon={<Ionicons name="person-outline" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="EMAIL ADDRESS"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            icon={<Ionicons name="mail-outline" size={18} color={Colors.textMuted} />}
          />

          <Input
            label="PHONE NUMBER"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 Phone number"
            keyboardType="phone-pad"
            icon={<Ionicons name="call-outline" size={18} color={Colors.textMuted} />}
          />
        </View>

        <Button
          title="SAVE CHANGES"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  changePhotoBtn: {
    paddingVertical: 4,
  },
  changePhotoText: {
    ...Typography.body2,
    color: Colors.gold,
    fontWeight: '700',
  },
  formSection: {
    gap: Spacing.md,
  },
  saveBtn: {
    marginTop: Spacing.xxl,
  },
});
