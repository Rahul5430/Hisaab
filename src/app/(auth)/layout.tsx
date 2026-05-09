'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/auth.store';

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const loading = useAuthStore((s) => s.loading);

	useEffect(() => {
		if (loading) return;
		if (!user) return;
		if (user.onboardingCompleted) {
			router.replace('/home');
		} else {
			router.replace('/onboarding');
		}
	}, [loading, user, router]);

	if (!loading && user) return null;

	return <>{children}</>;
}
