import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const timestampSchema = z.custom<Timestamp>((value) => value instanceof Timestamp, {
	message: 'Expected Firestore Timestamp',
});

export const budgetSchema = z.object({
	id: z.string(),
	ownerId: z.string(),
	ownerType: z.enum(['user', 'group']),
	categoryId: z.string(),
	monthlyLimit: z.number(),
	currency: z.string(),
	month: z.string(),
	createdAt: timestampSchema,
	updatedAt: timestampSchema,
});

export type BudgetSchema = z.infer<typeof budgetSchema>;
