'use client';

import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { useRouter,useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ExpenseCard } from '@/components/features/expenses/ExpenseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES } from '@/constants/categories';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useAuthStore } from '@/store/auth.store';

type FilterType = 'all' | 'mine' | 'group' | 'others';

export default function ExpensesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const user = useAuthStore((s) => s.user);
	const { expenses, isLoading, error } = useExpenses();
	
	const [showSearch, setShowSearch] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeFilter, setActiveFilter] = useState<FilterType>('all');
	
	const categoryParam = searchParams.get('category');
	const ownerParam = searchParams.get('owner');

	const filteredExpenses = useMemo(() => {
		let filtered = expenses;

		// Apply URL parameter filters
		if (categoryParam) {
			filtered = filtered.filter(expense => expense.categoryId === categoryParam);
		}
		if (ownerParam) {
			filtered = filtered.filter(expense => expense.ownerId === ownerParam);
		}

		// Apply tab filter
		if (user) {
			switch (activeFilter) {
				case 'mine':
					filtered = filtered.filter(expense => expense.ownerId === user.uid);
					break;
				case 'group':
					filtered = filtered.filter(expense => expense.visibility === 'group');
					break;
				case 'others':
					filtered = filtered.filter(
						expense => expense.ownerId !== user.uid && expense.visibility === 'group'
					);
					break;
				// 'all' - no additional filtering
			}
		}

		// Apply search filter
		if (searchQuery.trim()) {
			filtered = filtered.filter(expense =>
				expense.merchant.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return filtered;
	}, [expenses, categoryParam, ownerParam, user, activeFilter, searchQuery]);

	// Group expenses by date
	const expensesByDate = useMemo(() => {
		const grouped: Record<string, typeof filteredExpenses> = {};
		
		filteredExpenses.forEach(expense => {
			const expenseDate = parseISO(expense.date);
			let dateKey: string;
			
			if (isToday(expenseDate)) {
				dateKey = 'today';
			} else if (isYesterday(expenseDate)) {
				dateKey = 'yesterday';
			} else {
				dateKey = format(expenseDate, 'dd MMM yyyy');
			}
			
			if (!grouped[dateKey]) {
				grouped[dateKey] = [];
			}
			grouped[dateKey].push(expense);
		});

		return grouped;
	}, [filteredExpenses]);

	const handleExpenseClick = (expenseId: string) => {
		router.push(`/expenses/${expenseId}`);
	};

	const getCategoryLabel = (categoryId: string) => {
		const category = CATEGORIES[categoryId as keyof typeof CATEGORIES];
		return category?.label || categoryId;
	};

	if (error) {
		toast.error('Failed to load expenses');
	}

	return (
		<div className="px-4 py-6 space-y-6">
			{/* Header with search */}
			<div className="flex items-center justify-between">
				{categoryParam && (
					<div className="text-sm text-muted-foreground">
						{getCategoryLabel(categoryParam)}
					</div>
				)}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowSearch(!showSearch)}
					className="h-10 w-10 p-0"
				>
					<Search className="h-4 w-4" />
				</Button>
			</div>

			{/* Search input */}
			{showSearch && (
				<div className="space-y-2">
					<Input
						type="text"
						placeholder="Search by merchant name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="h-12"
					/>
				</div>
			)}

			{/* Filter tabs */}
			{user && (
				<Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="mine">Mine</TabsTrigger>
						<TabsTrigger value="group">Group</TabsTrigger>
						<TabsTrigger value="others">Others</TabsTrigger>
					</TabsList>
				</Tabs>
			)}

			{/* Loading state */}
			{isLoading && (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
					))}
				</div>
			)}

			{/* Expenses list */}
			{!isLoading && (
				<div className="space-y-6">
					{Object.entries(expensesByDate).length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="text-muted-foreground">No expenses found</div>
							<div className="text-sm text-muted-foreground mt-1">
								{searchQuery || categoryParam || ownerParam
									? 'Try adjusting your filters'
									: 'Tap the + button to add your first expense'}
							</div>
						</div>
					) : (
						Object.entries(expensesByDate).map(([dateKey, dateExpenses]) => (
							<div key={dateKey} className="space-y-2">
								<div className="text-sm font-medium text-secondary mb-2">
									{dateKey === 'today' && 'Today'}
									{dateKey === 'yesterday' && 'Yesterday'}
									{dateKey !== 'today' && dateKey !== 'yesterday' && dateKey}
								</div>
								<div className="space-y-2">
									{dateExpenses.map((expense) => (
										<ExpenseCard
											key={expense.id}
											expense={expense}
											onClick={() => handleExpenseClick(expense.id)}
										/>
									))}
								</div>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
