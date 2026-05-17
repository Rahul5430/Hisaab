'use client';

export function Select({ 
	value, 
	onValueChange, 
	children, 
	placeholder, 
	className 
}: { 
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
	placeholder?: string;
	className?: string;
}): React.JSX.Element {
	return (
		<select
			value={value}
			onChange={(e) => onValueChange(e.target.value)}
			className={`w-full h-12 px-3 border border-[--color-border] rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent ${className}`}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{children}
		</select>
	);
}

export function SelectTrigger({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}): React.JSX.Element {
	return <div className={className}>{children}</div>;
}

export function SelectValue({
	placeholder,
}: {
	placeholder?: string;
}): React.JSX.Element {
	return <span className="text-muted-foreground">{placeholder}</span>;
}

export function SelectContent({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return <>{children}</>;
}

export function SelectItem({ 
	value, 
	children 
}: { 
	value: string; 
	children: React.ReactNode; 
}): React.JSX.Element {
	return <option value={value}>{children}</option>;
}
