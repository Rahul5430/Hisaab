import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const timestampSchema = z.custom<Timestamp>((value) => value instanceof Timestamp, {
	message: 'Expected Firestore Timestamp',
});

export const expenseSchema = z.object({
	id: z.string(),
	ownerId: z.string(),
	groupId: z.string().nullable(),
	amount: z.number(),
	currency: z.string(),
	amountInINR: z.number(),
	merchant: z.string(),
	categoryId: z.string(),
	subcategoryId: z.string(),
	visibility: z.enum(['personal', 'group']),
	date: z.string(),
	time: z.string(),
	note: z.string().nullable(),
	paymentMethod: z
		.enum(['upi', 'card', 'cash', 'netbanking', 'other'])
		.nullable(),
	upiId: z.string().nullable(),
	source: z.enum(['manual', 'sms', 'receipt', 'import']),
	rawSms: z.string().nullable(),
	receiptImageUrl: z.string().nullable(),
	splitDetails: z
		.object({
			splitType: z.enum(['equal', 'custom']),
			shares: z.array(
				z.object({
					uid: z.string(),
					amount: z.number(),
					percentage: z.number(),
				})
			),
		})
		.nullable(),
	tags: z.array(z.string()),
	createdAt: timestampSchema,
	updatedAt: timestampSchema,
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
