'use client';

import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExpenses } from '@/lib/hooks/useExpenses';
import type { ExpenseSchema } from '@/lib/validators/expense.schema';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

import { ManualEntryTab } from './ManualEntryTab';
import { SMSParseTab } from './SMSParseTab';

export function AddExpenseSheet(): React.JSX.Element {
	const addExpenseSheetOpen = useUIStore((s) => s.addExpenseSheetOpen);
	const setAddExpenseSheetOpen = useUIStore((s) => s.setAddExpenseSheetOpen);
	const user = useAuthStore((s) => s.user);
	const { createExpense } = useExpenses();

	const handleSave = async (expense: Omit<ExpenseSchema, 'id'>) => {
		if (!user) {
			toast.error('Please sign in to add expenses');
			return;
		}

		try {
			const expenseWithOwner: Omit<ExpenseSchema, 'id'> = {
				...expense,
				ownerId: user.uid,
			};

			await createExpense(expenseWithOwner);
			setAddExpenseSheetOpen(false);
			toast.success('Expense saved');
		} catch (error) {
			console.error('Failed to save expense:', error);
			toast.error('Failed to save expense');
		}
	};

	return (
		<AnimatePresence>
			{addExpenseSheetOpen && (
				<Sheet open={addExpenseSheetOpen} onOpenChange={setAddExpenseSheetOpen}>
					<SheetContent
						side="bottom"
						className="h-[90vh] max-h-[800px] max-w-[430px] mx-auto rounded-t-2xl"
					>
						{/* Drag handle */}
						<div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-2 mb-6" />
						
						<Tabs defaultValue="sms" className="h-full">
							<TabsList className="grid w-full grid-cols-2 mb-6">
								<TabsTrigger value="sms">SMS Paste</TabsTrigger>
								<TabsTrigger value="manual">Manual</TabsTrigger>
							</TabsList>
							
							<TabsContent value="sms" className="mt-0 h-full overflow-y-auto">
								<SMSParseTab onSave={handleSave} />
							</TabsContent>
							
							<TabsContent value="manual" className="mt-0 h-full overflow-y-auto">
								<ManualEntryTab onSave={handleSave} />
							</TabsContent>
						</Tabs>
					</SheetContent>
				</Sheet>
			)}
		</AnimatePresence>
	);
}
