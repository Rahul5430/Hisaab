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

export const useUIStore = create<UIState>((set) => {
	// Initialize from localStorage when available
	let initialActive: ActivePeriod = 'today';
	let initialCustom: CustomDateRange | null = null;
	try {
		const raw = localStorage.getItem('ui.state');
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed?.activePeriod) initialActive = parsed.activePeriod;
			if (parsed?.customDateRange) initialCustom = parsed.customDateRange;
		}
	} catch (error) {
		console.warn('Failed to read UI state from localStorage', error);
	}

	const persist = () => {
		try {
			const state = {
				activePeriod: get().activePeriod,
				customDateRange: get().customDateRange,
			};
			localStorage.setItem('ui.state', JSON.stringify(state));
		} catch (error) {
			console.warn('Failed to persist UI state to localStorage', error);
		}
	};

	const get = () => store as unknown as UIState;

	const store = {
		activePeriod: initialActive,
		customDateRange: initialCustom,
		selectedGroupId: null,
		addExpenseSheetOpen: false,
		addInvestmentSheetOpen: false,
		profileStackOpen: false,
		setActivePeriod: (activePeriod: ActivePeriod) => {
			set({ activePeriod });
			persist();
		},
		setCustomDateRange: (customDateRange: CustomDateRange | null) => {
			set({ customDateRange });
			persist();
		},
		setSelectedGroupId: (selectedGroupId: string | null) => set({ selectedGroupId }),
		setAddExpenseSheetOpen: (open: boolean) => set({ addExpenseSheetOpen: open }),
		setAddInvestmentSheetOpen: (open: boolean) => set({ addInvestmentSheetOpen: open }),
		setProfileStackOpen: (open: boolean) => set({ profileStackOpen: open }),
		resetDateRange: () => {
			set({ customDateRange: null });
			persist();
		},
		reset: () =>
			set({
				activePeriod: 'month',
				customDateRange: null,
				selectedGroupId: null,
				addExpenseSheetOpen: false,
				addInvestmentSheetOpen: false,
				profileStackOpen: false,
			}),
	};

	return store;
});
