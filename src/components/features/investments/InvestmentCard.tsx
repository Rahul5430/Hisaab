'use client';

import { motion } from 'framer-motion';

import type { InvestmentSchema } from '@/lib/validators/investment.schema';

type InvestmentCardProps = {
	investment: InvestmentSchema;
	onClick?: () => void;
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

function getInstrumentIconName(instrument: string) {
	switch (instrument) {
		case 'mutual_fund':
		case 'stocks':
			return 'trending-up';
		case 'fd':
		case 'ppf':
		case 'rd':
		case 'nps':
			return 'landmark';
		case 'crypto':
			return 'globe';
		case 'real_estate':
			return 'building';
		case 'other':
		default:
			return 'wallet';
	}
}

function getInstrumentLabel(instrument: string) {
	switch (instrument) {
		case 'mutual_fund':
			return 'Mutual Fund';
		case 'stocks':
			return 'Stocks';
		case 'fd':
			return 'Fixed Deposit';
		case 'ppf':
			return 'PPF';
		case 'rd':
			return 'Recurring Deposit';
		case 'nps':
			return 'NPS';
		case 'crypto':
			return 'Crypto';
		case 'real_estate':
			return 'Real Estate';
		case 'other':
		default:
			return 'Other';
	}
}

function getOrdinalSuffix(day: number) {
	if (day > 3 && day < 21) return `${day}th`;
	switch (day % 10) {
		case 1: return `${day}st`;
		case 2: return `${day}nd`;
		case 3: return `${day}rd`;
		default: return `${day}th`;
	}
}

export function InvestmentCard({
	investment,
	onClick,
}: InvestmentCardProps): React.JSX.Element {
	const iconName = getInstrumentIconName(investment.instrument);
	const instrumentLabel = getInstrumentLabel(investment.instrument);
	
	// Format date for display
	const date = new Date(investment.date);
	const formattedDate = date.toLocaleDateString('en-US', { 
		month: 'short', 
		day: 'numeric' 
	});

	const recurringText = investment.recurring 
		? `${getOrdinalSuffix(investment.recurrenceDay || 1)} monthly`
		: formattedDate;

	return (
		<motion.button
			type='button'
			className='flex min-h-12 w-full items-start gap-3 rounded-xl border border-[--color-border] bg-background px-4 py-3 text-left'
			onClick={onClick}
			whileTap={{ scale: 0.98 }}
			transition={{ type: 'spring', stiffness: 400, damping: 40 }}
		>
			<div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-invest)_12%,var(--color-background))] text-(--color-invest) text-xl'>
				{iconName === 'trending-up' && '📈'}
				{iconName === 'landmark' && '🏛️'}
				{iconName === 'globe' && '🌐'}
				{iconName === 'building' && '🏢'}
				{iconName === 'wallet' && '💼'}
			</div>
			<div className='min-w-0 flex-1'>
				<div className='truncate text-base font-medium'>
					{investment.label}
				</div>
				<div className='truncate text-sm text-muted-foreground'>
					{instrumentLabel} · {recurringText}
				</div>
				<div className='flex gap-2 mt-1'>
					{investment.recurring && (
						<div className='rounded-full border border-[--color-invest]/20 bg-[color-mix(in_srgb,var(--color-invest)_8%,var(--color-background))] px-2 py-0.5 text-xs text-(--color-invest)'>
							Recurring
						</div>
					)}
					{investment.autoLogged && (
						<div className='rounded-full border border-[--color-invest]/20 bg-[color-mix(in_srgb,var(--color-invest)_8%,var(--color-background))] px-2 py-0.5 text-xs text-(--color-invest)'>
							Auto
						</div>
					)}
				</div>
			</div>
			<div className='flex shrink-0 flex-col items-end gap-2'>
				<div className='text-right text-base font-semibold text-(--color-invest)'>
					{currencyFormatter.format(investment.amountInINR)}
				</div>
				<div className='rounded-full border border-[--color-border] px-2 py-1 text-xs text-muted-foreground'>
					{investment.currency}
				</div>
			</div>
		</motion.button>
	);
}
