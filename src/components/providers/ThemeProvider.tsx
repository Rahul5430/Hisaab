'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<NextThemeProvider attribute='class' defaultTheme='system' enableSystem>
			{children}
		</NextThemeProvider>
	);
}
