'use client';

type SummaryBarProps = {
	totalSpent: number;
	totalInvested: number;
	remaining: number;
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

export function SummaryBar({
	totalSpent,
	totalInvested,
	remaining,
}: SummaryBarProps) {
	const remainingColor =
		remaining < 0 ? 'text-(--color-spent)' : 'text-(--color-positive)';

	return (
		<section className='grid grid-cols-3 gap-3'>
			<div className='min-w-0 rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-xs text-muted-foreground'>Spent</div>
				<div className='truncate text-2xl font-semibold text-(--color-spent)'>
					{currencyFormatter.format(totalSpent)}
				</div>
			</div>
			<div className='min-w-0 rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-xs text-muted-foreground'>Invested</div>
				<div className='truncate text-2xl font-semibold text-(--color-invest)'>
					{currencyFormatter.format(totalInvested)}
				</div>
			</div>
			<div className='min-w-0 rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-xs text-muted-foreground'>Left</div>
				<div className={`truncate text-2xl font-semibold ${remainingColor}`}>
					{currencyFormatter.format(remaining)}
				</div>
			</div>
		</section>
	);
}
