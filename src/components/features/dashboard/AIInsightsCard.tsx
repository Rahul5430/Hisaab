'use client';

import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function AIInsightsCard(): React.JSX.Element {
	const [open, setOpen] = useState(false);
	const ToggleIcon = open ? ChevronUp : ChevronDown;

	return (
		<section className='rounded-xl border border-[color-mix(in_srgb,var(--color-savings)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-savings)_8%,var(--color-background))]'>
			<button
				type='button'
				className='flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left'
				onClick={() => setOpen((value) => !value)}
			>
				<span className='flex items-center gap-2 text-sm font-semibold text-(--color-savings)'>
					<Sparkles className='size-4' />
					AI Insights
				</span>
				<ToggleIcon className='size-4 text-(--color-savings)' />
			</button>
			{open ? (
				<div className='px-4 pb-4 text-sm text-muted-foreground'>
					Insights are generated at the start of each month.
				</div>
			) : null}
		</section>
	);
}
