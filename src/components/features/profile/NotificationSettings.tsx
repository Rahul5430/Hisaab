'use client';

import { AlertTriangle, Bell, BellOff, CreditCard, Mail, Smartphone, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';

type NotificationSettings = {
	expenseAlerts: boolean;
	budgetWarnings: boolean;
	investmentReminders: boolean;
	groupInvites: boolean;
	pushNotifications: boolean;
	emailNotifications: boolean;
};

export function NotificationSettings(): React.JSX.Element {
	const user = useAuthStore((s) => s.user);
	const { updateCurrentUser } = useAuth();
	
	const [settings, setSettings] = useState<NotificationSettings>(() => ({
		expenseAlerts: user?.preferences?.notificationsEnabled ?? true,
		budgetWarnings: true,
		investmentReminders: true,
		groupInvites: true,
		pushNotifications: true,
		emailNotifications: false,
	}));

	const [isUpdating, setIsUpdating] = useState(false);

	const handleUpdateSetting = async (key: keyof NotificationSettings, value: boolean) => {
		if (!user) return;

		setIsUpdating(true);
		try {
			const newSettings = { ...settings, [key]: value };
			setSettings(newSettings);

			// Update user preferences
			await updateCurrentUser({
				preferences: {
					...user.preferences,
					notificationsEnabled: value,
				},
			});

			toast.success('Notification settings updated');
		} catch (error) {
			console.error('Failed to update notification settings:', error);
			toast.error('Failed to update notification settings');
			// Revert on error
			setSettings(prev => ({ ...prev, [key]: !value }));
		} finally {
			setIsUpdating(false);
		}
	};

	const notificationOptions = [
		{
			key: 'expenseAlerts' as keyof NotificationSettings,
			label: 'Expense Alerts',
			description: 'Get notified when expenses are added',
			icon: CreditCard,
		},
		{
			key: 'budgetWarnings' as keyof NotificationSettings,
			label: 'Budget Warnings',
			description: 'Alert when approaching budget limits',
			icon: AlertTriangle,
		},
		{
			key: 'investmentReminders' as keyof NotificationSettings,
			label: 'Investment Reminders',
			description: 'Reminders for recurring investments',
			icon: TrendingUp,
		},
		{
			key: 'groupInvites' as keyof NotificationSettings,
			label: 'Group Invites',
			description: 'Notifications for group invitations',
			icon: Bell,
		},
		{
			key: 'pushNotifications' as keyof NotificationSettings,
			label: 'Push Notifications',
			description: 'Receive notifications on this device',
			icon: Smartphone,
		},
		{
			key: 'emailNotifications' as keyof NotificationSettings,
			label: 'Email Notifications',
			description: 'Receive email summaries and alerts',
			icon: Mail,
		},
	];

	return (
		<div className="space-y-4">
			{notificationOptions.map((option) => {
				const Icon = option.icon;
				return (
					<div key={option.key} className="flex items-center justify-between p-4 border border-[--color-border] rounded-lg">
						<div className="flex items-center gap-3">
							<Icon className="size-5 text-muted-foreground" />
							<div>
								<div className="text-sm font-medium">{option.label}</div>
								<div className="text-xs text-muted-foreground">{option.description}</div>
							</div>
						</div>
						<Switch
							checked={settings[option.key]}
							onCheckedChange={(checked) => handleUpdateSetting(option.key, checked)}
							disabled={isUpdating}
						/>
					</div>
				);
			})}

			<div className="space-y-3">
				<div className="text-sm font-medium text-muted-foreground">Notification Preferences</div>
				
				<div className="flex items-center justify-between p-3 bg-muted rounded-lg">
					<div className="flex items-center gap-2">
						{settings.pushNotifications ? (
							<Bell className="size-4 text-[--color-brand]" />
						) : (
							<BellOff className="size-4 text-muted-foreground" />
						)}
						<span className="text-sm">
							{settings.pushNotifications ? 'Notifications enabled' : 'Notifications disabled'}
						</span>
					</div>
					<div className="text-xs text-muted-foreground">
						{Object.values(settings).filter(Boolean).length} of {Object.keys(settings).length} active
					</div>
				</div>
			</div>

			<div className="text-xs text-muted-foreground space-y-1">
				<div>• Push notifications work when the app is open</div>
				<div>• Email notifications include daily/weekly summaries</div>
				<div>• You can customize notification frequency in settings</div>
			</div>

			{/* Test notification button */}
			<Button
				variant="outline"
				onClick={() => {
					if ('Notification' in window && Notification.permission === 'granted') {
						new Notification('Hisaab Test', {
							body: 'This is a test notification from Hisaab',
							icon: '/favicon.ico',
						});
						toast.success('Test notification sent');
					} else if ('Notification' in window && Notification.permission !== 'denied') {
						Notification.requestPermission().then((permission) => {
							if (permission === 'granted') {
								new Notification('Hisaab Test', {
									body: 'This is a test notification from Hisaab',
									icon: '/favicon.ico',
								});
								toast.success('Test notification sent');
							} else {
								toast.error('Notification permission denied');
							}
						});
					} else {
						toast.info('Enable browser notifications to test');
					}
				}}
				className="w-full h-12 justify-start gap-2"
			>
				<Bell className="size-4" />
				Test Notification
			</Button>
		</div>
	);
}
