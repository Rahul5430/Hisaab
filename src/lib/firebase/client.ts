'use client';

import { type FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
	enableIndexedDbPersistence,
	type Firestore,
	getFirestore,
} from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export const app: FirebaseApp = getApps().length
	? getApp()
	: initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

let persistenceInitAttempted = false;

if (!persistenceInitAttempted) {
	persistenceInitAttempted = true;
	enableIndexedDbPersistence(db).catch(() => {
		// Safe to ignore: persistence can fail in private mode or multi-tab scenarios.
	});
}
