// src/screens/login/PhoneAuthScreen.tsx
import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";

import { RootStackParamList } from "../../../App";
import { auth } from "../../services/firebase";

import {
  PhoneAuthProvider,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";

import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { SliderCaptcha } from "../../components/SliderCaptcha";

import { saveIdToken } from "../../services/authStorage";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const COUNTRY_LIST = [
  { code: "US", name: "United States", dial: "1" },
  { code: "CA", name: "Canada", dial: "1" },
  { code: "GB", name: "United Kingdom", dial: "44" },
  { code: "AU", name: "Australia", dial: "61" },
  { code: "NZ", name: "New Zealand", dial: "64" },
  { code: "IN", name: "India", dial: "91" },
];

type AuthFlowState = "INPUT_PHONE" | "INPUT_CODE" | "VERIFYING";
type PhoneAuthRouteProp = RouteProp<RootStackParamList, "PhoneAuth">;

const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_WEB_ID,
  ios: process.env.EXPO_PUBLIC_IOS_ID,
  android: process.env.EXPO_PUBLIC_ANDROID_ID,
};

export default function PhoneAuthScreen(): React.ReactElement {
  const navigation = useNavigation<any>();
  const route = useRoute<PhoneAuthRouteProp>();
  const { provider } = route.params || { provider: "Unknown" };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [flowState, setFlowState] = useState<AuthFlowState>("INPUT_PHONE");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const [countryDialingCode, setCountryDialingCode] = useState("1");
  const [pickerVisible, setPickerVisible] = useState(false);

  const recaptchaVerifier = useRef<any>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.web,
    iosClientId: GOOGLE_CLIENT_IDS.ios,
    androidClientId: GOOGLE_CLIENT_IDS.android,
    scopes: ["profile", "email"],
  });

  interface LoginResponse {
  isNewUser: boolean;
  }


  async function handleAuthSuccess(idToken: string) {
    try {
      setError(null);

      await saveIdToken(idToken);

      const user = auth.currentUser;

      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });

    } catch (e: any) {
      setError(`Final login failed: ${e.message}`);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (provider !== "Google") return;
    if (!response) return;

    setLoading(true);

    async function exchangeToken() {
    if (!response) {
      setLoading(false);
      return;
    }
    
    if (response.type === 'success' && response.authentication) {
      const googleIdToken = response.authentication.idToken;

      if (!googleIdToken) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        setLoading(false);
        return;
      }

      try {
        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCred = await signInWithCredential(auth, credential);
        const firebaseIdToken = await userCred.user.getIdToken();
        
        await handleAuthSuccess(firebaseIdToken); 
        
      } catch {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } else {
      navigation.goBack();
    }

    setLoading(false);
  }

  exchangeToken();
  }, [response, provider]);

  async function handleSendCode() {
    if (!phoneNumber) return;
    if (!captchaVerified) {
      setError("Slide to verify first.");
      return;
    }

    const number = phoneNumber.replace(/[^\d]/g, "");
    const e164 = `+${countryDialingCode}${number}`;

    try {
      setLoading(true);
      setError(null);

      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(
        e164,
        recaptchaVerifier.current
      );

      setVerificationId(id);
      setFlowState("INPUT_CODE");
    } catch (e: any) {
      setError(`Failed to send code: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!verificationId) return;

    try {
      setLoading(true);
      setFlowState("VERIFYING");

      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );

      const userCred = await signInWithCredential(auth, credential);
      const idToken = await userCred.user.getIdToken();

      await handleAuthSuccess(idToken);
    } catch {
      setError("Invalid code");
      setFlowState("INPUT_CODE");
    } finally {
      setLoading(false);
    }
  }

  const isPhoneFlow = provider === "Phone";

  if (isPhoneFlow) {
    const headerText =
      flowState === "INPUT_PHONE"
        ? "Hey, can we get your number?"
        : "Enter your 6-digit code";

    const buttonText =
      flowState === "INPUT_PHONE" ? "Next" : "Verify and Sign In";

    const handler =
      flowState === "INPUT_PHONE" ? handleSendCode : handleVerifyCode;

    return (
      <View style={styles.phoneContainer}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={auth.app.options}
          attemptInvisibleVerification
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>

        <Text style={styles.header}>{headerText}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {flowState !== "VERIFYING" && (
          <>
            {flowState === "INPUT_PHONE" && (
              <>
                <View style={styles.inputRow}>
                  <TouchableOpacity
                    style={styles.countryPickerButton}
                    onPress={() => setPickerVisible(true)}
                  >
                    <Text style={styles.countryPickerText}>
                      +{countryDialingCode}
                    </Text>
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

                <SliderCaptcha onVerified={() => setCaptchaVerified(true)} />
              </>
            )}

            {flowState === "INPUT_CODE" && (
              <TextInput
                style={styles.input}
                placeholder="Code"
                placeholderTextColor="#888"
                keyboardType="number-pad"
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
                    (flowState === "INPUT_PHONE" &&
                      (!phoneNumber || !captchaVerified)) ||
                    (flowState === "INPUT_CODE" &&
                      verificationCode.length !== 6)
                      ? 0.5
                      : 1,
                },
              ]}
              disabled={
                (flowState === "INPUT_PHONE" &&
                  (!phoneNumber || !captchaVerified)) ||
                (flowState === "INPUT_CODE" &&
                  verificationCode.length !== 6)
              }
              onPress={handler}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </>
        )}

        {flowState === "VERIFYING" && (
          <ActivityIndicator size="large" color="white" />
        )}

        {pickerVisible && (
          <View style={styles.countryModal}>
            <View style={styles.countryModalInner}>
              {COUNTRY_LIST.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  style={styles.countryOption}
                  onPress={() => {
                    setCountryDialingCode(c.dial);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={styles.countryOptionText}>
                    {c.name} (+{c.dial})
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setPickerVisible(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        Provider {provider} not yet configured.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222222",
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneContainer: {
    flex: 1,
    backgroundColor: "#222",
    padding: 30,
  },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    marginTop: 50,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    color: "black",
    fontSize: 18,
  },
  inputRow: { flexDirection: "row", marginBottom: 20 },
  countryPickerButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  countryPickerText: {
    color: "black",
    fontSize: 18,
    marginRight: 5,
  },
  countryModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  countryModalInner: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  countryOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  countryOptionText: { fontSize: 18, color: "black" },
  closeModalButton: {
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
  },
  closeModalText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  phoneNumberInput: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    color: "black",
    fontSize: 18,
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "black", fontSize: 18, fontWeight: "bold" },
  error: { color: "red", marginBottom: 15, textAlign: "center" },
  statusText: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});
