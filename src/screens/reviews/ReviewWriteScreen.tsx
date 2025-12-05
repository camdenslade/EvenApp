// src/screens/reviews/ReviewWriteScreen.tsx

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { apiPost } from '../../services/apiService';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';

type ReviewType = 'normal' | 'emergency' | 'report';

type ReviewWriteNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'ReviewWrite'>;

type ReviewWriteRouteProp =
  RouteProp<RootStackParamList, 'ReviewWrite'>;

interface Props {
  navigation: ReviewWriteNavigationProp;
  route: ReviewWriteRouteProp;
}

interface ReviewResponse {
  id?: string;
  error?: string;
}

export default function ReviewWriteScreen({ navigation, route }: Props) {
  const { targetId } = route.params;

  const auth = getAuth();
  const reviewerUid = auth.currentUser?.uid ?? null;

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [type, setType] = useState<ReviewType>('normal');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reviewerUid) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }
    if (!rating) {
      Alert.alert('Error', 'Please select a rating.');
      return;
    }
    if (comment.trim().length < 2) {
      Alert.alert('Error', 'Comment must be at least 2 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        reviewerUid,
        targetUid: targetId,
        rating,
        comment,
        type,
      };

      const res = await apiPost<ReviewResponse>('/reviews', payload);

      if (!res) {
        Alert.alert('Error', 'No response from server.');
        return;
      }

      if (res.error) {
        Alert.alert('Error', res.error);
        return;
      }

      Alert.alert('Success', 'Your review has been submitted.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <Text style={styles.title}>Write a Review</Text>

      <Text style={styles.label}>Select Rating</Text>
      <View style={styles.ratingRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.ratingCircle,
              rating === num && styles.ratingCircleActive,
            ]}
            onPress={() => setRating(num)}
          >
            <Text
              style={[
                styles.ratingText,
                rating === num && { color: '#000' },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Comment</Text>
      <TextInput
        style={styles.textBox}
        placeholder="Write your experience…"
        placeholderTextColor="#777"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <Text style={styles.label}>Review Type</Text>
      <View style={styles.typeRow}>
        {(['normal', 'emergency', 'report'] as ReviewType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.typeButton,
              type === t && styles.typeButtonActive,
            ]}
            onPress={() => setType(t)}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === t && styles.typeButtonTextActive,
              ]}
            >
              {t === 'normal'
                ? 'Normal'
                : t === 'emergency'
                ? 'Emergency'
                : 'Report'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.5 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Submitting…' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const COLORS = {
  bg: '#222',
  surface: '#1a1a1a',
  white: '#fff',
  muted: '#777',
  primary: '#fff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ratingCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingCircleActive: {
    backgroundColor: COLORS.white,
  },
  ratingText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  textBox: {
    backgroundColor: COLORS.surface,
    color: COLORS.white,
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  typeButtonActive: {
    backgroundColor: COLORS.white,
  },
  typeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#000',
  },
  submitButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 40,
  },
  submitText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});
