import {
	arrayUnion,
	doc,
	getDoc,
	setDoc,
	Timestamp,
	updateDoc,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { type UserSchema, userSchema } from '@/lib/validators/user.schema';

const usersCollection = 'users' as const;

export async function getUser(uid: string): Promise<UserSchema | null> {
	const ref = doc(db, usersCollection, uid);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	return userSchema.parse(snap.data());
}

export async function createUser(user: UserSchema): Promise<void> {
	const ref = doc(db, usersCollection, user.uid);
	await setDoc(ref, user, { merge: false });
}

export async function updateUser(
	uid: string,
	data: Partial<UserSchema>
): Promise<void> {
	const ref = doc(db, usersCollection, uid);
	await updateDoc(ref, {
		...data,
		updatedAt: Timestamp.now(),
	});
}

export async function updatePushSubscription(
	uid: string,
	subscription: object
): Promise<void> {
	const ref = doc(db, usersCollection, uid);
	await updateDoc(ref, {
		pushSubscriptions: arrayUnion(subscription),
		updatedAt: Timestamp.now(),
	});
}
