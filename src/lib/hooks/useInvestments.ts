'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';
import { useCallback } from 'react';

import {
	addInvestment,
	deleteInvestment,
	getInvestments,
} from '@/lib/repositories/investments.repository';
import type { InvestmentSchema } from '@/lib/validators/investment.schema';
import { useAuthStore } from '@/store/auth.store';
import { type ActivePeriod,useUIStore } from '@/store/ui.store';

type DateRange = { from: string; to: string };

type UseInvestmentsResult = {
	investments: InvestmentSchema[];
	isLoading: boolean;
	error: Error | null;
	createInvestment: (
		investment: Omit<InvestmentSchema, 'id'>
	) => Promise<string>;
	removeInvestment: (investmentId: string) => Promise<void>;
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

export function useInvestments(): UseInvestmentsResult {
	const uid = useAuthStore((s) => s.user?.uid);
	const activePeriod = useUIStore((s) => s.activePeriod);
	const customDateRange = useUIStore((s) => s.customDateRange);
	const queryClient = useQueryClient();
	const { from, to } = getDateRange(activePeriod, customDateRange);

	const {
		data: investments = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['investments', uid, activePeriod, customDateRange],
		queryFn: () => getInvestments(uid ?? '', from, to),
		enabled: Boolean(uid),
	});

	const createInvestment = useCallback(
		async (
			investment: Omit<InvestmentSchema, 'id'>
		): Promise<string> => {
			const id = await addInvestment({
				...investment,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			});
			await queryClient.invalidateQueries({ queryKey: ['investments'] });
			return id;
		},
		[queryClient]
	);

	const removeInvestment = useCallback(
		async (investmentId: string): Promise<void> => {
			await deleteInvestment(investmentId);
			await queryClient.invalidateQueries({ queryKey: ['investments'] });
		},
		[queryClient]
	);

	return {
		investments,
		isLoading,
		error,
		createInvestment,
		removeInvestment,
	};
}
