'use client';

import { create } from 'zustand';

import type { UserSchema } from '@/lib/validators/user.schema';

type AuthState = {
	user: UserSchema | null;
	loading: boolean;
	setUser: (user: UserSchema) => void;
	setLoading: (loading: boolean) => void;
	clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	loading: true,
	setUser: (user) => set({ user }),
	setLoading: (loading) => set({ loading }),
	clearUser: () => set({ user: null }),
}));
