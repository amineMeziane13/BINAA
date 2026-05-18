import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
} from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const MATERIALS = [
  { name: 'Ciment (sac 50kg)', unit: 'sac', avgPrice: 800 },
  { name: 'Brique (1000 pièces)', unit: 'lot', avgPrice: 12000 },
  { name: 'Sable (m³)', unit: 'm³', avgPrice: 3500 },
  { name: 'Gravier (m³)', unit: 'm³', avgPrice: 4000 },
  { name: 'Fer à béton (barre 12m)', unit: 'barre', avgPrice: 1800 },
  { name: 'Peinture (seau 25L)', unit: 'seau', avgPrice: 6500 },
  { name: 'Carrelage (m²)', unit: 'm²', avgPrice: 2500 },
  { name: 'Plâtre (sac 40kg)', unit: 'sac', avgPrice: 600 },
];

interface CalcItem {
  name: string;
  quantity: string;
  unitPrice: string;
}

export default function CalculatorScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<CalcItem[]>([
    { name: '', quantity: '', unitPrice: '' },
  ]);
  const [laborCost, setLaborCost] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addItem = () => {
    setItems(prev => [...prev, { name: '', quantity: '', unitPrice: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof CalcItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addSuggested = (mat: typeof MATERIALS[0]) => {
    setItems(prev => [...prev, { name: mat.name, quantity: '1', unitPrice: String(mat.avgPrice) }]);
    setShowSuggestions(false);
  };

  const materialTotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0);

  const labor = parseFloat(laborCost) || 0;
  const grandTotal = materialTotal + labor;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="📐" size={24} bgColor="#059669" />
        <Text style={styles.title}>Calculatrice</Text>
      </View>

      <Text style={styles.subtitle}>Estimez le coût de votre projet de construction</Text>

      {/* Materials Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧱 Matériaux</Text>

        {items.map((item, index) => (
          <View key={index} style={[styles.itemCard, card3D()]}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>#{index + 1}</Text>
              {items.length > 1 && (
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              value={item.name}
              onChangeText={(v) => updateItem(index, 'name', v)}
              placeholder="Nom du matériel"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Quantité</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={item.quantity}
                  onChangeText={(v) => updateItem(index, 'quantity', v)}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Prix unitaire (DZD)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={item.unitPrice}
                  onChangeText={(v) => updateItem(index, 'unitPrice', v)}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
            {item.quantity && item.unitPrice ? (
              <Text style={styles.itemTotal}>
                = {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toLocaleString()} DZD
              </Text>
            ) : null}
          </View>
        ))}

        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>+ Ajouter un matériel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, styles.suggestBtn]}
            onPress={() => setShowSuggestions(!showSuggestions)}
          >
            <Text style={[styles.addBtnText, { color: '#059669' }]}>💡 Suggestions</Text>
          </TouchableOpacity>
        </View>

        {showSuggestions && (
          <View style={styles.suggestions}>
            {MATERIALS.map((mat, i) => (
              <TouchableOpacity key={i} style={styles.sugItem} onPress={() => addSuggested(mat)}>
                <Text style={styles.sugName}>{mat.name}</Text>
                <Text style={styles.sugPrice}>~{mat.avgPrice.toLocaleString()} DZD/{mat.unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Labor Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👷 Main d'œuvre</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={laborCost}
          onChangeText={setLaborCost}
          placeholder="Coût estimé de la main d'œuvre (DZD)"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Totals */}
      <View style={[styles.totalsCard, card3D()]}>
        <Text style={styles.totalsTitle}>💰 Estimation du coût</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Matériaux</Text>
          <Text style={styles.totalValue}>{materialTotal.toLocaleString()} DZD</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Main d'œuvre</Text>
          <Text style={styles.totalValue}>{labor.toLocaleString()} DZD</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total estimé</Text>
          <Text style={styles.grandTotalValue}>{grandTotal.toLocaleString()} DZD</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingTop: 50, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  backButton: { padding: 8 },
  backArrow: { fontSize: 24, color: colors.text },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 20 },

  section: { marginBottom: 24 },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },

  itemCard: { padding: 14, marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemNumber: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  removeBtn: { fontSize: 16, color: colors.error, padding: 4 },
  input: {
    backgroundColor: colors.surface, padding: 14, borderRadius: 12,
    ...typography.body, color: colors.text,
    borderWidth: 1, borderColor: colors.surfaceDark, marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 10 },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  itemTotal: { ...typography.body, color: colors.accent, fontWeight: '700', textAlign: 'right', marginTop: 4 },

  addRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  addBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed',
    alignItems: 'center',
  },
  suggestBtn: { borderColor: '#059669' },
  addBtnText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

  suggestions: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 10, marginTop: 10,
    borderWidth: 1, borderColor: '#05966930',
  },
  sugItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: colors.surfaceDark,
  },
  sugName: { ...typography.bodySmall, color: colors.text, flex: 1 },
  sugPrice: { ...typography.caption, color: '#059669', fontWeight: '600' },

  totalsCard: { padding: 20, borderWidth: 1, borderColor: colors.accent + '30' },
  totalsTitle: { ...typography.h3, color: colors.text, marginBottom: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { ...typography.body, color: colors.textSecondary },
  totalValue: { ...typography.body, color: colors.text, fontWeight: '500' },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: colors.surfaceDark, marginTop: 8, paddingTop: 12 },
  grandTotalLabel: { ...typography.h3, color: colors.text },
  grandTotalValue: { ...typography.h2, color: colors.accent, fontWeight: '800' },
});
