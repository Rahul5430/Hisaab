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
import {
	type InvestmentSchema,
	investmentSchema,
} from '@/lib/validators/investment.schema';

const investmentsCollection = collection(db, 'investments');

function parseInvestment(id: string, data: unknown): InvestmentSchema {
	if (!data || typeof data !== 'object') {
		return investmentSchema.parse({ id });
	}

	return investmentSchema.parse({ ...data, id });
}

export async function getInvestments(
	uid: string,
	from: string,
	to: string
): Promise<InvestmentSchema[]> {
	const investmentsQuery = query(
		investmentsCollection,
		where('ownerId', '==', uid),
		where('date', '>=', from),
		where('date', '<=', to)
	);
	const snapshot = await getDocs(investmentsQuery);

	return snapshot.docs.map((docSnapshot) =>
		parseInvestment(docSnapshot.id, docSnapshot.data())
	);
}

export async function addInvestment(
	investment: Omit<InvestmentSchema, 'id'>
): Promise<string> {
	const ref = await addDoc(investmentsCollection, investment);
	return ref.id;
}

export async function updateInvestment(
	id: string,
	data: Partial<InvestmentSchema>
): Promise<void> {
	await updateDoc(doc(db, 'investments', id), data);
}

export async function deleteInvestment(id: string): Promise<void> {
	await deleteDoc(doc(db, 'investments', id));
}
