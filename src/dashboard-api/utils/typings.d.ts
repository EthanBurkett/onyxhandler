export type PartialGuild = {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: string;
  features: string[];
};

export interface APIUser {
  id: string;
  username: string;
  avatar: string;
  avatar_decoration: any;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: string;
  banner_color: any;
  accent_color: any;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  email: string;
  verified: boolean;
}
