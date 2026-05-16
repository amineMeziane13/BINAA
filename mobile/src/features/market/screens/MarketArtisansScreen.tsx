import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import api from '../../../core/api/axios';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { card3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';
import { useNavigation } from '@react-navigation/native';

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

  const renderArtisan = ({ item }: any) => (
    <View style={[styles.card, card3D()]}>
      <View style={styles.cardHeader}>
        <Icon3D icon="👷" size={22} bgColor="#2563EB" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>{item.user?.fullName}</Text>
          <Text style={styles.profession}>{item.profession}</Text>
        </View>
        {item.isSubscribed && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Vérifié</Text>
          </View>
        )}
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>📅 Expérience</Text>
          <Text style={styles.detailValue}>{item.experienceYears} ans</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>📍 Commune</Text>
          <Text style={styles.detailValue}>{item.user?.commune}</Text>
        </View>
      </View>
      {item.skills && item.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {item.skills.slice(0, 4).map((skill: string, i: number) => (
            <View key={i} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {item.skills.length > 4 && (
            <View style={styles.skillChip}>
              <Text style={styles.skillText}>+{item.skills.length - 4}</Text>
            </View>
          )}
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
        <Icon3D icon="👷" size={22} bgColor="#2563EB" />
        <Text style={styles.title}>Artisans disponibles</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={artisans}
          keyExtractor={(item) => item.id}
          renderItem={renderArtisan}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Aucun artisan disponible</Text>}
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
  list: { padding: 16, paddingBottom: 30 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 60 },
  card: { padding: 16, marginVertical: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.h3, color: colors.text },
  profession: { ...typography.bodySmall, color: colors.primary, fontWeight: '600', marginTop: 2 },
  verifiedBadge: { backgroundColor: '#22C55E20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  verifiedText: { ...typography.caption, color: '#22C55E', fontWeight: '700' },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  detail: { flex: 1, backgroundColor: colors.surfaceDark + '40', padding: 10, borderRadius: 10 },
  detailLabel: { ...typography.caption, color: colors.textSecondary },
  detailValue: { ...typography.body, color: colors.text, fontWeight: '600', marginTop: 2 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  skillChip: { backgroundColor: '#2563EB15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  skillText: { ...typography.caption, color: '#2563EB', fontWeight: '600' },
});
