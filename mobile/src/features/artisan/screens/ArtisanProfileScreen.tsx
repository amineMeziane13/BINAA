import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const PROFESSIONS = [
  'Plombier', 'Électricien', 'Maçon', 'Peintre', 'Menuisier',
  'Carreleur', 'Soudeur', 'Climaticien', 'Serrurier', 'Vitrier',
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
  const [isNew, setIsNew] = useState(false);

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
      setIsNew(false);
    } catch {
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSave = async () => {
    if (!profession || !experienceYears) {
      Alert.alert('Erreur', 'Veuillez renseigner la profession et les années d\'expérience.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/artisans/profile', { profession, experienceYears: parseInt(experienceYears), skills });
      } else {
        await api.put('/artisans/profile', { profession, experienceYears: parseInt(experienceYears), skills });
      }
      Alert.alert('Succès', isNew ? 'Profil créé !' : 'Profil mis à jour !');
      loadProfile();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await api.post('/artisans/subscribe');
      Alert.alert('Succès', 'Abonnement activé ! Vous êtes maintenant visible pour les clients.');
      loadProfile();
    } catch (err: any) {
      Alert.alert('Info', err?.response?.data?.error || 'Erreur');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="🔧" size={22} bgColor="#2563EB" />
        <Text style={styles.title}>{isNew ? 'Créer mon profil' : 'Mon profil artisan'}</Text>
      </View>

      {/* Subscription Status */}
      {!isNew && (
        <View style={[styles.subCard, card3D(), profile?.isSubscribed && styles.subCardActive]}>
          <Icon3D icon={profile?.isSubscribed ? '✅' : '🔒'} size={18} bgColor={profile?.isSubscribed ? '#22C55E' : '#F59E0B'} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.subTitle}>{profile?.isSubscribed ? 'Abonné' : 'Non abonné'}</Text>
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

      {/* Profession */}
      <Text style={styles.label}>Profession *</Text>
      <View style={styles.chipContainer}>
        {PROFESSIONS.map(p => (
          <TouchableOpacity key={p} onPress={() => setProfession(p)} style={[styles.chip, profession === p && styles.chipSelected]}>
            <Text style={[styles.chipText, profession === p && styles.chipTextSelected]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Experience */}
      <Text style={styles.label}>Années d'expérience *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={experienceYears}
        onChangeText={setExperienceYears}
        placeholder="Ex: 5"
        placeholderTextColor={colors.textSecondary}
      />

      {/* Skills */}
      <Text style={styles.label}>Compétences</Text>
      <View style={styles.chipContainer}>
        {SUGGESTED_SKILLS.map(s => (
          <TouchableOpacity key={s} onPress={() => toggleSkill(s)} style={[styles.chip, skills.includes(s) && styles.chipSelectedBlue]}>
            <Text style={[styles.chipText, skills.includes(s) && styles.chipTextSelected]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity onPress={handleSave} disabled={saving} style={{ marginTop: 24 }}>
        <View style={[styles.saveBtn, button3D('#2563EB'), saving && { opacity: 0.6 }]}>
          <Text style={styles.saveBtnText}>{saving ? 'Enregistrement...' : isNew ? '✨ Créer le profil' : '💾 Mettre à jour'}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backArrow: { fontSize: 24, color: colors.text, marginRight: 4 },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  subCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 16 },
  subCardActive: { borderColor: '#22C55E', borderWidth: 1 },
  subTitle: { ...typography.body, color: colors.text, fontWeight: '700' },
  subDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  subBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  subBtnText: { ...typography.caption, color: colors.textLight, fontWeight: '700' },
  label: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  input: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, ...typography.body, color: colors.text, borderWidth: 1, borderColor: colors.surfaceDark },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.surfaceDark },
  chipSelected: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipSelectedBlue: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { ...typography.bodySmall, color: colors.text },
  chipTextSelected: { color: colors.textLight, fontWeight: '700' },
  saveBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 14 },
  saveBtnText: { ...typography.button, color: colors.textLight, fontSize: 16 },
});
