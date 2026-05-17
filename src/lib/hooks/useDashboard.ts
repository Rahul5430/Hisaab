'use client';

import { useMemo } from 'react';

import { CATEGORIES } from '@/constants/categories';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';
import type { InvestmentSchema } from '@/lib/validators/investment.schema';
import { useAuthStore } from '@/store/auth.store';

export interface DashboardData {
	totalSpent: number;
	totalInvested: number;
	remaining: number;
	byCategory: {
		categoryId: string;
		label: string;
		amount: number;
		percentage: number;
	}[];
	byPerson: {
		uid: string;
		amount: number;
	}[];
	topMerchants: {
		merchant: string;
		amount: number;
		count: number;
	}[];
	recentExpenses: ExpenseSchema[];
	groupTotal: number;
	personalTotal: number;
}

export function useDashboard(
	expenses: ExpenseSchema[],
	investments: InvestmentSchema[]
): DashboardData {
	const user = useAuthStore((s) => s.user);

	return useMemo(() => {
		const totalSpent = expenses.reduce(
			(sum, expense) => sum + expense.amountInINR,
			0
		);
		const totalInvested = investments.reduce(
			(sum, investment) => sum + investment.amountInINR,
			0
		);
		const remaining =
			(user?.monthlyIncome ?? 0) - totalSpent - totalInvested;

		const categoryTotals = expenses.reduce((totals, expense) => {
			totals.set(
				expense.categoryId,
				(totals.get(expense.categoryId) ?? 0) + expense.amountInINR
			);
			return totals;
		}, new Map<string, number>());

		const byCategory = Array.from(categoryTotals.entries())
			.map(([categoryId, amount]) => ({
				categoryId,
				label:
					CATEGORIES[categoryId as keyof typeof CATEGORIES]
						?.label ?? categoryId,
				amount,
				percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
			}))
			.sort((a, b) => b.amount - a.amount);

		const personTotals = expenses
			.filter((expense) => expense.visibility === 'group')
			.reduce((totals, expense) => {
				totals.set(
					expense.ownerId,
					(totals.get(expense.ownerId) ?? 0) + expense.amountInINR
				);
				return totals;
			}, new Map<string, number>());

		const byPerson = Array.from(personTotals.entries())
			.map(([uid, amount]) => ({ uid, amount }))
			.sort((a, b) => b.amount - a.amount);

		const merchantTotals = expenses.reduce((totals, expense) => {
			const current = totals.get(expense.merchant) ?? {
				amount: 0,
				count: 0,
			};
			totals.set(expense.merchant, {
				amount: current.amount + expense.amountInINR,
				count: current.count + 1,
			});
			return totals;
		}, new Map<string, { amount: number; count: number }>());

		const topMerchants = Array.from(merchantTotals.entries())
			.map(([merchant, value]) => ({ merchant, ...value }))
			.sort((a, b) => b.amount - a.amount)
			.slice(0, 5);

		const recentExpenses = [...expenses]
			.sort((a, b) =>
				`${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
			)
			.slice(0, 5);

		const groupTotal = expenses
			.filter((expense) => expense.visibility === 'group')
			.reduce((sum, expense) => sum + expense.amountInINR, 0);
		const personalTotal = expenses
			.filter(
				(expense) =>
					expense.visibility === 'personal' &&
					expense.ownerId === user?.uid
			)
			.reduce((sum, expense) => sum + expense.amountInINR, 0);

		return {
			totalSpent,
			totalInvested,
			remaining,
			byCategory,
			byPerson,
			topMerchants,
			recentExpenses,
			groupTotal,
			personalTotal,
		};
	}, [expenses, investments, user?.monthlyIncome, user?.uid]);
}
