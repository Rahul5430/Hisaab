export function Skeleton({
	className,
}: {
	className?: string;
}): React.JSX.Element {
	return (
		<div
			className={`animate-pulse rounded-md bg-muted ${className}`}
		/>
	);
}
