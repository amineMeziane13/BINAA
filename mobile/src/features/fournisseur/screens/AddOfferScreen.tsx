import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const OFFER_TYPES = [
  { label: 'Matériel', value: 'MATERIAL', icon: '🧱' },
  { label: 'Service', value: 'SERVICE', icon: '🛠️' },
  { label: 'Équipement (Location)', value: 'EQUIPMENT', icon: '🔧' },
];

const SUGGESTED_TAGS = [
  'peinture', 'plomberie', 'électricité', 'maçonnerie', 'menuiserie',
  'carrelage', 'climatisation', 'soudure', 'rénovation', 'construction',
];

export default function AddOfferScreen() {
  const navigation = useNavigation<any>();
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!type || !title || !price) {
      Alert.alert('Erreur', 'Veuillez remplir le type, le titre et le prix.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/products', {
        type,
        title,
        description: description || undefined,
        price: parseFloat(price),
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : undefined,
        tags,
      });
      Alert.alert('Succès', 'Offre créée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="➕" size={22} bgColor="#7C3AED" />
        <Text style={styles.title}>Ajouter une offre</Text>
      </View>

      {/* Type */}
      <Text style={styles.label}>Type d'offre *</Text>
      {OFFER_TYPES.map(ot => (
        <TouchableOpacity key={ot.value} onPress={() => setType(ot.value)} style={[styles.option, type === ot.value && styles.optionSelected]}>
          <Text style={styles.optionIcon}>{ot.icon}</Text>
          <Text style={[styles.optionText, type === ot.value && styles.optionTextSelected]}>{ot.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Title */}
      <Text style={styles.label}>Titre *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Ex: Sac de ciment 50kg"
        placeholderTextColor={colors.textSecondary}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Décrivez votre offre..."
        placeholderTextColor={colors.textSecondary}
      />

      {/* Price */}
      <Text style={styles.label}>Prix (DZD) *</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        placeholder="Ex: 800"
        placeholderTextColor={colors.textSecondary}
      />

      {/* Stock */}
      {type !== 'SERVICE' && (
        <>
          <Text style={styles.label}>Quantité en stock</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={stockQuantity}
            onChangeText={setStockQuantity}
            placeholder="Ex: 100"
            placeholderTextColor={colors.textSecondary}
          />
        </>
      )}

      {/* Tags */}
      <Text style={styles.label}>Tags (pour le matching intelligent)</Text>
      <View style={styles.chipContainer}>
        {SUGGESTED_TAGS.map(tag => (
          <TouchableOpacity key={tag} onPress={() => toggleTag(tag)} style={[styles.chip, tags.includes(tag) && styles.chipSelected]}>
            <Text style={[styles.chipText, tags.includes(tag) && styles.chipTextSelected]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit */}
      <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ marginTop: 24 }}>
        <View style={[styles.submitBtn, button3D('#7C3AED'), loading && { opacity: 0.6 }]}>
          <Text style={styles.submitText}>{loading ? 'Création...' : '📦 Créer l\'offre'}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backArrow: { fontSize: 24, color: colors.text, marginRight: 4 },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  label: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, ...typography.body, color: colors.text, borderWidth: 1, borderColor: colors.surfaceDark },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderRadius: 14, marginBottom: 8, borderWidth: 2, borderColor: colors.surfaceDark, gap: 12 },
  optionSelected: { borderColor: '#7C3AED', backgroundColor: '#7C3AED' + '10' },
  optionIcon: { fontSize: 20 },
  optionText: { ...typography.body, color: colors.text },
  optionTextSelected: { color: '#7C3AED', fontWeight: '700' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.surfaceDark },
  chipSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { ...typography.bodySmall, color: colors.text },
  chipTextSelected: { color: colors.textLight, fontWeight: '700' },
  submitBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 14 },
  submitText: { ...typography.button, color: colors.textLight, fontSize: 16 },
});
