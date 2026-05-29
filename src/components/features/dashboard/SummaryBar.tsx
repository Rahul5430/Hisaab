'use client';

type SummaryBarProps = {
	totalSpent: number;
	totalInvested: number;
	remaining: number;
};

function formatCompact(value: number): string {
	const abs = Math.abs(value);
	const sign = value < 0 ? '-' : '';
	if (abs >= 10000000) {
		return `${sign}₹${(abs / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
	}
	if (abs >= 100000) {
		return `${sign}₹${(abs / 100000).toFixed(1).replace(/\.0$/, '')}L`;
	}
	if (abs >= 1000) {
		return `${sign}₹${(abs / 1000).toFixed(1).replace(/\.0$/, '')}K`;
	}
	return `${sign}₹${abs}`;
}

export function SummaryBar({
	totalSpent,
	totalInvested,
	remaining,
}: Readonly<SummaryBarProps>) {
	const remainingColor =
		remaining < 0 ? 'text-(--color-spent)' : 'text-(--color-positive)';

	return (
		<section className='grid grid-cols-3 gap-3'>
			<div className='min-w-0 rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-xs text-muted-foreground'>Spent</div>
				<div className='truncate text-2xl font-semibold text-(--color-spent)'>
					{formatCompact(totalSpent)}
				</div>
			</div>
			<div className='min-w-0 rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-xs text-muted-foreground'>Invested</div>
				<div className='truncate text-2xl font-semibold text-(--color-invest)'>
					{formatCompact(totalInvested)}
				</div>
			</div>
			<div className='min-w-0 rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-xs text-muted-foreground'>Left</div>
				<div className={`truncate text-2xl font-semibold ${remainingColor}`}>
					{formatCompact(remaining)}
				</div>
			</div>
		</section>
	);
}
