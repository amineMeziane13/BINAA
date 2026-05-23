import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import api from '../../../core/api/axios';

const SKILLS = [
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

export default function EditOrderScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { order } = route.params || {};

  const [description, setDescription] = useState(order?.description || '');
  const [skill, setSkill] = useState(order?.requestedProfession || '');
  const [loading, setLoading] = useState(false);

  const isArtisan = order?.type === 'ARTISAN_SERVICE';

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/commandes/${order.id}`, {
        description,
        requestedProfession: isArtisan ? skill : undefined,
      });
      Alert.alert('Succès', 'Le projet a été mis à jour', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="✏️" size={24} bgColor={colors.primary} />
        <Text style={styles.title}>Modifier le projet</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {isArtisan && (
          <View style={styles.section}>
            <Text style={styles.label}>Métier recherché</Text>
            <View style={styles.chipContainer}>
              {SKILLS.map(s => (
                <TouchableOpacity
                  key={s.label}
                  onPress={() => setSkill(s.label)}
                  style={[styles.chip, skill === s.label && styles.chipSelected]}
                >
                  <Text style={styles.chipIcon}>{s.icon}</Text>
                  <Text style={[styles.chipText, skill === s.label && styles.chipTextSelected]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Description du projet</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre projet..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.submitContainer}>
          <View style={[styles.submitBtn, button3D(colors.primary)]}>
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text style={styles.submitText}>💾 Enregistrer les modifications</Text>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, paddingBottom: 8 },
  backButton: { padding: 8, marginRight: 8 },
  backArrow: { fontSize: 24, color: colors.text },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  body: { padding: 20 },
  section: { marginBottom: 24 },
  label: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: colors.surfaceDark,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipText: { ...typography.bodySmall, color: colors.text },
  chipTextSelected: { color: colors.textLight, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface, padding: 16, borderRadius: 14,
    ...typography.body, color: colors.text,
    borderWidth: 1, borderColor: colors.surfaceDark,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitContainer: { marginTop: 10, marginBottom: 40 },
  submitBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  submitText: { ...typography.button, color: colors.textLight },
});
