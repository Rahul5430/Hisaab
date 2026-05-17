'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORIES } from '@/constants/categories';
import { useExpense, useExpenses } from '@/lib/hooks/useExpenses';
import { useAuthStore } from '@/store/auth.store';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

export default function ExpenseDetailPage() {
	const params = useParams();
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const queryClient = useQueryClient();
	const { removeExpense } = useExpenses();
	
	const [isDeleting, setIsDeleting] = useState(false);

	const expenseId = typeof params.id === 'string' ? params.id : '';
	const {
		data: expense,
		isLoading,
		error,
	} = useExpense(expenseId);

	const handleDelete = async () => {
		if (!expense || !user) return;

		setIsDeleting(true);
		try {
			await removeExpense(expense.id);
			
			// Invalidate cache
			queryClient.invalidateQueries({ queryKey: ['expenses', 'detail', expense.id] });
			
			toast.success('Expense deleted');
			router.back();
		} catch (err) {
			console.error('Failed to delete expense:', err);
			toast.error('Failed to delete expense');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleEdit = () => {
		toast.info('Edit coming soon');
	};

	const getCategoryInfo = (categoryId: string, subcategoryId: string) => {
		const category = CATEGORIES[categoryId as keyof typeof CATEGORIES] || CATEGORIES.other;
		const subcategories = category.subcategories as Record<string, { label: string; icon: string }>;
		const subcategory = subcategories[subcategoryId];
		
		return {
			categoryLabel: category.label,
			subcategoryLabel: subcategory?.label || subcategoryId,
			icon: subcategory?.icon || category.icon,
		};
	};

	const formatPaymentMethod = (method: string | null) => {
		if (!method) return 'Not specified';
		const methods: Record<string, string> = {
			upi: 'UPI',
			card: 'Card',
			cash: 'Cash',
			netbanking: 'Net Banking',
			other: 'Other',
		};
		return methods[method] || method;
	};

	if (isLoading) {
		return (
			<div className="px-4 py-6 space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<Skeleton className="h-8 w-32" />
				</div>
				
				<div className="space-y-4">
					<Skeleton className="h-20 w-20 rounded-full" />
					<Skeleton className="h-12 w-48" />
					<Skeleton className="h-6 w-32" />
					
					<div className="grid grid-cols-2 gap-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error || !expense) {
		return (
			<div className="px-4 py-6 space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="text-lg font-medium">Expense not found</div>
				</div>
				
				<div className="text-center py-12">
					<div className="text-muted-foreground">The expense you&apos;re looking for doesn&apos;t exist.</div>
					<Button 
						variant="outline" 
						className="mt-4"
						onClick={() => router.back()}
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	const { categoryLabel, subcategoryLabel, icon } = getCategoryInfo(expense.categoryId, expense.subcategoryId);
	const canEdit = user && expense.ownerId === user.uid;

	return (
		<div className="px-4 py-6 space-y-6 pb-24">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="text-lg font-medium">Expense Detail</div>
				</div>
				
				{canEdit && (
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
									<AlertDialogTitle>Delete Expense</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this expense? This action cannot be undone.
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
				)}
			</div>

			{/* Main content */}
			<div className="space-y-6">
				{/* Category icon and merchant */}
				<div className="flex items-center gap-4">
					<div className="w-20 h-20 rounded-full bg-[color-mix(in_srgb,var(--color-brand)_12%,var(--color-background))] flex items-center justify-center text-(--color-brand)">
						{/* Icon would go here - for now using a placeholder */}
						<div className="text-3xl">{icon}</div>
					</div>
					<div>
						<h1 className="text-2xl font-bold">{expense.merchant}</h1>
						<div className="text-muted-foreground">{categoryLabel}</div>
					</div>
				</div>

				{/* Amount */}
				<div className="text-3xl font-bold text-(--color-spent)">
					{currencyFormatter.format(expense.amountInINR)}
				</div>

				{/* Details grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Date</div>
						<div className="font-medium">{expense.date}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Time</div>
						<div className="font-medium">{expense.time}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Category</div>
						<div className="font-medium">{categoryLabel}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Subcategory</div>
						<div className="font-medium">{subcategoryLabel}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Payment Method</div>
						<div className="font-medium">{formatPaymentMethod(expense.paymentMethod)}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Visibility</div>
						<div className="font-medium capitalize">{expense.visibility}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Currency</div>
						<div className="font-medium">{expense.currency}</div>
					</div>
					
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Added by</div>
						<div className="font-medium">{expense.ownerId}</div>
					</div>
				</div>

				{/* Note */}
				{expense.note && (
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">Note</div>
						<div className="p-3 bg-muted rounded-lg">
							{expense.note}
						</div>
					</div>
				)}

				{/* Split details */}
				{expense.splitDetails && (
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">Split Details</div>
						<div className="space-y-2">
							{expense.splitDetails.shares.map((share, index) => (
								<div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
									<div>
										<div className="font-medium">{share.uid}</div>
										<div className="text-sm text-muted-foreground">{share.percentage}%</div>
									</div>
									<div className="font-medium">
										{currencyFormatter.format(share.amount)}
									</div>
								</div>
							))}
						</div>
						<div className="text-xs text-muted-foreground">
							Split type: {expense.splitDetails.splitType}
						</div>
					</div>
				)}

				{/* Receipt image placeholder */}
				{expense.receiptImageUrl && (
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">Receipt</div>
						<div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
							<div className="text-muted-foreground">Receipt image</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
