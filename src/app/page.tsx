'use client';

import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/store/auth.store';

export default function RootPage() {
	const hasRedirected = useRef(false);
	const user = useAuthStore((s) => s.user);
	const loading = useAuthStore((s) => s.loading);

	useEffect(() => {
		if (loading) return;
		if (hasRedirected.current) return;
		hasRedirected.current = true;

		if (!user) {
			window.location.replace('/signin');
			return;
		}
		if (!user.onboardingCompleted) {
			window.location.replace('/onboarding');
			return;
		}
		window.location.replace('/home');
	}, [loading, user]);

	return null;
}
