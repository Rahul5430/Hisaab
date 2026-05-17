'use client';

import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AddInvestmentSheet } from '@/components/features/investments/AddInvestmentSheet';
import { InvestmentCard } from '@/components/features/investments/InvestmentCard';
import { InvestmentDetail } from '@/components/features/investments/InvestmentDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvestments } from '@/lib/hooks/useInvestments';
import type { InvestmentSchema } from '@/lib/validators/investment.schema';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

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

export default function InvestmentsPage() {
	const { investments, isLoading, error } = useInvestments();
	
	const [selectedInvestment, setSelectedInvestment] = useState<InvestmentSchema | null>(null);

	// Calculate total invested and breakdown by instrument type
	const { totalInvested, breakdownByType } = useMemo(() => {
		const total = investments.reduce((sum, inv) => sum + inv.amountInINR, 0);
		
		const breakdown = investments.reduce((acc, inv) => {
			const label = getInstrumentLabel(inv.instrument);
			acc[label] = (acc[label] || 0) + inv.amountInINR;
			return acc;
		}, {} as Record<string, number>);

		return { totalInvested: total, breakdownByType: breakdown };
	}, [investments]);

	// Group investments by instrument type
	const investmentsByType = useMemo(() => {
		const grouped = investments.reduce((acc, inv) => {
			const label = getInstrumentLabel(inv.instrument);
			if (!acc[label]) acc[label] = [];
			acc[label].push(inv);
			return acc;
		}, {} as Record<string, InvestmentSchema[]>);

		return grouped;
	}, [investments]);

	if (error) {
		toast.error('Failed to load investments');
	}

	return (
		<div className="px-4 py-6 space-y-6">
			{/* Summary card */}
			<div className="bg-background border border-[--color-border] rounded-xl p-6 space-y-4">
				<div className="text-2xl font-bold text-(--color-invest)">
					{currencyFormatter.format(totalInvested)}
				</div>
				<div className="text-sm text-muted-foreground">Total Invested</div>
				
				{Object.entries(breakdownByType).length > 0 && (
					<div className="flex flex-wrap gap-2">
						{Object.entries(breakdownByType).map(([type, amount]) => (
							<div
								key={type}
								className="rounded-full border border-[--color-invest]/20 bg-[color-mix(in_srgb,var(--color-invest)_8%,var(--color-background))] px-3 py-1 text-xs text-(--color-invest)"
							>
								{type}: {currencyFormatter.format(amount)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			)}

			{/* Empty state */}
			{!isLoading && investments.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
					<div className="text-muted-foreground">No investments yet.</div>
					<div className="text-sm text-muted-foreground mt-1">
						Tap + to add your first investment.
					</div>
				</div>
			)}

			{/* Investment list */}
			{!isLoading && investments.length > 0 && (
				<div className="space-y-6">
					{Object.entries(investmentsByType).map(([type, typeInvestments]) => (
						<div key={type} className="space-y-3">
							<div className="text-sm font-medium text-secondary">
								{type} ({typeInvestments.length})
							</div>
							<div className="space-y-2">
								{typeInvestments.map((investment) => (
									<InvestmentCard
										key={investment.id}
										investment={investment}
										onClick={() => setSelectedInvestment(investment)}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Add Investment Sheet */}
			<AddInvestmentSheet />

			{/* Investment Detail Sheet */}
			{selectedInvestment && (
				<div className="fixed inset-0 z-50 flex items-end justify-center">
					<div className="fixed inset-0 bg-black/50" onClick={() => setSelectedInvestment(null)} />
					<div className="relative bg-background rounded-t-2xl max-w-[430px] w-full max-h-[90vh] overflow-y-auto">
						<div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-2 mb-6" />
						<div className="px-4 py-6">
							<InvestmentDetail
								investment={selectedInvestment}
								onClose={() => setSelectedInvestment(null)}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
