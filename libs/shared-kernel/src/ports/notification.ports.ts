// Notification ports
export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  listByRecipient(recipientId: string): Promise<Notification[]>;
  listByStatus(status: string): Promise<Notification[]>;
}

export interface NotificationTemplateRepository {
  save(template: NotificationTemplate): Promise<void>;
  findById(id: string): Promise<NotificationTemplate | null>;
  listByTenant(tenantId: string): Promise<NotificationTemplate[]>;
}

export interface CommunicationCampaignRepository {
  save(campaign: CommunicationCampaign): Promise<void>;
  findById(id: string): Promise<CommunicationCampaign | null>;
  listByTenant(tenantId: string): Promise<CommunicationCampaign[]>;
}

export interface EmailPort {
  send(to: string, subject: string, html: string, text: string): Promise<{ messageId: string }>;
  getStatus(messageId: string): Promise<{ status: string; deliveredAt: string | null }>;
}

export interface SmsPort {
  send(to: string, message: string): Promise<{ messageId: string }>;
  getStatus(messageId: string): Promise<{ status: string; deliveredAt: string | null }>;
}

export interface PushNotificationPort {
  send(deviceTokens: string[], title: string, body: string, payload: Record<string, string>): Promise<void>;
}

export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';