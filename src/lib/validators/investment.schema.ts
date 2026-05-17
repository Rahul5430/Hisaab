import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const timestampSchema = z.custom<Timestamp>((value) => value instanceof Timestamp, {
	message: 'Expected Firestore Timestamp',
});

export const investmentSchema = z.object({
	id: z.string(),
	ownerId: z.string(),
	groupId: z.string().nullable(),
	instrument: z.enum([
		'mutual_fund',
		'stocks',
		'fd',
		'ppf',
		'rd',
		'nps',
		'crypto',
		'real_estate',
		'other',
	]),
	label: z.string(),
	amount: z.number(),
	currency: z.string(),
	amountInINR: z.number(),
	date: z.string(),
	note: z.string().nullable(),
	recurring: z.boolean(),
	recurrenceDay: z.number().nullable(),
	recurrenceEndDate: z.string().nullable(),
	autoLogged: z.boolean(),
	createdAt: timestampSchema,
	updatedAt: timestampSchema,
});

export type InvestmentSchema = z.infer<typeof investmentSchema>;
