'use client';

import { Progress } from '@/components/ui/progress';
import { CATEGORIES } from '@/constants/categories';
import type { BudgetSchema } from '@/lib/validators/budget.schema';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';

type BudgetProgressProps = {
	budgets: BudgetSchema[];
	expenses: ExpenseSchema[];
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

export function BudgetProgress({
	budgets,
	expenses,
}: BudgetProgressProps): React.JSX.Element {
	return (
		<section className='space-y-3'>
			<h2 className='text-lg font-semibold'>Budgets</h2>
			{budgets.length === 0 ? (
				<div className='rounded-xl border border-[--color-border] bg-background p-4 text-sm text-muted-foreground'>
					Set up budgets in Settings
				</div>
			) : (
				<div className='space-y-3'>
					{budgets.map((budget) => {
						const spent = expenses
							.filter(
								(expense) =>
									expense.categoryId === budget.categoryId
							)
							.reduce(
								(sum, expense) => sum + expense.amountInINR,
								0
							);
						const ratio =
							budget.monthlyLimit > 0
								? spent / budget.monthlyLimit
								: 0;
						const progress = Math.min(ratio * 100, 100);
						const fillClass =
							ratio >= 0.8
								? '[&>div]:bg-(--color-alert)'
								: '[&>div]:bg-(--color-positive)';
						const label =
							CATEGORIES[
								budget.categoryId as keyof typeof CATEGORIES
							]?.label ?? budget.categoryId;

						return (
							<div
								key={budget.id}
								className='space-y-2 rounded-xl border border-[--color-border] bg-background p-4'
							>
								<div className='flex items-center justify-between gap-3'>
									<div className='min-w-0 truncate text-sm font-medium'>
										{label}
									</div>
									<div className='text-sm text-muted-foreground'>
										{Math.round(progress)}%
									</div>
								</div>
								<Progress
									value={progress}
									className={`h-2 bg-[--color-border] ${fillClass}`}
								/>
								<div className='text-sm text-muted-foreground'>
									{currencyFormatter.format(spent)} /{' '}
									{currencyFormatter.format(
										budget.monthlyLimit
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
