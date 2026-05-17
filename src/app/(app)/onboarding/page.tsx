'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

type Step = 1 | 2 | 3;

function StepDots({ step }: { step: Step }) {
	return (
		<div className='flex items-center justify-center gap-2'>
			{([1, 2, 3] as const).map((s) => (
				<div
					key={s}
					className={cn(
						'h-2 w-2 rounded-full border',
						s === step
							? 'border-transparent bg-(--color-brand)'
							: 'border-border bg-transparent'
					)}
				/>
			))}
		</div>
	);
}

export default function OnboardingPage() {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const loading = useAuthStore((s) => s.loading);
	const { updateCurrentUser } = useAuth();

	const [step, setStep] = useState<Step>(1);
	const [displayName, setDisplayName] = useState(user?.displayName ?? '');
	const [monthlyIncome, setMonthlyIncome] = useState<string>('');
	const [groupName, setGroupName] = useState('');
	const [inviteCode, setInviteCode] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const avatarFallback = useMemo(() => {
		const source = displayName || user?.email || 'U';
		return source.slice(0, 1).toUpperCase();
	}, [displayName, user?.email]);

	useEffect(() => {
		if (!loading && user && user.onboardingCompleted) {
			router.replace('/home');
		}
	}, [loading, user, router]);

	if (!user) return null;

	const advance = () => setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));

	return (
		<main className='min-h-dvh w-full bg-background px-6 py-10'>
			<div className='mx-auto w-full max-w-[390px]'>
				<StepDots step={step} />

				<div className='mt-8 overflow-hidden'>
					<AnimatePresence mode='wait'>
						<motion.div
							key={step}
							initial={{ x: 40, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -40, opacity: 0 }}
							transition={{
								type: 'spring',
								stiffness: 400,
								damping: 40,
							}}
							className='space-y-6'
						>
							{step === 1 ? (
								<section className='space-y-6'>
									<div className='flex flex-col items-center gap-4'>
										<Avatar size='lg' className='size-16'>
											<AvatarImage
												src={user.photoURL}
												alt={displayName}
											/>
											<AvatarFallback>
												{avatarFallback}
											</AvatarFallback>
										</Avatar>
										<div className='text-center'>
											<h1 className='text-xl font-semibold'>
												Welcome
											</h1>
											<p className='mt-1 text-sm text-muted-foreground'>
												Let’s confirm your profile.
											</p>
										</div>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium'>
											Display name
										</label>
										<Input
											className='h-12'
											value={displayName}
											onChange={(e) =>
												setDisplayName(e.target.value)
											}
										/>
									</div>

									<Button
										className='h-12 w-full'
										disabled={
											submitting ||
											displayName.trim().length === 0
										}
										onClick={async () => {
											setSubmitting(true);
											try {
												await updateCurrentUser({
													displayName:
														displayName.trim(),
												});
												advance();
											} catch {
												toast.error(
													'Could not save your profile. Please try again.'
												);
											} finally {
												setSubmitting(false);
											}
										}}
									>
										{submitting ? (
											<Loader2 className='size-4 animate-spin' />
										) : (
											'Continue'
										)}
									</Button>
								</section>
							) : null}

							{step === 2 ? (
								<section className='space-y-6'>
									<div className='space-y-1'>
										<h1 className='text-xl font-semibold'>
											What&apos;s your monthly income?
										</h1>
										<p className='text-sm text-muted-foreground'>
											Used to calculate how much you have
											left each month
										</p>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium'>
											Amount
										</label>
										<div className='flex items-center gap-2'>
											<div className='flex h-12 items-center rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground'>
												₹
											</div>
											<Input
												className='h-12'
												inputMode='numeric'
												placeholder='0'
												value={monthlyIncome}
												onChange={(e) =>
													setMonthlyIncome(
														e.target.value.replace(
															/[^\d]/g,
															''
														)
													)
												}
											/>
										</div>
									</div>

									<Button
										className='h-12 w-full'
										disabled={submitting}
										onClick={async () => {
											setSubmitting(true);
											try {
												const amount = Number(
													monthlyIncome || '0'
												);
												await updateCurrentUser({
													monthlyIncome: amount,
												});
												advance();
											} catch {
												toast.error(
													'Could not save income. Please try again.'
												);
											} finally {
												setSubmitting(false);
											}
										}}
									>
										{submitting ? (
											<Loader2 className='size-4 animate-spin' />
										) : (
											'Continue'
										)}
									</Button>

									<button
										type='button'
										className='h-12 w-full text-sm font-medium text-muted-foreground underline underline-offset-4'
										onClick={() => {
											advance();
										}}
									>
										Skip for now
									</button>
								</section>
							) : null}

							{step === 3 ? (
								<section className='space-y-6'>
									<div className='space-y-1'>
										<h1 className='text-xl font-semibold'>
											Set up a group
										</h1>
										<p className='text-sm text-muted-foreground'>
											Create a family group or join with
											an invite code.
										</p>
									</div>

									<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
										<Card className='ring-1 ring-foreground/10'>
											<CardHeader>
												<CardTitle>
													Create a group
												</CardTitle>
											</CardHeader>
											<CardContent className='space-y-3'>
												<Input
													className='h-12'
													placeholder='Group name'
													value={groupName}
													onChange={(e) =>
														setGroupName(
															e.target.value
														)
													}
												/>
												<Button
													className='h-12 w-full'
													disabled={
														submitting ||
														groupName.trim()
															.length === 0
													}
													onClick={async () => {
														setSubmitting(true);
														try {
															const token =
																await auth.currentUser?.getIdToken();
															if (!token)
																throw new Error(
																	'No token'
																);

															const res =
																await fetch(
																	'/api/groups/create',
																	{
																		method: 'POST',
																		headers:
																			{
																				'Content-Type':
																					'application/json',
																				Authorization: `Bearer ${token}`,
																			},
																		body: JSON.stringify(
																			{
																				name: groupName.trim(),
																			}
																		),
																	}
																);
															if (!res.ok) {
																throw new Error(
																	'Failed'
																);
															}
															await updateCurrentUser({
																onboardingCompleted: true,
															});
															router.replace(
																'/home'
															);
														} catch {
															toast.error(
																'Could not create group. Please try again.'
															);
														} finally {
															setSubmitting(
																false
															);
														}
													}}
												>
													{submitting ? (
														<Loader2 className='size-4 animate-spin' />
													) : (
														'Create'
													)}
												</Button>
											</CardContent>
										</Card>

										<Card className='ring-1 ring-foreground/10'>
											<CardHeader>
												<CardTitle>
													Join a group
												</CardTitle>
											</CardHeader>
											<CardContent className='space-y-3'>
												<Input
													className='h-12'
													placeholder='Invite code'
													value={inviteCode}
													onChange={(e) =>
														setInviteCode(
															e.target.value.toUpperCase()
														)
													}
												/>
												<Button
													className='h-12 w-full'
													disabled={
														submitting ||
														inviteCode.trim()
															.length === 0
													}
													onClick={async () => {
														setSubmitting(true);
														try {
															const token =
																await auth.currentUser?.getIdToken();
															if (!token)
																throw new Error(
																	'No token'
																);

															const res =
																await fetch(
																	'/api/groups/join',
																	{
																		method: 'POST',
																		headers:
																			{
																				'Content-Type':
																					'application/json',
																				Authorization: `Bearer ${token}`,
																			},
																		body: JSON.stringify(
																			{
																				inviteCode:
																					inviteCode.trim(),
																			}
																		),
																	}
																);
															if (!res.ok) {
																const body =
																	(await res
																		.json()
																		.catch(
																			() =>
																				null
																		)) as {
																		error?: string;
																	} | null;
																throw new Error(
																	body?.error ??
																		'Failed'
																);
															}
															await updateCurrentUser({
																onboardingCompleted: true,
															});
															router.replace(
																'/home'
															);
														} catch (e) {
															const message =
																e instanceof
																Error
																	? e.message
																	: 'Failed to join group';
															toast.error(
																message
															);
														} finally {
															setSubmitting(
																false
															);
														}
													}}
												>
													{submitting ? (
														<Loader2 className='size-4 animate-spin' />
													) : (
														'Join'
													)}
												</Button>
											</CardContent>
										</Card>
									</div>

									<button
										type='button'
										className='h-12 w-full text-sm font-medium text-muted-foreground underline underline-offset-4'
										onClick={async () => {
											try {
												await updateCurrentUser({
													onboardingCompleted: true,
												});
											} catch {
												toast.error(
													'Something went wrong. Please try again.'
												);
												return;
											}
											router.replace('/home');
										}}
									>
										Skip — I&apos;ll do this later
									</button>
								</section>
							) : null}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</main>
	);
}
