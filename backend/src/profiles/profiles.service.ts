import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firebase/firestore.service';
import type { SetupProfileData } from './types/setup-profile';
import type { UpdateProfileData } from './types/update-profile';
import {
  CollectionReference,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

type Sex = 'male' | 'female';
type SexPreference = 'male' | 'female' | 'everyone';

interface UserData {
  name: string;
  age: number;
  sex: Sex;
  interestedInSex: SexPreference;
  bio: string;
  photos: string[];
  [key: string]: unknown;
}

export interface Profile extends UserData {
  id: string;
}

@Injectable()
export class ProfilesService {
  constructor(private firestore: FirestoreService) {}

  async getQueue(uid: string): Promise<Profile[]> {
    const usersRef: CollectionReference<UserData> =
      this.firestore.collection('users');

    const viewerDoc = await usersRef.doc(uid).get();
    if (!viewerDoc.exists) return [];
    const viewer = viewerDoc.data() as UserData;

    const swipeSnapshot = await this.firestore
      .collection('swipes')
      .doc(uid)
      .collection('targets')
      .get();

    const swiped = new Set<string>();
    swipeSnapshot.forEach((d) => swiped.add(d.id));

    const matchSnapshot = await this.firestore
      .collection('matches')
      .where('users', 'array-contains', uid)
      .get();

    const matched = new Set<string>();
    matchSnapshot.forEach((m) => {
      const ids = m.data().users as string[];
      const other = ids.find((id) => id !== uid);
      if (other) matched.add(other);
    });

    const allUsers: QuerySnapshot<UserData> = await usersRef.get();
    const results: Profile[] = [];

    allUsers.forEach((doc: QueryDocumentSnapshot<UserData>) => {
      const tid = doc.id;
      if (tid === uid) return;
      if (swiped.has(tid)) return;
      if (matched.has(tid)) return;

      const data = doc.data();
      if (!data.name || !data.age) return;
      if (!data.sex || !data.interestedInSex) return;
      if (!Array.isArray(data.photos) || data.photos.length < 3) return;

      const viewerPref =
        viewer.interestedInSex === 'everyone' ||
        viewer.interestedInSex === data.sex;

      const targetPref =
        data.interestedInSex === 'everyone' ||
        data.interestedInSex === viewer.sex;

      if (!viewerPref || !targetPref) return;

      results.push({ id: tid, ...data });
    });

    return results.sort(() => Math.random() - 0.5).slice(0, 20);
  }

  async setupProfile(uid: string, data: SetupProfileData) {
    await this.firestore.collection('users').doc(uid).set(data);
    await this.firestore
      .collection('profiles')
      .doc(uid)
      .set({
        name: data.name,
        profileImageUrl: data.photos[0] ?? '',
      });

    return { success: true };
  }

  async updateProfile(uid: string, data: UpdateProfileData) {
    const userRef = this.firestore.collection('users').doc(uid);
    await userRef.set(data, { merge: true });

    if (data.photos && data.photos.length > 0) {
      await this.firestore.collection('profiles').doc(uid).set(
        {
          name: data.name,
          profileImageUrl: data.photos[0],
        },
        { merge: true },
      );
    }

    return { success: true };
  }

  async checkProfileCompletion(uid: string): Promise<boolean> {
    const userDoc = await this.firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return false;
    }
    const userData = userDoc.data();
    if (!userData) {
      return false;
    }
    return userData && userData.profileComplete === true;
  }
}
