'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox='0 0 48 48'
			aria-hidden='true'
			focusable='false'
			{...props}
		>
			<path
				fill='currentColor'
				d='M43.611 20.083H42V20H24v8h11.303C33.651 32.653 29.218 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.968 3.032l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z'
			/>
			<path
				fill='currentColor'
				d='M6.306 14.691 12.88 19.51C14.659 15.108 18.97 12 24 12c3.059 0 5.842 1.154 7.968 3.032l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z'
			/>
			<path
				fill='currentColor'
				d='M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.197 0-9.615-3.319-11.277-7.946l-6.525 5.025C9.505 39.556 16.227 44 24 44Z'
			/>
			<path
				fill='currentColor'
				d='M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.084 5.57h.003l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917Z'
			/>
		</svg>
	);
}

function TallyIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox='0 0 48 48'
			aria-hidden='true'
			focusable='false'
			{...props}
		>
			<g
				fill='none'
				stroke='currentColor'
				strokeWidth='4'
				strokeLinecap='round'
			>
				<path d='M10 10v28' />
				<path d='M18 10v28' />
				<path d='M26 10v28' />
				<path d='M34 10v28' />
				<path d='M10 34L34 14' />
			</g>
		</svg>
	);
}

export default function SignInPage() {
	const router = useRouter();
	const { signInWithGoogle, loading } = useAuth();
	const [submitting, setSubmitting] = useState(false);

	const isBusy = loading || submitting;

	return (
		<main className='min-h-dvh w-full bg-background px-6 py-10'>
			<div className='mx-auto flex w-full max-w-[390px] flex-col items-center gap-6'>
				<div className='flex flex-col items-center gap-3'>
					<div
						className={cn(
							'text-3xl font-semibold tracking-tight text-(--color-brand)'
						)}
					>
						Hisaab
					</div>
					<TallyIcon className='h-12 w-12 text-(--color-brand)' />
					<p className='text-center text-sm text-muted-foreground'>
						Every rupee. Accounted for.
					</p>
				</div>

				<Button
					type='button'
					variant='outline'
					size='lg'
					className='h-12 w-full justify-center gap-3 bg-white text-foreground hover:bg-muted'
					disabled={isBusy}
					onClick={async () => {
						setSubmitting(true);
						try {
							const res = await signInWithGoogle();
							router.replace(
								res.isNewUser ? '/onboarding' : '/home'
							);
						} catch {
							toast.error('Could not sign in. Please try again.');
						} finally {
							setSubmitting(false);
						}
					}}
				>
					{isBusy ? (
						<Loader2 className='size-4 animate-spin' />
					) : (
						<GoogleIcon className='h-5 w-5' />
					)}
					<span className='text-sm font-medium'>
						Continue with Google
					</span>
				</Button>
			</div>
		</main>
	);
}
