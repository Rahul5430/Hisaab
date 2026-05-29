'use client';

import { Home, TrendingUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

type NavItem = {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
};

const homeItem: NavItem = { href: '/home', label: 'Home', icon: Home };
const investmentsItem: NavItem = {
	href: '/investments',
	label: 'Investments',
	icon: TrendingUp,
};

export function BottomNav(): React.JSX.Element {
	const pathname = usePathname();
	const router = useRouter();

	const renderItem = (item: NavItem) => {
		const isActive = pathname === item.href;
		const Icon = item.icon;
		return (
			<button
				key={item.href}
				type='button'
				className='flex h-12 flex-col items-center justify-center gap-1 transition-colors'
				onClick={() => router.push(item.href)}
			>
				<Icon
					className={cn(
						'size-5.5',
						isActive
							? 'text-(--color-brand)'
							: 'text-muted-foreground'
					)}
				/>
				<div
					className={cn(
						'text-xs font-medium',
						isActive
							? 'text-(--color-brand)'
							: 'text-muted-foreground'
					)}
				>
					{item.label}
				</div>
			</button>
		);
	};

	return (
		<nav className='fixed inset-x-0 bottom-0 z-50 border-t border-[--color-border] bg-background pb-[env(safe-area-inset-bottom)]'>
			<div className='mx-auto grid h-16 max-w-107.5 grid-cols-[1fr_64px_1fr] items-center px-4'>
				{renderItem(homeItem)}
				<div aria-hidden className='h-12 w-16' />
				{renderItem(investmentsItem)}
			</div>
		</nav>
	);
}
