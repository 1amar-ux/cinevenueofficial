import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { FilmProject, TalentProfile } from '../../types';

export const FilmProductionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeSegment, setActiveSegment] = useState<'PROJECTS' | 'CASTING' | 'TALENT'>('PROJECTS');

  const categories = [
    'Direction', 'Cinematography', 'Editing', 'Acting', 'Music Direction',
    'Choreography', 'Art Direction', 'VFX', 'Sound Design', 'Screenplay'
  ];

  const sampleProjects: FilmProject[] = [
    {
      id: 'FP-1',
      title: 'Varanasi Chronicles (Pan-India Action)',
      category: 'Feature Film',
      stage: 'PRE_PRODUCTION',
      director: 'K. S. Ravindra',
      synopsis: 'A high-budget mythological thriller set across ancient riverbeds.',
      openRolesCount: 4,
    },
    {
      id: 'FP-2',
      title: 'Midnight in Hyderabad (Crime Drama)',
      category: 'Web Series',
      stage: 'DEVELOPMENT',
      director: 'R. Gautham',
      synopsis: 'A gritty urban investigative series exploring the cyberpunk underbelly.',
      openRolesCount: 2,
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Film Production & Talent"
        subtitle="CineVenue Creative Industry Marketplace"
      />

      {/* Segment Selector */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'PROJECTS' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('PROJECTS')}
        >
          <Text style={[styles.segmentText, activeSegment === 'PROJECTS' && styles.textBlack]}>
            Projects
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'CASTING' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('CASTING')}
        >
          <Text style={[styles.segmentText, activeSegment === 'CASTING' && styles.textBlack]}>
            Casting Calls
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'TALENT' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('TALENT')}
        >
          <Text style={[styles.segmentText, activeSegment === 'TALENT' && styles.textBlack]}>
            Talent Profiles
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Pills Strip */}
        <Text style={styles.sectionHeader}>Professional Categories (23 Disciplines)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.catPill}
              onPress={() => navigation.navigate('TalentProfiles', { category: cat })}
            >
              <Text style={styles.catPillText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Projects List */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          {activeSegment === 'PROJECTS' ? 'Active Production Pipelines' : 'Open Auditions & Casting Calls'}
        </Text>

        {sampleProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id, title: project.title })}
            activeOpacity={0.85}
          >
            <View style={styles.projHeader}>
              <Text style={styles.projCategory}>{project.category}</Text>
              <View style={styles.stageBadge}>
                <Text style={styles.stageText}>{project.stage.replace('_', ' ')}</Text>
              </View>
            </View>

            <Text style={styles.projTitle}>{project.title}</Text>
            <Text style={styles.projDirector}>Director: {project.director}</Text>
            <Text style={styles.projSynopsis} numberOfLines={2}>{project.synopsis}</Text>

            <View style={styles.projFooter}>
              <Text style={styles.rolesText}>
                🔥 <Text style={{ color: Colors.gold, fontWeight: '800' }}>{project.openRolesCount} Open Roles</Text> available
              </Text>
              <Text style={styles.viewLink}>View Pitch &rarr;</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const ProjectDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { title } = route.params;

  return (
    <View style={styles.container}>
      <Header title={title} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.projectCard}>
          <Text style={styles.projCategory}>FEATURE FILM • PAN-INDIA</Text>
          <Text style={styles.projTitle}>{title}</Text>
          <Text style={styles.projDirector}>Production: CineVenue Motion Pictures & Media</Text>
          
          <Text style={[styles.sectionHeader, { marginTop: Spacing.md }]}>Synopsis</Text>
          <Text style={styles.projSynopsis}>
            An expansive saga set against dramatic historical backdrops, produced in 8K HDR with Dolby Atmos master tracks.
          </Text>

          <Text style={[styles.sectionHeader, { marginTop: Spacing.md }]}>Open Casting Roles</Text>
          <View style={styles.roleBox}>
            <Text style={styles.roleName}>Lead Antagonist (Male, 28-38)</Text>
            <Text style={styles.roleDesc}>Martial arts experience preferred. Dialogue delivery in Telugu/Hindi.</Text>
          </View>
          <View style={styles.roleBox}>
            <Text style={styles.roleName}>Key Cinematographer (DOP)</Text>
            <Text style={styles.roleDesc}>Experience in anamorphic lens capture and high-speed motion rigs.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export const TalentProfilesScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const category = route.params?.category || 'Cinematography';

  const sampleTalents: TalentProfile[] = [
    { id: 'T-1', name: 'Vikram Sundaram', category, experienceYears: 8, location: 'Hyderabad', bio: 'Specialist in low-light cinematic photography and RED V-Raptor.', skills: ['RED Monstro', 'Color Grading', 'Drone Motion'] },
    { id: 'T-2', name: 'Ananya Sharma', category, experienceYears: 5, location: 'Bengaluru', bio: 'Award-winning narrative DP with 3 indie feature releases.', skills: ['Arri Alexa', 'Lighting Design', 'Steadicam'] },
  ];

  return (
    <View style={styles.container}>
      <Header title={`${category} Talents`} showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sampleTalents.map((talent) => (
          <View key={talent.id} style={styles.talentCard}>
            <View style={styles.talentTop}>
              <View style={styles.talentAvatar}>
                <Ionicons name="person" size={24} color={Colors.gold} />
              </View>
              <View style={styles.talentInfo}>
                <Text style={styles.talentName}>{talent.name}</Text>
                <Text style={styles.talentMeta}>{talent.experienceYears} Years Exp • {talent.location}</Text>
              </View>
            </View>
            <Text style={styles.talentBio}>{talent.bio}</Text>
            <View style={styles.skillsRow}>
              {talent.skills.map((skill) => (
                <View key={skill} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 3,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: Colors.gold,
  },
  segmentText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  textBlack: {
    color: '#000000',
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 60,
  },
  sectionHeader: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catScroll: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  catPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  projHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.gold,
    textTransform: 'uppercase',
  },
  stageBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  stageText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  projTitle: {
    ...Typography.h3,
    fontSize: 16,
  },
  projDirector: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  projSynopsis: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  projFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  rolesText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  viewLink: {
    ...Typography.caption,
    color: Colors.gold,
    fontWeight: '700',
  },
  roleBox: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  roleName: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.gold,
  },
  roleDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  talentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  talentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  talentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  talentInfo: {
    flex: 1,
  },
  talentName: {
    ...Typography.h3,
    fontSize: 15,
  },
  talentMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  talentBio: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  skillPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 3,
  },
  skillText: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
