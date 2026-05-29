'use client';

import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvestments } from '@/lib/hooks/useInvestments';
import { convertToINR } from '@/lib/utils';
import type { InvestmentSchema } from '@/lib/validators/investment.schema';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

const INSTRUMENT_TYPES = [
	{ id: 'mutual_fund', label: 'Mutual Fund', icon: '📈' },
	{ id: 'stocks', label: 'Stocks', icon: '📊' },
	{ id: 'fd', label: 'Fixed Deposit', icon: '🏛️' },
	{ id: 'ppf', label: 'PPF', icon: '🏦' },
	{ id: 'rd', label: 'Recurring Deposit', icon: '💰' },
	{ id: 'nps', label: 'NPS', icon: '⚖️' },
	{ id: 'crypto', label: 'Crypto', icon: '🌐' },
	{ id: 'real_estate', label: 'Real Estate', icon: '🏢' },
	{ id: 'other', label: 'Other', icon: '💼' },
] as const;

const CURRENCIES = [
	{ code: 'INR', symbol: '₹' },
	{ code: 'USD', symbol: '$' },
	{ code: 'EUR', symbol: '€' },
	{ code: 'GBP', symbol: '£' },
];

type FormData = {
	instrument: string;
	label: string;
	amount: string;
	currency: string;
	date: string;
	isRecurring: boolean;
	recurrenceDay: string;
	recurrenceEndDate: string;
	note: string;
};

