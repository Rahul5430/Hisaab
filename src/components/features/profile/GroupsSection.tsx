'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Copy, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase/client';
import { useGroups } from '@/lib/hooks/useGroups';
import { useAuthStore } from '@/store/auth.store';

type ExpandedGroup = string | null;

export function GroupsSection(): React.JSX.Element {
	const { groups, isLoading } = useGroups();
	const user = useAuthStore((s) => s.user);
	const queryClient = useQueryClient();
	
	const [expandedGroup, setExpandedGroup] = useState<ExpandedGroup>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showJoinForm, setShowJoinForm] = useState(false);
	const [newGroupName, setNewGroupName] = useState('');
	const [joinCode, setJoinCode] = useState('');
	const [isCreating, setIsCreating] = useState(false);
	const [isJoining, setIsJoining] = useState(false);

	const handleCreateGroup = async () => {
		if (!user || !newGroupName.trim()) {
			toast.error('Please enter a group name');
			return;
		}

		setIsCreating(true);
		try {
			const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
			const response = await fetch('/api/groups/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: newGroupName.trim() }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to create group');
			}

			// Invalidate groups cache
			queryClient.invalidateQueries({ queryKey: ['groups'] });
			
			// Reset form
			setNewGroupName('');
			setShowCreateForm(false);
			
			toast.success('Group created successfully');
		} catch (error) {
			console.error('Failed to create group:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to create group');
		} finally {
			setIsCreating(false);
		}
	};

	const handleJoinGroup = async () => {
		if (!user || !joinCode.trim()) {
			toast.error('Please enter an invite code');
			return;
		}

		setIsJoining(true);
		try {
			const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
			const response = await fetch('/api/groups/join', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ inviteCode: joinCode.trim() }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to join group');
			}

			// Invalidate groups cache
			queryClient.invalidateQueries({ queryKey: ['groups'] });
			
			// Reset form
			setJoinCode('');
			setShowJoinForm(false);
			
			toast.success('Joined group successfully');
		} catch (error) {
			console.error('Failed to join group:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to join group');
		} finally {
			setIsJoining(false);
		}
	};

	const handleCopyInviteLink = (inviteCode: string) => {
		const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
		navigator.clipboard.writeText(inviteLink).then(() => {
			toast.success('Invite link copied');
		}).catch(() => {
			toast.error('Failed to copy invite link');
		});
	};

	const handleLeaveGroup = () => {
		toast.info('Leave group feature coming soon');
	};

	const isInviteCodeExpired = () => {
		// This is a simple check - in a real implementation, we'd check the expiry timestamp
		// For now, assume codes expire after 48 hours
		return false;
	};

	if (isLoading) {
		return (
			<div className="space-y-2">
				{['group-loading-1', 'group-loading-2', 'group-loading-3'].map((placeholderId) => (
					<div key={placeholderId} className="h-12 bg-muted rounded-lg animate-pulse" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Groups list */}
			{groups.map((group) => (
				<div key={group.id} className="border border-[--color-border] rounded-lg">
					<button
						type="button"
						onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
						className="w-full flex items-center justify-between p-3 text-left"
					>
						<div className="flex items-center gap-3">
							{expandedGroup === group.id ? (
								<ChevronDown className="size-4 text-muted-foreground" />
							) : (
								<ChevronRight className="size-4 text-muted-foreground" />
							)}
							<Users className="size-4 text-muted-foreground" />
							<div>
								<div className="text-sm font-medium">{group.name}</div>
								<div className="text-xs text-muted-foreground">
									{group.memberUids.length} members
								</div>
							</div>
						</div>
					</button>

					{expandedGroup === group.id && (
						<div className="px-3 pb-3 space-y-3 border-t border-[--color-border]">
							{/* Member list */}
							<div className="space-y-1">
								<div className="text-xs font-medium text-muted-foreground">Members</div>
								{group.memberUids.map((uid) => (
									<div key={uid} className="text-sm text-muted-foreground">
										{uid}
									</div>
								))}
							</div>

							{/* Invite code */}
							{group.inviteCode && (
								<div className="space-y-2">
									<div className="text-xs font-medium text-muted-foreground">
										Invite Code
										{isInviteCodeExpired() && (
											<span className="ml-2 text-(--color-alert)">(Expired)</span>
										)}
									</div>
									<div className="flex items-center gap-2">
										<code className="text-xs bg-muted px-2 py-1 rounded">
											{group.inviteCode}
										</code>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleCopyInviteLink(group.inviteCode)}
											className="h-7"
										>
											<Copy className="size-3" />
										</Button>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleLeaveGroup()}
									className="h-8"
								>
									Leave Group
								</Button>
							</div>
						</div>
					)}
				</div>
			))}

			{/* Create Group */}
			{showCreateForm ? (
				<div className="border border-[--color-border] rounded-lg p-3 space-y-3">
					<Input
						value={newGroupName}
						onChange={(e) => setNewGroupName(e.target.value)}
						placeholder="Enter group name"
						className="h-10"
					/>
					<div className="flex gap-2">
						<Button
							onClick={handleCreateGroup}
							disabled={isCreating || !newGroupName.trim()}
							className="h-10"
						>
							{isCreating ? 'Creating...' : 'Create'}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowCreateForm(false);
								setNewGroupName('');
							}}
							className="h-10"
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<Button
					variant="outline"
					onClick={() => setShowCreateForm(true)}
					className="w-full h-12 justify-start gap-2"
				>
					<Plus className="size-4" />
					Create Group
				</Button>
			)}

			{/* Join Group */}
			{showJoinForm ? (
				<div className="border border-[--color-border] rounded-lg p-3 space-y-3">
					<Input
						value={joinCode}
						onChange={(e) => setJoinCode(e.target.value)}
						placeholder="Enter invite code"
						className="h-10"
					/>
					<div className="flex gap-2">
						<Button
							onClick={handleJoinGroup}
							disabled={isJoining || !joinCode.trim()}
							className="h-10"
						>
							{isJoining ? 'Joining...' : 'Join'}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setShowJoinForm(false);
								setJoinCode('');
							}}
							className="h-10"
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<Button
					variant="outline"
					onClick={() => setShowJoinForm(true)}
					className="w-full h-12 justify-start gap-2"
				>
					<Plus className="size-4" />
					Join Group
				</Button>
			)}
		</div>
	);
}
