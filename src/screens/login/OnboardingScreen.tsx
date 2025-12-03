// src/screens/login/OnboardingScreen.tsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { apiGet, apiPost } from "../../services/apiService";
import { BirthdayPicker } from "../../components/BirthdayPicker";

const interestsList = [
  "Photography", "Shopping", "Karaoke", "Yoga", "Cooking",
  "Tennis", "Run", "Swimming", "Art", "Traveling",
  "Extreme", "Music", "Drink", "Video games",
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  const [name, setName] = useState("");

  const currentYear = new Date().getFullYear();
  const [birthday, setBirthday] = useState({
    year: currentYear - 18,
    month: 0,
    day: 1,
  });

  const [sex, setSex] = useState<"male" | "female" | null>(null);
  const [interestedInSex, setInterestedInSex] = useState<
    "male" | "female" | "everyone" | null
  >(null);

  const [datingPreference, setDatingPreference] = useState<
    | "hookups"
    | "situationship"
    | "short_term_relationship"
    | "short_term_open"
    | "long_term_open"
    | "long_term_relationship"
  >("short_term_relationship");

  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<(string | null)[]>([
    null, null, null, null, null, null,
  ]);

  const [error, setError] = useState<string | null>(null);

  async function compress(uri: string): Promise<string> {
    const resized = await manipulateAsync(uri, [{ resize: { width: 1080 } }], {
      compress: 0.7,
      format: SaveFormat.JPEG,
    });
    return resized.uri;
  }

  async function pickPhoto(index: number) {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (res.canceled) return;

    const uri = await compress(res.assets[0].uri);

    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = uri;
      return updated;
    });
  }

  const toggleInterest = (i: string) => {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  async function handleSubmit() {
    setError(null);

    if (!sex) {
      setError("Select your sex.");
      return;
    }
    if (!interestedInSex) {
      setError("Select who you're interested in.");
      return;
    }

    const realPhotos = photos.filter((p) => p !== null);
    if (realPhotos.length < 1) {
      setError("At least one photo required.");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const uri of realPhotos) {
      if (!uri) continue;

      const signed = await apiGet<{ uploadUrl: string; fileUrl: string }>(
        "/profiles/upload-url?fileType=image/jpeg"
      );

      if (!signed) {
        setError("Photo upload failed.");
        return;
      }

      const blob = await (await fetch(uri)).blob();

      await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      uploadedUrls.push(signed.fileUrl);
    }

    const today = new Date();
    const birth = new Date(birthday.year, birthday.month, birthday.day);

    let age = today.getFullYear() - birth.getFullYear();
    const mdiff = today.getMonth() - birth.getMonth();
    if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const payload = {
      name: name.trim(),
      age,
      bio,
      sex,
      interestedInSex,
      datingPreference,
      interests,
      photos: uploadedUrls,
    };

    const res = await apiPost("/profiles/setup", payload);
    if (!res) {
      setError("Setup failed");
      return;
    }

    onComplete();
  }

  if (step === 1) {
    return (
      <ScrollView style={styles.screen}>
        <Text style={styles.header}>Welcome! We just need a few things.</Text>

        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Birthday</Text>

        <BirthdayPicker value={birthday} onChange={setBirthday} />

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(2)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => setStep(1)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>I am</Text>

        {["male", "female"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderOption, sex === g && styles.genderSelected]}
            onPress={() => setSex(g as "male" | "female")}
          >
            <Text
              style={[
                styles.genderText,
                sex === g && styles.genderTextSelected,
              ]}
            >
              {g === "male" ? "Male" : "Female"}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(3)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => setStep(2)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>I'm interested in</Text>

        {["male", "female", "everyone"].map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.genderOption,
              interestedInSex === opt && styles.genderSelected,
            ]}
            onPress={() => setInterestedInSex(opt as any)}
          >
            <Text
              style={[
                styles.genderText,
                interestedInSex === opt && styles.genderTextSelected,
              ]}
            >
              {opt === "male"
                ? "Men"
                : opt === "female"
                ? "Women"
                : "Everyone"}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(4)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 4) {
    const prefs = [
      { value: "hookups", label: "Hookups" },
      { value: "situationship", label: "Situationship" },
      { value: "short_term_relationship", label: "Short-term Relationship" },
      { value: "short_term_open", label: "Short-term, open to long" },
      { value: "long_term_open", label: "Long-term, open to short" },
      { value: "long_term_relationship", label: "Long-term Relationship" },
    ];

    return (
      <ScrollView style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => setStep(3)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Dating preference</Text>

        {prefs.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.genderOption,
              datingPreference === p.value && styles.genderSelected,
            ]}
            onPress={() => setDatingPreference(p.value as any)}
          >
            <Text
              style={[
                styles.genderText,
                datingPreference === p.value && styles.genderTextSelected,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(5)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 5) {
    return (
      <ScrollView style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => setStep(4)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Your interests</Text>

        <View style={styles.interestGrid}>
          {interestsList.map((i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.interestChip,
                interests.includes(i) && styles.interestChipSelected,
              ]}
              onPress={() => toggleInterest(i)}
            >
              <Text
                style={[
                  styles.interestChipText,
                  interests.includes(i) && styles.interestChipTextSelected,
                ]}
              >
                {i}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(6)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (step === 6) {
    return (
      <ScrollView style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => setStep(5)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Who you are.</Text>

        <TextInput
          style={styles.bioInput}
          placeholder="Write something about yourself…"
          placeholderTextColor="#888"
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(7)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => setStep(6)}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Add photos</Text>
      <Text style={styles.subheader}>At least one required</Text>

      <View style={styles.photoGrid}>
        {photos.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.photoBox}
            onPress={() => pickPhoto(idx)}
          >
            {p ? (
              <Image source={{ uri: p }} style={styles.photo} />
            ) : (
              <Text style={styles.addPhotoText}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.mainButton} onPress={handleSubmit}>
        <Text style={styles.mainButtonText}>Finish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#222222", padding: 24 },
  back: { position: "absolute", top: 20, left: 20 },
  backText: { fontSize: 26, color: "white" },

  header: { fontSize: 30, fontWeight: "700", color: "white", marginTop: 70, marginBottom: 20 },
  subheader: { fontSize: 16, color: "#aaa", marginBottom: 10 },

  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "black",
  },

  mainButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 30,
    marginTop: 40,
    alignItems: "center",
    marginBottom: 40,
  },
  mainButtonText: {
    color: "#222",
    fontSize: 18,
    fontWeight: "600",
  },

  genderOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    marginBottom: 12,
  },
  genderSelected: { backgroundColor: "#222" },
  genderText: { fontSize: 18, color: "#444" },
  genderTextSelected: { color: "white" },

  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 20,
  },
  interestChip: {
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 6,
  },
  interestChipSelected: { backgroundColor: "#fff", borderColor: "#fff" },
  interestChipText: { fontSize: 14, color: "#ccc" },
  interestChipTextSelected: { color: "black" },

  bioInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: "#000",
  },

  photoGrid: { flexDirection: "row", flexWrap: "wrap" },
  photoBox: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#333",
    margin: "1.6%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
  fontSize: 18,
  fontWeight: "500",
  color: "white",
  marginTop: 20,
  marginBottom: 8,
  },
  photo: { width: "100%", height: "100%", borderRadius: 10 },
  addPhotoText: { color: "#fff", fontSize: 40, fontWeight: "300" },

  error: { color: "red", marginTop: 12, textAlign: "center" },
});
