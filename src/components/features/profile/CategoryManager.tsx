'use client';

import { ArrowUpDown, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CATEGORIES } from '@/constants/categories';

type CategoryVisibility = Record<string, boolean>;

export function CategoryManager(): React.JSX.Element {
	const [categoryVisibility, setCategoryVisibility] = useState<CategoryVisibility>(() => {
		// Initialize with all categories visible
		const visibility: CategoryVisibility = {};
		Object.keys(CATEGORIES).forEach(categoryId => {
			visibility[categoryId] = true;
		});
		return visibility;
	});

	const [showAddCategory, setShowAddCategory] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState('');
	const [newCategoryIcon, setNewCategoryIcon] = useState('');
	const [isAdding, setIsAdding] = useState(false);

	const handleToggleVisibility = (categoryId: string) => {
		setCategoryVisibility(prev => ({
			...prev,
			[categoryId]: !prev[categoryId]
		}));
		
		const isVisible = !categoryVisibility[categoryId];
		toast.success(`${CATEGORIES[categoryId as keyof typeof CATEGORIES]?.label || categoryId} ${isVisible ? 'shown' : 'hidden'}`);
	};

	const handleAddCategory = async () => {
		if (!newCategoryName.trim()) {
			toast.error('Please enter a category name');
			return;
		}

		setIsAdding(true);
		try {
			// This is a placeholder for adding custom categories
			// In a real implementation, this would call an API to save the custom category
			toast.info('Custom categories coming soon');
			
			// Reset form
			setNewCategoryName('');
			setNewCategoryIcon('');
			setShowAddCategory(false);
		} catch (error) {
			console.error('Failed to add category:', error);
			toast.error('Failed to add category');
		} finally {
			setIsAdding(false);
		}
	};

	const handleReorder = () => {
		toast.info('Category reordering coming soon');
	};

	const visibleCategories = Object.entries(CATEGORIES).filter(([categoryId]) => 
		categoryVisibility[categoryId] !== false
	);
	const hiddenCategories = Object.entries(CATEGORIES).filter(([categoryId]) => 
		categoryVisibility[categoryId] === false
	);

	return (
		<div className="space-y-6">
			{/* Reorder button */}
			<Button
				variant="outline"
				onClick={handleReorder}
				className="w-full h-12 justify-start gap-2"
			>
				<ArrowUpDown className="size-4" />
				Reorder Categories
			</Button>

			{/* Visible categories */}
			<div className="space-y-3">
				<div className="text-sm font-medium text-muted-foreground">
					Visible Categories ({visibleCategories.length})
				</div>
				{visibleCategories.map(([categoryId, category]) => (
					<div key={categoryId} className="flex items-center justify-between p-3 border border-[--color-border] rounded-lg">
						<div className="flex items-center gap-3">
							<span className="text-xl">{category.icon}</span>
							<div>
								<div className="text-sm font-medium">{category.label}</div>
								{category.subcategories && Object.keys(category.subcategories).length > 0 && (
									<div className="text-xs text-muted-foreground">
										{Object.keys(category.subcategories).length} subcategories
									</div>
								)}
							</div>
						</div>
						<Switch
							checked={categoryVisibility[categoryId] !== false}
							onCheckedChange={() => handleToggleVisibility(categoryId)}
						/>
					</div>
				))}
			</div>

			{/* Hidden categories */}
			{hiddenCategories.length > 0 && (
				<div className="space-y-3">
					<div className="text-sm font-medium text-muted-foreground">
						Hidden Categories ({hiddenCategories.length})
					</div>
					{hiddenCategories.map(([categoryId, category]) => (
						<div key={categoryId} className="flex items-center justify-between p-3 border border-[--color-border] rounded-lg opacity-60">
							<div className="flex items-center gap-3">
								<span className="text-xl">{category.icon}</span>
								<div>
									<div className="text-sm font-medium">{category.label}</div>
									{category.subcategories && Object.keys(category.subcategories).length > 0 && (
										<div className="text-xs text-muted-foreground">
											{Object.keys(category.subcategories).length} subcategories
										</div>
									)}
								</div>
							</div>
							<Switch
								checked={false}
								onCheckedChange={() => handleToggleVisibility(categoryId)}
							/>
						</div>
					))}
				</div>
			)}

			{/* Add custom category form */}
			{showAddCategory ? (
				<div className="border border-[--color-border] rounded-lg p-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="categoryName">Category Name</Label>
						<Input
							id="categoryName"
							value={newCategoryName}
							onChange={(e) => setNewCategoryName(e.target.value)}
							placeholder="Enter category name"
							className="h-10"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="categoryIcon">Icon (emoji)</Label>
						<Input
							id="categoryIcon"
							value={newCategoryIcon}
							onChange={(e) => setNewCategoryIcon(e.target.value)}
							placeholder="Enter emoji icon"
							className="h-10"
							maxLength={2}
						/>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={handleAddCategory}
							disabled={isAdding || !newCategoryName.trim()}
							className="flex-1"
						>
							{isAdding ? 'Adding...' : 'Add Category'}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowAddCategory(false);
								setNewCategoryName('');
								setNewCategoryIcon('');
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
					onClick={() => setShowAddCategory(true)}
					className="w-full h-12 justify-start gap-2"
				>
					<Plus className="size-4" />
					Add Custom Category
				</Button>
			)}

			{/* Info section */}
			<div className="text-xs text-muted-foreground space-y-1">
				<div>• Toggle categories to show/hide them in the app</div>
				<div>• Custom categories will be available in a future update</div>
				<div>• Category reordering will be available in a future update</div>
			</div>
		</div>
	);
}
