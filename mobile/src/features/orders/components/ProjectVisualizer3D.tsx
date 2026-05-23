import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import Icon3D from '../../../core/components/Icon3D';
import { useAuth } from '../../../core/hooks/useAuth';

const { width, height } = Dimensions.get('window');

const STATUS_LABELS: Record<string, string> = {
  PENDING_ASSIGNMENT: 'Recherche de prestataire...',
  PENDING_PAYMENT: 'En attente de paiement',
  PAID: 'En cours de réalisation',
  COMPLETED: 'Projet terminé',
  CANCELLED: 'Projet annulé',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_ASSIGNMENT: '#F59E0B',
  PENDING_PAYMENT: '#3B82F6',
  PAID: '#22C55E',
  COMPLETED: '#059669',
  CANCELLED: '#EF4444',
};

const TYPE_ICONS: Record<string, string> = {
  PRODUCT: '📦',
  ARTISAN_SERVICE: '👷',
};

export default function ProjectVisualizer3D({ visible, project, onClose, onPay, onComplete, onCancel, onEdit, onDelete }: any) {
  const { user } = useAuth();
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(opacityValue, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(rotateValue, { toValue: 1, duration: 600, useNativeDriver: true })
      ]).start();
    } else {
      scaleValue.setValue(0.8);
      opacityValue.setValue(0);
      rotateValue.setValue(0);
    }
  }, [visible]);

  if (!project) return null;

  const spin = rotateValue.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '0deg'] });
  const statusColor = STATUS_COLORS[project.status] || '#94A3B8';
  const icon = TYPE_ICONS[project.type] || '📁';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container3D, 
            { opacity: opacityValue, transform: [{ scale: scaleValue }, { rotate: spin }] }
          ]}
        >
          {/* Top Floating Badge */}
          <View style={[styles.floatingBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.floatingBadgeText}>{STATUS_LABELS[project.status]}</Text>
          </View>

          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Icon3D icon={icon} size={30} bgColor={statusColor} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.titleSection}>
              <Text style={styles.projectTitle}>
                {project.type === 'ARTISAN_SERVICE' ? 'Intervention Artisan' : 'Matériel / Équipement'}
              </Text>
              <Text style={styles.projectId}>Réf: #{project.id.slice(0, 8).toUpperCase()}</Text>
            </View>

            {/* 3D Glass Card for details */}
            <View style={styles.glassCard}>
              {project.requestedServices && project.requestedServices.length > 0 && (
                <View style={styles.glassRow}>
                  <Text style={styles.glassLabel}>Services demandés</Text>
                  <Text style={styles.glassValue}>{project.requestedServices.join(', ')}</Text>
                </View>
              )}
              {project.description && (
                <View style={styles.glassRow}>
                  <Text style={styles.glassLabel}>Description</Text>
                  <Text style={styles.glassValue}>{project.description}</Text>
                </View>
              )}
              <View style={styles.glassRow}>
                <Text style={styles.glassLabel}>Créé le</Text>
                <Text style={styles.glassValue}>
                  {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>

            {/* Pricing Node 3D */}
            <View style={styles.pricingNode}>
              <View style={styles.pricingLeft}>
                <Text style={styles.pricingLabel}>Budget estimé</Text>
                <Text style={styles.pricingTotal}>{project.totalAmount?.toLocaleString()} DZD</Text>
              </View>
              <View style={styles.pricingRight}>
                <Icon3D icon="💰" size={24} bgColor="#10B981" />
              </View>
            </View>

            {/* Assigned Provider 3D Panel */}
            {project.assignedProvider ? (
              <View style={styles.providerPanel}>
                <View style={styles.providerHeader}>
                  <Text style={styles.providerLabel}>Prestataire Assigné</Text>
                  <Icon3D icon="✅" size={12} bgColor="#22C55E" />
                </View>
                <Text style={styles.providerName}>{project.assignedProvider.user?.fullName}</Text>
                <Text style={styles.providerCommune}>📍 {project.assignedProvider.user?.commune}</Text>
              </View>
            ) : (
              <View style={[styles.providerPanel, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                <Text style={styles.providerLabel}>Aucun prestataire</Text>
                <Text style={styles.providerWait}>Le moteur intelligent recherche le meilleur prestataire pour vous...</Text>
              </View>
            )}

            {/* Client 3D Panel for Providers */}
            {user?.role !== 'CLIENT' && project.client && (
              <View style={[styles.providerPanel, { marginTop: 16 }]}>
                <View style={styles.providerHeader}>
                  <Text style={styles.providerLabel}>Client Intéressé</Text>
                  <Icon3D icon="👤" size={12} bgColor="#3B82F6" />
                </View>
                <Text style={styles.providerName}>{project.client.fullName}</Text>
                {project.client.phone && <Text style={styles.providerCommune}>📞 {project.client.phone}</Text>}
                {project.client.commune && <Text style={styles.providerCommune}>📍 {project.client.commune}</Text>}
              </View>
            )}

          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {user?.role === 'CLIENT' && project.status === 'PENDING_ASSIGNMENT' && onEdit && (
              <TouchableOpacity onPress={() => onEdit(project)} style={[styles.actionBtn3D, { backgroundColor: '#3B82F6', shadowColor: '#3B82F6', marginBottom: 10 }]}>
                <Text style={styles.actionBtnText}>✏️ Modifier le projet</Text>
              </TouchableOpacity>
            )}
            {user?.role === 'CLIENT' && project.status === 'PENDING_ASSIGNMENT' && onDelete && (
              <TouchableOpacity onPress={() => onDelete(project.id)} style={[styles.actionBtn3D, { backgroundColor: '#EF4444', shadowColor: '#EF4444', marginBottom: 10 }]}>
                <Text style={styles.actionBtnText}>🗑️ Supprimer le projet</Text>
              </TouchableOpacity>
            )}
            {project.status === 'PENDING_PAYMENT' && onPay && (
              <TouchableOpacity onPress={() => onPay(project.id)} style={[styles.actionBtn3D, { backgroundColor: '#3B82F6', shadowColor: '#3B82F6' }]}>
                <Text style={styles.actionBtnText}>Procéder au Paiement</Text>
              </TouchableOpacity>
            )}
            {project.status === 'PAID' && onComplete && (
              <TouchableOpacity onPress={() => onComplete(project.id)} style={[styles.actionBtn3D, { backgroundColor: '#10B981', shadowColor: '#10B981', marginTop: 10 }]}>
                <Text style={styles.actionBtnText}>Valider la fin du projet</Text>
              </TouchableOpacity>
            )}
            {project.status !== 'COMPLETED' && project.status !== 'CANCELLED' && onCancel && (
              <TouchableOpacity onPress={() => onCancel(project.id)} style={[styles.actionBtn3D, { backgroundColor: '#EF4444', shadowColor: '#EF4444', marginTop: 10 }]}>
                <Text style={styles.actionBtnText}>Annuler le projet</Text>
              </TouchableOpacity>
            )}
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center' },
  container3D: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    // 3D Shadow effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  floatingBadge: {
    position: 'absolute', top: -15, alignSelf: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
    zIndex: 10,
  },
  floatingBadgeText: { ...typography.caption, color: '#FFF', fontWeight: '800', letterSpacing: 0.5 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, marginTop: 10 },
  headerIconContainer: { transform: [{ translateY: -10 }] },
  closeBtn: { backgroundColor: '#F1F5F9', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#64748B', fontSize: 16, fontWeight: 'bold' },

  scrollContent: { paddingBottom: 20 },
  
  titleSection: { marginBottom: 20, alignItems: 'center' },
  projectTitle: { ...typography.h2, color: '#0F172A', textAlign: 'center' },
  projectId: { ...typography.caption, color: '#94A3B8', marginTop: 4 },

  glassCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  glassRow: { marginBottom: 12 },
  glassLabel: { ...typography.caption, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  glassValue: { ...typography.body, color: '#334155', fontWeight: '600', marginTop: 4 },

  pricingNode: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#1E293B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
  },
  pricingLeft: { flex: 1 },
  pricingLabel: { ...typography.caption, color: '#94A3B8' },
  pricingTotal: { ...typography.h2, color: '#F8FAFC', marginTop: 4 },
  pricingRight: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  providerPanel: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  providerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  providerLabel: { ...typography.caption, color: '#64748B', fontWeight: '700' },
  providerName: { ...typography.h3, color: '#0F172A' },
  providerCommune: { ...typography.bodySmall, color: '#64748B', marginTop: 4 },
  providerWait: { ...typography.bodySmall, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 },

  footer: { marginTop: 10 },
  actionBtn3D: {
    paddingVertical: 16, borderRadius: 16, alignItems: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  actionBtnText: { ...typography.button, color: '#FFFFFF', fontSize: 16 },
});
