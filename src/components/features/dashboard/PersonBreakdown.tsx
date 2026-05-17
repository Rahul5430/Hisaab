'use client';

import Image from 'next/image';

type PersonBreakdownProps = {
	data: { uid: string; amount: number }[];
	members: { uid: string; displayName: string; photoURL: string }[];
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0,
});

function getInitials(name: string) {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

export function PersonBreakdown({
	data,
	members,
}: PersonBreakdownProps): React.JSX.Element {
	const rows = data
		.filter((item) => item.amount > 0)
		.map((item) => ({
			...item,
			member: members.find((member) => member.uid === item.uid),
		}));

	return (
		<section className='space-y-3'>
			<h2 className='text-lg font-semibold'>By Person</h2>
			{rows.length === 0 ? (
				<div className='rounded-xl border border-[--color-border] bg-background p-4 text-sm text-muted-foreground'>
					No group expenses yet
				</div>
			) : (
				<div className='space-y-2'>
					{rows.map((row) => {
						const displayName = row.member?.displayName ?? row.uid;
						const photoURL = row.member?.photoURL ?? '';
						return (
							<div
								key={row.uid}
								className='flex min-h-12 items-center gap-3 rounded-xl border border-[--color-border] bg-background px-4 py-3'
							>
								<div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium'>
									{photoURL ? (
										<Image
											src={photoURL}
											alt={displayName}
											width={40}
											height={40}
											unoptimized
											className='size-full object-cover'
										/>
									) : (
										getInitials(displayName) || 'U'
									)}
								</div>
								<div className='min-w-0 flex-1 truncate text-sm font-medium'>
									{displayName}
								</div>
								<div className='text-right text-sm font-semibold'>
									{currencyFormatter.format(row.amount)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
