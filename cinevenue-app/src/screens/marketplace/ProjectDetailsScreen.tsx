import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

export const ProjectDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { projectId, title, banner, genre, budget, stage, director, description } =
    route.params || {};

  const projectTitle = title || 'Vanguard: The Chronicles of Time';
  const projectGenre = genre || 'Sci-Fi / Historical Action';
  const projectBudget = budget || '₹45 Crores';
  const projectStage = stage || 'Production';
  const projectDirector = director || 'R. S. Murthy';
  const projectBanner =
    banner ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';

  const handlePitchOrApply = () => {
    Alert.alert(
      'Submit Pitch / Audition',
      'Your verified CineVenue Creator Portfolio will be submitted directly to the production house casting department.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Application',
          onPress: () =>
            Alert.alert(
              'Application Sent! 🎬',
              'The producers will review your portfolio and reach out via CineVenue Direct Message.'
            ),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Project Details" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: projectBanner }} style={styles.bannerImage} resizeMode="cover" />

        <View style={styles.bodyPadding}>
          <View style={styles.badgeRow}>
            <View style={styles.stageBadge}>
              <Text style={styles.stageText}>{projectStage.toUpperCase()}</Text>
            </View>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>{projectGenre}</Text>
            </View>
          </View>

          <Text style={styles.title}>{projectTitle}</Text>

          {/* Project Details Grid */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Budget</Text>
              <Text style={styles.infoVal}>{projectBudget}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Director / Showrunner</Text>
              <Text style={styles.infoVal}>{projectDirector}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Production House</Text>
              <Text style={styles.infoVal}>CineVenue Originals & Studios</Text>
            </View>
          </View>

          {/* Synopsis */}
          <Text style={styles.sectionHeading}>SYNOPSIS & VISION</Text>
          <Text style={styles.synopsisText}>
            {description ||
              'A high-octane cinematic journey crossing temporal dimensions. Filmed on IMAX and Panavision cameras with cutting-edge VFX. Seeking dynamic lead actors, supporting ensemble cast, art directors, and music composers.'}
          </Text>

          {/* Open Requirements */}
          <Text style={styles.sectionHeading}>OPEN CASTING & CREW CALLS</Text>
          <View style={styles.rolesList}>
            <View style={styles.roleItem}>
              <Ionicons name="people-outline" size={18} color={Colors.gold} />
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Female Lead (Age 22 - 28)</Text>
                <Text style={styles.roleSub}>Classical dance & martial arts background preferred</Text>
              </View>
            </View>
            <View style={styles.roleItem}>
              <Ionicons name="musical-notes-outline" size={18} color={Colors.gold} />
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>Background Score Arranger</Text>
                <Text style={styles.roleSub}>Orchestral composition experience required</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          title="SUBMIT TALENT AUDITION / PITCH"
          onPress={handlePitchOrApply}
          icon={<Ionicons name="send" size={18} color="#000" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  bannerImage: {
    width: '100%',
    height: 220,
  },
  bodyPadding: {
    padding: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stageBadge: {
    backgroundColor: Colors.goldGlow,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  stageText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  genreBadge: {
    backgroundColor: Colors.surface,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
  },
  genreText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    ...Typography.h1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  infoVal: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionHeading: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  synopsisText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  rolesList: {
    gap: Spacing.sm,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roleSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
