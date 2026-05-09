import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
	const authHeader = req.headers.get('authorization') ?? '';
	const token = authHeader.startsWith('Bearer ')
		? authHeader.slice('Bearer '.length)
		: null;

	if (!token) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let uid: string;
	try {
		const decoded = await adminAuth.verifyIdToken(token);
		uid = decoded.uid;
	} catch {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	if (
		!body ||
		typeof body !== 'object' ||
		!('inviteCode' in body) ||
		typeof (body as { inviteCode: unknown }).inviteCode !== 'string'
	) {
		return Response.json({ error: 'Invalid body' }, { status: 400 });
	}

	const inviteCode = (body as { inviteCode: string }).inviteCode
		.trim()
		.toUpperCase();
	if (!inviteCode) {
		return Response.json({ error: 'Invalid body' }, { status: 400 });
	}

	const now = Timestamp.now();
	const querySnap = await adminDb
		.collection('groups')
		.where('inviteCode', '==', inviteCode)
		.where('inviteExpiresAt', '>', now)
		.limit(1)
		.get();

	if (querySnap.empty) {
		return Response.json(
			{ error: 'Invalid or expired invite code' },
			{ status: 404 }
		);
	}

	const docSnap = querySnap.docs[0];
	const groupId = docSnap.id;
	const groupName = (docSnap.data().name as string) ?? '';

	await docSnap.ref.update({
		memberUids: FieldValue.arrayUnion(uid),
		updatedAt: now,
	});

	return Response.json({ groupId, groupName });
}
