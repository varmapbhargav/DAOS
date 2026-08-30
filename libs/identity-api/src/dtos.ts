export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequestDto {
  subdomain: string;
  email: string;
  password: string;
}

export interface LoginResponseDto extends TokenPair {
  userId: string;
  tenantId: string;
}

export interface UserProfileDto {
  id: string;
  tenantId: string;
  email: string;
  status: string;
  roleIds: string[];
}

export interface WhiteLabelDto {
  brandColor: string;
  logoUrl: string | null;
  customDomain: string | null;
  featureFlags: Record<string, boolean>;
}

export interface TenantInfoDto {
  id: string;
  subdomain: string;
  name: string;
  status: string;
}

export interface TenantDetailDto extends TenantInfoDto {
  whiteLabel: WhiteLabelDto;
}

export interface RoleDto {
  id: string;
  tenantId: string;
  name: string;
  permissions: string[];
}

export interface MeResponseDto {
  user: UserProfileDto;
  tenant: TenantInfoDto;
  whiteLabel: WhiteLabelDto;
}
