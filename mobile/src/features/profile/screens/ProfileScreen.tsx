import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D, button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import api from '../../../core/api/axios';

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

const ROLE_ICONS: Record<string, string> = {
  CLIENT: '🏠',
  FOURNISSEUR: '📦',
  ARTISAN: '🔧',
  ADMIN: '⚙️',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [deleting, setDeleting] = useState(false);

  const role = user?.role || 'CLIENT';

  const performDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/me');
      logout();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur de suppression';
      if (Platform.OS === 'web') {
        window.alert('Erreur: ' + msg);
      } else {
        Alert.alert('Erreur', msg);
      }
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    const text = 'Êtes-vous sûr de vouloir supprimer votre compte ?\nCette action est irréversible et toutes vos données seront perdues.';
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(text);
      if (confirmed) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Supprimer le compte',
        text,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: performDelete,
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={[styles.avatarContainer, { backgroundColor: ROLE_COLORS[role] }]}>
          <Text style={styles.avatarText}>{ROLE_ICONS[role]}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[role] + '20' }]}>
          <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={[styles.infoCard, card3D()]}>
        <View style={styles.infoRow}>
          <Icon3D icon="✉️" size={14} bgColor={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Icon3D icon="📞" size={14} bgColor={colors.accent} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{user?.phone || 'Non renseigné'}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Icon3D icon="📍" size={14} bgColor="#22C55E" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.infoLabel}>Commune</Text>
            <Text style={styles.infoValue}>{user?.commune || 'Non renseignée'}</Text>
          </View>
        </View>
      </View>

      {/* Role-specific Actions */}
      {role === 'ARTISAN' && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ArtisanProfile')}>
          <Icon3D icon="🔧" size={16} bgColor={colors.primary} />
          <Text style={styles.actionBtnText}>Gérer mon profil Artisan</Text>
        </TouchableOpacity>
      )}

      {role === 'FOURNISSEUR' && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MyOffers')}>
          <Icon3D icon="📦" size={16} bgColor={colors.accent} />
          <Text style={styles.actionBtnText}>Gérer mes offres</Text>
        </TouchableOpacity>
      )}

      {role === 'CLIENT' && (
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Orders')}>
          <Icon3D icon="📋" size={16} bgColor={colors.primary} />
          <Text style={styles.actionBtnText}>Voir mes projets</Text>
        </TouchableOpacity>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Icon3D icon="🚪" size={16} bgColor={colors.error} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={deleting}>
        <Icon3D icon="⚠️" size={14} bgColor={colors.error} />
        <Text style={styles.deleteText}>{deleting ? 'Suppression...' : 'Supprimer mon compte'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  headerSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36 },
  name: { ...typography.h1, color: colors.text, textAlign: 'center' },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  roleBadgeText: { ...typography.bodySmall, fontWeight: '700' },
  infoCard: { margin: 16, padding: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  infoLabel: { ...typography.caption, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.text, fontWeight: '500', marginTop: 2 },
  separator: { height: 1, backgroundColor: colors.surfaceDark, marginHorizontal: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, backgroundColor: colors.surface, borderRadius: 14, marginHorizontal: 16, marginTop: 20 },
  actionBtnText: { ...typography.button, color: colors.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, backgroundColor: colors.surface, borderRadius: 14, marginHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: colors.error },
  logoutText: { ...typography.button, color: colors.error },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginHorizontal: 16, marginTop: 12 },
  deleteText: { ...typography.bodySmall, color: colors.textSecondary, textDecorationLine: 'underline' },
});
