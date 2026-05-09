'use client';

import { create } from 'zustand';

export type ActivePeriod = 'today' | 'week' | 'month' | 'custom';

export type CustomDateRange = {
	from: string;
	to: string;
};

type UIState = {
	activePeriod: ActivePeriod;
	customDateRange: CustomDateRange | null;
	selectedGroupId: string | null;
	addExpenseSheetOpen: boolean;
	addInvestmentSheetOpen: boolean;
	profileStackOpen: boolean;
	setActivePeriod: (activePeriod: ActivePeriod) => void;
	setCustomDateRange: (customDateRange: CustomDateRange | null) => void;
	setSelectedGroupId: (selectedGroupId: string | null) => void;
	setAddExpenseSheetOpen: (open: boolean) => void;
	setAddInvestmentSheetOpen: (open: boolean) => void;
	setProfileStackOpen: (open: boolean) => void;
	resetDateRange: () => void;
	reset: () => void;
};

export const useUIStore = create<UIState>((set) => ({
	activePeriod: 'today',
	customDateRange: null,
	selectedGroupId: null,
	addExpenseSheetOpen: false,
	addInvestmentSheetOpen: false,
	profileStackOpen: false,
	setActivePeriod: (activePeriod) => set({ activePeriod }),
	setCustomDateRange: (customDateRange) => set({ customDateRange }),
	setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
	setAddExpenseSheetOpen: (open) => set({ addExpenseSheetOpen: open }),
	setAddInvestmentSheetOpen: (open) => set({ addInvestmentSheetOpen: open }),
	setProfileStackOpen: (open) => set({ profileStackOpen: open }),
	resetDateRange: () => set({ customDateRange: null }),
	reset: () =>
		set({
			activePeriod: 'month',
			customDateRange: null,
			selectedGroupId: null,
			addExpenseSheetOpen: false,
			addInvestmentSheetOpen: false,
			profileStackOpen: false,
		}),
}));
