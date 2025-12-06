// backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';

// Modules ---------------------------------------------------------------
import { FirebaseModule } from './firebase/firebase.module';

// ====================================================================
// # AUTH MODULE
// ====================================================================
//
// Wraps the Firebase authentication integration.
// Other modules (Users, Reviews, Chat, etc.) rely on Firebase guards
// to authenticate incoming requests.
//

@Module({
  imports: [FirebaseModule],
})
export class AuthModule {}
