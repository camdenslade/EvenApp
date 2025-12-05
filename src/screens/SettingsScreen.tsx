// src/screens/SettingsScreen.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { apiGet, apiPost } from "../services/apiService";
import { clearTokens } from "../services/authStorage";

export default function SettingsScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<{ email: string | null }>("/users/me");
        if (data && data.email) setEmail(data.email);
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveEmail() {
    setError(null);
    setMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    setSaving(true);
    const res = await apiPost("/auth/update-email", { email });
    setSaving(false);

    if (!res) {
      setError("Failed to update email.");
      return;
    }

    setMessage("Email updated successfully.");
  }

  async function handlePauseAccount() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await apiPost("/auth/pause", {});
    setSaving(false);

    if (!res) {
      setError("Failed to pause account.");
      return;
    }

    setMessage("Your account is now paused.");
  }

  async function handleDeleteAccount() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await apiPost("/auth/delete", {});
    setSaving(false);

    if (!res) {
      setError("Failed to delete account.");
      return;
    }

    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  async function handleSignOut() {
    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Settings</Text>
        </View>

        <Text style={styles.sectionTitle}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Add an email"
          placeholderTextColor="#666"
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEmail}>
          <Text style={styles.saveText}>Save Email</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pause Account</Text>
        <Text style={styles.description}>
          Pausing hides your profile temporarily.
        </Text>

        <TouchableOpacity style={styles.pauseBtn} onPress={handlePauseAccount}>
          <Text style={styles.pauseText}>Pause Account</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Delete Account</Text>
        <Text style={styles.description}>
          This action is permanent and cannot be undone.
        </Text>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
        {message && <Text style={styles.message}>{message}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222", padding: 20 },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  loadingText: { color: "white", marginTop: 10 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 40,
  },
  backArrow: { color: "white", fontSize: 32, marginRight: 10 },
  headerText: { color: "white", fontSize: 32, fontWeight: "700" },

  sectionTitle: {
    color: "white",
    fontSize: 22,
    marginTop: 30,
    marginBottom: 10,
    fontWeight: "600",
  },
  description: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#333",
    color: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },

  saveBtn: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveText: { color: "#222", textAlign: "center", fontWeight: "600" },

  pauseBtn: {
    backgroundColor: "#444",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  pauseText: { color: "white", textAlign: "center", fontWeight: "600" },

  deleteBtn: {
    borderWidth: 1,
    borderColor: "red",
    padding: 14,
    borderRadius: 12,
    marginBottom: 30,
  },
  deleteText: { color: "red", textAlign: "center", fontWeight: "600" },

  signOutBtn: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "white",
    padding: 14,
    borderRadius: 12,
  },
  signOutText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 17,
  },

  error: { color: "#ff4444", marginTop: 10, textAlign: "center" },
  message: { color: "#5fff8f", marginTop: 10, textAlign: "center" },
});
