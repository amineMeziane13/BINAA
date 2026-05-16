import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D } from '../../../core/theme/neumorphism';
import Star3D from '../../../core/components/Star3D';
import Icon3D from '../../../core/components/Icon3D';
import { useLocalize } from '../../../core/hooks/useLocalize';
import { useAuth } from '../../../core/hooks/useAuth';
import { TouchableOpacity } from 'react-native';

export default function ProviderProfileScreen({ route }: any) {
  const { t } = useLocalize();
  const { user: currentUser, logout } = useAuth();
  const isCurrentUser = !route?.params?.provider;
  
  const provider = route?.params?.provider || (currentUser?.role !== 'CLIENT' ? { type: currentUser?.role, rating: 0, profession: '', experienceYears: 0 } : null);
  const user = route?.params?.provider?.user || currentUser;

  if (!user) {
    return (
      <View style={styles.center}>
        <Icon3D icon="👤" size={36} bgColor={colors.surfaceDark} />
        <Text style={styles.empty}>{t('select_provider')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Icon3D icon="👤" size={40} bgColor={colors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user.fullName}</Text>
          {provider && (
            <Text style={styles.badge}>{provider.type === 'ARTISAN' ? t('artisan') : t('fournisseur')}</Text>
          )}
        </View>
      </View>

      <View style={[styles.card, card3D()]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon3D icon="📍" size={14} bgColor={colors.accent} />
          <Text style={styles.sectionTitle}>{t('commune')}</Text>
        </View>
        <Text style={styles.info}>{user.commune}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <Icon3D icon="📞" size={14} bgColor={colors.accent} />
          <Text style={styles.sectionTitle}>{t('phone')}</Text>
        </View>
        <Text style={styles.info}>{user.phone}</Text>
      </View>

      {provider && (
        <View style={[styles.card, card3D()]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon3D icon="🔧" size={14} bgColor={colors.primary} />
            <Text style={styles.sectionTitle}>{t('profession')}</Text>
          </View>
          <Text style={styles.info}>{provider.profession || t('not_specified')}</Text>
          {provider.experienceYears !== null && provider.experienceYears !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Icon3D icon="📅" size={14} bgColor={colors.primary} />
              <Text style={styles.sectionTitle}>{t('experience')}</Text>
            </View>
          )}
          {provider.experienceYears !== null && provider.experienceYears !== undefined && (
            <Text style={styles.info}>{provider.experienceYears} ans</Text>
          )}
          <View style={styles.ratingRow}>
            <Star3D rating={provider.rating} />
          </View>
          {provider.type === 'ARTISAN' && (
            <Text style={styles.info}>
              {t('subscription')}: {provider.isSubscribed ? t('active') : t('inactive')}
            </Text>
          )}
        </View>
      )}

      {isCurrentUser && (
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icon3D icon="🚪" size={16} bgColor={colors.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 16, gap: 16 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  card: { padding: 20, marginVertical: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  headerText: { flex: 1 },
  name: { ...typography.h2, color: colors.text },
  badge: {
    ...typography.caption, color: colors.primary, backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    marginTop: 4, fontWeight: '700',
  },
  sectionTitle: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  info: { ...typography.body, color: colors.textSecondary, marginTop: 2, marginLeft: 22 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, backgroundColor: colors.surface, borderRadius: 12, marginTop: 20, marginBottom: 40, borderWidth: 1, borderColor: colors.error },
  logoutText: { ...typography.button, color: colors.error },
});
