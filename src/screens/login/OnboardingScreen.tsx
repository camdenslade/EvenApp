import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { apiPost } from "../../services/apiService";
import { useNavigation } from "@react-navigation/native";

const sexes = ["male", "female"] as const;
type Sex = typeof sexes[number];

const sexPreferences = ["male", "female", "everyone"] as const;
type SexPreference = typeof sexPreferences[number];

export default function OnboardingScreen(): React.ReactElement {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [interestedInSex, setInterestedInSex] =
    useState<SexPreference | null>(null);
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function compress(uri: string): Promise<string> {
    const resized = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    return resized.uri;
  }

  async function pickPhotos(): Promise<void> {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (res.canceled) return;
    if (photos.length + res.assets.length > 5) {
      setError("You may upload at most 5 photos.");
      return;
    }

    const processed: string[] = [];
    for (const asset of res.assets) {
      processed.push(await compress(asset.uri));
    }
    setPhotos((prev) => [...prev, ...processed]);
  }

  async function handleSubmit(): Promise<void> {
    setError(null);

    if (!name || !age || !sex || !interestedInSex) {
      setError("All fields are required.");
      return;
    }

    if (photos.length < 3) {
      setError("You must upload at least 3 photos.");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const localUri of photos) {
      const signed = await apiPost<{ uploadUrl: string; fileUrl: string }>(
        "/profiles/upload-url",
        {}
      );

      if (!signed) {
        setError("Failed to fetch upload URL.");
        return;
      }

      const blob = await (await fetch(localUri)).blob();

      await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      uploadedUrls.push(signed.fileUrl);
    }

    const result = await apiPost("/profiles/setup", {
      name,
      age: Number(age),
      sex,
      interestedInSex,
      bio,
      photos: uploadedUrls,
    });

    if (!result) {
      setError("Profile setup failed.");
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create Your Profile</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.label}>Sex</Text>
      <View style={styles.row}>
        {sexes.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.selector, sex === s ? styles.selected : null]}
            onPress={() => setSex(s)}
          >
            <Text style={styles.selectorText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Interested In</Text>
      <View style={styles.row}>
        {sexPreferences.map((pref) => (
          <TouchableOpacity
            key={pref}
            style={[
              styles.selector,
              interestedInSex === pref ? styles.selected : null,
            ]}
            onPress={() => setInterestedInSex(pref)}
          >
            <Text style={styles.selectorText}>{pref}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        multiline
        value={bio}
        onChangeText={setBio}
      />

      <Text style={styles.label}>Photos (3–5)</Text>
      <View style={styles.photoGrid}>
        {photos.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.photo} />
        ))}
      </View>

      <Button title="Add Photos" onPress={pickPhotos} />

      <View style={styles.submitWrapper}>
        <Button title="Finish" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "black", flex: 1 },
  header: { color: "white", fontSize: 28, marginBottom: 20 },
  label: { color: "white", marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: "white", padding: 10, borderRadius: 8 },
  bioInput: { height: 120, textAlignVertical: "top" },
  row: { flexDirection: "row", marginBottom: 10 },
  selector: {
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 8,
    marginRight: 8,
  },
  selected: { backgroundColor: "#3498db" },
  selectorText: { color: "white" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
  photo: { width: 100, height: 100, marginRight: 10, marginBottom: 10 },
  error: { color: "red", marginVertical: 10 },
  submitWrapper: { marginTop: 40, marginBottom: 100 },
});
