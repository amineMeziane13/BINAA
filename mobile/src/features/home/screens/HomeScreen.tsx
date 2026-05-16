import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import Icon3D from '../../../core/components/Icon3D';
import CreateProjectModal from '../components/CreateProjectModal';

const CLIENT_SECTIONS = [
  { key: 'materials', title: 'Marché des Produits', icon: '🧱', bg: '#DC2626', screen: 'MarketProducts' },
  { key: 'artisans', title: 'Marché des Artisans', icon: '👷', bg: '#2563EB', screen: 'MarketArtisans' },
  { key: 'equipment', title: 'Location Équipements', icon: '🔧', bg: '#7C3AED', screen: 'MarketEquipment' },
  { key: 'calculator', title: 'Calculatrice', icon: '📐', bg: '#059669', screen: 'Calculator' },
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

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [showWizard, setShowWizard] = useState(false);

  const role = user?.role || 'CLIENT';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

          <TouchableOpacity activeOpacity={0.85} style={styles.startOuter} onPress={() => setShowWizard(true)}>
            <View style={[styles.startButton, button3D(colors.accent)]}>
              <Text style={styles.startIcon}>🚀</Text>
              <Text style={styles.startText}>Démarrer un projet</Text>
            </View>
          </TouchableOpacity>

          <CreateProjectModal 
            visible={showWizard} 
            onClose={() => setShowWizard(false)} 
            onSuccess={() => { setShowWizard(false); navigation.navigate('Orders'); }} 
          />
        </>
      )}

      {/* FOURNISSEUR: Quick Actions */}
      {role === 'FOURNISSEUR' && (
        <View style={styles.providerSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('MyOffers')}>
            <View style={[styles.actionCard, card3D()]}>
              <Icon3D icon="📦" size={28} bgColor="#7C3AED" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.actionTitle}>Mes offres</Text>
                <Text style={styles.actionSub}>Gérer produits, services et équipements</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Orders')}>
            <View style={[styles.actionCard, card3D()]}>
              <Icon3D icon="👥" size={28} bgColor="#F59E0B" />
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
              <Icon3D icon="🔧" size={28} bgColor="#2563EB" />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.actionTitle}>Mon profil artisan</Text>
                <Text style={styles.actionSub}>Gérer métiers, compétences et abonnement</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Orders')}>
            <View style={[styles.actionCard, card3D()]}>
              <Icon3D icon="👥" size={28} bgColor="#F59E0B" />
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 8 },
  gridItem: { width: '50%', paddingHorizontal: 6 },
  card: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12, marginVertical: 6 },
  cardIcon: { marginBottom: 12 },
  cardTitle: { ...typography.body, color: colors.text, textAlign: 'center', fontWeight: '600' },
  startOuter: { paddingHorizontal: 20, marginVertical: 24 },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  startIcon: { fontSize: 24 },
  startText: { ...typography.button, color: colors.textLight, fontSize: 18 },
  providerSection: { paddingHorizontal: 16, gap: 12, marginTop: 16 },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  actionTitle: { ...typography.h3, color: colors.text },
  actionSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 28, color: colors.textSecondary },
});
