'use client';

import {
	useQuery,
	useQueryClient,
	type UseQueryResult,
} from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useCallback } from 'react';

import { useGroups } from '@/lib/hooks/useGroups';
import {
	addExpense,
	deleteExpense,
	getExpenseById,
	getExpenses,
} from '@/lib/repositories/expenses.repository';
import type { MerchantPattern } from '@/lib/repositories/merchantPatterns.repository';
import { getPatternForMerchant } from '@/lib/repositories/merchantPatterns.repository';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';
import { useAuthStore } from '@/store/auth.store';
import { type ActivePeriod,useUIStore } from '@/store/ui.store';

type DateRange = { from: string; to: string };

type UseExpensesResult = {
	expenses: ExpenseSchema[];
	isLoading: boolean;
	error: Error | null;
	createExpense: (expense: Omit<ExpenseSchema, 'id'>) => Promise<string>;
	removeExpense: (expenseId: string) => Promise<void>;
	lookupMerchantPattern: (
		merchantRaw: string
	) => Promise<MerchantPattern | null>;
};

function formatInIST(date: Date): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
}

function addDaysToISODate(isoDate: string, days: number): string {
	const [year, month, day] = isoDate.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day + days));
	return date.toISOString().slice(0, 10);
}

function getDateRange(
	activePeriod: ActivePeriod,
	customDateRange: { from: string; to: string } | null
): DateRange {
	const todayString = formatInIST(new Date());

	if (activePeriod === 'today') {
		return { from: todayString, to: todayString };
	}

	if (activePeriod === 'week') {
		const dayOfWeek = new Date(`${todayString}T00:00:00+05:30`).getDay();
		return {
			from: addDaysToISODate(todayString, -dayOfWeek),
			to: todayString,
		};
	}

	if (activePeriod === 'month') {
		return {
			from: `${todayString.slice(0, 8)}01`,
			to: todayString,
		};
	}

	if (customDateRange) {
		return customDateRange;
	}

	return { from: todayString, to: todayString };
}

export function useExpenses(): UseExpensesResult {
	const uid = useAuthStore((s) => s.user?.uid);
	const activePeriod = useUIStore((s) => s.activePeriod);
	const customDateRange = useUIStore((s) => s.customDateRange);
	const selectedGroupId = useUIStore((s) => s.selectedGroupId);
	const queryClient = useQueryClient();
	const { groups, isLoading: groupsLoading } = useGroups();
	const groupIds = groups.map((group) => group.id);
	const { from, to } = getDateRange(activePeriod, customDateRange);

	const enabled = Boolean(uid) && !groupsLoading;

	const {
		data: allExpenses = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: [
			'expenses',
			uid,
			groupIds,
			activePeriod,
			customDateRange,
		],
		queryFn: async () => {
			return getExpenses(uid ?? '', groupIds, from, to);
		},
		enabled,
	});

	const expenses = selectedGroupId
		? allExpenses.filter((expense) => expense.groupId === selectedGroupId)
		: allExpenses;

	const createExpense = useCallback(
		async (expense: Omit<ExpenseSchema, 'id'>): Promise<string> => {
			const id = await addExpense({
				...expense,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			});
			await queryClient.invalidateQueries({ queryKey: ['expenses'] });
			return id;
		},
		[queryClient]
	);

	const removeExpense = useCallback(
		async (expenseId: string): Promise<void> => {
			await deleteExpense(expenseId);
			await queryClient.invalidateQueries({ queryKey: ['expenses'] });
		},
		[queryClient]
	);

	const lookupMerchantPattern = useCallback(
		(merchantRaw: string): Promise<MerchantPattern | null> => {
			if (!uid) return Promise.resolve(null);
			return getPatternForMerchant(uid, merchantRaw);
		},
		[uid]
	);

	return {
		expenses,
		isLoading: isLoading || groupsLoading,
		error,
		createExpense,
		removeExpense,
		lookupMerchantPattern,
	};
}

export function useExpense(
	expenseId: string
): UseQueryResult<ExpenseSchema | null, Error> {
	return useQuery({
		queryKey: ['expenses', 'detail', expenseId],
		queryFn: () => getExpenseById(expenseId),
		enabled: Boolean(expenseId),
	});
}
