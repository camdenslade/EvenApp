import { Injectable } from '@nestjs/common';
import { FirestoreService } from '../firebase/firestore.service';
import type { Timestamp } from 'firebase-admin/firestore';

interface MatchData {
  users: string[];
  matchedAt: Timestamp;
}

interface UserProfile {
  name: string;
  profileImageUrl: string;
  [key: string]: any;
}

@Injectable()
export class MatchesService {
  constructor(private readonly firestore: FirestoreService) {}

  async getMatches(currentUserId: string) {
    const querySnapshot = await this.firestore
      .collection('matches')
      .where('users', 'array-contains', currentUserId)
      .get();

    if (querySnapshot.empty) {
      return [];
    }

    const otherUserIds: string[] = [];
    const matchMetadata: { [key: string]: { id: string; matchedAt: Date } } =
      {};

    querySnapshot.docs.forEach((doc) => {
      const matchData = doc.data() as MatchData;
      const otherUserId = matchData.users.find(
        (id: string) => id !== currentUserId,
      );

      if (otherUserId) {
        otherUserIds.push(otherUserId);
        matchMetadata[otherUserId] = {
          id: doc.id,
          matchedAt: matchData.matchedAt.toDate(),
        };
      }
    });

    if (otherUserIds.length === 0) {
      return [];
    }

    const profilesSnapshot = await this.firestore
      .collection('users')
      .where('uid', 'in', otherUserIds.slice(0, 10))
      .get();

    const usersMap = new Map<string, UserProfile>();
    profilesSnapshot.docs.forEach((doc) => {
      usersMap.set(doc.id, doc.data() as UserProfile);
    });

    const matches = otherUserIds
      .map((userId) => {
        const userProfile = usersMap.get(userId);

        if (userProfile) {
          return {
            matchId: matchMetadata[userId].id,
            matchedAt: matchMetadata[userId].matchedAt,
            otherUser: {
              uid: userId,
              name: userProfile.name,
              profileImageUrl: userProfile.profileImageUrl,
            },
          };
        }
        return null;
      })
      .filter((match) => match !== null);

    return matches;
  }
}
