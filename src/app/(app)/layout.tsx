'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { AddExpenseSheet } from '@/components/features/expenses/AddExpenseSheet';
import {
	AppShellProvider,
	useAppShell,
} from '@/components/providers/AppShellContext';
import { BottomNav } from '@/components/shared/BottomNav';
import { Fab } from '@/components/shared/FAB';
import { ProfileStack } from '@/components/shared/ProfileStack';
import { TopBar } from '@/components/shared/TopBar';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const router = useRouter();
	const pathname = usePathname();
	const hasRedirected = useRef(false);
	const user = useAuthStore((s) => s.user);
	const loading = useAuthStore((s) => s.loading);

	useEffect(() => {
		if (loading) return;
		if (hasRedirected.current) return;

		if (!user) {
			hasRedirected.current = true;
			router.replace('/signin');
			return;
		}
		if (!user.onboardingCompleted) {
			hasRedirected.current = true;
			router.replace('/onboarding');
		}
	}, [loading, user, router]);

	// 1. Onboarding path — render without chrome regardless of auth state
	// The onboarding page handles its own auth guard internally
	if (pathname === '/onboarding') {
		return (
			<div className='min-h-dvh bg-[--color-background]'>
				<div className='relative mx-auto min-h-dvh w-full max-w-107.5 bg-background'>
					{children}
				</div>
			</div>
		);
	}

	// 2. Still loading auth state
	if (loading) return <AppShellSkeleton pathname={pathname} />;

	// 3. No user — redirect is in flight
	if (!user) return <AppShellSkeleton pathname={pathname} />;

	// 4. Onboarding not complete — redirect is in flight
	if (!user.onboardingCompleted)
		return <AppShellSkeleton pathname={pathname} />;

	// 5. Fully authenticated and onboarded — render app shell
	return (
		<AppShellProvider>
			<AppShellFrame pathname={pathname}>{children}</AppShellFrame>
		</AppShellProvider>
	);
}

function AppShellSkeleton({ pathname }: Readonly<{ pathname: string }>) {
	if (pathname === '/onboarding') {
		return (
			<div className='min-h-dvh bg-[--color-background]'>
				<div className='relative mx-auto min-h-dvh w-full max-w-107.5 bg-background' />
			</div>
		);
	}

	return (
		<div className='min-h-dvh bg-[--color-background]'>
			<div className='relative mx-auto flex min-h-dvh w-full max-w-107.5 flex-col bg-background'>
				<div className='sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[--color-border] bg-background px-4'>
					<div className='h-6 w-28 animate-pulse rounded-md bg-muted' />
					<div className='h-9 w-9 animate-pulse rounded-full bg-muted' />
				</div>
				<div className='flex-1' />
				<div className='sticky bottom-0 z-50 h-16 border-t border-[--color-border] bg-background pb-[env(safe-area-inset-bottom)]'>
					<div className='h-full animate-pulse' />
				</div>
			</div>
		</div>
	);
}

function AppShellFrame({
	children,
	pathname,
}: Readonly<{
	children: React.ReactNode;
	pathname: string;
}>) {
	const { config } = useAppShell();
	const setProfileStackOpen = useUIStore((s) => s.setProfileStackOpen);

	// Routes that intentionally do NOT show persistent chrome.
	if (pathname === '/onboarding') {
		return (
			<div className='min-h-dvh bg-[--color-background]'>
				<div className='relative mx-auto min-h-dvh w-full max-w-107.5 bg-background'>
					{children}
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-dvh bg-[--color-background]'>
			<div className='relative mx-auto flex min-h-dvh w-full max-w-107.5 flex-col bg-background'>
				<TopBar
					title={config.title}
					showPeriodSelector={config.showPeriodSelector}
					onAvatarClick={() => setProfileStackOpen(true)}
				/>

				<main className='flex-1 overflow-y-auto pb-28 pt-14'>
					{children}
				</main>

				<BottomNav />

				<div className='pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-50 flex justify-center'>
					<div className='pointer-events-auto'>
						<Fab />
					</div>
				</div>

				<ProfileStack />
				<AddExpenseSheet />
			</div>
		</div>
	);
}
