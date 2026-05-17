'use client';

import { useRouter } from 'next/navigation';
import { Cell, Pie, PieChart } from 'recharts';

type CategoryBreakdownItem = {
	categoryId: string;
	label: string;
	amount: number;
	percentage: number;
};

type CategoryBreakdownProps = {
	data: CategoryBreakdownItem[];
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

const chartColors = [
	'var(--color-brand)',
	'color-mix(in srgb, var(--color-brand) 88%, var(--color-background))',
	'color-mix(in srgb, var(--color-brand) 76%, var(--color-background))',
	'color-mix(in srgb, var(--color-brand) 64%, var(--color-background))',
	'color-mix(in srgb, var(--color-brand) 52%, var(--color-background))',
	'color-mix(in srgb, var(--color-brand) 40%, var(--color-background))',
	'color-mix(in srgb, var(--color-brand) 32%, var(--color-background))',
	'color-mix(in srgb, var(--color-brand) 24%, var(--color-background))',
];

export function CategoryBreakdown({
	data,
}: CategoryBreakdownProps): React.JSX.Element {
	const router = useRouter();
	const total = data.reduce((sum, item) => sum + item.amount, 0);
	const visibleRows = data.slice(0, 5);

	if (data.length === 0) {
		return (
			<section className='space-y-3'>
				<h2 className='text-lg font-semibold'>Categories</h2>
				<div className='rounded-xl border border-[--color-border] bg-background p-4 text-sm text-muted-foreground'>
					No expenses yet
				</div>
			</section>
		);
	}

	return (
		<section className='space-y-4'>
			<h2 className='text-lg font-semibold'>Categories</h2>
			<div className='flex justify-center'>
				<div className='relative h-[200px] w-[200px]'>
					<PieChart width={200} height={200}>
						<Pie
							data={data}
							dataKey='amount'
							nameKey='label'
							cx='50%'
							cy='50%'
							innerRadius={70}
							outerRadius={90}
							paddingAngle={2}
						>
							{data.map((item, index) => (
								<Cell
									key={item.categoryId}
									fill={chartColors[index % chartColors.length]}
									stroke='var(--color-background)'
								/>
							))}
						</Pie>
					</PieChart>
					<div className='pointer-events-none absolute inset-0 flex items-center justify-center text-center text-lg font-semibold'>
						{currencyFormatter.format(total)}
					</div>
				</div>
			</div>
			<div className='space-y-2'>
				{visibleRows.map((item) => (
					<button
						key={item.categoryId}
						type='button'
						className='flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[--color-border] bg-background px-4 py-3 text-left'
						onClick={() =>
							router.push(
								`/expenses?category=${encodeURIComponent(item.categoryId)}`
							)
						}
					>
						<span className='min-w-0 flex-1 truncate text-sm font-medium'>
							{item.label}
						</span>
						<span className='text-right text-sm'>
							<span className='font-medium'>
								{currencyFormatter.format(item.amount)}
							</span>
							<span className='ml-2 text-muted-foreground'>
								{Math.round(item.percentage)}%
							</span>
						</span>
					</button>
				))}
			</div>
			{data.length > 5 ? (
				<button
					type='button'
					className='min-h-12 text-sm font-medium text-(--color-brand)'
					onClick={() => router.push('/expenses')}
				>
					See all
				</button>
			) : null}
		</section>
	);
}
