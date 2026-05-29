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
				<Sheet
					open={addExpenseSheetOpen}
					onOpenChange={setAddExpenseSheetOpen}
				>
					<SheetContent
						side='bottom'
						className='flex flex-col max-h-[90dvh] p-0'
					>
						{/* Drag handle */}
						<div className='flex h-12 shrink-0 items-center justify-center'>
						<div className='h-1.5 w-20 rounded-full bg-slate-200' />
					</div>

						<Tabs
							defaultValue='sms'
							className='flex flex-col flex-1 overflow-hidden'
						>
							<TabsList className='grid w-full grid-cols-2 gap-2 mb-4'>
								<TabsTrigger value='sms'>SMS Paste</TabsTrigger>
								<TabsTrigger value='manual'>Manual</TabsTrigger>
							</TabsList>

							<TabsContent
								value='sms'
								className='flex-1 overflow-y-auto px-4 pb-8'
							>
								<SMSParseTab onSave={handleSave} />
							</TabsContent>

							<TabsContent
								value='manual'
								className='flex-1 overflow-y-auto px-4 pb-8'
							>
								<ManualEntryTab onSave={handleSave} />
							</TabsContent>
						</Tabs>
					</SheetContent>
				</Sheet>
			)}
		</AnimatePresence>
	);
}
