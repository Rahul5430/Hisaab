'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { CATEGORIES } from '@/constants/categories';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';

type ExpenseCardProps = {
	expense: ExpenseSchema;
	onClick?: () => void;
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

const icons = LucideIcons as unknown as Record<string, LucideIcon>;

function toPascalCase(iconName: string) {
	return iconName
		.split('-')
		.map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
		.join('');
}

function getCategoryMeta(expense: ExpenseSchema) {
	const category =
		CATEGORIES[expense.categoryId as keyof typeof CATEGORIES] ??
		CATEGORIES.other;
	const subcategories = category.subcategories as Record<
		string,
		{ label: string; icon: string }
	>;
	const subcategory = subcategories[expense.subcategoryId];
	const Icon =
		icons[toPascalCase(subcategory?.icon ?? category.icon)] ??
		LucideIcons.CircleEllipsis;

	return {
		Icon,
		subcategoryLabel: subcategory?.label ?? expense.subcategoryId,
	};
}

export function ExpenseCard({
	expense,
	onClick,
}: ExpenseCardProps): React.JSX.Element {
	const { Icon, subcategoryLabel } = getCategoryMeta(expense);
	const visibilityLabel =
		expense.visibility === 'group' ? 'Group' : 'Personal';

	return (
		<motion.button
			type='button'
			className='flex min-h-12 w-full items-start gap-3 rounded-xl border border-[--color-border] bg-background px-4 py-3 text-left'
			onClick={onClick}
			whileTap={{ scale: 0.98 }}
			transition={{ type: 'spring', stiffness: 400, damping: 40 }}
		>
			<div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-brand)_12%,var(--color-background))] text-(--color-brand)'>
				<Icon className='size-5' />
			</div>
			<div className='min-w-0 flex-1'>
				<div className='truncate text-base font-medium'>
					{expense.merchant}
				</div>
				<div className='truncate text-sm text-muted-foreground'>
					{subcategoryLabel} · {expense.time}
				</div>
			</div>
			<div className='flex shrink-0 flex-col items-end gap-2'>
				<div className='text-right text-base font-semibold text-(--color-spent)'>
					{currencyFormatter.format(expense.amountInINR)}
				</div>
				<div className='rounded-full border border-[--color-border] px-2 py-1 text-xs text-muted-foreground'>
					{visibilityLabel}
				</div>
			</div>
		</motion.button>
	);
}
