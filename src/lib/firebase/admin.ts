/**
 * SERVER ONLY.
 *
 * Never import this file from client components, hooks, or Zustand stores.
 * Use it only inside Next.js route handlers, server actions, or other server code.
 */

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
	throw new Error(
		'Missing Firebase Admin env vars. Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.'
	);
}

const adminApp =
	getApps().length > 0
		? getApp()
		: initializeApp({
				credential: cert({
					projectId,
					clientEmail,
					privateKey,
				}),
			});

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

