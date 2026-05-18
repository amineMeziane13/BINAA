import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, modal3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useAuth } from '../../../core/hooks/useAuth';
import ProjectVisualizer3D from '../components/ProjectVisualizer3D';

const STATUS_LABELS: Record<string, string> = {
  PENDING_ASSIGNMENT: 'En attente d\'affectation',
  PENDING_PAYMENT: 'En attente de paiement',
  PAID: 'Payé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_ASSIGNMENT: '#F59E0B',
  PENDING_PAYMENT: '#3B82F6',
  PAID: '#22C55E',
  COMPLETED: '#059669',
  CANCELLED: '#EF4444',
};

const TYPE_LABELS: Record<string, string> = {
  ARTISAN_REQUEST: 'Prestation Artisan',
  MATERIAL_REQUEST: 'Achat Matériel',
  EQUIPMENT_REQUEST: 'Location Équipement',
};

export default function OrderScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [rating, setRating] = useState(0);

  const loadOrders = () => {
    setLoading(true);
    api.get('/commandes')
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  const handlePayOrder = async (orderId: string) => {
    try {
      await api.patch(`/commandes/${orderId}/status`, { status: 'PAID' });
      setSelected(null);
      loadOrders();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur de paiement');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await api.patch(`/commandes/${orderId}/status`, { status: 'COMPLETED' });
      setSelected(null);
      loadOrders();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert('Annuler', 'Voulez-vous vraiment annuler cette commande ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: async () => {
        try {
          await api.patch(`/commandes/${orderId}/status`, { status: 'CANCELLED' });
          setSelected(null);
          loadOrders();
        } catch (err: any) {
          Alert.alert('Erreur', err?.response?.data?.error || 'Erreur');
        }
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity activeOpacity={0.85} onPress={() => setSelected(item)}>
      <View style={[styles.card, card3D()]}>
        <View style={styles.cardRow}>
          <Icon3D icon="📦" size={16} bgColor={STATUS_COLORS[item.status] || '#94A3B8'} />
          <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
          <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] || '#94A3B8') + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#94A3B8' }]}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.typeLabel}>{TYPE_LABELS[item.type] || item.type}</Text>
        <Text style={styles.amount}>{item.totalAmount?.toLocaleString()} DZD</Text>
        {user?.role !== 'CLIENT' && item.client && (
          <Text style={styles.client}>Client: {item.client.fullName}</Text>
        )}
        {user?.role === 'CLIENT' && item.assignedProvider && (
          <Text style={styles.client}>Prestataire: {item.assignedProvider.fullName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon3D icon="📋" size={22} bgColor={colors.primary} />
        <Text style={styles.title}>{user?.role === 'CLIENT' ? 'Mes Projets' : 'Commandes'}</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucune commande pour le moment</Text>}
        onRefresh={loadOrders}
        refreshing={loading}
      />

      {/* Order Details Modal */}
      {selected && (
        <ProjectVisualizer3D 
          visible={!!selected} 
          project={selected} 
          onClose={() => setSelected(null)} 
          onPay={handlePayOrder}
          onComplete={handleCompleteOrder}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, paddingBottom: 8 },
  title: { ...typography.h2, color: colors.text },
  list: { padding: 16, paddingBottom: 30 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 60 },
  card: { padding: 16, marginVertical: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderId: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { ...typography.caption, fontWeight: '700' },
  typeLabel: { ...typography.bodySmall, color: colors.primary, fontWeight: '600', marginTop: 8 },
  amount: { ...typography.h3, color: colors.accent, fontWeight: '700', marginVertical: 4 },
  client: { ...typography.bodySmall, color: colors.textSecondary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalTitle: { ...typography.h2, color: colors.text, flex: 1 },
  closeBtn: { fontSize: 20, color: colors.textSecondary, padding: 8 },
  detailCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderLeftWidth: 4, marginBottom: 12 },
  detailRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  detailHalf: { flex: 1, backgroundColor: colors.surface, padding: 14, borderRadius: 12 },
  detailLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  detailValue: { ...typography.body, color: colors.text, fontWeight: '600' },
  statusBadgeLg: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusTextLg: { ...typography.bodySmall, fontWeight: '700' },
  amountSection: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  amountLabel: { ...typography.body, color: colors.textSecondary },
  amountValue: { ...typography.body, color: colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.surfaceDark, marginTop: 6, paddingTop: 10 },
  totalLabel: { ...typography.h3, color: colors.text },
  totalValue: { ...typography.h3, color: colors.accent, fontWeight: '700' },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 12, marginBottom: 8 },
  personLabel: { ...typography.caption, color: colors.textSecondary },
  personName: { ...typography.body, color: colors.text, fontWeight: '600' },
  personSub: { ...typography.caption, color: colors.textSecondary },
  dateText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginVertical: 12 },
  actions: { gap: 10, marginTop: 8, marginBottom: 20 },
  actionBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  actionBtnText: { ...typography.button, color: colors.textLight },
  cancelBtn: { padding: 14, alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: colors.error },
  cancelBtnText: { ...typography.button, color: colors.error },
  ratingSection: { alignItems: 'center', marginTop: 12 },
  ratingTitle: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 36, color: colors.surfaceDark },
  starActive: { color: '#F59E0B' },
});
