import { Timestamp } from 'firebase-admin/firestore';

import { adminAuth, adminDb } from '@/lib/firebase/admin';

function randomInviteCode(length: number) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let out = '';
	for (let i = 0; i < length; i++) {
		out += chars[Math.floor(Math.random() * chars.length)];
	}
	return out;
}

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
		!('name' in body) ||
		typeof (body as { name: unknown }).name !== 'string'
	) {
		return Response.json({ error: 'Invalid body' }, { status: 400 });
	}

	const name = (body as { name: string }).name.trim();
	if (!name) {
		return Response.json({ error: 'Invalid body' }, { status: 400 });
	}

	const now = Timestamp.now();
	const inviteCode = randomInviteCode(6);
	const inviteExpiresAt = Timestamp.fromDate(
		new Date(Date.now() + 48 * 60 * 60 * 1000)
	);

	const ref = adminDb.collection('groups').doc();
	const groupId = ref.id;

	await ref.set({
		id: groupId,
		name,
		createdBy: uid,
		memberUids: [uid],
		inviteCode,
		inviteExpiresAt,
		createdAt: now,
		updatedAt: now,
	});

	return Response.json({ groupId, inviteCode });
}
