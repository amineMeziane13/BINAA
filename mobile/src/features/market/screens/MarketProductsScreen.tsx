import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const TYPE_ICONS: Record<string, string> = { MATERIAL: '🧱', SERVICE: '🛠️', EQUIPMENT: '🔧' };
const TYPE_COLORS: Record<string, string> = { MATERIAL: '#DC2626', SERVICE: '#2563EB', EQUIPMENT: '#7C3AED' };
const TYPE_LABELS: Record<string, string> = { MATERIAL: 'Matériel', SERVICE: 'Service', EQUIPMENT: 'Équipement' };

const FILTERS = [
  { label: 'Tous', value: '' },
  { label: 'Matériel', value: 'MATERIAL' },
  { label: 'Service', value: 'SERVICE' },
  { label: 'Équipement', value: 'EQUIPMENT' },
];

export default function MarketProductsScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const loadProducts = (typeFilter?: string) => {
    setLoading(true);
    const url = typeFilter ? `/products?type=${typeFilter}` : '/products';
    api.get(url)
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const applyFilter = (value: string) => {
    setFilter(value);
    loadProducts(value || undefined);
  };

  const renderProduct = ({ item }: any) => (
    <View style={[styles.card, card3D()]}>
      <View style={styles.cardHeader}>
        <Icon3D icon={TYPE_ICONS[item.type] || '📦'} size={18} bgColor={TYPE_COLORS[item.type] || '#94A3B8'} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.productTitle}>{item.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[item.type] || '#94A3B8') + '15' }]}>
            <Text style={[styles.typeText, { color: TYPE_COLORS[item.type] || '#94A3B8' }]}>{TYPE_LABELS[item.type] || item.type}</Text>
          </View>
        </View>
        <Text style={styles.price}>{item.price?.toLocaleString()} DZD</Text>
      </View>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.provider && (
        <View style={styles.providerRow}>
          <Icon3D icon="👤" size={10} bgColor={colors.surfaceDark} />
          <Text style={styles.providerName}>{item.provider.fullName}</Text>
          <Text style={styles.providerCommune}>📍 {item.provider.commune}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="🛒" size={22} bgColor="#DC2626" />
        <Text style={styles.title}>Marché</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.value} onPress={() => applyFilter(f.value)} style={[styles.filterChip, filter === f.value && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Aucune offre disponible</Text>}
          onRefresh={() => loadProducts(filter || undefined)}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, paddingBottom: 8 },
  backArrow: { fontSize: 24, color: colors.text, marginRight: 4 },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.surfaceDark },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.bodySmall, color: colors.text },
  filterTextActive: { color: colors.textLight, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 30 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 60 },
  card: { padding: 16, marginVertical: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  productTitle: { ...typography.h3, color: colors.text },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  typeText: { ...typography.caption, fontWeight: '700' },
  price: { ...typography.h3, color: colors.accent, fontWeight: '700' },
  description: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 8 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.surfaceDark },
  providerName: { ...typography.bodySmall, color: colors.text, fontWeight: '500' },
  providerCommune: { ...typography.caption, color: colors.textSecondary },
});
