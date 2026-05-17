'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';

export function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	useAuth();

	const loading = useAuthStore((s) => s.loading);

	if (loading) {
		return (
			<div className='flex min-h-dvh items-center justify-center bg-background'>
				<div className='flex flex-col items-center gap-3'>
					<div className='h-10 w-10 animate-spin rounded-full border-2 border-[--color-brand] border-t-transparent' />
					<p className='text-sm text-muted-foreground'>
						Loading...
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
