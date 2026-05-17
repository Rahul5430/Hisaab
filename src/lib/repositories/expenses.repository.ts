import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	updateDoc,
	where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import {
	type ExpenseSchema,
	expenseSchema,
} from '@/lib/validators/expense.schema';

const expensesCollection = collection(db, 'expenses');

function parseExpense(data: unknown): ExpenseSchema {
	return expenseSchema.parse(data);
}

function withId(id: string, data: unknown): unknown {
	if (!data || typeof data !== 'object') {
		return { id };
	}

	return { ...data, id };
}

export async function getExpenses(
	uid: string,
	groupIds: string[],
	from: string,
	to: string
): Promise<ExpenseSchema[]> {
	const ownQuery = query(
		expensesCollection,
		where('ownerId', '==', uid),
		where('date', '>=', from),
		where('date', '<=', to)
	);

	const ownSnapshot = await getDocs(ownQuery);
	const byId = new Map<string, ExpenseSchema>();

	ownSnapshot.docs.forEach((snapshot) => {
		byId.set(
			snapshot.id,
			parseExpense(withId(snapshot.id, snapshot.data()))
		);
	});

	if (groupIds.length > 0) {
		const groupQuery = query(
			expensesCollection,
			where('groupId', 'in', groupIds),
			where('date', '>=', from),
			where('date', '<=', to)
		);
		const groupSnapshot = await getDocs(groupQuery);

		groupSnapshot.docs.forEach((snapshot) => {
			byId.set(
				snapshot.id,
				parseExpense(withId(snapshot.id, snapshot.data()))
			);
		});
	}

	return Array.from(byId.values());
}

export async function getExpenseById(
	expenseId: string
): Promise<ExpenseSchema | null> {
	const snapshot = await getDoc(doc(db, 'expenses', expenseId));

	if (!snapshot.exists()) {
		return null;
	}

	return parseExpense(withId(snapshot.id, snapshot.data()));
}

export async function addExpense(
	expense: Omit<ExpenseSchema, 'id'>
): Promise<string> {
	const ref = await addDoc(expensesCollection, expense);
	return ref.id;
}

export async function updateExpense(
	id: string,
	data: Partial<ExpenseSchema>
): Promise<void> {
	await updateDoc(doc(db, 'expenses', id), data);
}

export async function deleteExpense(id: string): Promise<void> {
	await deleteDoc(doc(db, 'expenses', id));
}

export function subscribeToGroupExpenses(
	groupId: string,
	callback: (expenses: ExpenseSchema[]) => void
): () => void {
	const groupQuery = query(
		expensesCollection,
		where('groupId', '==', groupId)
	);

	return onSnapshot(groupQuery, (snapshot) => {
		callback(
			snapshot.docs.map((docSnapshot) =>
				parseExpense(withId(docSnapshot.id, docSnapshot.data()))
			)
		);
	});
}
