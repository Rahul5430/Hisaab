'use client';

import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIES, type CategoryId } from '@/constants/categories';
import { auth } from '@/lib/firebase/client';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useGroups } from '@/lib/hooks/useGroups';
import type { ParsedExpense } from '@/lib/parsers/sms';
import { parseSMSClient } from '@/lib/parsers/sms';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';
import { useAuthStore } from '@/store/auth.store';

type SMSParseTabProps = {
	onSave: (expense: Omit<ExpenseSchema, 'id'>) => Promise<void>;
};

type FormData = {
	amount: string;
	merchant: string;
	categoryId: string;
	subcategoryId: string;
	date: string;
	time: string;
	note: string;
	visibility: 'personal' | 'group';
	groupId: string | null;
	paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null;
	upiId: string | null;
};

export function SMSParseTab({ onSave }: Readonly<SMSParseTabProps>): React.JSX.Element {
	const user = useAuthStore((s) => s.user);
	const { groups } = useGroups();
	const { lookupMerchantPattern } = useExpenses();

	const [smsText, setSmsText] = useState('');
	const [parsed, setParsed] = useState<ParsedExpense | null>(null);
	const [isParsing, setIsParsing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showSuggestion, setShowSuggestion] = useState(false);

	const [formData, setFormData] = useState<FormData>({
		amount: '',
		merchant: '',
		categoryId: '',
		subcategoryId: '',
		date: format(new Date(), 'yyyy-MM-dd'),
		time: format(new Date(), 'HH:mm'),
		note: '',
		visibility: 'personal',
		groupId: null,
		paymentMethod: null,
		upiId: null,
	});

	const handleParseSMS = async () => {
		if (!smsText.trim()) {
			toast.error('Please paste an SMS message');
			return;
		}

		setIsParsing(true);

		try {
			// Layer 1+3: Client-side parsing
			let result = parseSMSClient(smsText);

			// Layer 4: Gemini fallback if no result
			if (result.resolvedBy === 'none' && auth.currentUser) {
				const token = await auth.currentUser.getIdToken();
				const response = await fetch('/api/sms/parse', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ smsText }),
				});

				if (response.ok) {
					const data = await response.json();
					result = data.parsed;
				}
			}

			setParsed(result);

			// Update form with parsed data
			setFormData((prev) => ({
				...prev,
				amount: result.amount?.toString() || prev.amount,
				merchant: result.merchant || prev.merchant,
				categoryId: result.suggestedCategoryId || prev.categoryId,
				subcategoryId:
					result.suggestedSubcategoryId || prev.subcategoryId,
				date: result.date || prev.date,
				time: result.time || prev.time,
				paymentMethod: result.paymentMethod ?? prev.paymentMethod,
				upiId: result.upiId ?? prev.upiId,
			}));

			// Layer 2: Check merchant patterns
			if (result.merchant && user) {
				const pattern = await lookupMerchantPattern(result.merchant);
				if (pattern) {
					if (
						pattern.confidence > 0.7 &&
						pattern.confirmedCount > 2
					) {
						// Silent application
						setFormData((prev) => ({
							...prev,
							categoryId: pattern.categoryId,
							subcategoryId: pattern.subcategoryId,
						}));
					} else if (pattern.confidence >= 0.4) {
						// Show suggestion
						setFormData((prev) => ({
							...prev,
							categoryId: pattern.categoryId,
							subcategoryId: pattern.subcategoryId,
						}));
						setShowSuggestion(true);
					}
				}
			}
		} catch (error) {
			console.error('SMS parsing failed:', error);
			toast.error('Failed to parse SMS');
		} finally {
			setIsParsing(false);
		}
	};

	const handleSave = async () => {
		if (!user) {
			toast.error('Please sign in to save expenses');
			return;
		}

		// Validation
		const amount = Number.parseFloat(formData.amount);
		if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
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

		setIsSaving(true);

		try {
			const expense: Omit<ExpenseSchema, 'id'> = {
				ownerId: user.uid,
				groupId: formData.groupId,
				amount,
				currency: 'INR',
				amountInINR: amount, // Assume INR for now
				merchant: formData.merchant.trim(),
				categoryId: formData.categoryId,
				subcategoryId: formData.subcategoryId,
				visibility: formData.visibility,
				date: formData.date,
				time: formData.time,
				note: formData.note.trim() || null,
				paymentMethod: formData.paymentMethod,
				upiId: formData.upiId,
				source: 'sms',
				rawSms: smsText,
				receiptImageUrl: null,
				splitDetails: null,
				tags: [],
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};

			await onSave(expense);

			// Confirm merchant pattern
			if (parsed?.merchant && auth.currentUser) {
				try {
					const token = await auth.currentUser.getIdToken();
					await fetch('/api/sms/confirm', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							merchantRaw: parsed.merchant,
							merchantNormalized: formData.merchant.trim(),
							categoryId: formData.categoryId,
							subcategoryId: formData.subcategoryId,
							paymentMethod: parsed.paymentMethod,
						}),
					});
				} catch (error) {
					console.error('Failed to confirm merchant pattern:', error);
				}
			}
		} catch (error) {
			console.error('Failed to save expense:', error);
			toast.error('Failed to save expense');
		} finally {
			setIsSaving(false);
		}
	};

	const handleCategoryChange = (categoryId: string) => {
		setFormData((prev) => ({
			...prev,
			categoryId,
			subcategoryId: '', // Reset subcategory when category changes
		}));
		setShowSuggestion(false); // Hide suggestion when user manually changes
	};

	const handleSubcategoryChange = (subcategoryId: string) => {
		setFormData((prev) => ({
			...prev,
			subcategoryId,
		}));
		setShowSuggestion(false); // Hide suggestion when user manually changes
	};

	const selectedCategory = CATEGORIES[formData.categoryId as CategoryId];
	const availableSubcategories = selectedCategory?.subcategories || {};

	return (
		<div className='flex h-full flex-col'>
			<div className='flex-1 overflow-y-auto space-y-4 py-4 px-4'>
				{/* SMS Input Area */}
			<div className='space-y-4'>
				<Label htmlFor='sms-text'>Paste your bank SMS below</Label>
				<textarea
					id='sms-text'
					value={smsText}
					onChange={(e) => setSmsText(e.target.value)}
					placeholder='Paste your SMS here...'
					className='w-full min-h-30 p-3 border border-[--color-border] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent'
				/>
				<Button
					onClick={handleParseSMS}
					disabled={isParsing || !smsText.trim()}
					className='w-full h-12'
				>
					{isParsing ? 'Parsing...' : 'Parse SMS'}
				</Button>
			</div>

			{/* Parsed Preview */}
			{parsed && (
				<div className='space-y-4 border-t border-[--color-border] pt-4'>
					<div className='text-sm text-muted-foreground'>
						Parsed successfully with{' '}
						{Math.round(parsed.confidence * 100)}% confidence
					</div>

					{/* Amount */}
					<div className='space-y-2'>
						<Label htmlFor='amount'>Amount</Label>
						<Input
							id='amount'
							type='number'
							value={formData.amount}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									amount: e.target.value,
								}))
							}
							placeholder='0.00'
							className='h-12'
						/>
					</div>

					{/* Merchant */}
					<div className='space-y-2'>
						<Label htmlFor='merchant'>Merchant</Label>
						<Input
							id='merchant'
							value={formData.merchant}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									merchant: e.target.value,
								}))
							}
							placeholder='Merchant name'
							className='h-12'
						/>
					</div>

					{/* Category */}
					<div className='space-y-2'>
						<Label htmlFor='category'>
							Category
							{showSuggestion && (
								<Badge
									variant='secondary'
									className='ml-2 text-xs'
								>
									Suggested
								</Badge>
							)}
						</Label>
						<Select
							value={formData.categoryId}
							onValueChange={handleCategoryChange}
						>
							<SelectTrigger className='h-12'>
								<SelectValue placeholder='Select category' />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(CATEGORIES).map(
									([id, category]) => (
										<SelectItem key={id} value={id}>
											{category.label}
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>
					</div>

					{/* Subcategory */}
					{selectedCategory && (
						<div className='space-y-2'>
							<Label htmlFor='subcategory'>Subcategory</Label>
							<Select
								value={formData.subcategoryId}
								onValueChange={handleSubcategoryChange}
							>
								<SelectTrigger className='h-12'>
									<SelectValue placeholder='Select subcategory' />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(availableSubcategories).map(
										([id, subcategory]) => (
											<SelectItem key={id} value={id}>
												{subcategory.label}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Date & Time */}
					<div className='grid grid-cols-2 gap-3'>
						<div className='space-y-2'>
							<Label htmlFor='date'>Date</Label>
							<Input
								id='date'
								type='date'
								value={formData.date}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										date: e.target.value,
									}))
								}
								className='h-12'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='time'>Time</Label>
							<Input
								id='time'
								type='time'
								value={formData.time}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										time: e.target.value,
									}))
								}
								className='h-12'
							/>
						</div>
					</div>

					{/* Visibility */}
					<div className='space-y-2'>
						<Label>Visibility</Label>
						<Tabs
							value={formData.visibility}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									visibility: value as 'personal' | 'group',
								}))
							}
						>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='personal'>
									Personal
								</TabsTrigger>
								<TabsTrigger value='group'>Group</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* Group Selector */}
					{formData.visibility === 'group' && groups.length > 0 && (
						<div className='space-y-2'>
							<Label htmlFor='group'>Group</Label>
							<Select
								value={formData.groupId || ''}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										groupId: value || null,
									}))
								}
							>
								<SelectTrigger className='h-12'>
									<SelectValue placeholder='Select group' />
								</SelectTrigger>
								<SelectContent>
									{groups.map((group) => (
										<SelectItem
											key={group.id}
											value={group.id}
										>
											{group.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Note */}
					<div className='space-y-2'>
						<Label htmlFor='note'>Note (optional)</Label>
						<Input
							id='note'
							value={formData.note}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									note: e.target.value,
								}))
							}
							placeholder='Add a note...'
							className='h-12'
						/>
					</div>

					{/* Save Button */}
</div>
			)}
		</div>
		{parsed && (
			<div className='sticky bottom-0 left-0 z-10 border-t border-[--color-border] bg-background p-4'>
				<Button
						onClick={handleSave}
						disabled={isSaving}
						className='w-full h-12'
					>
						{isSaving ? 'Saving...' : 'Save Expense'}
					</Button>
				</div>
			)}
		</div>
	);
}
