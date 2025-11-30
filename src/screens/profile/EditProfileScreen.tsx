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

type Sex = "male" | "female";
type SexPreference = "male" | "female" | "everyone";

interface UserProfileData {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  sex: Sex;
  interestedInSex: SexPreference;
}

export default function EditProfileScreen({
  onDone,
}: {
  onDone: () => void;
}): React.ReactElement | null {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [interestedInSex, setInterestedInSex] =
    useState<SexPreference>("everyone");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<UserProfileData>("/me");
        if (data) {
          setProfile(data);
          setName(data.name);
          setAge(String(data.age));
          setBio(data.bio);
          setSex(data.sex);
          setInterestedInSex(data.interestedInSex);
          setPhotos(data.photos);
        }
      } catch (e) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function compress(uri: string): Promise<string> {
    const crop = await manipulateAsync(
      uri,
      [{ crop: { originX: 0, originY: 0, width: 1080, height: 1080 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    const resized = await manipulateAsync(
      crop.uri,
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
    if (res.canceled || !res.assets || res.assets.length === 0) return;

    if (photos.length >= 5) {
      setError("Maximum 5 photos allowed.");
      return;
    }

    const asset = res.assets[0];
    const compressed = await compress(asset.uri);

    const upload = await apiPost<{ uploadUrl: string; fileUrl: string }>(
      "/profiles/upload-url",
      {}
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
    if (!name || !age || !sex || !interestedInSex) {
      setError("All fields are required");
      return;
    }

    const res = await apiPost("/profiles/update", {
      name,
      age: Number(age),
      bio,
      sex,
      interestedInSex,
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
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color="#6a0dad" />
      </View>
    );
  }

  if (!profile) {
    return <Text style={localStyles.errorText}>Could not load profile data.</Text>;
  }

  const allSexes: Sex[] = ["male", "female"];
  const allPrefs: SexPreference[] = ["male", "female", "everyone"];

  return (
    <ScrollView style={localStyles.container}>
      {error && <Text style={localStyles.errorText}>{error}</Text>}

      <Text style={localStyles.label}>Name</Text>
      <TextInput
        style={localStyles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={localStyles.label}>Age</Text>
      <TextInput
        keyboardType="number-pad"
        style={localStyles.input}
        value={age}
        onChangeText={setAge}
      />

      <Text style={localStyles.label}>Bio</Text>
      <TextInput
        style={[localStyles.input, localStyles.bioInput]}
        value={bio}
        multiline
        onChangeText={setBio}
      />

      <Text style={localStyles.label}>Sex</Text>
      <View style={localStyles.selectorRow}>
        {allSexes.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSex(s)}
            style={[localStyles.selector, sex === s && localStyles.selectorSelected]}
          >
            <Text style={localStyles.selectorText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={localStyles.label}>Interested In</Text>
      <View style={localStyles.selectorRow}>
        {allPrefs.map((pref) => (
          <TouchableOpacity
            key={pref}
            onPress={() => setInterestedInSex(pref)}
            style={[
              localStyles.selector,
              interestedInSex === pref && localStyles.selectorSelected,
            ]}
          >
            <Text style={localStyles.selectorText}>{pref}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={localStyles.label}>Photos ({photos.length} / 5)</Text>
      {photos.map((uri) => (
        <View key={uri} style={localStyles.photoWrapper}>
          <Image
            source={{ uri }}
            style={localStyles.photo}
          />
          <Button title="Remove Photo" onPress={() => removePhoto(uri)} color="#e74c3c" />
        </View>
      ))}

      <Button title="Add Photo" onPress={addPhoto} disabled={photos.length >= 5} />

      <View style={localStyles.submitContainer}>
        <Button title="Save Changes" onPress={save} color="#6a0dad" />
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: "#000",
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    color: "#e74c3c",
    marginVertical: 10,
    textAlign: "center",
    fontSize: 16,
  },
  selectorRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  selector: {
    padding: 10,
    marginRight: 10,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  selectorSelected: {
    backgroundColor: "#6a0dad",
  },
  selectorText: {
    color: "#fff",
  },
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
  submitContainer: {
    marginTop: 30,
    marginBottom: 50,
  },
});