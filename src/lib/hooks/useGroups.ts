'use client';

import { useQuery } from '@tanstack/react-query';

import { getGroupsForUser } from '@/lib/repositories/groups.repository';
import type { GroupSchema } from '@/lib/validators/group.schema';
import { useAuthStore } from '@/store/auth.store';

type UseGroupsResult = {
	groups: GroupSchema[];
	isLoading: boolean;
};

export function useGroups(): UseGroupsResult {
	const uid = useAuthStore((s) => s.user?.uid);

	const {
		data: groups = [],
		isLoading,
	} = useQuery({
		queryKey: ['groups', uid],
		queryFn: () => getGroupsForUser(uid ?? ''),
		enabled: Boolean(uid),
	});

	return { groups, isLoading };
}
