import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Chore } from '../types/chore';
import { calculateTiming } from './time';

const REMINDER_CHANNEL_ID = 'chore-reminders';

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (Platform.OS === 'android') {
        // Android 13+ won't show the permission prompt until a channel exists
        await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
          name: 'Chore reminders',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } else if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
  }
  return false;
}

export async function syncChoreNotifications(chores: Chore[]): Promise<void> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const enabledChores = chores.filter((c) => c.reminderEnabled);
    if (enabledChores.length === 0) return;
    if (!(await requestNotificationPermissions())) return;

    const now = Date.now();

    for (const chore of enabledChores) {
      const timing = calculateTiming(chore, now);

      if (timing.isOverdue) {
        // Send a notification reminding of the overdue chore
        await Notifications.scheduleNotificationAsync({
          identifier: `overdue-${chore.id}`,
          content: {
            title: `Chore Due: ${chore.title}`,
            body: `${chore.title} is ${timing.latenessText}. ${timing.timeSinceLastPerformedText}.`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            channelId: REMINDER_CHANNEL_ID,
            seconds: 3600 * 4, // Remind in 4 hours
            repeats: false,
          },
        });
      } else {
        // Schedule notification for its exact due date
        const secondsUntilDue = Math.max(60, Math.floor((timing.dueDate - now) / 1000));
        await Notifications.scheduleNotificationAsync({
          identifier: `due-${chore.id}`,
          content: {
            title: `Chore Reminder: ${chore.title}`,
            body: `It's time for ${chore.title}! ${timing.timeSinceLastPerformedText}.`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            channelId: REMINDER_CHANNEL_ID,
            seconds: secondsUntilDue,
            repeats: false,
          },
        });
      }
    }
  } catch (err) {
    console.warn('Failed to sync notifications:', err);
  }
}
