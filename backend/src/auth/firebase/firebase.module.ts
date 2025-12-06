// backend/src/auth/firebase/firebase.module.ts

import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

// ====================================================================
// # FIREBASE MODULE (GLOBAL)
// ====================================================================
//
// Provides a globally available Firebase Admin SDK instance.
// Ensures the app initializes only once.
// Exported as 'FIREBASE_ADMIN' for use in guards and services.
//

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
        }
        return admin;
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
