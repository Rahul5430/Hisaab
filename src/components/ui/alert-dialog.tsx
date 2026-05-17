'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

type AlertDialogProps = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
};

const AlertDialog = ({ children }: AlertDialogProps) => {
	return <>{children}</>;
};

const AlertDialogTrigger = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentPropsWithoutRef<typeof Button>
>(({ children, ...props }, ref) => (
	<Button ref={ref} {...props}>
		{children}
	</Button>
));
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

const AlertDialogContent = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/50" />
			<div className="relative bg-background rounded-lg p-6 max-w-md w-full mx-4">
				{children}
			</div>
		</div>
	);
};

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => {
	return <div className="mb-4">{children}</div>;
};

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => {
	return <div className="flex gap-2 justify-end mt-6">{children}</div>;
};

const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => {
	return <h2 className="text-lg font-semibold">{children}</h2>;
};

const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => {
	return <p className="text-sm text-muted-foreground">{children}</p>;
};

const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentPropsWithoutRef<typeof Button>
>(({ children, ...props }, ref) => (
	<Button ref={ref} {...props}>
		{children}
	</Button>
));
AlertDialogAction.displayName = 'AlertDialogAction';

const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentPropsWithoutRef<typeof Button>
>(({ children, ...props }, ref) => (
	<Button ref={ref} variant="outline" {...props}>
		{children}
	</Button>
));
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
};
