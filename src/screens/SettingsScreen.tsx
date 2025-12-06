// src/screens/SettingsScreen.tsx
// ============================================================================
// SettingsScreen
// Purpose:
//   Allows users to manage account-level settings, including:
//
//     • Updating email
//     • Pausing / resuming their account
//     • Deleting account permanently
//     • Signing out
//
// Backend Endpoints:
//   GET    /users/me                  → fetch user email
//   GET    /profiles/me               → fetch pause state
//   POST   /auth/update-email         → change email
//   PATCH  /profiles/me/pause         → pause profile
//   PATCH  /profiles/me/unpause       → resume profile
//   DELETE /users/me                  → delete account
//
// UX Notes:
//   • All destructive actions require modals (confirmation + success)
//   • Pausing hides the user's profile from swipes
//   • Delete permanently removes the user and all associated data
//   • After deletion or sign-out, navigation resets to Login
//
// ============================================================================

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";

import { apiGet, apiPost, apiPatch, apiDelete } from "../services/apiService";
import { clearTokens } from "../services/authStorage";

export default function SettingsScreen({ navigation }: any) {
  // Email text field
  const [email, setEmail] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pause state fetched from backend
  const [isPaused, setIsPaused] = useState(false);

  // Visibility toggles for modal dialogs
  const [pauseConfirmVisible, setPauseConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const [pauseSuccessVisible, setPauseSuccessVisible] = useState(false);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  // ---------------------------------------------------------------------------
  // LOAD SETTINGS ON MOUNT
  // ---------------------------------------------------------------------------
  //
  // Fetches:
  //   1. Email from /users/me
  //   2. Pause state from /profiles/me
  //
  // If either request fails, an error message is displayed.
  //
  useEffect(() => {
    async function load() {
      try {
        const user = await apiGet<{ email: string | null }>("/users/me");
        if (user?.email) setEmail(user.email);

        const profile = await apiGet<{ paused: boolean }>("/profiles/me");
        if (profile) setIsPaused(profile.paused);
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ---------------------------------------------------------------------------
  // SAVE EMAIL
  // ---------------------------------------------------------------------------
  //
  // POST /auth/update-email
  //
  async function handleSaveEmail() {
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    setSaving(true);
    const res = await apiPost("/auth/update-email", { email });
    setSaving(false);

    if (!res) setError("Failed to update email.");
  }

  // ---------------------------------------------------------------------------
  // PAUSE / RESUME ACCOUNT
  // ---------------------------------------------------------------------------
  //
  // PATCH /profiles/me/pause
  // PATCH /profiles/me/unpause
  //
  // Opens confirmation modal first; on confirm, toggles status.
  //
  async function handlePauseToggle() {
    setSaving(true);

    const endpoint = isPaused
      ? "/profiles/me/unpause"
      : "/profiles/me/pause";

    const res = await apiPatch(endpoint, {});
    setSaving(false);

    if (!res) {
      setError(isPaused ? "Failed to resume account." : "Failed to pause account.");
      return;
    }

    setIsPaused(!isPaused);
    setPauseSuccessVisible(true); // shows success modal
  }

  // ---------------------------------------------------------------------------
  // DELETE ACCOUNT
  // ---------------------------------------------------------------------------
  //
  // DELETE /users/me
  //
  // Fully removes the user. After success, a success modal appears.
  //
  async function handleDeleteAccount() {
    setSaving(true);
    const res = await apiDelete("/users/me");
    setSaving(false);

    if (!res) {
      setError("Failed to delete account.");
      return;
    }

    setDeleteSuccessVisible(true);
  }

  // ---------------------------------------------------------------------------
  // ACCOUNT DELETION FINAL STEP
  // ---------------------------------------------------------------------------
  //
  // Clears tokens and sends user back to login.
  //
  async function finishDeleteFlow() {
    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  // ---------------------------------------------------------------------------
  // SIGN OUT
  // ---------------------------------------------------------------------------
  //
  // Does NOT delete the user. Only clears saved tokens.
  //
  async function handleSignOut() {
    await clearTokens();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  // ---------------------------------------------------------------------------
  // LOADING SCREEN
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Settings</Text>
        </View>

        {/* EMAIL */}
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

        {/* PAUSE ACCOUNT */}
        <Text style={styles.sectionTitle}>Pause Account</Text>
        <Text style={styles.description}>
          {isPaused
            ? "Your account is currently paused. Others cannot see your profile."
            : "Pausing hides your profile temporarily."}
        </Text>

        <TouchableOpacity
          style={styles.pauseBtn}
          onPress={() => setPauseConfirmVisible(true)}
        >
          <Text style={styles.pauseText}>
            {isPaused ? "Resume Account" : "Pause Account"}
          </Text>
        </TouchableOpacity>

        {/* DELETE ACCOUNT */}
        <Text style={styles.sectionTitle}>Delete Account</Text>
        <Text style={styles.description}>
          This action is permanent and cannot be undone.
        </Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setDeleteConfirmVisible(true)}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        {/* SIGN OUT */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {/* ======================================================================
           PAUSE CONFIRMATION MODAL
         ====================================================================== */}
      <Modal
        visible={pauseConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPauseConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {isPaused ? "Resume Account?" : "Pause Account?"}
            </Text>

            <Text style={styles.modalMessage}>
              {isPaused
                ? "Resuming will make your profile visible again."
                : "Pausing hides your profile until you unpause it."}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPauseConfirmVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setPauseConfirmVisible(false);
                  handlePauseToggle();
                }}
              >
                <Text style={styles.modalConfirmText}>
                  {isPaused ? "Resume" : "Pause"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================================
           PAUSE SUCCESS MODAL
         ====================================================================== */}
      <Modal
        visible={pauseSuccessVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPauseSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {isPaused ? "Account Resumed" : "Account Paused"}
            </Text>

            <Text style={styles.modalMessage}>
              {isPaused
                ? "Your account is now active."
                : "Your account is now paused."}
            </Text>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={() => setPauseSuccessVisible(false)}
            >
              <Text style={styles.modalConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================================
           DELETE CONFIRMATION MODAL
         ====================================================================== */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalMessage}>
              This action is permanent and cannot be undone.
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: "red" }]}
                onPress={() => {
                  setDeleteConfirmVisible(false);
                  handleDeleteAccount();
                }}
              >
                <Text style={[styles.modalConfirmText, { color: "white" }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================================
           DELETE SUCCESS MODAL
         ====================================================================== */}
      <Modal visible={deleteSuccessVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Account Deleted</Text>
            <Text style={styles.modalMessage}>
              Your account has been deleted.
            </Text>

            <TouchableOpacity
              style={[styles.modalConfirmBtn, { backgroundColor: "red" }]}
              onPress={() => {
                setDeleteSuccessVisible(false);
                finishDeleteFlow();
              }}
            >
              <Text style={[styles.modalConfirmText, { color: "white" }]}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222", padding: 20 },

  // Loading screen
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  loadingText: { color: "white", marginTop: 10 },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 40,
  },
  backArrow: { color: "white", fontSize: 32, marginRight: 10 },
  headerText: { color: "white", fontSize: 32, fontWeight: "700" },

  // Inputs & Sections
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

  // Buttons
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

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#ccc",
    fontSize: 15,
    marginBottom: 20,
  },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  modalCancelText: {
    color: "#aaa",
    fontSize: 16,
  },

  modalConfirmBtn: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 16,
  },
});
