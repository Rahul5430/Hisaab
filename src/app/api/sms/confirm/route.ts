import { Timestamp } from 'firebase-admin/firestore';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { adminAuth, adminDb } from '@/lib/firebase/admin';

const requestSchema = z.object({
	merchantRaw: z.string().min(1),
	merchantNormalized: z.string().min(1),
	categoryId: z.string().min(1),
	subcategoryId: z.string().min(1),
	paymentMethod: z.string().nullable(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		// Verify Firebase ID token
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json(
				{ error: 'Missing or invalid authorization header' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);
		let decodedToken;
		
		try {
			decodedToken = await adminAuth.verifyIdToken(token);
		} catch {
			return NextResponse.json(
				{ error: 'Invalid authentication token' },
				{ status: 401 }
			);
		}

		const uid = decodedToken.uid;

		// Parse and validate request body
		const body = await request.json();
		const { merchantRaw, merchantNormalized, categoryId, subcategoryId, paymentMethod } = requestSchema.parse(body);

		// Query for existing pattern
		const existingPatternQuery = await adminDb
			.collection('merchantPatterns')
			.where('userId', '==', uid)
			.where('merchantRaw', '==', merchantRaw)
			.limit(1)
			.get();

		const now = Timestamp.now();

		if (!existingPatternQuery.empty) {
			// Update existing pattern
			const existingDoc = existingPatternQuery.docs[0];
			const existingData = existingDoc.data();
			
			const newConfirmedCount = (existingData.confirmedCount || 0) + 1;
			const newConfidence = Math.min((existingData.confidence || 0) + 0.1, 1.0);

			await existingDoc.ref.update({
				merchantNormalized,
				categoryId,
				subcategoryId,
				paymentMethod,
				confirmedCount: newConfirmedCount,
				confidence: newConfidence,
				lastSeen: now,
				updatedAt: now,
			});
		} else {
			// Create new pattern
			await adminDb.collection('merchantPatterns').add({
				userId: uid,
				merchantRaw,
				merchantNormalized,
				categoryId,
				subcategoryId,
				paymentMethod,
				confirmedCount: 1,
				confidence: 0.5,
				source: 'user_confirmed',
				createdAt: now,
				updatedAt: now,
				lastSeen: now,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request body', details: error.issues },
				{ status: 400 }
			);
		}

		console.error('SMS confirm error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
