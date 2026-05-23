import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import OfferDetailsModal from '../components/OfferDetailsModal';

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
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const loadOffers = () => {
    setLoading(true);
    api.get('/products/mine')
      .then(({ data }) => setOffers(data))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  };

  useFocusEffect(
    React.useCallback(() => {
      loadOffers();
    }, [])
  );

  const handleEdit = (offer: any) => {
    setSelectedOffer(null);
    navigation.navigate('EditOffer', { offer });
  };

  const handleDelete = (offer: any) => {
    Alert.alert(
      'Supprimer l\'offre',
      'Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/products/${offer.id}`);
              setSelectedOffer(null);
              loadOffers();
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'offre');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderOffer = ({ item }: any) => {
    const hasPhotos = item.photos && item.photos.length > 0;

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => setSelectedOffer(item)}>
        <View style={[styles.card, card3D()]}>
        {/* Photo banner */}
        {hasPhotos && (
          <View style={styles.photoBanner}>
            <Image source={{ uri: item.photos[0] }} style={styles.bannerImage} />
            {item.photos.length > 1 && (
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>+{item.photos.length - 1}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardBody}>
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
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price?.toLocaleString()} DZD</Text>
            {item.type !== 'SERVICE' && item.stockQuantity != null && (
              <View style={[styles.stockBadge, { backgroundColor: item.stockQuantity > 0 ? '#22C55E15' : '#EF444415' }]}>
                <Text style={[styles.stockText, { color: item.stockQuantity > 0 ? '#22C55E' : '#EF4444' }]}>
                  {item.stockQuantity > 0 ? `📦 Stock: ${item.stockQuantity}` : '⚠️ Rupture'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="📦" size={22} bgColor="#7C3AED" />
        <Text style={styles.title}>Mes offres</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{offers.length}</Text>
        </View>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        renderItem={renderOffer}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Aucune offre</Text>
            <Text style={styles.emptyDesc}>Ajoutez votre première offre pour commencer à recevoir des clients</Text>
          </View>
        }
        onRefresh={loadOffers}
        refreshing={loading}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddOffer')}>
        <View style={[styles.fabInner, button3D('#7C3AED')]}>
          <Text style={styles.fabText}>+ Ajouter une offre</Text>
        </View>
      </TouchableOpacity>

      <OfferDetailsModal
        visible={!!selectedOffer}
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        isOwner={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, paddingBottom: 8 },
  backArrow: { fontSize: 24, color: colors.text, marginRight: 4 },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  countBadge: {
    backgroundColor: '#7C3AED', width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  countText: { ...typography.caption, color: '#fff', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptyDesc: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },

  // Card
  card: { marginVertical: 6, overflow: 'hidden' },
  photoBanner: { position: 'relative' },
  bannerImage: { width: '100%', height: 140, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  photoBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  photoBadgeText: { ...typography.caption, color: '#fff', fontWeight: '600' },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  offerTitle: { ...typography.h3, color: colors.text },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  typeText: { ...typography.caption, fontWeight: '700' },
  description: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { ...typography.h3, color: colors.accent, fontWeight: '700' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockText: { ...typography.caption, fontWeight: '600' },

  // FAB
  fab: { position: 'absolute', bottom: 24, right: 20, left: 20 },
  fabInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  fabText: { ...typography.button, color: colors.textLight, fontSize: 16 },
});
