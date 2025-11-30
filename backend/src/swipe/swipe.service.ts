import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firebase/firestore.service';
import { DocumentSnapshot, DocumentReference } from 'firebase-admin/firestore'; // FIX: Single line import

type SwipeAction = 'LIKE' | 'SKIP' | 'SUPER_LIKE';

interface ProfileData {
  name?: string;
  profileImageUrl?: string;
  [key: string]: unknown;
}

interface MatchRecord {
  id: string;
  matchedAt: Date;
  users: [string, string];
  userA: { id: string; name?: string; profileImageUrl?: string };
  userB: { id: string; name?: string; profileImageUrl?: string };
}

interface MatchUsersData {
  users: string[];
}

@Injectable()
export class SwipeService {
  constructor(private firestore: FirestoreService) {}

  async handleSwipe(userId: string, targetId: string, action: SwipeAction) {
    await this.saveSwipe(userId, targetId, action);

    if (action === 'SKIP') {
      return {
        status: 'ERROR',
        errorMessage: 'Profile skipped',
        targetProfileId: targetId,
      };
    }

    const reverse = await this.getReverseSwipe(targetId, userId);
    const isMatch = reverse === 'LIKE' || reverse === 'SUPER_LIKE';

    if (isMatch) {
      const match = await this.createMatch(userId, targetId);
      return {
        status: 'MATCH_FOUND',
        newMatch: match,
        targetProfileId: targetId,
      };
    }

    return {
      status: 'IDLE',
      currentProfile: null,
    };
  }

  private async saveSwipe(
    userId: string,
    targetId: string,
    action: SwipeAction,
  ): Promise<void> {
    await this.firestore
      .collection('swipes')
      .doc(userId)
      .collection('targets')
      .doc(targetId)
      .set({
        action,
        timestamp: new Date(),
      });
  }

  private async getReverseSwipe(
    targetId: string,
    userId: string,
  ): Promise<SwipeAction | null> {
    const doc = (await this.firestore
      .collection('swipes')
      .doc(targetId)
      .collection('targets')
      .doc(userId)
      .get()) as DocumentSnapshot<{ action: SwipeAction }>;

    if (!doc.exists) return null;
    return doc.data()?.action ?? null;
  }

  private async createMatch(a: string, b: string) {
    const existing = await this.firestore
      .collection('matches')
      .where('users', 'array-contains', a)
      .get();

    let already = false;
    existing.forEach((m) => {
      const data = m.data() as MatchUsersData;
      if (data.users.includes(b)) already = true;
    });

    if (already) {
      const doc: DocumentSnapshot<ProfileData> = (await this.firestore
        .collection('profiles')
        .doc(b)
        .get()) as DocumentSnapshot<ProfileData>;

      return {
        id: '',
        matchedAt: new Date(),
        otherUser: {
          id: b,
          name: doc.data()?.name,
          profileImageUrl: doc.data()?.profileImageUrl,
        },
      };
    }

    const ref = this.firestore
      .collection('matches')
      .doc() as DocumentReference<MatchRecord>;

    const aData = (await this.firestore
      .collection('profiles') // FIX: Multiline formatting
      .doc(a)
      .get()) as DocumentSnapshot<ProfileData>;

    const bData = (await this.firestore
      .collection('profiles')
      .doc(b)
      .get()) as DocumentSnapshot<ProfileData>;

    const record: MatchRecord = {
      id: ref.id,
      matchedAt: new Date(),
      users: [a, b] as [string, string],
      userA: {
        id: a,
        name: aData.data()?.name,
        profileImageUrl: aData.data()?.profileImageUrl,
      },
      userB: {
        id: b,
        name: bData.data()?.name,
        profileImageUrl: bData.data()?.profileImageUrl,
      },
    };

    await ref.set(record);

    return {
      id: record.id,
      matchedAt: record.matchedAt,
      otherUser: record.userB,
    };
  }
}
