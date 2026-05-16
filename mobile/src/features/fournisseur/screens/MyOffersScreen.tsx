import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const TYPE_ICONS: Record<string, string> = {
  MATERIAL: '🧱',
  SERVICE: '🛠️',
  EQUIPMENT: '🔧',
};

const TYPE_COLORS: Record<string, string> = {
  MATERIAL: '#DC2626',
  SERVICE: '#2563EB',
  EQUIPMENT: '#7C3AED',
};

const TYPE_LABELS: Record<string, string> = {
  MATERIAL: 'Matériel',
  SERVICE: 'Service',
  EQUIPMENT: 'Équipement',
};

export default function MyOffersScreen() {
  const navigation = useNavigation<any>();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = () => {
    setLoading(true);
    api.get('/products')
      .then(({ data }) => setOffers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOffers(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderOffer = ({ item }: any) => (
    <View style={[styles.card, card3D()]}>
      <View style={styles.cardHeader}>
        <Icon3D icon={TYPE_ICONS[item.type] || '📦'} size={18} bgColor={TYPE_COLORS[item.type] || '#94A3B8'} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.offerTitle}>{item.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[item.type] || '#94A3B8') + '15' }]}>
            <Text style={[styles.typeText, { color: TYPE_COLORS[item.type] || '#94A3B8' }]}>
              {TYPE_LABELS[item.type] || item.type}
            </Text>
          </View>
        </View>
      </View>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{item.price?.toLocaleString()} DZD</Text>
        {item.stockQuantity !== null && item.stockQuantity !== undefined && (
          <Text style={styles.stock}>Stock: {item.stockQuantity}</Text>
        )}
      </View>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.map((tag: string, i: number) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
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
        <Icon3D icon="📦" size={22} bgColor="#7C3AED" />
        <Text style={styles.title}>Mes offres</Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucune offre pour le moment</Text>}
        onRefresh={loadOffers}
        refreshing={loading}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddOffer')}>
        <View style={[styles.fabInner, button3D('#7C3AED')]}>
          <Text style={styles.fabText}>+ Ajouter</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, paddingBottom: 8 },
  backArrow: { fontSize: 24, color: colors.text, marginRight: 4 },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 60 },
  card: { padding: 16, marginVertical: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  offerTitle: { ...typography.h3, color: colors.text },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  typeText: { ...typography.caption, fontWeight: '700' },
  description: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { ...typography.h3, color: colors.accent, fontWeight: '700' },
  stock: { ...typography.bodySmall, color: colors.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { backgroundColor: colors.surfaceDark, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { ...typography.caption, color: colors.textSecondary },
  fab: { position: 'absolute', bottom: 24, right: 20, left: 20 },
  fabInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  fabText: { ...typography.button, color: colors.textLight, fontSize: 16 },
});
