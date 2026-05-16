import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Modal3D from '../../../core/components/Modal3D';
import Icon3D from '../../../core/components/Icon3D';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { modal3D, button3D, buttonPressed3D, input3D } from '../../../core/theme/neumorphism';
import { useLocalize } from '../../../core/hooks/useLocalize';

interface Props {
  visible: boolean;
  amount: number;
  onPay: (method: 'edahabia' | 'cib', cardNumber: string) => void;
  onClose: () => void;
  title?: string;
}

export default function PaymentDialog({ visible, amount, onPay, onClose, title }: Props) {
  const { t } = useLocalize();
  const [method, setMethod] = useState<'edahabia' | 'cib'>('edahabia');
  const [cardNumber, setCardNumber] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [methodPressed, setMethodPressed] = useState<'edahabia' | 'cib' | null>(null);
  const [payPressed, setPayPressed] = useState(false);

  const handlePay = () => {
    if (!cardNumber.trim()) {
      setErrorVisible(true);
      return;
    }
    onPay(method, cardNumber);
  };

  return (
    <>
      <Modal3D visible={errorVisible} title="Erreur de paiement" message="Veuillez entrer un numéro de carte valide" icon="💳" iconColor={colors.error} buttonColor={colors.primary} onClose={() => setErrorVisible(false)} />

      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.dialog, modal3D()]}>
            <Icon3D icon="💳" size={28} bgColor={colors.accent} />
            <Text style={styles.title}>{title || t('pay')}</Text>
            <Text style={styles.amount}>{amount.toLocaleString()} {t('dinar')}</Text>

            <View style={styles.methodRow}>
              {(['edahabia', 'cib'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMethod(m)}
                  onPressIn={() => setMethodPressed(m)}
                  onPressOut={() => setMethodPressed(null)}
                  activeOpacity={1}
                  style={styles.methodBtnOuter}
                >
                  <View style={[
                    styles.methodBtn,
                    method === m ? (methodPressed === m ? buttonPressed3D(colors.primary) : button3D(colors.primary)) : button3D('#E2E8F0'),
                  ]}>
                    <Text style={[styles.methodText, { color: method === m ? '#FFFFFF' : colors.textSecondary }]}>
                      {m === 'edahabia' ? '💳 Edahabia' : '🏦 CIB'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[input3D(), { width: '100%', marginBottom: 16 }]}
              placeholder="Numéro de carte"
              placeholderTextColor="#94A3B8"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
            />

            <TouchableOpacity
              onPress={handlePay}
              onPressIn={() => setPayPressed(true)}
              onPressOut={() => setPayPressed(false)}
              activeOpacity={1}
            >
              <View style={[styles.payBtn, payPressed ? buttonPressed3D(colors.accent) : button3D(colors.accent)]}>
                <Text style={styles.payText}>{t('pay')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)', padding: 24,
  },
  dialog: { width: '100%', maxWidth: 360, alignItems: 'center' },
  title: { ...typography.h2, color: colors.text, marginTop: 12, marginBottom: 4 },
  amount: { ...typography.h1, color: colors.accent, fontWeight: '700', marginBottom: 20 },
  methodRow: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  methodBtnOuter: { flex: 1 },
  methodBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 12 },
  methodText: { ...typography.button, fontWeight: '600' },
  payBtn: { alignItems: 'center', paddingVertical: 16, borderRadius: 14, minWidth: 200 },
  payText: { ...typography.button, color: colors.textLight },
  cancel: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: 16 },
});
