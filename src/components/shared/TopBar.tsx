'use client';

import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { type ActivePeriod, useUIStore } from '@/store/ui.store';

export interface TopBarProps {
	title?: string;
	showPeriodSelector?: boolean;
	onAvatarClick: () => void;
}

const periodLabels: Record<ActivePeriod, string> = {
	today: 'Today',
	week: 'This Week',
	month: 'This Month',
	custom: 'Custom',
};

export function TopBar({
	title,
	showPeriodSelector,
	onAvatarClick,
}: TopBarProps) {
	const user = useAuthStore((s) => s.user);
	const activePeriod = useUIStore((s) => s.activePeriod);
	const customDateRange = useUIStore((s) => s.customDateRange);
	const setActivePeriod = useUIStore((s) => s.setActivePeriod);
	const setCustomDateRange = useUIStore((s) => s.setCustomDateRange);

	const [periodOpen, setPeriodOpen] = useState(false);
	const [customFrom, setCustomFrom] = useState(customDateRange?.from ?? '');
	const [customTo, setCustomTo] = useState(customDateRange?.to ?? '');

	const initials = useMemo(() => {
		const source = user?.displayName || user?.email || 'U';
		return source
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase())
			.join('');
	}, [user?.displayName, user?.email]);

	return (
		<header className='sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[--color-border] bg-background px-4'>
			<div className='min-w-0'>
				{showPeriodSelector ? (
					<Drawer open={periodOpen} onOpenChange={setPeriodOpen}>
						<Button
							variant='ghost'
							className='h-12 gap-1 px-2 text-base font-medium'
							onClick={() => setPeriodOpen(true)}
						>
							<span className='truncate'>
								{periodLabels[activePeriod]}
							</span>
							<ChevronDown className='size-4 text-muted-foreground' />
						</Button>

						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Period</DrawerTitle>
							</DrawerHeader>

							<div className='space-y-2 px-4 pb-2'>
								{(
									[
										{ id: 'today', label: 'Today' },
										{ id: 'week', label: 'This Week' },
										{ id: 'month', label: 'This Month' },
										{ id: 'custom', label: 'Custom Range' },
									] as const
								).map((opt) => (
									<Button
										key={opt.id}
										variant={
											activePeriod === opt.id
												? 'default'
												: 'outline'
										}
										className={cn(
											'h-12 w-full justify-start'
										)}
										onClick={() => {
											setActivePeriod(opt.id);
											if (opt.id !== 'custom') {
												setCustomDateRange(null);
												setPeriodOpen(false);
											}
										}}
									>
										{opt.label}
									</Button>
								))}

								{activePeriod === 'custom' ? (
									<div className='mt-4 space-y-3'>
										<div className='grid grid-cols-2 gap-3'>
											<div className='space-y-2'>
												<label className='text-sm font-medium'>
													From
												</label>
												<Input
													type='date'
													className='h-12'
													value={customFrom}
													onChange={(e) =>
														setCustomFrom(
															e.target.value
														)
													}
												/>
											</div>
											<div className='space-y-2'>
												<label className='text-sm font-medium'>
													To
												</label>
												<Input
													type='date'
													className='h-12'
													value={customTo}
													onChange={(e) =>
														setCustomTo(
															e.target.value
														)
													}
												/>
											</div>
										</div>

										<Button
											className='h-12 w-full'
											disabled={!customFrom || !customTo}
											onClick={() => {
												setCustomDateRange({
													from: customFrom,
													to: customTo,
												});
												setPeriodOpen(false);
											}}
										>
											Confirm range
										</Button>
									</div>
								) : null}
							</div>

							<DrawerFooter />
						</DrawerContent>
					</Drawer>
				) : (
					<div className='truncate text-base font-medium'>
						{title ?? ''}
					</div>
				)}
			</div>

			<Button
				variant='ghost'
				size='icon-lg'
				className='h-12 w-12 rounded-full'
				onClick={onAvatarClick}
			>
				<Avatar className='size-9'>
					<AvatarImage
						src={user?.photoURL ?? ''}
						alt={user?.displayName ?? ''}
					/>
					<AvatarFallback>{initials || 'U'}</AvatarFallback>
				</Avatar>
			</Button>
		</header>
	);
}
