import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Picker } from "@react-native-picker/picker";
import { apiPost } from "../../services/apiService";
import { useNavigation } from "@react-navigation/native";

const interestsList = [
  "Photography", "Shopping", "Karaoke", "Yoga", "Cooking",
  "Tennis", "Run", "Swimming", "Art", "Traveling",
  "Extreme", "Music", "Drink", "Video games",
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // -------------------------------
  // BIRTHDAY PICKER (3 Wheels)
  // -------------------------------
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(currentYear - 18);

  const birthday = new Date(selectedYear, selectedMonth - 1, selectedDay);

  const [gender, setGender] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // IMAGE UPLOAD
  // -------------------------------
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

  // -------------------------------
  // INTERESTS
  //-------------------------------
  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((p) => p !== i) : [...prev, i]
    );
  }

  // -------------------------------
  // SUBMIT PROFILE
  //-------------------------------
  async function handleSubmit() {
    setError(null);

    if (!firstName || !lastName || !gender) {
      setError("Please complete all required fields.");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const uri of photos) {
      if (!uri) continue;

      const signed = await apiPost<{ uploadUrl: string; fileUrl: string }>(
        "/profiles/upload-url",
        {}
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

    const result = await apiPost("/profiles/setup", {
      name: `${firstName} ${lastName}`.trim(),
      age: currentYear - birthday.getFullYear(),
      sex: gender,
      interestedInSex: gender === "Man" ? "female" : "male",
      bio: "",
      photos: uploadedUrls,
      interests,
    });

    if (!result) {
      setError("Profile setup failed.");
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: "Swipe" }] });
  }

  // -------------------------------
  // STEP 1
  //-------------------------------
  if (step === 1) {
    return (
      <ScrollView style={styles.screen}>
        <TouchableOpacity style={styles.skip} onPress={() => navigation.navigate("Swipe")}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <Text style={styles.header}>Profile details</Text>

        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor="#aaa"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor="#aaa"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Birthday</Text>

        <View style={styles.birthdayWrapper}>
          {/* MONTH */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              dropdownIconColor="black"
              onValueChange={(v) => setSelectedMonth(v)}
            >
              {months.map((m, idx) => (
                <Picker.Item key={idx} label={m} value={idx + 1} />
              ))}
            </Picker>
          </View>

          {/* DAY */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedDay}
              style={styles.picker}
              dropdownIconColor="black"
              onValueChange={(v) => setSelectedDay(v)}
            >
              {days.map((d) => (
                <Picker.Item key={d} label={String(d)} value={d} />
              ))}
            </Picker>
          </View>

          {/* YEAR */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              dropdownIconColor="black"
              onValueChange={(v) => setSelectedYear(v)}
            >
              {years.map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(2)}>
          <Text style={styles.mainButtonText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // -------------------------------
  // STEP 2
  //-------------------------------
  if (step === 2) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => setStep(1)}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skip} onPress={() => setStep(3)}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <Text style={styles.header}>I am a</Text>

        {["Woman", "Man", "Choose another"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderOption,
              gender === g ? styles.genderSelected : null,
            ]}
            onPress={() => setGender(g)}
          >
            <Text
              style={[
                styles.genderText,
                gender === g ? styles.genderTextSelected : null,
              ]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.mainButton} onPress={() => setStep(3)}>
          <Text style={styles.mainButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------
  // STEP 3
  //-------------------------------
  return (
    <ScrollView style={styles.screen}>
      <TouchableOpacity style={styles.back} onPress={() => setStep(2)}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skip} onPress={handleSubmit}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your interests</Text>
      <Text style={styles.subheader}>Select a few of your interests</Text>

      <View style={styles.interestGrid}>
        {interestsList.map((i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.interestChip,
              interests.includes(i) ? styles.interestChipSelected : null,
            ]}
            onPress={() => toggleInterest(i)}
          >
            <Text
              style={[
                styles.interestChipText,
                interests.includes(i) ? styles.interestChipTextSelected : null,
              ]}
            >
              {i}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={handleSubmit}>
        <Text style={styles.mainButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// -------------------------------
// STYLES
// -------------------------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#222222",
    padding: 24,
  },

  label: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    marginTop: 20,
    marginBottom: 8,
  },

  skip: { position: "absolute", top: 20, right: 20 },
  skipText: { color: "white", fontSize: 16 },

  back: { position: "absolute", top: 20, left: 20 },
  backText: { fontSize: 26, color: "white" },

  header: {
    fontSize: 30,
    fontWeight: "600",
    color: "white",
    marginTop: 70,
    marginBottom: 20,
  },

  subheader: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },

  // BIRTHDAY PICKER
  birthdayWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  pickerContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 4,
    paddingHorizontal: 6,
  },

  picker: {
    height: 52,
    color: "black",
  },

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
    color: "#222222",
    fontSize: 18,
    fontWeight: "600",
  },

  genderOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    marginBottom: 12,
  },

  genderSelected: {
    backgroundColor: "#222222",
  },

  genderText: {
    fontSize: 18,
    color: "#444",
  },

  genderTextSelected: {
    color: "white",
  },

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

  interestChipSelected: {
    backgroundColor: "#222222",
    borderColor: "#222222",
  },

  interestChipText: { fontSize: 14, color: "#ccc" },

  interestChipTextSelected: {
    color: "white",
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
