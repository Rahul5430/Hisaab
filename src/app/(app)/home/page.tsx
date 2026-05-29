'use client';

import { Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { AIInsightsCard } from '@/components/features/dashboard/AIInsightsCard';
import { BudgetProgress } from '@/components/features/dashboard/BudgetProgress';
import { CategoryBreakdown } from '@/components/features/dashboard/CategoryBreakdown';
import { MonthComparison } from '@/components/features/dashboard/MonthComparison';
import { PersonBreakdown } from '@/components/features/dashboard/PersonBreakdown';
import { SummaryBar } from '@/components/features/dashboard/SummaryBar';
import { TopMerchants } from '@/components/features/dashboard/TopMerchants';
import { ExpenseCard } from '@/components/features/expenses/ExpenseCard';
import { useAppShell } from '@/components/providers/AppShellContext';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useGroups } from '@/lib/hooks/useGroups';
import { useInvestments } from '@/lib/hooks/useInvestments';
import { useUIStore } from '@/store/ui.store';

export default function HomePage() {
	const router = useRouter();
	const { setConfig } = useAppShell();
	const { expenses, isLoading: expensesLoading, error: expensesError } = useExpenses();
	const { investments, isLoading: investmentsLoading, error: investmentsError } = useInvestments();
	const { groups, isLoading: groupsLoading } = useGroups();
	const { budgets, isLoading: budgetsLoading } = useBudgets();
	const selectedGroupId = useUIStore((s) => s.selectedGroupId);
	const setSelectedGroupId = useUIStore((s) => s.setSelectedGroupId);
	
	const dashboardData = useDashboard(expenses, investments);
	const {
		totalSpent,
		totalInvested,
		remaining,
		byCategory,
		byPerson,
		topMerchants,
		recentExpenses,
	} = dashboardData;

	const isLoading = expensesLoading || investmentsLoading || groupsLoading || budgetsLoading;
	const error = expensesError || investmentsError;

	useEffect(() => {
		setConfig({ showPeriodSelector: true });
	}, [setConfig]);

	useEffect(() => {
		if (error) {
			toast.error('Failed to load dashboard');
		}
	}, [error]);

	 // Create members list for PersonBreakdown
	const members = groups.reduce((acc, group) => {
		group.memberUids.forEach((uid) => {
			if (!acc.some((member) => member.uid === uid)) {
				acc.push({
					uid,
					displayName: uid, // Fallback to uid since we don't have members lookup yet
					photoURL: '',
				});
			}
		});
		return acc;
	}, [] as { uid: string; displayName: string; photoURL: string }[]);

	if (isLoading) {
		return (
			<div className='px-4 py-6 space-y-6'>
				{/* Summary Bar Skeleton */}
				<div className='grid grid-cols-3 gap-3'>
					<div className='h-20 rounded-xl bg-muted animate-pulse' />
					<div className='h-20 rounded-xl bg-muted animate-pulse' />
					<div className='h-20 rounded-xl bg-muted animate-pulse' />
				</div>
				
				{/* Category Breakdown Skeleton */}
				<div className='space-y-3'>
					<div className='h-6 w-24 rounded bg-muted animate-pulse' />
					<div className='flex justify-center'>
						<div className='h-50 w-50 rounded-full bg-muted animate-pulse' />
					</div>
					<div className='space-y-2'>
						{['home-loading-1', 'home-loading-2', 'home-loading-3'].map((placeholderId) => (
							<div key={placeholderId} className='h-12 rounded-xl bg-muted animate-pulse' />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='px-4 py-6 space-y-6'>
			{/* Summary Bar */}
			<SummaryBar
				totalSpent={totalSpent}
				totalInvested={totalInvested}
				remaining={remaining}
			/>

			{/* Group Selector */}
			<div className='space-y-3'>
				<div className='flex gap-2 overflow-x-auto pb-2 no-scrollbar'>
					<button
						type='button'
						onClick={() => setSelectedGroupId(null)}
						className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium h-9 transition-colors ${
							selectedGroupId === null
								? 'bg-(--color-brand) text-white'
								: 'bg-background border border-[--color-border] text-foreground'
						}`}
					>
						All
					</button>
					{groups.map((group) => (
						<button
							key={group.id}
							type='button'
							onClick={() => setSelectedGroupId(group.id)}
							className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium h-9 transition-colors ${
								selectedGroupId === group.id
									? 'bg-(--color-brand) text-white'
									: 'bg-background border border-[--color-border] text-foreground'
							}`}
						>
							{group.name}
						</button>
					))}
				</div>
			</div>

			{/* Category Breakdown */}
			<CategoryBreakdown data={byCategory} />

			{/* Person Breakdown */}
			<PersonBreakdown data={byPerson} members={members} />

			{/* Budget Progress */}
			<BudgetProgress budgets={budgets} expenses={expenses} />

			{/* Top Merchants */}
			<TopMerchants data={topMerchants} />

			{/* Month Comparison */}
			<MonthComparison currentTotal={totalSpent} />

			{/* AI Insights */}
			<AIInsightsCard />

			{/* Recent Expenses */}
			<section className='space-y-3'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-semibold'>Recent</h2>
					<button
						type='button'
						onClick={() => router.push('/expenses')}
						className='text-sm text-(--color-brand) font-medium'
					>
						See all →
					</button>
				</div>
				{recentExpenses.length === 0 ? (
					<div className='rounded-xl border border-[--color-border] bg-background p-8 text-center'>
						<Receipt className='mx-auto size-12 text-muted-foreground mb-3' />
						<p className='text-sm text-secondary'>
							No expenses yet. Tap + to add your first.
						</p>
					</div>
				) : (
					<div className='space-y-2'>
						{recentExpenses.map((expense) => (
							<ExpenseCard
								key={expense.id}
								expense={expense}
								onClick={() => router.push('/expenses/' + expense.id)}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