export function AddInvestmentSheet(): React.JSX.Element {
	const addInvestmentSheetOpen = useUIStore((s) => s.addInvestmentSheetOpen);
	const setAddInvestmentSheetOpen = useUIStore((s) => s.setAddInvestmentSheetOpen);
	const user = useAuthStore((s) => s.user);
	const { createInvestment } = useInvestments();
	
	const [formData, setFormData] = useState<FormData>({
		instrument: '',
		label: '',
		amount: '',
		currency: 'INR',
		date: format(new Date(), 'yyyy-MM-dd'),
		isRecurring: false,
		recurrenceDay: '1',
		recurrenceEndDate: '',
		note: '',
	});

	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!user) {
			toast.error('Please sign in to add investments');
			return;
		}

		// Validation
		if (!formData.instrument) {
			toast.error('Please select an instrument type');
			return;
		}

		if (!formData.label.trim()) {
			toast.error('Please enter a label');
			return;
		}

		const amount = Number.parseFloat(formData.amount);
		if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (formData.isRecurring && (!formData.recurrenceDay || Number.parseInt(formData.recurrenceDay) < 1 || Number.parseInt(formData.recurrenceDay) > 28)) {
			toast.error('Please enter a valid recurrence day (1-28)');
			return;
		}

		setIsSaving(true);

		try {
			const investment: Omit<InvestmentSchema, 'id'> = {
				ownerId: user.uid,
				groupId: null,
				instrument: formData.instrument as InvestmentSchema['instrument'],
				label: formData.label.trim(),
				amount,
				currency: formData.currency,
				amountInINR: convertToINR(amount, formData.currency),
				date: formData.date,
				note: formData.note.trim() || null,
				recurring: formData.isRecurring,
				recurrenceDay: formData.isRecurring ? Number.parseInt(formData.recurrenceDay) : null,
				recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : null,
				autoLogged: false,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};

			await createInvestment(investment);
			setAddInvestmentSheetOpen(false);
			
			// Reset form
			setFormData({
				instrument: '',
				label: '',
				amount: '',
				currency: 'INR',
				date: format(new Date(), 'yyyy-MM-dd'),
				isRecurring: false,
				recurrenceDay: '1',
				recurrenceEndDate: '',
				note: '',
			});
			
			// Show success toast
			toast.success('Investment saved');
		} catch (error) {
			console.error('Failed to save investment:', error);
			toast.error('Failed to save investment');
		} finally {
			setIsSaving(false);
		}
	};

	const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency);

	return (
		<Sheet open={addInvestmentSheetOpen} onOpenChange={setAddInvestmentSheetOpen}>
			<SheetContent
				side="bottom"
				className="h-[90vh] max-h-200 max-w-107.5 mx-auto rounded-t-2xl"
			>
				{/* Drag handle */}
				<div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-2 mb-6" />
				
				<div className="space-y-6">
					{/* Instrument type selector */}
					<div className="space-y-3">
						<Label>Investment Type</Label>
						<div className="grid grid-cols-3 gap-3">
							{INSTRUMENT_TYPES.map((type) => (
								<button
									key={type.id}
									type="button"
									onClick={() => setFormData(prev => ({ ...prev, instrument: type.id }))}
									className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors h-16 ${
										formData.instrument === type.id
											? 'border-[--color-invest] bg-[color-mix(in_srgb,var(--color-invest)_8%,var(--color-background))]'
											: 'border-[--color-border] bg-background'
									}`}
								>
									<span className="text-xl">{type.icon}</span>
									<span className="text-xs text-center">{type.label}</span>
								</button>
							))}
						</div>
					</div>

					{/* Label */}
					<div className="space-y-2">
						<Label htmlFor="label">Label</Label>
						<Input
							id="label"
							value={formData.label}
							onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
							placeholder="e.g. Axis Bluechip SIP"
							className="h-12"
						/>
					</div>

					{/* Amount & Currency */}
					<div className="grid grid-cols-3 gap-3">
						<div className="col-span-2 space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
									{selectedCurrency?.symbol}
								</span>
								<Input
									id="amount"
									type="number"
									value={formData.amount}
									onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
									placeholder="0.00"
									className="h-12 pl-8"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="currency">Currency</Label>
							<Select value={formData.currency} onValueChange={(value) => 
								setFormData(prev => ({ ...prev, currency: value }))
							}>
								<SelectTrigger className="h-12">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{CURRENCIES.map((currency) => (
										<SelectItem key={currency.code} value={currency.code}>
											{currency.code} ({currency.symbol})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Date */}
					<div className="space-y-2">
						<Label htmlFor="date">Date</Label>
						<Input
							id="date"
							type="date"
							value={formData.date}
							onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
							className="h-12"
						/>
					</div>

					{/* One-time / Recurring toggle */}
					<div className="space-y-2">
						<Label>Type</Label>
						<Tabs
							value={formData.isRecurring ? 'recurring' : 'onetime'}
							onValueChange={(value) => setFormData(prev => ({ 
								...prev, 
								isRecurring: value === 'recurring' 
							}))}
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="onetime">One-time</TabsTrigger>
								<TabsTrigger value="recurring">Recurring</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* Recurring options */}
					{formData.isRecurring && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="recurrenceDay">Repeat on day</Label>
								<Input
									id="recurrenceDay"
									type="number"
									min="1"
									max="28"
									value={formData.recurrenceDay}
									onChange={(e) => setFormData(prev => ({ ...prev, recurrenceDay: e.target.value }))}
									placeholder="1-28"
									className="h-12"
								/>
								<div className="text-xs text-muted-foreground">
									Day of month (1-28) when investment will be logged
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="recurrenceEndDate">End date (optional)</Label>
								<Input
									id="recurrenceEndDate"
									type="date"
									value={formData.recurrenceEndDate}
									onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
									className="h-12"
								/>
								<div className="text-xs text-muted-foreground">
									Leave empty for no end date
								</div>
							</div>
						</div>
					)}

					{/* Note */}
					<div className="space-y-2">
						<Label htmlFor="note">Note (optional)</Label>
						<Input
							id="note"
							value={formData.note}
							onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
							placeholder="Add a note..."
							className="h-12"
						/>
					</div>

					{/* Save button */}
					<Button
						onClick={handleSave}
						disabled={isSaving}
						className="w-full h-12"
					>
						{isSaving ? 'Saving...' : 'Save Investment'}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
