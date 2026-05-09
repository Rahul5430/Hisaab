'use client';

import {
	BadgeIndianRupee,
	ChartPie,
	ChevronRight,
	FolderKanban,
	GanttChartSquare,
	Gauge,
	LayoutGrid,
	Moon,
	Shield,
	Sun,
	User,
	Wallet,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

type Row = {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	hidden?: boolean;
	action?: () => void;
	right?: React.ReactNode;
};

export function ProfileStack() {
	const open = useUIStore((s) => s.profileStackOpen);
	const setOpen = useUIStore((s) => s.setProfileStackOpen);
	const user = useAuthStore((s) => s.user);
	const { signOut } = useAuth();
	const { theme, setTheme } = useTheme();

	const initials = useMemo(() => {
		const source = user?.displayName || user?.email || 'U';
		return source
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase())
			.join('');
	}, [user?.displayName, user?.email]);

	const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;

	const rows: Row[] = [
		{
			id: 'groups',
			label: 'Groups',
			icon: FolderKanban,
		},
		{
			id: 'categories',
			label: 'Categories',
			icon: LayoutGrid,
		},
		{
			id: 'budgets',
			label: 'Budgets',
			icon: Gauge,
		},
		{
			id: 'recurring',
			label: 'Recurring Investments',
			icon: GanttChartSquare,
		},
		{
			id: 'notifications',
			label: 'Notifications',
			icon: Wallet,
		},
		{
			id: 'theme',
			label: 'Theme',
			icon: Moon,
			right: (
				<div className='flex items-center gap-1'>
					<Button
						variant={theme === 'light' ? 'default' : 'outline'}
						size='sm'
						className='h-9'
						onClick={(e) => {
							e.stopPropagation();
							setTheme('light');
						}}
					>
						<Sun className='size-4' />
					</Button>
					<Button
						variant={theme === 'dark' ? 'default' : 'outline'}
						size='sm'
						className='h-9'
						onClick={(e) => {
							e.stopPropagation();
							setTheme('dark');
						}}
					>
						<Moon className='size-4' />
					</Button>
					<Button
						variant={theme === 'system' ? 'default' : 'outline'}
						size='sm'
						className='h-9'
						onClick={(e) => {
							e.stopPropagation();
							setTheme('system');
						}}
					>
						System
					</Button>
				</div>
			),
		},
		{
			id: 'currency',
			label: 'Currency Preferences',
			icon: BadgeIndianRupee,
		},
		{
			id: 'income',
			label: 'Monthly Income',
			icon: ChartPie,
		},
		{
			id: 'export',
			label: 'Export Data',
			icon: User,
		},
		{
			id: 'admin',
			label: 'Admin Panel',
			icon: Shield,
			hidden: !user?.uid || !adminUid || user.uid !== adminUid,
		},
	];

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent
				side='right'
				className='w-full max-w-[430px] border-l border-[--color-border] p-0'
			>
				<SheetHeader className='border-b border-[--color-border]'>
					<SheetTitle>Profile</SheetTitle>
				</SheetHeader>

				<div className='space-y-6 p-4'>
					<section className='space-y-3'>
						<div className='flex items-center gap-3'>
							<Avatar className='size-10'>
								<AvatarImage
									src={user?.photoURL ?? ''}
									alt={user?.displayName ?? ''}
								/>
								<AvatarFallback>
									{initials || 'U'}
								</AvatarFallback>
							</Avatar>
							<div className='min-w-0'>
								<div className='truncate text-sm font-medium'>
									{user?.displayName || 'Account'}
								</div>
								<div className='truncate text-sm text-muted-foreground'>
									{user?.email || ''}
								</div>
							</div>
						</div>

						<Button
							variant='outline'
							className='h-12 w-full justify-center'
							onClick={async () => {
								await signOut();
								setOpen(false);
							}}
						>
							Sign Out
						</Button>
					</section>

					<section className='space-y-2'>
						{rows
							.filter((r) => !r.hidden)
							.map((row) => {
								const Icon = row.icon;
								return (
									<button
										key={row.id}
										type='button'
										className={cn(
											'flex h-12 w-full items-center gap-3 rounded-lg border border-[--color-border] bg-background px-3 text-left'
										)}
										onClick={() => row.action?.()}
									>
										<Icon className='size-5 text-muted-foreground' />
										<div className='flex min-w-0 flex-1 items-center justify-between gap-3'>
											<div className='truncate text-sm font-medium'>
												{row.label}
											</div>
											{row.right ? (
												<div
													onClick={(e) =>
														e.stopPropagation()
													}
												>
													{row.right}
												</div>
											) : (
												<ChevronRight className='size-4 text-muted-foreground' />
											)}
										</div>
									</button>
								);
							})}
					</section>
				</div>
			</SheetContent>
		</Sheet>
	);
}
