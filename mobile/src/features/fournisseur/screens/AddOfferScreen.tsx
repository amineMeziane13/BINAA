import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Image, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D, card3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const OFFER_TYPES = [
  { label: 'Matériel', value: 'MATERIAL', icon: '🧱', color: '#DC2626', desc: 'Ciment, brique, peinture...' },
  { label: 'Service', value: 'SERVICE', icon: '🛠️', color: '#2563EB', desc: 'Maintenance, installation...' },
  { label: 'Équipement', value: 'EQUIPMENT', icon: '🔧', color: '#7C3AED', desc: 'Location grue, bétonnière...' },
];

export default function AddOfferScreen() {
  const navigation = useNavigation<any>();
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
        description: description || '',
        price: parseFloat(price),
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        photos,
      });
      Alert.alert('✅ Succès', 'Offre créée avec succès !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = OFFER_TYPES.find(t => t.value === type);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon3D icon="➕" size={24} bgColor="#7C3AED" />
          <Text style={styles.title}>Nouvelle offre</Text>
        </View>
      </View>

      {/* Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Type d'offre</Text>
        <View style={styles.typeGrid}>
          {OFFER_TYPES.map(ot => (
            <TouchableOpacity
              key={ot.value}
              onPress={() => setType(ot.value)}
              style={[
                styles.typeCard,
                card3D(),
                type === ot.value && { borderColor: ot.color, borderWidth: 2 },
              ]}
            >
              <View style={[styles.typeIconCircle, { backgroundColor: ot.color + '15' }]}>
                <Text style={styles.typeIcon}>{ot.icon}</Text>
              </View>
              <Text style={[styles.typeLabel, type === ot.value && { color: ot.color, fontWeight: '700' }]}>
                {ot.label}
              </Text>
              <Text style={styles.typeDesc}>{ot.desc}</Text>
              {type === ot.value && (
                <View style={[styles.checkCircle, { backgroundColor: ot.color }]}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✏️ Titre de l'offre</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Sac de ciment 50kg"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez votre offre en détail..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Price & Stock */}
      <View style={styles.rowSection}>
        <View style={styles.halfField}>
          <Text style={styles.sectionTitle}>💰 Prix (DZD)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholder="Ex: 800"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        {type !== 'SERVICE' && (
          <View style={styles.halfField}>
            <Text style={styles.sectionTitle}>📊 Stock</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              placeholder="Ex: 100"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Photos du produit/service</Text>
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

      {/* Summary Preview */}
      {type && title && price ? (
        <View style={[styles.previewCard, card3D()]}>
          <Text style={styles.previewTitle}>📋 Aperçu de l'offre</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Type</Text>
            <View style={[styles.previewBadge, { backgroundColor: (selectedType?.color || '#94A3B8') + '15' }]}>
              <Text style={[styles.previewBadgeText, { color: selectedType?.color }]}>
                {selectedType?.icon} {selectedType?.label}
              </Text>
            </View>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Titre</Text>
            <Text style={styles.previewValue}>{title}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Prix</Text>
            <Text style={[styles.previewValue, { color: colors.accent, fontWeight: '700' }]}>
              {parseFloat(price).toLocaleString()} DZD
            </Text>
          </View>
          {photos.length > 0 && (
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Photos</Text>
              <Text style={styles.previewValue}>{photos.length} photo(s)</Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Submit */}
      <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ marginTop: 16 }}>
        <View style={[styles.submitBtn, button3D('#7C3AED'), loading && { opacity: 0.6 }]}>
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.submitText}>📦 Publier l'offre</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { padding: 8, marginRight: 8 },
  backArrow: { fontSize: 24, color: colors.text },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  title: { ...typography.h2, color: colors.text, flex: 1 },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { ...typography.body, color: colors.text, fontWeight: '700', marginBottom: 10 },
  rowSection: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  halfField: { flex: 1 },

  // Type Cards
  typeGrid: { gap: 10 },
  typeCard: {
    padding: 16, position: 'relative',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  typeIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  typeIcon: { fontSize: 22 },
  typeLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  typeDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  checkCircle: {
    position: 'absolute', top: 12, right: 12,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Inputs
  input: {
    backgroundColor: colors.surface, padding: 16, borderRadius: 14,
    ...typography.body, color: colors.text,
    borderWidth: 1, borderColor: colors.surfaceDark,
  },
  textArea: { height: 100, textAlignVertical: 'top' },

  // Photos
  photoScroll: { marginTop: 4 },
  addPhotoBtn: {
    width: 100, height: 100, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 2,
    borderColor: '#7C3AED40', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  addPhotoIcon: { fontSize: 28 },
  addPhotoText: { ...typography.caption, color: '#7C3AED', marginTop: 4, fontWeight: '600' },
  photoWrapper: { marginRight: 10, position: 'relative' },
  photo: { width: 100, height: 100, borderRadius: 14 },
  removePhoto: {
    position: 'absolute', top: -6, right: -6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
  },
  removePhotoText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Preview
  previewCard: { padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#7C3AED20' },
  previewTitle: { ...typography.body, color: colors.text, fontWeight: '700', marginBottom: 12 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  previewLabel: { ...typography.bodySmall, color: colors.textSecondary },
  previewValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  previewBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { ...typography.caption, fontWeight: '700' },

  // Submit
  submitBtn: { paddingVertical: 18, alignItems: 'center', borderRadius: 14 },
  submitText: { ...typography.button, color: colors.textLight, fontSize: 16 },
});
