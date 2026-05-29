const createLocalStorageMock = () => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => (key in store ? store[key] : null),
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
};

describe('UI store localStorage persistence', () => {
	beforeEach(() => {
		jest.resetModules();
		(global as any).window = { localStorage: createLocalStorageMock() };
	});

	it('initializes activePeriod from localStorage', async () => {
		window.localStorage.setItem(
			'ui.state',
			JSON.stringify({ activePeriod: 'week', customDateRange: null })
		);

		const mod = await import('@/store/ui.store');
		const { useUIStore } = mod;
		const state = useUIStore.getState();

		expect(state.activePeriod).toBe('week');
		expect(state.customDateRange).toBeNull();
	});

	it('persists activePeriod when updated', async () => {
		const mod = await import('@/store/ui.store');
		const { useUIStore } = mod;
		useUIStore.getState().setActivePeriod('month');

		const stored = JSON.parse(window.localStorage.getItem('ui.state') ?? '{}');
		expect(stored.activePeriod).toBe('month');
		expect(stored.customDateRange).toBeNull();
	});
});
