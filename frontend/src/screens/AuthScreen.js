import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { adminLogin } from '../../api/api';
import { AuthContext } from '../context/AuthContext';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleRetour = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await adminLogin(email, password);
      // Persister le token
      await login(data.token);
      // Naviguer vers l'interface d'administration
      navigation.replace('ZoneManagement');
    } catch (error) {
      Alert.alert('Accès Refusé', 'Identifiants invalides.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={handleRetour}>
          <ArrowLeft color="#0A2B5E" size={24} />
        </TouchableOpacity>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Shield color="#FFF" size={32} />
          </View>
          <Text style={styles.appName}>JARDIN MAJORELLE</Text>
          <Text style={styles.appSub}>A D M I N I S T R A T I V E  P O R T A L</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Staff Authentication</Text>
          <Text style={styles.cardDesc}>
            Please enter your credentials to access the secure dashboard.
          </Text>

          <Text style={styles.inputLabel}>USERNAME / EMAIL</Text>
          <View style={styles.inputWrapper}>
            <User color="#0A2B5E" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="nadine@test.com" 
              placeholderTextColor="#A0AAB8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>SECURE PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Lock color="#0A2B5E" size={20} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput} 
              placeholder="••••••••••" 
              placeholderTextColor="#A0AAB8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff color="#0A2B5E" size={20} /> : <Eye color="#0A2B5E" size={20} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.authBtn} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.authBtnText}>Authenticate</Text>
                <ArrowRight color="#FFF" size={18} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Access Credentials?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Area */}
        <View style={styles.footer}>
          <View style={styles.domeShape} />
          
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SERVER ONLINE   |   V2.4.0-SECURE</Text>
          </View>

          <Text style={styles.legalText}>
            PROPRIETARY SYSTEM — ACCESS RESTRICTED TO{'\n'}
            AUTHORIZED JARDIN MAJORELLE PERSONNEL ONLY.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F4EC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(10, 43, 94, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#B4B813', // Iconic Jardin Majorelle Yellow
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoBox: {
    backgroundColor: '#004B9E',
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A2B5E',
    marginBottom: 5,
  },
  appSub: {
    fontSize: 10,
    color: '#68778D',
    letterSpacing: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: '#68778D',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#127A3A',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFE9',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0A2B5E',
  },
  eyeBtn: {
    padding: 5,
  },
  authBtn: {
    backgroundColor: '#0A2B5E',
    borderRadius: 12,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  authBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 10,
  },
  forgotBtn: {
    alignItems: 'center',
  },
  forgotText: {
    color: '#127A3A',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  domeShape: {
    width: 60,
    height: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#127A3A',
    marginRight: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4E5E2D',
    letterSpacing: 1,
  },
  legalText: {
    textAlign: 'center',
    fontSize: 9,
    color: '#8C9BB0',
    lineHeight: 14,
    letterSpacing: 0.5,
  }
});
