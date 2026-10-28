import type { AppNotification } from '../types';
import { fetchJson } from './client';
import type { RequestOptions } from './client';

interface NotificationsResponse {
  notifications: AppNotification[];
}

export async function getNotifications(options?: RequestOptions): Promise<AppNotification[]> {
  const response = await fetchJson<NotificationsResponse>('notifications.json', options);
  return response.notifications;
}
