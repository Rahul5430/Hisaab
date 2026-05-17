'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useCallback } from 'react';

import {
	deleteBudget,
	getBudgets,
	setBudget,
} from '@/lib/repositories/budgets.repository';
import type { BudgetSchema } from '@/lib/validators/budget.schema';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

type UseBudgetsResult = {
	budgets: BudgetSchema[];
	isLoading: boolean;
	createBudget: (budget: Omit<BudgetSchema, 'id'>) => Promise<string>;
	removeBudget: (budgetId: string) => Promise<void>;
	month: string;
};

export function useBudgets(ownerId?: string): UseBudgetsResult {
	const uid = useAuthStore((s) => s.user?.uid);
	const selectedGroupId = useUIStore((s) => s.selectedGroupId);
	const queryClient = useQueryClient();
	const resolvedOwnerId = ownerId ?? selectedGroupId ?? uid;
	const month = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
	})
		.format(new Date())
		.slice(0, 7);

	const {
		data: budgets = [],
		isLoading,
	} = useQuery({
		queryKey: ['budgets', resolvedOwnerId, month],
		queryFn: () => getBudgets(resolvedOwnerId ?? '', month),
		enabled: Boolean(resolvedOwnerId),
	});

	const createBudget = useCallback(
		async (budget: Omit<BudgetSchema, 'id'>): Promise<string> => {
			const id = await setBudget({
				...budget,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			});
			await queryClient.invalidateQueries({ queryKey: ['budgets'] });
			return id;
		},
		[queryClient]
	);

	const removeBudget = useCallback(
		async (budgetId: string): Promise<void> => {
			await deleteBudget(budgetId);
			await queryClient.invalidateQueries({ queryKey: ['budgets'] });
		},
		[queryClient]
	);

	return { budgets, isLoading, createBudget, removeBudget, month };
}
