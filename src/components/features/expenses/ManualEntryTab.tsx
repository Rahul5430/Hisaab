'use client';

import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES, type CategoryId } from '@/constants/categories';
import { useGroups } from '@/lib/hooks/useGroups';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';
import { useAuthStore } from '@/store/auth.store';

type ManualEntryTabProps = {
	onSave: (expense: Omit<ExpenseSchema, 'id'>) => Promise<void>;
};

type FormData = {
	amount: string;
	currency: string;
	merchant: string;
	categoryId: string;
	subcategoryId: string;
	date: string;
	time: string;
	note: string;
	visibility: 'personal' | 'group';
	groupId: string | null;
	paymentMethod: string;
};

const CURRENCIES = [
	{ code: 'INR', symbol: '₹' },
	{ code: 'USD', symbol: '$' },
	{ code: 'EUR', symbol: '€' },
	{ code: 'GBP', symbol: '£' },
];

const PAYMENT_METHODS = [
	{ value: 'upi', label: 'UPI' },
	{ value: 'card', label: 'Card' },
	{ value: 'cash', label: 'Cash' },
	{ value: 'netbanking', label: 'Net Banking' },
	{ value: 'other', label: 'Other' },
];

export function ManualEntryTab({
	onSave,
}: ManualEntryTabProps): React.JSX.Element {
	const user = useAuthStore((s) => s.user);
	const { groups } = useGroups();
	
	const [formData, setFormData] = useState<FormData>({
		amount: '',
		currency: 'INR',
		merchant: '',
		categoryId: '',
		subcategoryId: '',
		date: format(new Date(), 'yyyy-MM-dd'),
		time: format(new Date(), 'HH:mm'),
		note: '',
		visibility: 'personal',
		groupId: null,
		paymentMethod: '',
	});

	const handleSave = async () => {
		if (!user) {
			toast.error('Please sign in to save expenses');
			return;
		}

		// Validation
		const amount = parseFloat(formData.amount);
		if (!formData.amount || isNaN(amount) || amount <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (!formData.merchant.trim()) {
			toast.error('Please enter a merchant name');
			return;
		}

		if (!formData.categoryId || !formData.subcategoryId) {
			toast.error('Please select a category');
			return;
		}

		if (formData.visibility === 'group' && !formData.groupId) {
			toast.error('Please select a group');
			return;
		}

		try {
			const expense: Omit<ExpenseSchema, 'id'> = {
				ownerId: user.uid,
				groupId: formData.groupId,
				amount,
				currency: formData.currency,
				amountInINR: formData.currency === 'INR' ? amount : amount, // Conversion to be implemented later
				merchant: formData.merchant.trim(),
				categoryId: formData.categoryId,
				subcategoryId: formData.subcategoryId,
				visibility: formData.visibility,
				date: formData.date,
				time: formData.time,
				note: formData.note.trim() || null,
				paymentMethod: (formData.paymentMethod as 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null) || null,
				upiId: null,
				source: 'manual',
				rawSms: null,
				receiptImageUrl: null,
				splitDetails: null,
				tags: [],
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};

			await onSave(expense);
		} catch (error) {
			console.error('Failed to save expense:', error);
			toast.error('Failed to save expense');
		}
	};

	const handleCategoryChange = (categoryId: string) => {
		setFormData(prev => ({
			...prev,
			categoryId,
			subcategoryId: '', // Reset subcategory when category changes
		}));
	};

	const selectedCategory = CATEGORIES[formData.categoryId as CategoryId];
	const availableSubcategories = selectedCategory?.subcategories || {};
	const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency);

	return (
		<div className="space-y-6">
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

			{/* Category */}
			<div className="space-y-2">
				<Label htmlFor="category">Category</Label>
				<Select value={formData.categoryId} onValueChange={handleCategoryChange}>
					<SelectTrigger className="h-12">
						<SelectValue placeholder="Select category" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(CATEGORIES).map(([id, category]) => (
							<SelectItem key={id} value={id}>
								{category.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Subcategory */}
			{selectedCategory && (
				<div className="space-y-2">
					<Label htmlFor="subcategory">Subcategory</Label>
					<Select value={formData.subcategoryId} onValueChange={(value) => 
						setFormData(prev => ({ ...prev, subcategoryId: value }))
					}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder="Select subcategory" />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(availableSubcategories).map(([id, subcategory]) => (
								<SelectItem key={id} value={id}>
									{subcategory.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Merchant/Note */}
			<div className="space-y-2">
				<Label htmlFor="merchant">Merchant / Note</Label>
				<Input
					id="merchant"
					value={formData.merchant}
					onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
					placeholder="Where did you spend?"
					className="h-12"
				/>
			</div>

			{/* Date & Time */}
			<div className="grid grid-cols-2 gap-3">
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
				<div className="space-y-2">
					<Label htmlFor="time">Time</Label>
					<Input
						id="time"
						type="time"
						value={formData.time}
						onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
						className="h-12"
					/>
				</div>
			</div>

			{/* Visibility */}
			<div className="space-y-2">
				<Label>Visibility</Label>
				<Tabs
					value={formData.visibility}
					onValueChange={(value) => setFormData(prev => ({ 
						...prev, 
						visibility: value as 'personal' | 'group' 
					}))}
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="personal">Personal</TabsTrigger>
						<TabsTrigger value="group">Group</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Group Selector */}
			{formData.visibility === 'group' && groups.length > 0 && (
				<div className="space-y-2">
					<Label htmlFor="group">Group</Label>
					<Select value={formData.groupId || ''} onValueChange={(value) => 
						setFormData(prev => ({ ...prev, groupId: value || null }))
					}>
						<SelectTrigger className="h-12">
							<SelectValue placeholder="Select group" />
						</SelectTrigger>
						<SelectContent>
							{groups.map((group) => (
								<SelectItem key={group.id} value={group.id}>
									{group.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{/* Payment Method */}
			<div className="space-y-2">
				<Label htmlFor="payment-method">Payment Method (optional)</Label>
				<Select value={formData.paymentMethod} onValueChange={(value) => 
					setFormData(prev => ({ ...prev, paymentMethod: value }))
				}>
					<SelectTrigger className="h-12">
						<SelectValue placeholder="Select payment method" />
					</SelectTrigger>
					<SelectContent>
						{PAYMENT_METHODS.map((method) => (
							<SelectItem key={method.value} value={method.value}>
								{method.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Note */}
			<div className="space-y-2">
				<Label htmlFor="note">Additional Note (optional)</Label>
				<Input
					id="note"
					value={formData.note}
					onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
					placeholder="Add details..."
					className="h-12"
				/>
			</div>

			{/* Save Button */}
			<Button
				onClick={handleSave}
				className="w-full h-12"
			>
				Save Expense
			</Button>
		</div>
	);
}
