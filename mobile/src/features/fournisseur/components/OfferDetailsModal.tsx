import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D } from '../../../core/theme/neumorphism';
import Icon3D from '../../../core/components/Icon3D';

interface OfferDetailsModalProps {
  visible: boolean;
  offer: any;
  onClose: () => void;
  isOwner?: boolean;
  onEdit?: (offer: any) => void;
  onDelete?: (offer: any) => void;
}

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

export default function OfferDetailsModal({ visible, offer, onClose, isOwner, onEdit, onDelete }: OfferDetailsModalProps) {
  if (!offer) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon3D icon={TYPE_ICONS[offer.type] || '📦'} size={24} bgColor={TYPE_COLORS[offer.type] || '#94A3B8'} />
              <Text style={styles.title} numberOfLines={1}>{offer.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 20, color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {offer.photos && offer.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                {offer.photos.map((uri: string, idx: number) => (
                  <Image key={idx} source={{ uri }} style={styles.photo} />
                ))}
              </ScrollView>
            )}

            <View style={styles.detailsCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Type</Text>
                <View style={[styles.badge, { backgroundColor: (TYPE_COLORS[offer.type] || '#94A3B8') + '20' }]}>
                  <Text style={[styles.badgeText, { color: TYPE_COLORS[offer.type] || '#94A3B8' }]}>
                    {TYPE_LABELS[offer.type] || offer.type}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Prix</Text>
                <Text style={styles.price}>{offer.price?.toLocaleString()} DZD</Text>
              </View>

              {offer.type !== 'SERVICE' && offer.stockQuantity != null && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.label}>Stock</Text>
                    <View style={[styles.stockBadge, { backgroundColor: offer.stockQuantity > 0 ? '#22C55E15' : '#EF444415' }]}>
                      <Text style={[styles.stockText, { color: offer.stockQuantity > 0 ? '#22C55E' : '#EF4444' }]}>
                        {offer.stockQuantity > 0 ? `📦 ${offer.stockQuantity} disponibles` : '⚠️ Rupture de stock'}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {offer.description ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.descContainer}>
                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.description}>{offer.description}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.actionsContainer}>
            {isOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => onEdit && onEdit(offer)}>
                  <View style={[styles.actionBtn, button3D('#3B82F6')]}>
                    <Text style={styles.actionBtnText}>✏️ Modifier</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => onDelete && onDelete(offer)}>
                  <View style={[styles.actionBtn, button3D('#EF4444')]}>
                    <Text style={styles.actionBtnText}>🗑️ Supprimer</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={{ marginTop: isOwner ? 12 : 16 }} onPress={onClose}>
              <View style={[styles.actionBtn, button3D(isOwner ? colors.surfaceDark : colors.primary)]}>
                <Text style={[styles.actionBtnText, isOwner && { color: colors.text }]}>Fermer</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { ...typography.h2, color: colors.text, flex: 1 },
  closeBtn: { padding: 8 },
  scrollArea: { marginBottom: 8 },
  photoScroll: { marginBottom: 16, flexDirection: 'row' },
  photo: { width: 280, height: 180, borderRadius: 14, marginRight: 12 },
  detailsCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.surfaceDark },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { ...typography.body, color: colors.textSecondary },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { ...typography.caption, fontWeight: '700' },
  price: { ...typography.h3, color: colors.accent, fontWeight: '700' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  stockText: { ...typography.bodySmall, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.surfaceDark, marginVertical: 8 },
  descContainer: { paddingVertical: 8 },
  description: { ...typography.body, color: colors.text, marginTop: 8, lineHeight: 22 },
  actionsContainer: { marginTop: 16 },
  ownerActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  actionBtnText: { ...typography.button, color: colors.textLight },
});
