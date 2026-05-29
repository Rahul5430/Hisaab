'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { useUIStore } from '@/store/ui.store';

export function Fab(): React.JSX.Element {
	const pathname = usePathname();
	const setAddExpenseSheetOpen = useUIStore((s) => s.setAddExpenseSheetOpen);
	const setAddInvestmentSheetOpen = useUIStore(
		(s) => s.setAddInvestmentSheetOpen
	);

	return (
		<motion.button
			type='button'
			className='flex h-14 w-14 items-center justify-center rounded-full bg-[--color-brand] text-white shadow-lg'
			whileTap={{ scale: 0.95 }}
			transition={{ type: 'spring', stiffness: 400, damping: 40 }}
			onClick={() => {
				if (pathname === '/investments') {
					setAddInvestmentSheetOpen(true);
				} else {
					setAddExpenseSheetOpen(true);
				}
			}}
			aria-label='Add'
		>
			<Plus className='size-6' />
		</motion.button>
	);
}
