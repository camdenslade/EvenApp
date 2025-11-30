import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "../../hooks/firebase";
import { apiPost } from "../../services/apiService";
import { saveTokens } from "../../services/authStorage";
import { useNavigation } from "@react-navigation/native";

interface TokenResponse {
  access: string;
  refresh: string;
  isNewUser: boolean;
}

export default function LoginScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(): Promise<void> {
    try {
      setError(null);
      setLoading(true);

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      const tokens = await apiPost<TokenResponse>("/auth/login", { idToken });
      
      if (!tokens) {
        Alert.alert("Error", "Server failed to issue tokens. Try again later.");
        return;
      }

      await saveTokens(tokens.access, tokens.refresh);

      navigation.reset({
        index: 0,
        routes: [{ name: tokens.isNewUser ? "Onboarding" : "Swipe" }],
      });
    } catch (e) {
      if (e instanceof Error && 'code' in e) {
        switch (e.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError("Invalid email or password.");
            break;
          case 'auth/invalid-email':
            setError("Invalid email format.");
            break;
          default:
            setError(`Login failed: ${e.message}`);
        }
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown login error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Even Dating</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button 
        title={loading ? "Loading..." : "Login"} 
        onPress={handleLogin} 
        disabled={loading}
      />

      <TouchableOpacity onPress={() => navigation.navigate("Onboarding")}>
        <Text style={styles.newUser}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  header: { fontSize: 32, color: "white", textAlign: "center", marginBottom: 30 },
  label: { color: "white", marginBottom: 6 },
  input: { backgroundColor: "white", padding: 10, borderRadius: 6, marginBottom: 18 },
  error: { color: "red", marginBottom: 14 },
  newUser: { marginTop: 20, color: "#3498db", textAlign: "center" },
});