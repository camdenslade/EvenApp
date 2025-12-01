// backend/src/firebase/firebase.module.ts
import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirestoreService } from './firestore.service';
import * as serviceAccount from '../../serviceAccountKey.json';

const firebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: () => {
    const adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    adminApp.firestore().settings({ ignoreUndefinedProperties: true });

    return adminApp;
  },
};

@Module({
  providers: [FirestoreService, firebaseAdminProvider],
  exports: [FirestoreService],
})
export class FirebaseModule {}
