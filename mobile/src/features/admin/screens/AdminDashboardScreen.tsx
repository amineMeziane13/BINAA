import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, modal3D, button3D, input3D } from '../../../core/theme/neumorphism';
import { useAuth } from '../../../core/hooks/useAuth';
import Icon3D from '../../../core/components/Icon3D';

const STATUS_LABELS: Record<string, string> = {
  PENDING_ASSIGNMENT: 'En attente',
  PENDING_PAYMENT: 'Paiement',
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

const ROLE_COLORS: Record<string, string> = {
  CLIENT: '#22C55E',
  FOURNISSEUR: '#7C3AED',
  ARTISAN: '#2563EB',
  ADMIN: '#DC2626',
};

type TabKey = 'dashboard' | 'reports' | 'users' | 'orders';

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commission, setCommission] = useState('10');
  const [showAssign, setShowAssign] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [userFilter, setUserFilter] = useState('ALL');
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, ordersRes, settingsRes, reportsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/commandes'),
        api.get('/admin/settings'),
        api.get('/admin/reports')
      ]);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
      setReports(reportsRes.data);
      const commRate = settingsRes.data.find((s: any) => s.key === 'COMMISSION_RATE');
      if (commRate) setCommission(String(commRate.value));
    } catch {}
    setLoading(false);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    Alert.alert('Supprimer', `Voulez-vous supprimer le compte de ${name} ?`, [
      { text: 'Non', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          loadAll();
        } catch (err: any) {
          Alert.alert('Erreur', err?.response?.data?.error || 'Erreur');
        }
      }},
    ]);
  };

  const handleAssign = async (providerId: string) => {
    try {
      await api.patch(`/admin/commandes/${selectedOrder.id}/assign`, { assignedProviderId: providerId });
      setShowAssign(false);
      setSelectedOrder(null);
      loadAll();
    } catch {}
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert('Annuler', 'Voulez-vous vraiment annuler cette commande ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: async () => {
        try {
          await api.patch(`/admin/commandes/${orderId}/cancel`);
          loadAll();
        } catch (err: any) {
          Alert.alert('Erreur', err?.response?.data?.error || 'Erreur');
        }
      }},
    ]);
  };

  const handleSaveCommission = async () => {
    try {
      await api.put('/admin/settings/COMMISSION_RATE', { value: parseFloat(commission) });
      Alert.alert('Succès', 'Commission mise à jour');
    } catch {}
  };

  // Stats
  const totalOrders = orders.length;
  const revenue = orders.filter(o => o.status === 'PAID' || o.status === 'COMPLETED').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const clientCount = users.filter(u => u.role === 'CLIENT').length;
  const artisanCount = users.filter(u => u.role === 'ARTISAN').length;
  const fournisseurCount = users.filter(u => u.role === 'FOURNISSEUR').length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING_ASSIGNMENT').length;

  const filteredUsers = userFilter === 'ALL' ? users.filter(u => u.role !== 'ADMIN') : users.filter(u => u.role === userFilter);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon3D icon="⚙️" size={22} bgColor={colors.primary} />
        <Text style={styles.headerTitle}>Administration</Text>
        <TouchableOpacity style={styles.logoutIcon} onPress={logout}>
          <Icon3D icon="🚪" size={12} bgColor={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['dashboard', 'reports', 'users', 'orders'] as TabKey[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'dashboard' ? '📊 Stats' : t === 'reports' ? '📈 Rapports' : t === 'users' ? '👥 Users' : '📋 Cmds'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, card3D()]}>
              <Icon3D icon="💰" size={18} bgColor="#22C55E" />
              <Text style={styles.statValue}>{revenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>CA (DZD)</Text>
            </View>
            <View style={[styles.statCard, card3D()]}>
              <Icon3D icon="📦" size={18} bgColor="#3B82F6" />
              <Text style={styles.statValue}>{totalOrders}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={[styles.statCard, card3D()]}>
              <Icon3D icon="✅" size={18} bgColor="#059669" />
              <Text style={styles.statValue}>{completedOrders}</Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>
            <View style={[styles.statCard, card3D()]}>
              <Icon3D icon="⏳" size={18} bgColor="#F59E0B" />
              <Text style={styles.statValue}>{pendingOrders}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
          </View>

          <View style={styles.userStats}>
            <View style={[styles.userStatCard, { borderLeftColor: '#22C55E' }]}>
              <Text style={styles.userStatValue}>{clientCount}</Text>
              <Text style={styles.userStatLabel}>Clients</Text>
            </View>
            <View style={[styles.userStatCard, { borderLeftColor: '#2563EB' }]}>
              <Text style={styles.userStatValue}>{artisanCount}</Text>
              <Text style={styles.userStatLabel}>Artisans</Text>
            </View>
            <View style={[styles.userStatCard, { borderLeftColor: '#7C3AED' }]}>
              <Text style={styles.userStatValue}>{fournisseurCount}</Text>
              <Text style={styles.userStatLabel}>Fournisseurs</Text>
            </View>
          </View>

          {/* Commission */}
          <View style={[styles.commissionCard, card3D()]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Icon3D icon="⚙️" size={16} bgColor={colors.primary} />
              <Text style={styles.commissionLabel}>Taux de commission (%)</Text>
            </View>
            <View style={styles.commissionRow}>
              <TextInput style={[input3D(), { flex: 1 }]} value={commission} onChangeText={setCommission} keyboardType="decimal-pad" />
              <TouchableOpacity onPress={handleSaveCommission}>
                <View style={[styles.smallButton, button3D(colors.primary)]}>
                  <Text style={styles.smallButtonText}>Sauver</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Reports Tab */}
      {tab === 'reports' && reports && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          <View style={[styles.statCard, card3D(), { width: '100%', marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between' }]}>
            <View>
              <Text style={styles.statLabel}>Commissions Générées</Text>
              <Text style={styles.statValue}>{reports.financials.totalCommissionEarned?.toLocaleString()} DZD</Text>
            </View>
            <Icon3D icon="💸" size={24} bgColor="#7C3AED" />
          </View>

          <Text style={{ ...typography.h3, color: colors.text, marginBottom: 8 }}>Répartition par statut</Text>
          <View style={[card3D(), { padding: 16, marginBottom: 16 }]}>
            {Object.entries(reports.operations.ordersByStatus).map(([status, count]: any) => (
              <View key={status} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                <Text style={{ color: STATUS_COLORS[status] || colors.text, fontWeight: '600' }}>{STATUS_LABELS[status] || status}</Text>
                <Text style={{ ...typography.body, color: colors.text }}>{count}</Text>
              </View>
            ))}
          </View>

          <Text style={{ ...typography.h3, color: colors.text, marginBottom: 8 }}>Opérations Récentes</Text>
          {reports.recentOperations?.map((op: any) => (
            <View key={op.id} style={[card3D(), { padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text style={styles.orderId}>#{op.id.slice(0, 8)} - {op.type}</Text>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>{new Date(op.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ ...typography.body, fontWeight: '700', color: colors.accent }}>{op.totalAmount} DZD</Text>
                <View style={[styles.orderStatus, { backgroundColor: (STATUS_COLORS[op.status] || '#94A3B8') + '20' }]}>
                  <Text style={[styles.orderStatusText, { color: STATUS_COLORS[op.status] }]}>{STATUS_LABELS[op.status] || op.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <View style={{ flex: 1 }}>
          <View style={styles.filterRow}>
            {['ALL', 'CLIENT', 'ARTISAN', 'FOURNISSEUR'].map(f => (
              <TouchableOpacity key={f} onPress={() => setUserFilter(f)} style={[styles.filterChip, userFilter === f && styles.filterActive]}>
                <Text style={[styles.filterText, userFilter === f && styles.filterTextActive]}>
                  {f === 'ALL' ? 'Tous' : f === 'CLIENT' ? 'Clients' : f === 'ARTISAN' ? 'Artisans' : 'Fournisseurs'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.userCard, card3D()]}>
                <View style={styles.userHeader}>
                  <View style={[styles.userRoleDot, { backgroundColor: ROLE_COLORS[item.role] || '#94A3B8' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                  <View style={[styles.userRoleBadge, { backgroundColor: (ROLE_COLORS[item.role] || '#94A3B8') + '20' }]}>
                    <Text style={[styles.userRoleText, { color: ROLE_COLORS[item.role] }]}>{item.role}</Text>
                  </View>
                </View>
                <View style={styles.userFooter}>
                  <Text style={styles.userDetail}>📍 {item.commune}</Text>
                  <TouchableOpacity onPress={() => handleDeleteUser(item.id, item.fullName)}>
                    <Text style={styles.deleteLink}>🗑️ Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (item.status === 'PENDING_ASSIGNMENT') {
                  setSelectedOrder(item);
                  setShowAssign(true);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.orderCard, card3D()]}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
                  <View style={[styles.orderStatus, { backgroundColor: (STATUS_COLORS[item.status] || '#94A3B8') + '20' }]}>
                    <Text style={[styles.orderStatusText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
                  </View>
                </View>
                <Text style={styles.orderAmount}>{item.totalAmount?.toLocaleString()} DZD</Text>
                <Text style={styles.orderClient}>Client: {item.client?.fullName}</Text>
                {item.assignedProvider && <Text style={styles.orderClient}>Assigné: {item.assignedProvider.user?.fullName || item.assignedProvider.fullName}</Text>}
                {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                  <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
                    {item.status === 'PENDING_ASSIGNMENT' && (
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: colors.primary + '15', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                        onPress={() => { setSelectedOrder(item); setShowAssign(true); }}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>Affecter</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: '#EF444415', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                      onPress={() => handleCancelOrder(item.id)}
                    >
                      <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 12 }}>Annuler</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Assign Modal */}
      {showAssign && selectedOrder && (
        <Modal transparent visible={showAssign} animationType="fade" onRequestClose={() => setShowAssign(false)}>
          <View style={styles.assignOverlay}>
            <View style={[styles.assignModal, modal3D()]}>
              <Text style={styles.assignTitle}>Affecter #{selectedOrder.id.slice(0, 8)}</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {users.filter(u => u.role === 'ARTISAN' || u.role === 'FOURNISSEUR').map(p => (
                  <TouchableOpacity key={p.id} style={styles.providerItem} onPress={() => handleAssign(p.id)}>
                    <View style={[styles.userRoleDot, { backgroundColor: ROLE_COLORS[p.role] }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.providerName}>{p.fullName}</Text>
                      <Text style={styles.providerType}>{p.role} - {p.commune}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowAssign(false)}>
                <Text style={styles.cancel}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  headerTitle: { ...typography.h2, color: colors.text, flex: 1 },
  logoutIcon: { padding: 8, borderRadius: 8, backgroundColor: colors.surface },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodySmall, color: colors.textSecondary },
  tabTextActive: { color: colors.textLight, fontWeight: '700' },
  tabContent: { padding: 16, paddingBottom: 30 },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', padding: 16, alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.text, marginTop: 8 },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  userStats: { flexDirection: 'row', gap: 10, marginTop: 16 },
  userStatCard: { flex: 1, backgroundColor: colors.surface, padding: 14, borderRadius: 12, borderLeftWidth: 4, alignItems: 'center' },
  userStatValue: { ...typography.h2, color: colors.text },
  userStatLabel: { ...typography.caption, color: colors.textSecondary },
  // Commission
  commissionCard: { padding: 16, marginTop: 16 },
  commissionLabel: { ...typography.body, color: colors.text },
  commissionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  smallButtonText: { ...typography.button, color: colors.textLight },
  // Users
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface, borderRadius: 16 },
  filterActive: { backgroundColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.textLight, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 30 },
  userCard: { padding: 14, marginVertical: 4 },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userRoleDot: { width: 10, height: 10, borderRadius: 5 },
  userName: { ...typography.body, color: colors.text, fontWeight: '600' },
  userEmail: { ...typography.caption, color: colors.textSecondary },
  userRoleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  userRoleText: { ...typography.caption, fontWeight: '700' },
  userFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  userDetail: { ...typography.caption, color: colors.textSecondary },
  deleteLink: { ...typography.caption, color: colors.error },
  // Orders
  orderCard: { padding: 14, marginVertical: 4 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { ...typography.caption, color: colors.textSecondary },
  orderStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  orderStatusText: { ...typography.caption, fontWeight: '700' },
  orderAmount: { ...typography.h3, color: colors.accent, fontWeight: '700', marginVertical: 4 },
  orderClient: { ...typography.bodySmall, color: colors.textSecondary },
  // Assign Modal
  assignOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  assignModal: { maxHeight: 400, padding: 20 },
  assignTitle: { ...typography.h3, color: colors.text, marginBottom: 16 },
  providerItem: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.surface, borderRadius: 10, marginVertical: 4, gap: 10 },
  providerName: { ...typography.body, color: colors.text },
  providerType: { ...typography.caption, color: colors.textSecondary },
  cancel: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 16 },
});
