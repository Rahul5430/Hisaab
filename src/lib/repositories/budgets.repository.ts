import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { type BudgetSchema,budgetSchema } from '@/lib/validators/budget.schema';

const budgetsCollection = collection(db, 'budgets');

function parseBudget(id: string, data: unknown): BudgetSchema {
	if (!data || typeof data !== 'object') {
		return budgetSchema.parse({ id });
	}

	return budgetSchema.parse({ ...data, id });
}

export async function getBudgets(
	ownerId: string,
	month: string
): Promise<BudgetSchema[]> {
	const budgetsQuery = query(
		budgetsCollection,
		where('ownerId', '==', ownerId),
		where('month', '==', month)
	);
	const snapshot = await getDocs(budgetsQuery);

	return snapshot.docs.map((docSnapshot) =>
		parseBudget(docSnapshot.id, docSnapshot.data())
	);
}

export async function setBudget(
	budget: Omit<BudgetSchema, 'id'>
): Promise<string> {
	const ref = await addDoc(budgetsCollection, budget);
	return ref.id;
}

export async function updateBudget(
	id: string,
	data: Partial<BudgetSchema>
): Promise<void> {
	await updateDoc(doc(db, 'budgets', id), data);
}

export async function deleteBudget(id: string): Promise<void> {
	await deleteDoc(doc(db, 'budgets', id));
}
