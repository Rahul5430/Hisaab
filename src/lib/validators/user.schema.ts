import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const timestampSchema = z.custom<Timestamp>((val) => val instanceof Timestamp, {
	message: 'Expected Firestore Timestamp',
});

export const userSchema = z.object({
	uid: z.string(),
	email: z.string(),
	displayName: z.string(),
	photoURL: z.string(),
	monthlyIncome: z.number().default(0),
	incomeCurrency: z.string().default('INR'),
	onboardingCompleted: z.boolean(),
	preferences: z.object({
		defaultVisibility: z.enum(['personal', 'group']),
		defaultCurrency: z.string().default('INR'),
		theme: z.enum(['light', 'dark', 'system']),
		notificationsEnabled: z.boolean(),
	}),
	pushSubscriptions: z.array(z.record(z.string(), z.unknown())),
	createdAt: timestampSchema,
	updatedAt: timestampSchema,
});

export type UserSchema = z.infer<typeof userSchema>;
