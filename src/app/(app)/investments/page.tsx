'use client';

import { useEffect } from 'react';

import { useAppShell } from '@/components/providers/AppShellContext';

export default function InvestmentsPage() {
	const { setConfig } = useAppShell();

	useEffect(() => {
		setConfig({ showPeriodSelector: true, title: undefined });
	}, [setConfig]);

	return (
		<div className='p-6'>
			<div className='text-sm text-muted-foreground'>
				Investments coming soon
			</div>
		</div>
	);
}
