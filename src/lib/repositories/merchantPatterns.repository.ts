import type { Timestamp } from 'firebase/firestore';
import {
	collection,
	getDocs,
	query,
	where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';

export type MerchantPattern = {
	userId: string;
	merchantRaw: string;
	merchantNormalized: string;
	categoryId: string;
	subcategoryId: string;
	paymentMethod: string | null;
	confirmedCount: number;
	confidence: number;
	source: 'user_confirmed' | 'system_inferred' | 'admin_override';
	createdAt: Timestamp;
	updatedAt: Timestamp;
	lastSeen: Timestamp;
};

const merchantPatternsCollection = collection(db, 'merchantPatterns');

export async function getPatternForMerchant(
	userId: string,
	merchantRaw: string
): Promise<MerchantPattern | null> {
	const q = query(
		merchantPatternsCollection,
		where('userId', '==', userId),
		where('merchantRaw', '==', merchantRaw)
	);

	const querySnapshot = await getDocs(q);
	
	if (querySnapshot.empty) {
		return null;
	}

	const docSnapshot = querySnapshot.docs[0];
	const data = docSnapshot.data();
	
	return {
		userId: data.userId,
		merchantRaw: data.merchantRaw,
		merchantNormalized: data.merchantNormalized,
		categoryId: data.categoryId,
		subcategoryId: data.subcategoryId,
		paymentMethod: data.paymentMethod || null,
		confirmedCount: data.confirmedCount || 0,
		confidence: data.confidence || 0,
		source: data.source || 'system_inferred',
		createdAt: data.createdAt,
		updatedAt: data.updatedAt,
		lastSeen: data.lastSeen,
	} as MerchantPattern;
}
