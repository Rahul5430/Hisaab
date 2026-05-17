'use client';

import { Timestamp } from 'firebase/firestore';
import { Plus,Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/constants/categories';
import { useBudgets } from '@/lib/hooks/useBudgets';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

export function BudgetManager(): React.JSX.Element {
	const { budgets, isLoading, createBudget, removeBudget, month } = useBudgets();
	const user = useAuthStore((s) => s.user);
	const selectedGroupId = useUIStore((s) => s.selectedGroupId);
	
	const [showAddForm, setShowAddForm] = useState(false);
	const [newBudget, setNewBudget] = useState({
		categoryId: '',
		monthlyLimit: '',
		isGroup: false,
	});
	const [isAdding, setIsAdding] = useState(false);

	const handleAddBudget = async () => {
		if (!user || !newBudget.categoryId || !newBudget.monthlyLimit) {
			toast.error('Please fill all fields');
			return;
		}

		const limit = parseFloat(newBudget.monthlyLimit);
		if (isNaN(limit) || limit <= 0) {
			toast.error('Please enter a valid budget limit');
			return;
		}

		setIsAdding(true);
		try {
			const ownerId = newBudget.isGroup ? selectedGroupId : user.uid;
			if (!ownerId) {
				toast.error('Please select a group for group budgets');
				return;
			}

			await createBudget({
				ownerId,
				ownerType: newBudget.isGroup ? 'group' : 'user',
				categoryId: newBudget.categoryId,
				monthlyLimit: limit,
				currency: 'INR',
				month,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			});
			
			// Reset form
			setNewBudget({ categoryId: '', monthlyLimit: '', isGroup: false });
			setShowAddForm(false);
			
			toast.success('Budget created successfully');
		} catch (error) {
			console.error('Failed to create budget:', error);
			toast.error('Failed to create budget');
		} finally {
			setIsAdding(false);
		}
	};

	const handleDeleteBudget = async (budgetId: string) => {
		try {
			await removeBudget(budgetId);
			toast.success('Budget deleted successfully');
		} catch (error) {
			console.error('Failed to delete budget:', error);
			toast.error('Failed to delete budget');
		}
	};

	const getCategoryLabel = (categoryId: string) => {
		const category = CATEGORIES[categoryId as keyof typeof CATEGORIES];
		return category?.label || categoryId;
	};

	const getOwnerLabel = (ownerId: string) => {
		if (ownerId === user?.uid) return 'Personal';
		if (ownerId === selectedGroupId) return 'Group';
		return 'Unknown';
	};

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Existing budgets */}
			{budgets.map((budget) => (
				<div key={budget.id} className="flex items-center justify-between p-3 border border-[--color-border] rounded-lg">
					<div className="flex-1">
						<div className="text-sm font-medium">
							{getCategoryLabel(budget.categoryId)}
						</div>
						<div className="text-xs text-muted-foreground">
							{getOwnerLabel(budget.ownerId)} • {currencyFormatter.format(budget.monthlyLimit)}
						</div>
					</div>
					
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<Trash2 className="size-4" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Budget</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete the budget for {getCategoryLabel(budget.categoryId)}? This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => handleDeleteBudget(budget.id)}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			))}

			{/* Add budget form */}
			{showAddForm ? (
				<div className="border border-[--color-border] rounded-lg p-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={newBudget.categoryId}
							onValueChange={(value) => setNewBudget(prev => ({ ...prev, categoryId: value }))}
						>
							<SelectTrigger>
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

					<div className="space-y-2">
						<Label htmlFor="limit">Monthly Limit (₹)</Label>
						<Input
							id="limit"
							type="number"
							value={newBudget.monthlyLimit}
							onChange={(e) => setNewBudget(prev => ({ ...prev, monthlyLimit: e.target.value }))}
							placeholder="Enter amount"
						/>
					</div>

					<div className="space-y-2">
						<Label>Type</Label>
						<Select
							value={newBudget.isGroup ? 'group' : 'personal'}
							onValueChange={(value) => setNewBudget(prev => ({ ...prev, isGroup: value === 'group' }))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="personal">Personal</SelectItem>
								<SelectItem value="group">
									Group {!selectedGroupId && '(select a group first)'}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={handleAddBudget}
							disabled={isAdding || !newBudget.categoryId || !newBudget.monthlyLimit}
							className="flex-1"
						>
							{isAdding ? 'Creating...' : 'Create Budget'}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowAddForm(false);
								setNewBudget({ categoryId: '', monthlyLimit: '', isGroup: false });
							}}
							className="flex-1"
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<Button
					variant="outline"
					onClick={() => setShowAddForm(true)}
					className="w-full h-12 justify-start gap-2"
				>
					<Plus className="size-4" />
					Add Budget
				</Button>
			)}

			{budgets.length === 0 && !showAddForm && (
				<div className="text-center py-8 text-muted-foreground">
					No budgets set yet. Tap &quot;Add Budget&quot; to create your first budget.
				</div>
			)}
		</div>
	);
}
