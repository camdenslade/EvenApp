// src/screens/profile/EditProfileScreen.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import { apiGet, apiPost } from "../../services/apiService";
import type {
  UserProfile,
  Sex,
  SexPreference,
  DatingPreference,
} from "../../types/user";

import { BirthdayValue } from "../../components/BirthdayPicker";

interface EditProfileProps {
  navigation: any;
  onDone: () => void;
}

export default function EditProfileScreen({
  navigation,
  onDone,
}: EditProfileProps): React.ReactElement | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [sex, setSex] = useState<Sex>();
  const [sexPreference, setSexPreference] =
    useState<SexPreference>("everyone");
  const [datingPreference, setDatingPreference] =
    useState<DatingPreference>("hookups");
  const [birthday, setBirthday] = useState<BirthdayValue>({
    year: 2000,
    month: 0,
    day: 1,
  });

  const [photos, setPhotos] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UserProfile>("/profiles/me");
        if (data) {
          setProfile(data);
          setName(data.name);
          setBio(data.bio);
          setSex(data.sex);
          setSexPreference(data.sexPreference);
          setDatingPreference(data.datingPreference);
          setPhotos(data.photos);

          const dob = new Date(data.age * -365);
        }
      } catch {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function compress(uri: string): Promise<string> {
    const resized = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    return resized.uri;
  }

  const addPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (res.canceled || !res.assets?.length) return;

    if (photos.length >= 5) {
      setError("Maximum 5 photos allowed.");
      return;
    }

    const asset = res.assets[0];
    const compressed = await compress(asset.uri);

    const upload = await apiGet<{ uploadUrl: string; fileUrl: string }>(
      "/profiles/upload-url?fileType=image/jpeg"
    );

    if (!upload) {
      setError("Failed to get upload URL.");
      return;
    }

    const blob = await (await fetch(compressed)).blob();

    await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
    });

    setPhotos((prev) => [...prev, upload.fileUrl]);
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const save = async () => {
    setError(null);

    if (photos.length < 3) {
      setError("Minimum 3 photos required");
      return;
    }

    const res = await apiPost("/profiles/update", {
      name,
      bio,
      sex,
      sexPreference,
      datingPreference,
      photos,
    });

    if (!res) {
      setError("Update failed");
      return;
    }

    onDone();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  if (!profile) {
    return (
      <Text style={styles.errorText}>Could not load profile data.</Text>
    );
  }

  const allSexes: Sex[] = ["male", "female"];
  const allPrefs: SexPreference[] = ["male", "female", "everyone"];

  const allDatingPrefs: { value: DatingPreference; label: string }[] = [
    { value: "hookups", label: "Hookups Only" },
    { value: "situationship", label: "Situationship" },
    { value: "short_term_relationship", label: "Short-term Relationship" },
    { value: "short_term_open", label: "Short-term, open to long" },
    { value: "long_term_open", label: "Long-term, open to short" },
    { value: "long_term_relationship", label: "Long-term Relationship" },
  ];

  return (
    <ScrollView style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        value={bio}
        multiline
        onChangeText={setBio}
      />

      <Text style={styles.label}>Sex</Text>
      <View style={styles.selectorRow}>
        {allSexes.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSex(s)}
            style={[
              styles.selector,
              sex === s && styles.selectorSelected,
            ]}
          >
            <Text style={styles.selectorText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Interested In</Text>
      <View style={styles.selectorRow}>
        {allPrefs.map((pref) => (
          <TouchableOpacity
            key={pref}
            onPress={() => setSexPreference(pref)}
            style={[
              styles.selector,
              sexPreference === pref && styles.selectorSelected,
            ]}
          >
            <Text style={styles.selectorText}>{pref}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Dating Preference</Text>
      <View style={styles.selectorColumn}>
        {allDatingPrefs.map((p) => (
          <TouchableOpacity
            key={p.value}
            onPress={() => setDatingPreference(p.value)}
            style={[
              styles.selector,
              datingPreference === p.value &&
                styles.selectorSelected,
            ]}
          >
            <Text style={styles.selectorText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Photos ({photos.length}/5)</Text>

      {photos.map((uri) => (
        <View key={uri} style={styles.photoWrapper}>
          <Image source={{ uri }} style={styles.photo} />
          <Button
            title="Remove Photo"
            onPress={() => removePhoto(uri)}
            color="#e74c3c"
          />
        </View>
      ))}

      <Button
        title="Add Photo"
        onPress={addPhoto}
        disabled={photos.length >= 5}
      />

      <View style={styles.submitContainer}>
        <Button title="Save Changes" onPress={save} color="#6a0dad" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#222222" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: "#000",
  },
  bioInput: { height: 100, textAlignVertical: "top" },

  label: { color: "#fff", fontSize: 16, marginTop: 10, marginBottom: 5 },
  errorText: {
    color: "#e74c3c",
    marginVertical: 10,
    textAlign: "center",
    fontSize: 16,
  },

  selectorRow: { flexDirection: "row", marginBottom: 20 },
  selectorColumn: { flexDirection: "column", marginBottom: 20 },

  selector: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  selectorSelected: { backgroundColor: "#6a0dad" },
  selectorText: { color: "#fff" },

  photoWrapper: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  photo: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 10,
  },

  submitContainer: { marginTop: 30, marginBottom: 80 },
});
