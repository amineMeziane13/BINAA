import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { typography } from '../../../core/theme/typography';
import { button3D, buttonPressed3D, input3D } from '../../../core/theme/neumorphism';
import { useAuth } from '../../../core/hooks/useAuth';
import { useLocalize } from '../../../core/hooks/useLocalize';
import Modal3D from '../../../core/components/Modal3D';
import Icon3D from '../../../core/components/Icon3D';

export default function LoginScreen({ navigation }: any) {
  const { t } = useLocalize();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [pressed, setPressed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const passwordRef = useRef<TextInput>(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setModalMsg('Veuillez remplir tous les champs');
      setModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setModalMsg(err.message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoWrap}>
          <Icon3D icon="🏗️" size={40} bgColor={colors.primary} />
          <Text style={styles.title}>{t('app_name')}</Text>
          <Text style={styles.subtitle}>{t('login')}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('email')}</Text>
          <TextInput
            style={input3D()}
            placeholder="email@exemple.com"
            placeholderTextColor="#94A3B8"
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            ref={passwordRef}
            style={input3D()}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            value={password} onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin} disabled={loading}
          onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
          activeOpacity={1}
          style={styles.buttonOuter}
        >
          <View style={[styles.buttonInner, loading || pressed ? buttonPressed3D(colors.primary) : button3D(colors.primary)]}>
            {loading ? <ActivityIndicator color={colors.textLight} /> : <Text style={styles.buttonText}>{t('login')}</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>{t('register')}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal3D visible={modalVisible} title="Erreur de connexion" message={modalMsg} icon="⚠️" iconColor={colors.error} buttonColor={colors.primary} onClose={() => setModalVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoWrap: { alignItems: 'center', marginBottom: 36, gap: 8 },
  title: { ...typography.h1, color: colors.primary, textAlign: 'center' },
  subtitle: { ...typography.h3, color: colors.textSecondary, textAlign: 'center' },
  field: { marginBottom: 12 },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 6, marginLeft: 4, fontWeight: '600' },
  buttonOuter: { marginTop: 20 },
  buttonInner: { alignItems: 'center', paddingVertical: 16, borderRadius: 14 },
  buttonText: { ...typography.button, color: colors.textLight },
  link: { ...typography.body, color: colors.primary, textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
