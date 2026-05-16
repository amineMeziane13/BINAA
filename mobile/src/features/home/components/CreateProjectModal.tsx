import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
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
  { label: 'Prestation Artisan', value: 'ARTISAN_REQUEST', icon: '👷', desc: 'Plombier, électricien, maçon...' },
  { label: 'Achat Matériel', value: 'MATERIAL_REQUEST', icon: '🧱', desc: 'Ciment, brique, peinture...' },
  { label: 'Location Équipement', value: 'EQUIPMENT_REQUEST', icon: '🔧', desc: 'Grue, bétonnière, échafaudage...' },
];

const SKILLS = [
  'Plombier', 'Électricien', 'Maçon', 'Peintre', 'Menuisier',
  'Carreleur', 'Soudeur', 'Climaticien', 'Serrurier', 'Vitrier',
];

const COMMUNES = [
  'Oran', 'Es-Sénia', 'Bir El Djir', 'Aïn El Turk', 'Arzew',
  'Bethioua', 'Gdyel', 'Oued Tlelat', 'Boutlélis', 'Misserghin',
  'Canastel', 'El Ançor', 'Hassi Bounif', 'Sidi Chahmi', 'Mers El Kébir',
];

export default function CreateProjectModal({ visible, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [skill, setSkill] = useState('');
  const [description, setDescription] = useState('');
  const [commune, setCommune] = useState(user?.commune || '');
  const [loading, setLoading] = useState(false);

  const totalSteps = type === 'ARTISAN_REQUEST' ? 4 : 3;

  const canProceed = () => {
    if (step === 1) return !!type;
    if (step === 2 && type === 'ARTISAN_REQUEST') return !!skill;
    if (step === 2 && type !== 'ARTISAN_REQUEST') return !!budget;
    if (step === 3 && type === 'ARTISAN_REQUEST') return !!budget;
    if (step === 3 && type !== 'ARTISAN_REQUEST') return true;
    if (step === 4) return true;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/commandes', {
        type,
        baseAmount: parseFloat(budget) || 0,
        skills: type === 'ARTISAN_REQUEST' ? [skill] : [],
      });
      setStep(1);
      setType('');
      setBudget('');
      setSkill('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setType('');
    setBudget('');
    setSkill('');
    setDescription('');
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
            {/* Step 1: Choose type */}
            {step === 1 && (
              <>
                <Text style={styles.label}>De quoi avez-vous besoin ?</Text>
                {PROJECT_TYPES.map(pt => (
                  <TouchableOpacity key={pt.value} onPress={() => setType(pt.value)} style={[styles.option, type === pt.value && styles.optionSelected]}>
                    <Icon3D icon={pt.icon} size={18} bgColor={type === pt.value ? colors.primary : colors.surfaceDark} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.optionTitle, type === pt.value && styles.optionTitleSelected]}>{pt.label}</Text>
                      <Text style={styles.optionDesc}>{pt.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Step 2 for ARTISAN: Choose skill */}
            {step === 2 && type === 'ARTISAN_REQUEST' && (
              <>
                <Text style={styles.label}>Quel métier recherchez-vous ?</Text>
                <View style={styles.chipContainer}>
                  {SKILLS.map(s => (
                    <TouchableOpacity key={s} onPress={() => setSkill(s)} style={[styles.chip, skill === s && styles.chipSelected]}>
                      <Text style={[styles.chipText, skill === s && styles.chipTextSelected]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Budget step */}
            {((step === 2 && type !== 'ARTISAN_REQUEST') || (step === 3 && type === 'ARTISAN_REQUEST')) && (
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
            {((step === 3 && type !== 'ARTISAN_REQUEST') || (step === 4 && type === 'ARTISAN_REQUEST')) && (
              <>
                <Text style={styles.label}>📍 Localisation</Text>
                <Text style={styles.communeDisplay}>{commune || user?.commune || 'Non définie'}</Text>

                <Text style={styles.label}>Résumé du projet</Text>
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Type :</Text>
                    <Text style={styles.summaryValue}>{PROJECT_TYPES.find(p => p.value === type)?.label}</Text>
                  </View>
                  {type === 'ARTISAN_REQUEST' && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Métier :</Text>
                      <Text style={styles.summaryValue}>{skill}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Budget :</Text>
                    <Text style={styles.summaryValue}>{parseFloat(budget || '0').toLocaleString()} DZD</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Commune :</Text>
                    <Text style={styles.summaryValue}>{commune || user?.commune}</Text>
                  </View>
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
                <Text style={styles.submitText}>
                  {loading ? '...' : step === totalSteps ? '🚀 Lancer le projet' : 'Suivant →'}
                </Text>
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
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderRadius: 14, marginBottom: 10, borderWidth: 2, borderColor: colors.surfaceDark },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '15' },
  optionTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  optionTitleSelected: { color: colors.primary },
  optionDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.surfaceDark },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySmall, color: colors.text },
  chipTextSelected: { color: colors.textLight, fontWeight: '700' },
  input: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, ...typography.body, color: colors.text, borderWidth: 1, borderColor: colors.surfaceDark },
  communeDisplay: { ...typography.h3, color: colors.primary, marginBottom: 8 },
  summary: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...typography.body, color: colors.textSecondary },
  summaryValue: { ...typography.body, color: colors.text, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryLight + '15', padding: 14, borderRadius: 12, marginTop: 16 },
  infoText: { ...typography.bodySmall, color: colors.primary, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  backBtn: { padding: 12 },
  backText: { ...typography.button, color: colors.textSecondary },
  submitBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  submitText: { ...typography.button, color: colors.textLight },
});
