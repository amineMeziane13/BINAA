import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon3D from '../../../core/components/Icon3D';
import CreateProjectModal from '../components/CreateProjectModal';
import api from '../../../core/api/axios';

const CLIENT_SECTIONS = [
  { key: 'materials', title: 'Marché Produits', icon: '🧱', bg: '#DC2626', screen: 'MarketProducts' },
  { key: 'artisans', title: 'Artisans', icon: '👷', bg: '#2563EB', screen: 'MarketArtisans' },
  { key: 'equipment', title: 'Équipements', icon: '🔧', bg: '#7C3AED', screen: 'MarketEquipment' },
  { key: 'calculator', title: 'Calculatrice', icon: '📐', bg: '#059669', screen: 'CalculatorScreen' },
];

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Client',
  FOURNISSEUR: 'Fournisseur',
  ARTISAN: 'Artisan',
  ADMIN: 'Administrateur',
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: '#22C55E',
  FOURNISSEUR: '#7C3AED',
  ARTISAN: '#2563EB',
  ADMIN: '#DC2626',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_ASSIGNMENT: 'En recherche...',
  PENDING_PAYMENT: 'À payer',
  PAID: 'En cours',
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

const STATUS_ICONS: Record<string, string> = {
  PENDING_ASSIGNMENT: '🔍',
  PENDING_PAYMENT: '💳',
  PAID: '🚧',
  COMPLETED: '✅',
  CANCELLED: '❌',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [showWizard, setShowWizard] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role || 'CLIENT';

  const loadProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/commandes');
      setProjects(data);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (role === 'CLIENT') loadProjects();
    }, [role, loadProjects])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const activeProjects = projects.filter(p => !['COMPLETED', 'CANCELLED'].includes(p.status));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Icon3D icon="🏗️" size={28} bgColor={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Binaa</Text>
          <Text style={styles.subtitle}>Bienvenue, {user?.fullName}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[role] + '20' }]}>
          <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
        </View>
      </View>

      {/* CLIENT: Marketplace Grid */}
      {role === 'CLIENT' && (
        <>
          {/* Quick Stats */}
          {projects.length > 0 && (
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#2563EB10' }]}>
                <Text style={[styles.statNumber, { color: '#2563EB' }]}>{activeProjects.length}</Text>
                <Text style={styles.statLabel}>En cours</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#22C55E10' }]}>
                <Text style={[styles.statNumber, { color: '#22C55E' }]}>
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </Text>
                <Text style={styles.statLabel}>Terminés</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F59E0B10' }]}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{projects.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          )}

          {/* Marketplace Grid */}
          <View style={styles.grid}>
            {CLIENT_SECTIONS.map((section) => (
              <TouchableOpacity
                key={section.key}
                activeOpacity={0.85}
                style={styles.gridItem}
                onPress={() => navigation.navigate(section.screen)}
              >
                <View style={[styles.card, card3D()]}>
                  <Icon3D icon={section.icon} size={32} bgColor={section.bg} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>{section.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Start Project Button */}
          <TouchableOpacity activeOpacity={0.85} style={styles.startOuter} onPress={() => setShowWizard(true)}>
            <View style={[styles.startButton, button3D(colors.accent)]}>
              <Text style={styles.startIcon}>🚀</Text>
              <Text style={styles.startText}>Démarrer un projet</Text>
            </View>
          </TouchableOpacity>

          {/* Active Projects Section */}
          {activeProjects.length > 0 && (
            <View style={styles.projectsSection}>
              <View style={styles.projectsHeader}>
                <Text style={styles.projectsSectionTitle}>🚧 Projets en cours</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                  <Text style={styles.seeAll}>Voir tout →</Text>
                </TouchableOpacity>
              </View>
              {activeProjects.slice(0, 3).map((project) => (
                <TouchableOpacity
                  key={project.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Orders')}
                >
                  <View style={[styles.projectCard, card3D()]}>
                    <View style={styles.projectRow}>
                      <View style={[styles.projectStatusDot, { backgroundColor: STATUS_COLORS[project.status] }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.projectType}>
                          {project.type === 'ARTISAN_SERVICE' ? '👷 Prestation Artisan' :
                           project.type === 'PRODUCT' ? '📦 Achat Produit' : project.type}
                        </Text>
                        <View style={styles.projectStatusRow}>
                          <Text style={styles.projectStatusIcon}>{STATUS_ICONS[project.status]}</Text>
                          <Text style={[styles.projectStatus, { color: STATUS_COLORS[project.status] }]}>
                            {STATUS_LABELS[project.status]}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.projectAmount}>
                        {project.totalAmount?.toLocaleString()} DZD
                      </Text>
                    </View>
                    {project.assignedProvider && (
                      <View style={styles.projectProvider}>
                        <Text style={styles.projectProviderText}>
                          🔧 {project.assignedProvider.user?.fullName || project.assignedProvider.fullName}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <CreateProjectModal
            visible={showWizard}
            onClose={() => setShowWizard(false)}
            onSuccess={() => { setShowWizard(false); loadProjects(); navigation.navigate('Orders'); }}
          />
        </>
      )}

      {/* FOURNISSEUR: Quick Actions */}
      {role === 'FOURNISSEUR' && (
        <View style={styles.providerSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('MyOffers')}>
            <View style={[styles.actionCard, card3D()]}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#7C3AED15' }]}>
                <Text style={styles.actionIconText}>📦</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.actionTitle}>Mes offres</Text>
                <Text style={styles.actionSub}>Gérer produits, services et équipements</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Orders')}>
            <View style={[styles.actionCard, card3D()]}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#F59E0B15' }]}>
                <Text style={styles.actionIconText}>👥</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.actionTitle}>Clients intéressés</Text>
                <Text style={styles.actionSub}>Commandes reçues de clients</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('AddOffer')}>
            <View style={[styles.startButton, button3D('#7C3AED')]}>
              <Text style={styles.startIcon}>➕</Text>
              <Text style={styles.startText}>Ajouter une offre</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ARTISAN: Quick Actions */}
      {role === 'ARTISAN' && (
        <View style={styles.providerSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('ArtisanProfile')}>
            <View style={[styles.actionCard, card3D()]}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#2563EB15' }]}>
                <Text style={styles.actionIconText}>🔧</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.actionTitle}>Mon profil artisan</Text>
                <Text style={styles.actionSub}>Gérer métiers, compétences et abonnement</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Orders')}>
            <View style={[styles.actionCard, card3D()]}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#F59E0B15' }]}>
                <Text style={styles.actionIconText}>👥</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.actionTitle}>Clients intéressés</Text>
                <Text style={styles.actionSub}>Demandes de prestations reçues</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  greeting: { ...typography.h1, color: colors.primary },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { ...typography.caption, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 8, marginBottom: 4 },
  statCard: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  statNumber: { ...typography.h2, fontWeight: '800' },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 8 },
  gridItem: { width: '50%', paddingHorizontal: 6 },
  card: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12, marginVertical: 6 },
  cardIcon: { marginBottom: 12 },
  cardTitle: { ...typography.body, color: colors.text, textAlign: 'center', fontWeight: '600' },

  // Start button
  startOuter: { paddingHorizontal: 20, marginVertical: 16 },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  startIcon: { fontSize: 24 },
  startText: { ...typography.button, color: colors.textLight, fontSize: 18 },

  // Projects
  projectsSection: { paddingHorizontal: 16, marginTop: 8 },
  projectsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  projectsSectionTitle: { ...typography.h3, color: colors.text },
  seeAll: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  projectCard: { padding: 16, marginBottom: 10 },
  projectRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  projectStatusDot: { width: 10, height: 10, borderRadius: 5 },
  projectType: { ...typography.body, color: colors.text, fontWeight: '600' },
  projectStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  projectStatusIcon: { fontSize: 12 },
  projectStatus: { ...typography.caption, fontWeight: '600' },
  projectAmount: { ...typography.body, color: colors.accent, fontWeight: '700' },
  projectProvider: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.surfaceDark },
  projectProviderText: { ...typography.bodySmall, color: colors.textSecondary },

  // Provider actions
  providerSection: { paddingHorizontal: 16, gap: 12, marginTop: 16 },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  actionIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  actionIconText: { fontSize: 24 },
  actionTitle: { ...typography.h3, color: colors.text },
  actionSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 28, color: colors.textSecondary },
});
