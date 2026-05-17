import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { type GroupSchema,groupSchema } from '@/lib/validators/group.schema';

const groupsCollection = collection(db, 'groups');

function parseGroup(id: string, data: unknown): GroupSchema {
	if (!data || typeof data !== 'object') {
		return groupSchema.parse({ id });
	}

	return groupSchema.parse({ ...data, id });
}

export async function getGroupsForUser(uid: string): Promise<GroupSchema[]> {
	const groupsQuery = query(
		groupsCollection,
		where('memberUids', 'array-contains', uid)
	);
	const snapshot = await getDocs(groupsQuery);

	return snapshot.docs.map((docSnapshot) =>
		parseGroup(docSnapshot.id, docSnapshot.data())
	);
}

export async function getGroup(groupId: string): Promise<GroupSchema | null> {
	const snapshot = await getDoc(doc(db, 'groups', groupId));

	if (!snapshot.exists()) {
		return null;
	}

	return parseGroup(snapshot.id, snapshot.data());
}
