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
				className='flex h-12 flex-col items-center justify-center gap-1'
				onClick={() => router.push(item.href)}
			>
				<div
					className={cn(
						'h-4 w-0.5 rounded-full',
						isActive ? 'bg-(--color-brand)' : 'bg-transparent'
					)}
				/>
				<Icon
					className={cn(
						'size-[22px]',
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
		<nav className='sticky bottom-0 z-50 border-t border-[--color-border] bg-background pb-[env(safe-area-inset-bottom)]'>
			<div className='grid h-16 grid-cols-[1fr_64px_1fr] items-center px-4'>
				{renderItem(homeItem)}
				<div aria-hidden className='h-12 w-16' />
				{renderItem(investmentsItem)}
			</div>
		</nav>
	);
}
