import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const timestampSchema = z.custom<Timestamp>((value) => value instanceof Timestamp, {
	message: 'Expected Firestore Timestamp',
});

export const groupSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdBy: z.string(),
	memberUids: z.array(z.string()),
	inviteCode: z.string(),
	inviteExpiresAt: timestampSchema,
	createdAt: timestampSchema,
	updatedAt: timestampSchema,
});

export type GroupSchema = z.infer<typeof groupSchema>;
