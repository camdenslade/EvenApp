import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService {
  private db: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private adminApp: typeof admin) {
    this.db = adminApp.firestore();
  }

  collection<T = FirebaseFirestore.DocumentData>(name: string) {
    return this.db.collection(name) as FirebaseFirestore.CollectionReference<T>;
  }

  doc<T = FirebaseFirestore.DocumentData>(path: string) {
    return this.db.doc(path) as FirebaseFirestore.DocumentReference<T>;
  }

  get raw() {
    return this.db;
  }
}
