// src/screens/profile/EditProfileScreen.tsx
// ============================================================================
// EditProfileScreen
//
// PURPOSE:
//   Allows the user to update their profile after onboarding.
//   Supports editing:
//     • Photos (upload, remove, replace; max 6 slots)
//     • Bio
//     • Sex preference (men / women / everyone)
//     • Dating preferences (age-dependent filtering logic)
//     • Interests (searchable list)
//     • Smart Photos toggle (placeholder for future ML feature)
//
// PRIMARY DATA FLOW:
//   1. Load profile from GET /profiles/me
//   2. Hydrate UI with their existing details
//   3. Allow edits
//   4. Upload new photos using signed URLs (PUT to Storage)
//   5. Submit final payload to POST /profiles/update
//
// NOTE:
//   The API expects a *flattened* array of photos (no nulls), so nulls are removed.
// ============================================================================

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import { apiGet, apiPost } from "../../services/apiService";
import { INTERESTS } from "../../constants/interests";

import type {
  UserProfile,
  SexPreference,
  DatingPreference,
} from "../../types/user";

// Sex preferences displayed in UI
const ALL_PREFS: SexPreference[] = ["male", "female", "everyone"];

// Raw dating preferences available (age-filtered later)
const RAW_DATING_PREFS: { value: DatingPreference; label: string }[] = [
  { value: "hookups", label: "Hookups Only" },
  { value: "situationship", label: "Situationship" },
  { value: "short_term_relationship", label: "Short-term Relationship" },
  { value: "short_term_open", label: "Short-term, open to long" },
  { value: "long_term_open", label: "Long-term, open to short" },
  { value: "long_term_relationship", label: "Long-term Relationship" },
];

