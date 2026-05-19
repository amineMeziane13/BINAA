import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, Image, Animated, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const PROFESSIONS = [
  { label: 'Plombier', icon: '🔧' },
  { label: 'Électricien', icon: '⚡' },
  { label: 'Maçon', icon: '🧱' },
  { label: 'Peintre', icon: '🎨' },
  { label: 'Menuisier', icon: '🪚' },
  { label: 'Carreleur', icon: '🔲' },
  { label: 'Soudeur', icon: '🔥' },
  { label: 'Climaticien', icon: '❄️' },
  { label: 'Serrurier', icon: '🔑' },
  { label: 'Vitrier', icon: '🪟' },
];

const SUGGESTED_SKILLS = [
  'plomberie', 'électricité', 'maçonnerie', 'peinture', 'menuiserie',
  'carrelage', 'soudure', 'climatisation', 'serrurerie', 'vitrerie',
  'rénovation', 'construction', 'décoration', 'isolation', 'étanchéité',
];

export default function ArtisanProfileScreen() {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profession, setProfession] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/artisans/profile/me');
      setProfile(data);
      setProfession(data.profession || '');
      setExperienceYears(String(data.experienceYears || ''));
      setSkills(data.skills || []);
      setPhotos(data.photos || []);
      setIsNew(!data.profession);
    } catch {
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotos(prev => [...prev, uri]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profession || !experienceYears) {
      const msg = "Veuillez renseigner la profession et les années d'expérience.";
      if (Platform.OS === 'web') {
        window.alert('Erreur: ' + msg);
      } else {
        Alert.alert('Erreur', msg);
      }
      return;
    }
    setSaving(true);
    try {
      const payload = {
        profession,
        experienceYears: parseInt(experienceYears),
        skills,
        photos,
      };
      const { data } = await api.put('/artisans/profile', payload);
      setProfile(data);
      setIsNew(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur lors de l\'enregistrement';
      if (Platform.OS === 'web') {
        window.alert('Erreur: ' + msg);
      } else {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await api.post('/artisans/subscribe');
      const msg = 'Abonnement activé ! Vous êtes maintenant visible pour les clients.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Succès', msg);
      }
      loadProfile();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur';
      if (Platform.OS === 'web') {
        window.alert('Info: ' + msg);
      } else {
        Alert.alert('Info', msg);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon3D icon="🔧" size={26} bgColor="#2563EB" />
          <Text style={styles.title}>{isNew ? 'Créer mon profil' : 'Mon profil artisan'}</Text>
        </View>
      </View>

      {/* Success Banner */}
      {showSuccess && (
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>Profil enregistré avec succès !</Text>
        </View>
      )}

      {/* Profile Card Preview - shown after save */}
      {!isNew && profile && (
        <View style={[styles.profileCard, card3D()]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatarCircle, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.avatarEmoji}>
                {PROFESSIONS.find(p => p.label === profession)?.icon || '🔧'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.user?.fullName || 'Artisan'}</Text>
              <View style={styles.profBadge}>
                <Text style={styles.profBadgeText}>{profession || 'Non défini'}</Text>
              </View>
              <Text style={styles.expText}>
                {experienceYears ? `${experienceYears} ans d'expérience` : ''}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>
              {'★'.repeat(Math.round(profile.rating || 0))}{'☆'.repeat(5 - Math.round(profile.rating || 0))}
            </Text>
            <Text style={styles.ratingValue}>{(profile.rating || 0).toFixed(1)}/5</Text>
          </View>

          {/* Skills Preview */}
          {skills.length > 0 && (
            <View style={styles.skillsPreview}>
              {skills.map((s, i) => (
                <View key={i} style={styles.skillPreviewChip}>
                  <Text style={styles.skillPreviewText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          {profile.user?.commune && (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{profile.user.commune}</Text>
            </View>
          )}
        </View>
      )}

      {/* Subscription Status */}
      {!isNew && (
        <View style={[styles.subCard, card3D(), profile?.isSubscribed && styles.subCardActive]}>
          <View style={[styles.subIcon, { backgroundColor: profile?.isSubscribed ? '#22C55E20' : '#F59E0B20' }]}>
            <Text style={styles.subIconText}>{profile?.isSubscribed ? '✅' : '🔒'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.subTitle}>
              {profile?.isSubscribed ? 'Abonné Premium' : 'Non abonné'}
            </Text>
            <Text style={styles.subDesc}>
              {profile?.isSubscribed
                ? 'Vous êtes visible pour les clients dans votre commune.'
                : 'Abonnez-vous pour être visible et recevoir des demandes.'}
            </Text>
          </View>
          {!profile?.isSubscribed && (
            <TouchableOpacity onPress={handleSubscribe}>
              <View style={[styles.subBtn, button3D('#22C55E')]}>
                <Text style={styles.subBtnText}>S'abonner</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Section: Profession */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>👷</Text>
          <Text style={styles.label}>Profession *</Text>
        </View>
        <View style={styles.chipContainer}>
          {PROFESSIONS.map(p => (
            <TouchableOpacity
              key={p.label}
              onPress={() => setProfession(p.label)}
              style={[styles.profChip, profession === p.label && styles.profChipSelected]}
            >
              <Text style={styles.profChipIcon}>{p.icon}</Text>
              <Text style={[styles.profChipText, profession === p.label && styles.profChipTextSelected]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section: Experience */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📅</Text>
          <Text style={styles.label}>Années d'expérience *</Text>
        </View>
        <View style={styles.expInputRow}>
          <TouchableOpacity
            style={styles.expBtn}
            onPress={() => {
              const val = parseInt(experienceYears || '0');
              if (val > 0) setExperienceYears(String(val - 1));
            }}
          >
            <Text style={styles.expBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.expInput}
            keyboardType="numeric"
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            textAlign="center"
          />
          <TouchableOpacity
            style={[styles.expBtn, styles.expBtnPlus]}
            onPress={() => {
              const val = parseInt(experienceYears || '0');
              setExperienceYears(String(val + 1));
            }}
          >
            <Text style={[styles.expBtnText, styles.expBtnTextPlus]}>+</Text>
          </TouchableOpacity>
          <Text style={styles.expUnit}>ans</Text>
        </View>
      </View>

      {/* Section: Skills */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>💡</Text>
          <Text style={styles.label}>Compétences</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{skills.length}</Text>
          </View>
        </View>
        <View style={styles.chipContainer}>
          {SUGGESTED_SKILLS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => toggleSkill(s)}
              style={[styles.skillChip, skills.includes(s) && styles.skillChipSelected]}
            >
              <Text style={styles.skillCheckmark}>
                {skills.includes(s) ? '✓ ' : ''}
              </Text>
              <Text style={[styles.skillChipText, skills.includes(s) && styles.skillChipTextSelected]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section: Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📸</Text>
          <Text style={styles.label}>Photos de réalisations</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          <TouchableOpacity onPress={pickImage} style={styles.addPhotoBtn}>
            <Text style={styles.addPhotoIcon}>📷</Text>
            <Text style={styles.addPhotoText}>Ajouter</Text>
          </TouchableOpacity>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(i)}>
                <Text style={styles.removePhotoText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={handleSave} disabled={saving} style={{ marginTop: 8 }}>
        <View style={[styles.saveBtn, button3D('#2563EB'), saving && { opacity: 0.6 }]}>
          <Text style={styles.saveBtnText}>
            {saving ? '⏳ Enregistrement...' : isNew ? '✨ Créer le profil' : '💾 Mettre à jour'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: 12 },
  loadingText: { ...typography.bodySmall, color: colors.textSecondary },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 8, marginRight: 8 },
  backArrow: { fontSize: 24, color: colors.text },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  title: { ...typography.h2, color: colors.text, flex: 1 },

  // Success Banner
  successBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#22C55E15', borderWidth: 1, borderColor: '#22C55E40',
    padding: 14, borderRadius: 14, marginBottom: 16, gap: 8,
  },
  successIcon: { fontSize: 18 },
  successText: { ...typography.body, color: '#22C55E', fontWeight: '600' },

  // Profile Card
  profileCard: { padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2563EB20' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { ...typography.h3, color: colors.text, marginBottom: 4 },
  profBadge: {
    backgroundColor: '#2563EB15', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  profBadgeText: { ...typography.caption, color: '#2563EB', fontWeight: '700' },
  expText: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  ratingStars: { fontSize: 18, color: '#F59E0B' },
  ratingValue: { ...typography.bodySmall, color: colors.textSecondary },
  skillsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  skillPreviewChip: { backgroundColor: '#2563EB10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  skillPreviewText: { ...typography.caption, color: '#2563EB', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  locationIcon: { fontSize: 14 },
  locationText: { ...typography.bodySmall, color: colors.textSecondary },

  // Subscription
  subCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 16 },
  subCardActive: { borderColor: '#22C55E', borderWidth: 1 },
  subIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  subIconText: { fontSize: 20 },
  subTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  subDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  subBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  subBtnText: { ...typography.caption, color: colors.textLight, fontWeight: '700' },

  // Sections
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionIcon: { fontSize: 18 },
  label: { ...typography.body, color: colors.text, fontWeight: '700', flex: 1 },
  countBadge: {
    backgroundColor: '#2563EB', width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  countText: { ...typography.caption, color: '#fff', fontWeight: '700', fontSize: 11 },

  // Profession Chips
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.surfaceDark,
  },
  profChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  profChipIcon: { fontSize: 16 },
  profChipText: { ...typography.bodySmall, color: colors.text, fontWeight: '500' },
  profChipTextSelected: { color: '#fff', fontWeight: '700' },

  // Experience
  expInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceDark,
    justifyContent: 'center', alignItems: 'center',
  },
  expBtnPlus: { backgroundColor: '#2563EB15', borderColor: '#2563EB40' },
  expBtnText: { fontSize: 22, color: colors.textSecondary, fontWeight: '600' },
  expBtnTextPlus: { color: '#2563EB' },
  expInput: {
    width: 70, height: 44, backgroundColor: colors.surface,
    borderRadius: 14, ...typography.h3, color: colors.text,
    borderWidth: 1, borderColor: colors.surfaceDark, textAlign: 'center',
  },
  expUnit: { ...typography.body, color: colors.textSecondary },

  // Skill Chips
  skillChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: colors.surfaceDark,
  },
  skillChipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  skillCheckmark: { ...typography.caption, color: '#fff', fontWeight: '700' },
  skillChipText: { ...typography.bodySmall, color: colors.text },
  skillChipTextSelected: { color: '#fff', fontWeight: '700' },

  // Photos
  photoScroll: { marginTop: 4 },
  addPhotoBtn: {
    width: 90, height: 90, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 2,
    borderColor: colors.surfaceDark, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  addPhotoIcon: { fontSize: 28 },
  addPhotoText: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  photoWrapper: { marginRight: 10, position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 14 },
  removePhoto: {
    position: 'absolute', top: -6, right: -6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
  },
  removePhotoText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Save
  saveBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 14 },
  saveBtnText: { ...typography.button, color: colors.textLight, fontSize: 16 },
});
