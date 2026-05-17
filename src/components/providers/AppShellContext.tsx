'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';

export interface AppShellConfig {
	showPeriodSelector: boolean;
	title?: string;
}

type AppShellContextValue = {
	config: AppShellConfig;
	setConfig: (next: Partial<AppShellConfig>) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

const defaultConfig: AppShellConfig = { showPeriodSelector: false };

export function AppShellProvider({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const [config, setConfigState] = useState<AppShellConfig>(defaultConfig);

	const setConfig = useCallback((next: Partial<AppShellConfig>) => {
		setConfigState((prev) => ({ ...prev, ...next }));
	}, []);

	const value = useMemo<AppShellContextValue>(
		() => ({
			config,
			setConfig,
		}),
		[config, setConfig]
	);

	return (
		<AppShellContext.Provider value={value}>
			{children}
		</AppShellContext.Provider>
	);
}

export function useAppShell(): AppShellContextValue {
	const ctx = useContext(AppShellContext);
	if (!ctx) {
		throw new Error('useAppShell must be used within AppShellProvider');
	}
	return ctx;
}