export default function EditProfileScreen({ navigation }: any) {
  // ============================================================================
  // STATE: Loading & error
  // ============================================================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // PROFILE FIELDS
  // ============================================================================
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState<number>(18);
  const [sex, setSex] = useState<"male" | "female">("male");

  const [sexPreference, setSexPreference] =
    useState<SexPreference>("everyone");

  const [datingPreference, setDatingPreference] =
    useState<DatingPreference>("hookups");

  const [interests, setInterests] = useState<string[]>([]);

  // 6 photo slots (null = empty)
  const [photos, setPhotos] = useState<(string | null)[]>([
    null, null, null,
    null, null, null,
  ]);

  // Smart Photos toggle (for future ML scoring)
  const [smartPhotos, setSmartPhotos] = useState(false);

  // Interest search UI
  const [interestSearch, setInterestSearch] = useState("");
  const [showAllInterests, setShowAllInterests] = useState(false);

  // Display labels for sex preferences
  const SEX_PREF_LABELS: Record<SexPreference, string> = {
    male: "Men",
    female: "Women",
    everyone: "Everyone",
  };

  // ============================================================================
  // LOAD EXISTING PROFILE DATA
  //
  // GET /profiles/me → hydrate all fields
  // Ensures grid always contains exactly 6 slots
  // ============================================================================
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UserProfile>("/profiles/me");

        if (data) {
          setName(data.name);
          setBio(data.bio);
          setSex(data.sex);
          setAge(data.age);
          setSexPreference(data.sexPreference);
          setDatingPreference(data.datingPreference);
          setInterests(data.interests);

          // Fill 6 photo boxes
          const grid: (string | null)[] = [...data.photos];
          while (grid.length < 6) grid.push(null);
          setPhotos(grid);
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ============================================================================
  // IMAGE COMPRESSION
  // - Reduces file size before uploading
  // - Width capped at 1080px
  // ============================================================================
  async function compressToJpeg(uri: string): Promise<string> {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    return result.uri;
  }

  // ============================================================================
  // SELECT & UPLOAD PHOTO
  //
  // Flow:
  //   1. User picks photo from gallery
  //   2. Compress locally
  //   3. Request signed URL → PUT upload
  //   4. Save final fileUrl in photos[]
  // ============================================================================
  async function pickPhoto(index: number) {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (res.canceled) return;

    const compressed = await compressToJpeg(res.assets[0].uri);

    // GET signed upload URL
    const signed = await apiGet<{ uploadUrl: string; fileUrl: string }>(
      "/profiles/upload-url?fileType=image/jpeg"
    );
    if (!signed) {
      setError("Upload URL failed.");
      return;
    }

    // Upload file to storage bucket
    const blob = await (await fetch(compressed)).blob();
    await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
    });

    // Store final accessible URL
    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = signed.fileUrl;
      return updated;
    });
  }

  // Removes photo slot at index
  function removePhoto(i: number) {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[i] = null;
      return updated;
    });
  }

  // Toggles an interest on/off
  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  // ============================================================================
  // SAVE PROFILE
  //
  // POST /profiles/update
  //   name, bio, sex, sexPreference, datingPreference, interests, photos[]
  //
  // Must remove nulls from photo array.
  // ============================================================================
  async function save() {
    setError(null);

    const realPhotos = photos.filter((p): p is string => p !== null);

    if (realPhotos.length < 1) {
      setError("At least one photo required.");
      return;
    }

    const res = await apiPost("/profiles/update", {
      name,
      bio,
      sex,
      sexPreference,
      datingPreference,
      interests,
      photos: realPhotos,
    });

    if (!res) {
      setError("Failed to save changes.");
      return;
    }

    navigation.goBack();
  }

  // Loading UI
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  // ============================================================================
  // DATING PREFERENCE FILTERING BY AGE
  //
  // • Users < 25 remove “short_term_relationship”
  // • Users ≥ 25 remove “situationship”
  //
  // Also ensures previously saved preference is included even if
  // it no longer matches filtering rules.
  // ============================================================================
  let DATING_PREFS =
    age < 25
      ? [
          RAW_DATING_PREFS[0],
          RAW_DATING_PREFS[1],
          RAW_DATING_PREFS[3],
          RAW_DATING_PREFS[4],
          RAW_DATING_PREFS[5],
        ]
      : [
          RAW_DATING_PREFS[0],
          RAW_DATING_PREFS[2],
          RAW_DATING_PREFS[3],
          RAW_DATING_PREFS[4],
          RAW_DATING_PREFS[5],
        ];

  if (!DATING_PREFS.some((p) => p.value === datingPreference)) {
    const saved = RAW_DATING_PREFS.find((p) => p.value === datingPreference);
    if (saved) DATING_PREFS = [saved, ...DATING_PREFS];
  }

  // ============================================================================
  // MAIN UI RENDER
  // ============================================================================
  return (
    <View style={{ flex: 1, backgroundColor: "#222222" }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
        </View>

        {/* PHOTO GRID */}
        <View style={styles.photoGrid}>
          {photos.map((p, i) => (
            <View key={i} style={styles.photoBox}>
              {p ? (
                <>
                  {/* Existing photo */}
                  <Image source={{ uri: p }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePhoto(i)}
                  >
                    <Text style={styles.removeX}>×</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Empty slot → add photo
                <TouchableOpacity
                  style={styles.addSlot}
                  onPress={() => pickPhoto(i)}
                >
                  <Text style={styles.plus}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* ADD PHOTOS BUTTON */}
        <TouchableOpacity
          style={styles.addPhotoBtn}
          onPress={() => {
            const idx = photos.findIndex((p) => p === null);
            if (idx !== -1) pickPhoto(idx);
          }}
        >
          <Text style={styles.addPhotoText}>Add Photos</Text>
        </TouchableOpacity>

        {/* SMART PHOTOS */}
        <Text style={styles.sectionTitle}>Your Best Look:</Text>
        <View style={styles.smartRow}>
          <Text style={styles.smartDesc}>
            We continuously test your photos to find your best one.
          </Text>
          <Switch
            value={smartPhotos}
            onValueChange={setSmartPhotos}
            thumbColor={smartPhotos ? "#333" : "#555"}
            trackColor={{ true: "white", false: "#333" }}
          />
        </View>

        {/* BIO */}
        <Text style={styles.sectionTitle}>Bio:</Text>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Write something about yourself…"
          placeholderTextColor="#666"
        />

        {/* SEX PREFERENCE */}
        <Text style={styles.sectionTitle}>Interested In:</Text>
        <View style={styles.selectorRow}>
          {ALL_PREFS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setSexPreference(p)}
              style={[
                styles.selector,
                sexPreference === p && styles.selectorSelected,
              ]}
            >
              <Text
                style={[
                  styles.selectorText,
                  sexPreference === p && styles.selectorSelectedText,
                ]}
              >
                {SEX_PREF_LABELS[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATING PREFERENCE */}
        <Text style={styles.sectionTitle}>Dating Preference:</Text>
        <View style={styles.selectorColumn}>
          {DATING_PREFS.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setDatingPreference(p.value)}
              style={[
                styles.selector,
                datingPreference === p.value && styles.selectorSelected,
              ]}
            >
              <Text
                style={[
                  styles.selectorText,
                  datingPreference === p.value && styles.selectorSelectedText,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INTERESTS */}
        <Text style={styles.sectionTitle}>Interests</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search interests…"
          placeholderTextColor="#666"
          value={interestSearch}
          onChangeText={setInterestSearch}
        />

        {/* Interest Grid (searchable, expandable) */}
        <View style={styles.interestGrid}>
          {INTERESTS
            .filter((i) =>
              i.toLowerCase().includes(interestSearch.toLowerCase())
            )
            .slice(0, showAllInterests ? INTERESTS.length : 15)
            .map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => toggleInterest(i)}
                style={[
                  styles.interestChip,
                  interests.includes(i) && styles.interestChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.interestText,
                    interests.includes(i) && styles.interestTextSelected,
                  ]}
                >
                  {i}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* "Show More" / "Show Less" interests */}
        {INTERESTS.filter((i) =>
          i.toLowerCase().includes(interestSearch.toLowerCase())
        ).length > 25 && (
          <TouchableOpacity
            onPress={() => setShowAllInterests((prev) => !prev)}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>
              {showAllInterests ? "Show less" : "Show more"}
            </Text>
          </TouchableOpacity>
        )}

        {/* ERROR MESSAGE */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 180,
  },
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
  },
  backArrow: {
    fontSize: 34,
    color: "white",
    marginRight: 10,
    marginBottom: 20,
    marginTop: 50,
  },
  headerText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 50,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoBox: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#333",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#000c",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 0,
  },
  removeX: { color: "white", fontSize: 22 },
  addSlot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  plus: { color: "#777", fontSize: 42, fontWeight: "300" },
  addPhotoBtn: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  addPhotoText: {
    color: "black",
    textAlign: "center",
    fontSize: 18,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    marginTop: 28,
    marginBottom: 12,
    fontWeight: "600",
  },
  bioInput: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: 14,
    borderRadius: 10,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 16,
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  selectorColumn: {
    flexDirection: "column",
    marginBottom: 10,
  },
  selector: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  selectorSelected: {
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 2,
  },
  selectorText: {
    color: "white",
    fontSize: 16,
  },
  selectorSelectedText: {
    color: "black",
  },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  interestChip: {
    borderColor: "#444",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 6,
    backgroundColor: "#111",
  },
  interestChipSelected: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  interestText: {
    color: "#ccc",
    fontSize: 14,
  },
  interestTextSelected: {
    color: "#000",
  },
  smartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smartDesc: {
    flex: 1,
    color: "#ccc",
    paddingRight: 10,
  },
  errorText: {
    color: "#ff5555",
    textAlign: "center",
    marginTop: 15,
  },
  saveBtn: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginTop: 35,
    marginBottom: 60,
  },
  saveText: {
    color: "black",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "#1a1a1a",
    color: "white",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 14,
  },
  expandButton: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  expandButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
