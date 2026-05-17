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
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function ProfileStack(): React.JSX.Element {
	const open = useUIStore((s) => s.profileStackOpen);
	const setOpen = useUIStore((s) => s.setProfileStackOpen);
	const user = useAuthStore((s) => s.user);
	const { signOut, updateCurrentUser } = useAuth();
	const { theme, setTheme } = useTheme();
	
	const [isEditingName, setIsEditingName] = useState(false);
	const [editingName, setEditingName] = useState('');
	const [isEditingIncome, setIsEditingIncome] = useState(false);
	const [editingIncome, setEditingIncome] = useState('');

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

	const handleSaveName = async () => {
		if (!user || !editingName.trim()) return;
		
		try {
			await updateCurrentUser({ displayName: editingName.trim() });
			setIsEditingName(false);
			toast.success('Name updated');
		} catch (error) {
			console.error('Failed to update name:', error);
			toast.error('Failed to update name');
		}
	};

	const handleSaveIncome = async () => {
		if (!user || !editingIncome) return;
		
		const income = parseFloat(editingIncome);
		if (isNaN(income) || income < 0) {
			toast.error('Please enter a valid income amount');
			return;
		}
		
		try {
			await updateCurrentUser({ monthlyIncome: income });
			setIsEditingIncome(false);
			toast.success('Monthly income updated');
		} catch (error) {
			console.error('Failed to update income:', error);
			toast.error('Failed to update income');
		}
	};

	const handleComingSoon = (label: string) => {
		toast.info(`${label} coming soon`);
	};

	const rows: Row[] = [
		{
			id: 'groups',
			label: 'Groups',
			icon: FolderKanban,
			action: () => handleComingSoon('Groups section'),
		},
		{
			id: 'categories',
			label: 'Categories',
			icon: LayoutGrid,
			action: () => handleComingSoon('Categories section'),
		},
		{
			id: 'budgets',
			label: 'Budgets',
			icon: Gauge,
			action: () => handleComingSoon('Budgets section'),
		},
		{
			id: 'recurring',
			label: 'Recurring Investments',
			icon: GanttChartSquare,
			action: () => handleComingSoon('Recurring Investments section'),
		},
		{
			id: 'notifications',
			label: 'Notifications',
			icon: Wallet,
			action: () => handleComingSoon('Notifications section'),
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
			action: () => handleComingSoon('Currency Preferences section'),
		},
		{
			id: 'income',
			label: 'Monthly Income',
			icon: ChartPie,
			right: (
				<div className='text-sm text-muted-foreground'>
					{user?.monthlyIncome ? `₹${user.monthlyIncome.toLocaleString()}` : 'Not set'}
				</div>
			),
			action: () => {
				setEditingIncome(user?.monthlyIncome?.toString() || '');
				setIsEditingIncome(true);
			},
		},
		{
			id: 'export',
			label: 'Export Data',
			icon: User,
			action: () => handleComingSoon('Export Data section'),
		},
		{
			id: 'admin',
			label: 'Admin Panel',
			icon: Shield,
			hidden: !user?.uid || !adminUid || user.uid !== adminUid,
			action: () => handleComingSoon('Admin Panel section'),
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
							<div className='min-w-0 flex-1'>
								{isEditingName ? (
									<div className='flex items-center gap-2'>
										<Input
											value={editingName}
											onChange={(e) => setEditingName(e.target.value)}
											onBlur={handleSaveName}
											onKeyDown={(e) => {
												if (e.key === 'Enter') handleSaveName();
												if (e.key === 'Escape') {
													setIsEditingName(false);
													setEditingName(user?.displayName || '');
												}
											}}
											className='h-8 text-sm'
											placeholder='Enter name'
											autoFocus
										/>
									</div>
								) : (
									<div 
										className='truncate text-sm font-medium cursor-pointer'
										onClick={() => {
											setEditingName(user?.displayName || '');
											setIsEditingName(true);
										}}
									>
										{user?.displayName || 'Account'}
									</div>
								)}
								<div className='truncate text-sm text-muted-foreground'>
									{user?.email || ''}
								</div>
							</div>
						</div>

						{isEditingIncome && (
							<div className='flex items-center gap-2'>
								<Input
									value={editingIncome}
									onChange={(e) => setEditingIncome(e.target.value)}
									onBlur={handleSaveIncome}
									onKeyDown={(e) => {
										if (e.key === 'Enter') handleSaveIncome();
										if (e.key === 'Escape') {
											setIsEditingIncome(false);
											setEditingIncome(user?.monthlyIncome?.toString() || '');
										}
									}}
									className='h-8 text-sm'
									placeholder='Enter monthly income'
									type='number'
									autoFocus
								/>
								<Button
									size='sm'
									onClick={handleSaveIncome}
									className='h-8'
								>
									Save
								</Button>
							</div>
						)}

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
