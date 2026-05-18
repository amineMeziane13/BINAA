import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

const PROF_ICONS: Record<string, string> = {
  'Plombier': '🔧', 'Électricien': '⚡', 'Maçon': '🧱',
  'Peintre': '🎨', 'Menuisier': '🪚', 'Carreleur': '🔲',
  'Soudeur': '🔥', 'Climaticien': '❄️', 'Serrurier': '🔑', 'Vitrier': '🪟',
};

export default function MarketArtisansScreen() {
  const navigation = useNavigation<any>();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/artisans')
      .then(({ data }) => setArtisans(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderArtisan = ({ item }: any) => {
    const profIcon = PROF_ICONS[item.profession] || '👷';
    const hasSkills = item.skills && item.skills.length > 0;
    const hasPhotos = item.photos && item.photos.length > 0;

    return (
      <View style={[styles.card, card3D()]}>
        {/* Header with avatar */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.avatarText}>{profIcon}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.user?.fullName}</Text>
            <View style={styles.profRow}>
              <View style={styles.profBadge}>
                <Text style={styles.profBadgeText}>{item.profession || 'Artisan'}</Text>
              </View>
            </View>
          </View>
          {item.isSubscribed && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Vérifié</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailLabel}>Expérience</Text>
            <Text style={styles.detailValue}>{item.experienceYears || 0} ans</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailLabel}>Commune</Text>
            <Text style={styles.detailValue}>{item.user?.commune || '-'}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailIcon}>⭐</Text>
            <Text style={styles.detailLabel}>Note</Text>
            <Text style={styles.detailValue}>
              {item.rating > 0 ? `${item.rating.toFixed(1)}/5` : 'Nouveau'}
            </Text>
          </View>
        </View>

        {/* Skills */}
        {hasSkills && (
          <View style={styles.skillsSection}>
            <Text style={styles.skillsTitle}>💡 Compétences</Text>
            <View style={styles.skillsRow}>
              {item.skills.map((skill: string, i: number) => (
                <View key={i} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Photos */}
        {hasPhotos && (
          <View style={styles.photosSection}>
            {item.photos.slice(0, 3).map((uri: string, i: number) => (
              <Image key={i} source={{ uri }} style={styles.photoThumb} />
            ))}
            {item.photos.length > 3 && (
              <View style={styles.morePhotos}>
                <Text style={styles.morePhotosText}>+{item.photos.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Phone */}
        {item.user?.phone && (
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>{item.user.phone}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Icon3D icon="👷" size={22} bgColor="#2563EB" />
        <Text style={styles.title}>Artisans disponibles</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{artisans.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={artisans}
          keyExtractor={(item) => item.id}
          renderItem={renderArtisan}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👷</Text>
              <Text style={styles.emptyTitle}>Aucun artisan disponible</Text>
              <Text style={styles.emptyDesc}>Les artisans s'inscrivent régulièrement. Revenez bientôt !</Text>
            </View>
          }
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
  countBadge: {
    backgroundColor: '#2563EB', width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  countText: { ...typography.caption, color: '#fff', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 30 },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptyDesc: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },

  // Card
  card: { padding: 16, marginVertical: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22 },
  name: { ...typography.h3, color: colors.text },
  profRow: { flexDirection: 'row', marginTop: 4 },
  profBadge: { backgroundColor: '#2563EB15', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  profBadgeText: { ...typography.caption, color: '#2563EB', fontWeight: '700' },
  verifiedBadge: { backgroundColor: '#22C55E20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { ...typography.caption, color: '#22C55E', fontWeight: '700' },

  // Details
  detailsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  detail: {
    flex: 1, backgroundColor: colors.surfaceDark + '30',
    padding: 10, borderRadius: 10, alignItems: 'center',
  },
  detailIcon: { fontSize: 16, marginBottom: 2 },
  detailLabel: { ...typography.caption, color: colors.textSecondary, fontSize: 10 },
  detailValue: { ...typography.bodySmall, color: colors.text, fontWeight: '700', marginTop: 2 },

  // Skills
  skillsSection: { marginTop: 14 },
  skillsTitle: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', marginBottom: 6 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: { backgroundColor: '#2563EB12', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  skillText: { ...typography.caption, color: '#2563EB', fontWeight: '600' },

  // Photos
  photosSection: { flexDirection: 'row', gap: 8, marginTop: 12 },
  photoThumb: { width: 60, height: 60, borderRadius: 10 },
  morePhotos: {
    width: 60, height: 60, borderRadius: 10, backgroundColor: colors.surfaceDark + '40',
    justifyContent: 'center', alignItems: 'center',
  },
  morePhotosText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },

  // Contact
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.surfaceDark,
  },
  contactIcon: { fontSize: 14 },
  contactText: { ...typography.bodySmall, color: colors.textSecondary },
});
