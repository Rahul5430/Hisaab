'use client';

type MonthComparisonProps = {
	currentTotal: number;
};

export function MonthComparison({
	currentTotal,
}: MonthComparisonProps): React.JSX.Element {
	void currentTotal;

	return (
		<section className='space-y-3'>
			<h2 className='text-lg font-semibold'>vs Last Month</h2>
			<div className='rounded-xl border border-[--color-border] bg-background p-4'>
				<div className='text-2xl font-semibold text-muted-foreground'>
					—
				</div>
				<div className='mt-1 text-sm text-muted-foreground'>
					Comparison available after your first full month
				</div>
			</div>
		</section>
	);
}
