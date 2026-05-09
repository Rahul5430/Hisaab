'use client';

import {
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signOut as firebaseSignOut,
	type User as FirebaseUser,
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { auth } from '@/lib/firebase/client';
import { createUser, getUser } from '@/lib/repositories/users.repository';
import type { UserSchema } from '@/lib/validators/user.schema';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

function buildUserDoc(firebaseUser: FirebaseUser): UserSchema {
	const now = Timestamp.now();

	return {
		uid: firebaseUser.uid,
		email: firebaseUser.email ?? '',
		displayName: firebaseUser.displayName ?? '',
		photoURL: firebaseUser.photoURL ?? '',
		monthlyIncome: 0,
		incomeCurrency: 'INR',
		onboardingCompleted: false,
		preferences: {
			defaultVisibility: 'personal',
			defaultCurrency: 'INR',
			theme: 'system',
			notificationsEnabled: true,
		},
		pushSubscriptions: [],
		createdAt: now,
		updatedAt: now,
	};
}

export function useAuth() {
	const user = useAuthStore((s) => s.user);
	const loading = useAuthStore((s) => s.loading);
	const setUser = useAuthStore((s) => s.setUser);
	const setLoading = useAuthStore((s) => s.setLoading);
	const clearUser = useAuthStore((s) => s.clearUser);

	const provider = useMemo(() => new GoogleAuthProvider(), []);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (!firebaseUser) {
					clearUser();
					setLoading(false);
					return;
				}

				const existing = await getUser(firebaseUser.uid);
				if (!existing) {
					const created = buildUserDoc(firebaseUser);
					await createUser(created);
					setUser(created);
					setLoading(false);
					return;
				}

				setUser(existing);
				setLoading(false);
			} catch {
				clearUser();
				setLoading(false);
				toast.error('Failed to load your account. Please try again.');
			}
		});

		return () => unsubscribe();
	}, [clearUser, setLoading, setUser]);

	const signInWithGoogle = useCallback(async () => {
		setLoading(true);
		try {
			const res = await signInWithPopup(auth, provider);
			const firebaseUser = res.user;

			const existing = await getUser(firebaseUser.uid);
			if (existing) {
				setUser(existing);
				setLoading(false);
				return { isNewUser: false as const };
			}

			const created = buildUserDoc(firebaseUser);
			await createUser(created);
			setUser(created);
			setLoading(false);
			return { isNewUser: true as const };
		} catch {
			setLoading(false);
			toast.error('Google sign-in failed. Please try again.');
			throw new Error('Google sign-in failed');
		}
	}, [provider, setLoading, setUser]);

	const signOut = useCallback(async () => {
		setLoading(true);
		try {
			await firebaseSignOut(auth);
			clearUser();
			useUIStore.getState().reset();
			setLoading(false);
		} catch {
			setLoading(false);
			toast.error('Failed to sign out. Please try again.');
		}
	}, [clearUser, setLoading]);

	return { user, loading, signInWithGoogle, signOut };
}
