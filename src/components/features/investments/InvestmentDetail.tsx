'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useInvestments } from '@/lib/hooks/useInvestments';
import type { InvestmentSchema } from '@/lib/validators/investment.schema';

type InvestmentDetailProps = {
	investment: InvestmentSchema;
	onClose: () => void;
};

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

function getOrdinalSuffix(day: number) {
	if (day > 3 && day < 21) return `${day}th`;
	switch (day % 10) {
		case 1: return `${day}st`;
		case 2: return `${day}nd`;
		case 3: return `${day}rd`;
		default: return `${day}th`;
	}
}

export function InvestmentDetail({
	investment,
	onClose,
}: InvestmentDetailProps): React.JSX.Element {
	const { removeInvestment } = useInvestments();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await removeInvestment(investment.id);
			toast.success('Investment deleted');
			onClose();
		} catch (err) {
			console.error('Failed to delete investment:', err);
			toast.error('Failed to delete investment');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleEdit = () => {
		toast.info('Edit coming soon');
	};

	const instrumentLabel = getInstrumentLabel(investment.instrument);
	
	const recurringText = investment.recurring 
		? `Repeats on day ${getOrdinalSuffix(investment.recurrenceDay || 1)} of every month`
		: 'One-time investment';

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="text-lg font-medium">Investment Detail</div>
				<div className="flex gap-2">
					<Button variant="ghost" size="sm" onClick={handleEdit}>
						<Edit className="h-4 w-4" />
					</Button>
					
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="ghost" size="sm">
								<Trash2 className="h-4 w-4" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Investment</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this investment? This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									disabled={isDeleting}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			{/* Main content */}
			<div className="space-y-6">
				{/* Amount */}
				<div className="text-3xl font-bold text-(--color-invest)">
					{currencyFormatter.format(investment.amountInINR)}
				</div>

				{/* Details grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Label</div>
						<div className="font-medium">{investment.label}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Instrument</div>
						<div className="font-medium">{instrumentLabel}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Date</div>
						<div className="font-medium">{investment.date}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Currency</div>
						<div className="font-medium">{investment.currency}</div>
					</div>
				</div>

				{/* Recurring info */}
				<div className="space-y-2">
					<div className="text-sm text-muted-foreground">Type</div>
					<div className="font-medium">{recurringText}</div>
					{investment.recurring && investment.recurrenceEndDate && (
						<div className="text-sm text-muted-foreground">
							Ends on {investment.recurrenceEndDate}
						</div>
					)}
				</div>

				{/* Note */}
				{investment.note && (
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">Note</div>
						<div className="p-3 bg-muted rounded-lg">
							{investment.note}
						</div>
					</div>
				)}

				{/* Metadata */}
				<div className="space-y-2">
					<div className="text-sm text-muted-foreground">Metadata</div>
					<div className="space-y-1">
						<div className="flex justify-between">
							<span className="text-sm">Auto-logged:</span>
							<span className="text-sm font-medium">
								{investment.autoLogged ? 'Yes' : 'No'}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm">Added:</span>
							<span className="text-sm font-medium">
								{investment.createdAt.toDate().toLocaleDateString('en-IN')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
