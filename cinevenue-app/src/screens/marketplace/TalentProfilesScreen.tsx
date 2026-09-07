import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

interface Talent {
  id: string;
  name: string;
  role: string;
  experience: string;
  avatar: string;
  skills: string[];
  rating: number;
}

const TALENTS: Talent[] = [
  {
    id: 't-1',
    name: 'Aanya Sharma',
    role: 'Lead Actress & Dancer',
    experience: '6 Years / 4 Feature Films',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    skills: ['Method Acting', 'Kathak', 'Dialogue Delivery'],
    rating: 4.9,
  },
  {
    id: 't-2',
    name: 'Karthik Rao',
    role: 'Cinematographer (DoP)',
    experience: '8 Years / 12 Feature Films',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    skills: ['ARRI Alexa 65', 'Steadicam', 'Color Grading'],
    rating: 4.8,
  },
  {
    id: 't-3',
    name: 'Vikram Menon',
    role: 'Music Composer & Sound Designer',
    experience: '10 Years / 18 Albums',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    skills: ['Dolby Atmos', 'Orchestration', 'Live Strings'],
    rating: 5.0,
  },
  {
    id: 't-4',
    name: 'Meera Nambiar',
    role: 'Screenwriter & Dialogue Writer',
    experience: '5 Years / 3 Box Office Hits',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    skills: ['Thriller', 'Period Drama', 'Story Doctoring'],
    rating: 4.9,
  },
];

export const TalentProfilesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [talents] = useState<Talent[]>(TALENTS);

  const handleContact = (talent: Talent) => {
    Alert.alert(
      `Contact ${talent.name}`,
      `Send a direct collaboration request or casting inquiry for your upcoming production project.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Direct Message',
          onPress: () =>
            Alert.alert(
              'Inquiry Sent! ✨',
              `Your request was delivered to ${talent.name}'s verified representation.`
            ),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Verified Film Talent"
        subtitle="Connect with certified actors, directors & technicians"
        showBack
      />

      <FlatList
        data={talents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.gold} />
                </View>
                <Text style={styles.role}>{item.role}</Text>
                <Text style={styles.exp}>{item.experience}</Text>
              </View>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={12} color="#000" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>

            {/* Skills */}
            <View style={styles.skillsRow}>
              {item.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            {/* Action */}
            <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact(item)}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.gold} />
              <Text style={styles.contactBtnText}>CONNECT & HIRE</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    ...Typography.body1,
    fontWeight: '700',
  },
  role: {
    ...Typography.body2,
    color: Colors.gold,
    marginTop: 1,
  },
  exp: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  skillChip: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.goldGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  contactBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: 0.5,
  },
});
