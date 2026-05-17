'use client';

type TopMerchantsProps = {
	data: { merchant: string; amount: number; count: number }[];
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

export function TopMerchants({ data }: TopMerchantsProps): React.JSX.Element {
	const rows = data.slice(0, 5);

	return (
		<section className='space-y-3'>
			<h2 className='text-lg font-semibold'>Top Merchants</h2>
			{rows.length === 0 ? (
				<div className='rounded-xl border border-[--color-border] bg-background p-4 text-sm text-muted-foreground'>
					No merchants yet
				</div>
			) : (
				<div className='space-y-2'>
					{rows.map((item) => (
						<div
							key={item.merchant}
							className='flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[--color-border] bg-background px-4 py-3'
						>
							<div className='min-w-0'>
								<div className='truncate text-sm font-medium'>
									{item.merchant}
								</div>
								<div className='text-sm text-muted-foreground'>
									{item.count} transactions
								</div>
							</div>
							<div className='shrink-0 text-right text-sm font-semibold'>
								{currencyFormatter.format(item.amount)}
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
