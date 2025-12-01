import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../../App'; 
import { RouteProp } from '@react-navigation/native';
import { AuthSessionResult } from 'expo-auth-session';

import { auth } from '../../hooks/firebase';
import { PhoneAuthProvider, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal} from 'expo-firebase-recaptcha';

import { apiPost } from '../../services/apiService';
import { saveTokens } from '../../services/authStorage';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';

WebBrowser.maybeCompleteAuthSession();

type AuthFlowState = 'INPUT_PHONE' | 'INPUT_CODE' | 'VERIFYING';
type PhoneAuthRouteProp = RouteProp<RootStackParamList, 'PhoneAuth'>;

interface TokenResponse {
  access: string;
  refresh: string;
  isNewUser: boolean;
}

const GOOGLE_CLIENT_IDS = {
    web: process.env.EXPO_PUBLIC_WEB_ID,
    // Note: iOS client ID is technically needed here for iOS devices
    android: process.env.EXPO_PUBLIC_ANDROID_ID,
};


export default function PhoneAuthScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<PhoneAuthRouteProp>();
  const { provider } = route.params || { provider: 'Unknown' };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [flowState, setFlowState] = useState<AuthFlowState>('INPUT_PHONE');
  const recaptchaRef = useRef<any>(null); 
  const [verificationId, setVerificationId] = useState<string | null>(null);
  
  // Country Picker State
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [countryDialingCode, setCountryDialingCode] = useState('1');
  const [pickerVisible, setPickerVisible] = useState(false);
  
  // Google Auth Hooks
  const [request, response, promptAsync] = Google.useAuthRequest({
      webClientId: GOOGLE_CLIENT_IDS.web,
      // iosClientId: GOOGLE_CLIENT_IDS.ios,
      androidClientId: GOOGLE_CLIENT_IDS.android,
      scopes: ['profile', 'email'],
  });

  // --- Universal Success Handler ---
  async function handleAuthSuccess(idToken: string) {
    try {
      setError(null);
      
      const tokens = await apiPost<TokenResponse>('/auth/login', { idToken }); 

      if (!tokens) {
          setError('Server failed to issue tokens.');
          return;
      }
      
      await saveTokens(tokens.access, tokens.refresh);
      navigation.reset({ 
          index: 0, 
          routes: [{ 
              name: tokens.isNewUser ? 'Onboarding' : 'Swipe',
              params: undefined
          }] 
      });
    } catch (e: any) {
      setError(`Final login failed: ${e.message}`);
      console.error('Final Login Error:', e);
      navigation.reset({ index: 0, routes: [{ name: 'Login', params: undefined }] });
    } finally {
      setLoading(false);
    }
  }

  // --- GOOGLE AUTH LOGIC ---
  useEffect(() => {
    if (provider !== 'Google') return;
    if (response == null) return;

    const res = response;

    setLoading(true);

    async function exchangeToken() {
        if (res.type === 'success') {
        const successRes = res as AuthSessionResult & {
            authentication?: { idToken?: string };
        };

        const googleIdToken = successRes.authentication?.idToken;

        if (!googleIdToken) {
            Alert.alert(
            "Google Auth Failed",
            "Token was missing after successful response."
            );
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            return;
        }

        try {
            const credential = GoogleAuthProvider.credential(googleIdToken);
            const userCred = await signInWithCredential(auth, credential);
            const firebaseIdToken = await userCred.user.getIdToken();

            await handleAuthSuccess(firebaseIdToken);
        } catch (e: any) {
            Alert.alert("Google Auth Failed", e.message);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
        }

        else if (res.type === 'error') {
        const err = res as AuthSessionResult & {
            error?: { message?: string };
        };

        Alert.alert(
            "Login Failed",
            err.error?.message || "Google sign-in failed."
        );

        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }

        else if (res.type === 'dismiss' || res.type === 'cancel') {
        navigation.goBack();
        }

        setLoading(false);
    }

    exchangeToken();
    }, [response, provider, navigation, handleAuthSuccess]);


  // --- PHONE AUTH LOGIC ---
  async function handleSendCode() {
    if (!phoneNumber || !countryDialingCode) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    let number = phoneNumber.replace(/[^\d]/g, '');
    let e164Number = `+${countryDialingCode}${number}`;
    if (e164Number.length < 10) {
        setError('Phone number is too short.');
        return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const provider = new PhoneAuthProvider(auth);
      
      const id = await provider.verifyPhoneNumber(
        e164Number,
        recaptchaRef.current!
      );

      setVerificationId(id);
      setFlowState('INPUT_CODE');
    } catch (e: any) {
      console.error('SMS Send Error:', e);
      setError(`Failed to send code: ${e.message}.`); 
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!verificationId) {
      setError('Verification failed. Restart the process.');
      setFlowState('INPUT_PHONE');
      return;
    }
    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits.');
      return;
    }

    try {
      setLoading(true);
      setFlowState('VERIFYING');
      setError(null);

      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );

      const userCred = await signInWithCredential(auth, credential);
      const idToken = await userCred.user.getIdToken();

      await handleAuthSuccess(idToken);
      
    } catch (e: any) {
      console.error('Verification Error:', e);
      setError('Invalid verification code. Please try again.');
      setFlowState('INPUT_CODE');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (provider === 'Google') {
        if (request && promptAsync) {
            setLoading(true);
            promptAsync();
        } else {
            setError('Google configuration missing. Check environment variables.');
            setLoading(false);
        }
    }
  }, [provider, request, promptAsync]);


  const isPhoneFlow = provider === 'Phone';

  if (isPhoneFlow) {
    const headerText = flowState === 'INPUT_PHONE' ? 'Hey, can we get your number?' : 'Enter your 6-digit code';
    const actionButtonText = flowState === 'INPUT_PHONE' ? 'Next' : 'Verify and Sign In';
    const actionHandler = flowState === 'INPUT_PHONE' ? handleSendCode : handleVerifyCode;

    return (
      <View style={styles.phoneContainer}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaRef}
          firebaseConfig={auth.app.options}
          attemptInvisibleVerification={true}
        />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>

        <Text style={styles.header}>{headerText}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {flowState === 'VERIFYING' && <ActivityIndicator size="large" color="white" />}
        
        {flowState !== 'VERIFYING' && (
          <>
            {flowState === 'INPUT_PHONE' ? (
                <>
                    <View style={styles.inputRow}>
                        <TouchableOpacity
                            style={styles.countryPickerButton}
                            onPress={() => setPickerVisible(true)}
                        >
                            <Text style={styles.countryPickerText}>+{countryDialingCode}</Text>
                            <Ionicons name="chevron-down" size={16} color="black" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.phoneNumberInput}
                            placeholder="Phone Number"
                            placeholderTextColor="#888"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            autoFocus
                        />
                    </View>
                    <CountryPicker
                        withFilter
                        withFlag
                        withCallingCode
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        onSelect={(country) => {
                            setCountryCode(country.cca2);
                            setCountryDialingCode(country.callingCode ? country.callingCode[0] : '1');
                            setPickerVisible(false);
                        }}
                        countryCode={countryCode}
                        theme={{
                            primaryColor: 'white',
                            onBackgroundTextColor: 'black'
                        }}
                    />
                </>
            ) : (
                <TextInput
                    style={styles.input}
                    placeholder={'Code'}
                    placeholderTextColor="#888"
                    keyboardType={'number-pad'}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                    autoFocus
                />
            )}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  opacity:
                    (flowState === 'INPUT_PHONE' && !phoneNumber) ||
                    (flowState === 'INPUT_CODE' &&
                      verificationCode.length !== 6)
                      ? 0.5
                      : 1
                }
              ]}
              onPress={actionHandler}
              disabled={
                (flowState === 'INPUT_PHONE' && !phoneNumber) ||
                (flowState === 'INPUT_CODE' &&
                  verificationCode.length !== 6)
              }
            >
              <Text style={styles.buttonText}>{actionButtonText}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
        <Text style={styles.statusText}>Provider {provider} not yet configured.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222222', padding: 30, justifyContent: 'center', alignItems: 'center' },
  phoneContainer: { flex: 1, backgroundColor: '#222222', padding: 30 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: 50
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    color: 'black',
    fontSize: 18
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: 'black', fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 15, textAlign: 'center' },
  statusText: { color: 'white', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  countryPickerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  countryPickerText: {
    color: 'black',
    fontSize: 18,
    marginRight: 5,
  },
  phoneNumberInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    color: 'black',
    fontSize: 18,
  },
});