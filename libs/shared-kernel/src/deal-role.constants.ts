// Role constants for deal-studio
export enum DealRole {
  DEAL_CREATOR = 'DealCreator',
  DEAL_MANAGER = 'DealManager',
  DEAL_ANALYST = 'DealAnalyst',
  LEGAL_REVIEWER = 'LegalReviewer',
  COMPLIANCE_REVIEWER = 'ComplianceReviewer',
  INVESTMENT_COMMITTEE_MEMBER = 'InvestmentCommitteeMember',
  APPROVER = 'Approver',
  ADMINISTRATOR = 'Administrator',
  VIEWER = 'Viewer',
}

// Permissions by role
export const ROLE_PERMISSIONS: Record<DealRole, string[]> = {
  [DealRole.DEAL_CREATOR]: ['create:deal'],
  [DealRole.DEAL_MANAGER]: ['create:deal', 'modify:structure', 'finalize:terms', 'close:deal', 'cancel:deal'],
  [DealRole.DEAL_ANALYST]: ['view:deal', 'modify:structure'],
  [DealRole.LEGAL_REVIEWER]: ['view:deal', 'submit:approval', 'verify:conditions'],
  [DealRole.COMPLIANCE_REVIEWER]: ['view:deal', 'verify:conditions'],
  [DealRole.INVESTMENT_COMMITTEE_MEMBER]: ['view:deal', 'submit:approval', 'approve:deal'],
  [DealRole.APPROVER]: ['view:deal', 'approve:deal'],
  [DealRole.ADMINISTRATOR]: ['*'], // All permissions
  [DealRole.VIEWER]: ['view:deal'],
};

// Check if a role has a specific permission
export function hasPermission(roleIds: string[], permission: string): boolean {
  // Admin has all permissions
  if (roleIds.includes('Administrator')) return true;

  const permissions = roleIds.flatMap(role => ROLE_PERMISSIONS[role as DealRole] || []);
  return permissions.includes(permission) || permissions.includes('*');
}

// Check if any of the given roles has the required permission
export function hasAnyPermission(roleIds: string[], permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(roleIds, permission));
}