import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D, modal3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import api from '../../../core/api/axios';
import { useAuth } from '../../../core/hooks/useAuth';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PROJECT_TYPES = [
  { label: 'Prestation Artisan', value: 'ARTISAN_REQUEST', icon: '👷', desc: 'Plombier, électricien, maçon...', color: '#2563EB' },
  { label: 'Achat Matériel', value: 'MATERIAL_REQUEST', icon: '🧱', desc: 'Ciment, brique, peinture...', color: '#DC2626' },
  { label: 'Location Équipement', value: 'EQUIPMENT_REQUEST', icon: '🔧', desc: 'Grue, bétonnière, échafaudage...', color: '#7C3AED' },
];

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

export default function CreateProjectModal({ visible, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const needsSkillStep = selectedTypes.includes('ARTISAN_REQUEST');
  const totalSteps = needsSkillStep ? 4 : 3;

  const toggleType = (value: string) => {
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const canProceed = () => {
    if (step === 1) return selectedTypes.length > 0;
    if (step === 2 && needsSkillStep) return !!skill;
    if (step === 2 && !needsSkillStep) return !!budget;
    if (step === 3 && needsSkillStep) return !!budget;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create orders for each selected type
      const promises = selectedTypes.map(type => {
        const orderType = type === 'ARTISAN_REQUEST' ? 'ARTISAN_SERVICE' : 'PRODUCT';
        const requestedProfession = type === 'ARTISAN_REQUEST' ? skill : undefined;
        const requestedProductType = type === 'MATERIAL_REQUEST' ? 'MATERIAL' :
                                     type === 'EQUIPMENT_REQUEST' ? 'EQUIPMENT' : undefined;

        return api.post('/commandes', {
          type: orderType,
          baseAmount: parseFloat(budget) || 0,
          description: description || undefined,
          requestedProfession,
          requestedProductType,
          requestedServices: selectedTypes,
        });
      });

      await Promise.all(promises);
      resetForm();
      onSuccess();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedTypes([]);
    setBudget('');
    setSkill('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, modal3D()]}>
          {/* Header */}
          <View style={styles.header}>
            <Icon3D icon="📝" size={24} bgColor={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Créer un projet</Text>
              <Text style={styles.stepText}>Étape {step} sur {totalSteps}</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Step 1: Choose types (multi-select) */}
            {step === 1 && (
              <>
                <Text style={styles.label}>De quoi avez-vous besoin ?</Text>
                <Text style={styles.hint}>💡 Vous pouvez sélectionner plusieurs options</Text>
                {PROJECT_TYPES.map(pt => {
                  const isSelected = selectedTypes.includes(pt.value);
                  return (
                    <TouchableOpacity
                      key={pt.value}
                      onPress={() => toggleType(pt.value)}
                      style={[styles.option, isSelected && { borderColor: pt.color, backgroundColor: pt.color + '08' }]}
                    >
                      <View style={[styles.optionCheck, isSelected && { backgroundColor: pt.color, borderColor: pt.color }]}>
                        {isSelected && <Text style={styles.optionCheckMark}>✓</Text>}
                      </View>
                      <Icon3D icon={pt.icon} size={18} bgColor={isSelected ? pt.color : colors.surfaceDark} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.optionTitle, isSelected && { color: pt.color }]}>{pt.label}</Text>
                        <Text style={styles.optionDesc}>{pt.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {selectedTypes.length > 1 && (
                  <View style={styles.multiSelectInfo}>
                    <Text style={styles.multiSelectIcon}>🎯</Text>
                    <Text style={styles.multiSelectText}>
                      {selectedTypes.length} services sélectionnés - Un projet sera créé pour chaque type
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Step 2 for ARTISAN: Choose skill */}
            {step === 2 && needsSkillStep && (
              <>
                <Text style={styles.label}>Quel métier recherchez-vous ?</Text>
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
              </>
            )}

            {/* Budget step */}
            {((step === 2 && !needsSkillStep) || (step === 3 && needsSkillStep)) && (
              <>
                <Text style={styles.label}>Quel est votre budget ? (DZD)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="Ex: 25000"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={styles.label}>Description du projet (optionnel)</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décrivez votre projet..."
                  placeholderTextColor={colors.textSecondary}
                />
              </>
            )}

            {/* Confirmation step */}
            {((step === 3 && !needsSkillStep) || (step === 4 && needsSkillStep)) && (
              <>
                <Text style={styles.label}>📍 Localisation</Text>
                <Text style={styles.communeDisplay}>{user?.commune || 'Non définie'}</Text>

                <Text style={styles.label}>Résumé du projet</Text>
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Services :</Text>
                    <View style={styles.summaryTypes}>
                      {selectedTypes.map(t => {
                        const pt = PROJECT_TYPES.find(p => p.value === t);
                        return pt ? (
                          <View key={t} style={[styles.summaryTypeBadge, { backgroundColor: pt.color + '15' }]}>
                            <Text style={[styles.summaryTypeText, { color: pt.color }]}>{pt.icon} {pt.label}</Text>
                          </View>
                        ) : null;
                      })}
                    </View>
                  </View>
                  {needsSkillStep && skill && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Métier :</Text>
                      <Text style={styles.summaryValue}>{skill}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Budget :</Text>
                    <Text style={[styles.summaryValue, { color: colors.accent, fontWeight: '700' }]}>
                      {parseFloat(budget || '0').toLocaleString()} DZD
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Commune :</Text>
                    <Text style={styles.summaryValue}>{user?.commune}</Text>
                  </View>
                  {description ? (
                    <View style={[styles.summaryRow, { flexDirection: 'column', gap: 4 }]}>
                      <Text style={styles.summaryLabel}>Description :</Text>
                      <Text style={styles.summaryValue}>{description}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.infoBox}>
                  <Icon3D icon="🤖" size={14} bgColor={colors.primary} />
                  <Text style={styles.infoText}>
                    Binaa va automatiquement trouver le meilleur prestataire dans votre zone pour ce projet.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
                <Text style={styles.backText}>← Retour</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed() || loading}
              style={{ opacity: canProceed() ? 1 : 0.5 }}
            >
              <View style={[styles.submitBtn, button3D(step === totalSteps ? colors.accent : colors.primary)]}>
                {loading ? (
                  <ActivityIndicator color={colors.textLight} size="small" />
                ) : (
                  <Text style={styles.submitText}>
                    {step === totalSteps ? '🚀 Lancer le projet' : 'Suivant →'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  title: { ...typography.h2, color: colors.text },
  stepText: { ...typography.caption, color: colors.textSecondary },
  closeBtn: { fontSize: 20, color: colors.textSecondary, padding: 8 },
  progressBar: { height: 4, backgroundColor: colors.surfaceDark, borderRadius: 2, marginBottom: 16 },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  body: { marginBottom: 16 },
  label: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  hint: { ...typography.caption, color: colors.primary, marginBottom: 12, fontStyle: 'italic' },
  option: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: colors.surface, borderRadius: 14, marginBottom: 10,
    borderWidth: 2, borderColor: colors.surfaceDark,
  },
  optionCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.surfaceDark,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  optionCheckMark: { color: '#fff', fontWeight: '700', fontSize: 14 },
  optionTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  optionDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  multiSelectInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2563EB10', padding: 12, borderRadius: 12, marginTop: 4,
  },
  multiSelectIcon: { fontSize: 16 },
  multiSelectText: { ...typography.caption, color: '#2563EB', flex: 1, fontWeight: '500' },
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
  input: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, ...typography.body, color: colors.text, borderWidth: 1, borderColor: colors.surfaceDark },
  communeDisplay: { ...typography.h3, color: colors.primary, marginBottom: 8 },
  summary: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { ...typography.body, color: colors.textSecondary },
  summaryValue: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  summaryTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, justifyContent: 'flex-end' },
  summaryTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  summaryTypeText: { ...typography.caption, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryLight + '15', padding: 14, borderRadius: 12, marginTop: 16 },
  infoText: { ...typography.bodySmall, color: colors.primary, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  backBtn: { padding: 12 },
  backText: { ...typography.button, color: colors.textSecondary },
  submitBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  submitText: { ...typography.button, color: colors.textLight },
});
