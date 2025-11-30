// backend/src/firebase/firebase.module.ts
import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirestoreService } from './firestore.service';

@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
          });
        }
        return admin;
      },
    },
    FirestoreService,
  ],
  exports: ['FIREBASE_ADMIN', FirestoreService],
})
export class FirebaseModule {}
