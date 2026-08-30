// Notification & Communication Value Objects
export type NotificationChannel = 'email' | 'sms' | 'pushNotification' | 'inApp';

export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';

export type TemplateCategory = 'transactional' | 'regulatory' | 'marketing';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';

export type AudienceCriteria = {
  investorStatus: string;
  accreditationLevel: string;
  productIds: string[];
};
