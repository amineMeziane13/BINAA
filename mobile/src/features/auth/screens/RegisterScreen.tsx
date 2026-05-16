import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D, buttonPressed3D, input3D } from '../../../core/theme/neumorphism';
import { useAuth } from '../../../core/hooks/useAuth';
import { useLocalize } from '../../../core/hooks/useLocalize';
import Modal3D from '../../../core/components/Modal3D';
import Icon3D from '../../../core/components/Icon3D';
import Dropdown from '../../../core/components/Dropdown';
import api from '../../../core/api/axios';

const ORAN_COMMUNES = [
  'Oran', 'Es Sénia', 'Bir El Djir', 'Misserghin', 'Boutlélis',
  'Aïn El Kerma', 'Aïn El Bia', 'Mers El Kébir', 'Boufatis', 'El Ançor',
  'Oued Tlelat', 'Tafraoui', 'Sidi Chami', 'El Kerma', 'El Braya',
  'Arzew', 'Saint Leu', 'Hassi Mefsoukh', 'Hassi Ben Okba',
  'Ben Freha', 'Gdyel', 'Hassi Ameur', 'Aïn Bya', 'Mers El Hadjadj',
  'Bousfer', 'El Menasria',
];

const ROLES = ['CLIENT', 'FOURNISSEUR', 'ARTISAN'];

export default function RegisterScreen({ navigation }: any) {
  const { t } = useLocalize();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [commune, setCommune] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMsg, setModalMsg] = useState('');
  const [modalIcon, setModalIcon] = useState('❌');
  const [modalColor, setModalColor] = useState(colors.error);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pressed, setPressed] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const showModal = (title: string, msg: string, icon: string, color: string) => {
    setModalTitle(title);
    setModalMsg(msg);
    setModalIcon(icon);
    setModalColor(color);
    setModalVisible(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Required';
    if (!email.trim()) errors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!phone.trim()) errors.phone = 'Required';
    else if (!/^(05|06|07)\d{8}$/.test(phone)) errors.phone = 'Format: 05XXXXXXXX';
    if (!password || password.length < 6) errors.password = 'Min 6 characters';
    if (!role) errors.role = 'Select a role';
    if (!commune) errors.commune = 'Select a commune';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ email, password, role, fullName, phone, commune });
      showModal('🎉 Succès', `Compte ${role.toLowerCase()} créé avec succès !`, '✅', colors.success);
    } catch (err: any) {
      showModal('Erreur', err.message, '❌', colors.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Icon3D icon="📝" size={30} bgColor={colors.primary} />
          <Text style={styles.title}>{t('register')}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('full_name')}</Text>
          <TextInput style={[input3D(), fieldErrors.fullName && styles.inputError]} placeholder="Votre nom complet" placeholderTextColor="#94A3B8" value={fullName} onChangeText={(v) => { setFullName(v); setFieldErrors((p) => ({ ...p, fullName: '' })); }} returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />
          {fieldErrors.fullName ? <Text style={styles.fieldError}>{fieldErrors.fullName}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('email')}</Text>
          <TextInput ref={emailRef} style={[input3D(), fieldErrors.email && styles.inputError]} placeholder="email@exemple.com" placeholderTextColor="#94A3B8" value={email} onChangeText={(v) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: '' })); }} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} />
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('phone')}</Text>
          <TextInput ref={phoneRef} style={[input3D(), fieldErrors.phone && styles.inputError]} placeholder="05XXXXXXXX" placeholderTextColor="#94A3B8" value={phone} onChangeText={(v) => { setPhone(v); setFieldErrors((p) => ({ ...p, phone: '' })); }} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
          {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('password')}</Text>
          <TextInput ref={passwordRef} style={[input3D(), fieldErrors.password && styles.inputError]} placeholder="••••••••" placeholderTextColor="#94A3B8" value={password} onChangeText={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: '' })); }} secureTextEntry returnKeyType="done" />
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
        </View>

        <View style={styles.field}>
          <Dropdown label={t('role')} items={ROLES} selected={role} onSelect={(v) => { setRole(v); setFieldErrors((p) => ({ ...p, role: '' })); }} />
          {fieldErrors.role ? <Text style={styles.fieldError}>{fieldErrors.role}</Text> : null}
        </View>

        <View style={styles.field}>
          <Dropdown label={t('commune')} items={ORAN_COMMUNES} selected={commune} onSelect={(v) => { setCommune(v); setFieldErrors((p) => ({ ...p, commune: '' })); }} />
          {fieldErrors.commune ? <Text style={styles.fieldError}>{fieldErrors.commune}</Text> : null}
        </View>

        <TouchableOpacity
          onPress={handleRegister} disabled={loading}
          onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
          activeOpacity={1}
        >
          <View style={[styles.buttonWrap, (loading ? buttonPressed3D(colors.primary) : pressed ? buttonPressed3D(colors.primary) : button3D(colors.primary))]}>
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text style={styles.buttonText}>{t('register')}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{t('login')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal3D visible={modalVisible} title={modalTitle} message={modalMsg} icon={modalIcon} iconColor={modalColor} buttonColor={colors.primary} onClose={() => setModalVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 },
  title: { ...typography.h2, color: colors.primary, textAlign: 'center' },
  field: { marginBottom: 6 },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 6, marginLeft: 4, fontWeight: '600' },
  inputError: { borderColor: colors.error, borderWidth: 1.5 },
  fieldError: { ...typography.caption, color: colors.error, marginTop: 4, marginLeft: 4 },
  buttonWrap: { alignItems: 'center', paddingVertical: 16, borderRadius: 14, marginTop: 12 },
  buttonText: { ...typography.button, color: colors.textLight },
  link: { ...typography.body, color: colors.primary, textAlign: 'center', marginTop: 16 },
});
