export interface WhiteLabelProps {
  brandColor: string;
  logoUrl: string | null;
  customDomain: string | null;
  featureFlags: Record<string, boolean>;
}

export class WhiteLabelConfig {
  private constructor(private readonly props: WhiteLabelProps) {}

  static create(props: WhiteLabelProps): WhiteLabelConfig {
    if (!/^#[0-9a-fA-F]{6}$/.test(props.brandColor)) {
      throw new Error('brandColor must be a #RRGGBB hex value');
    }
    return new WhiteLabelConfig({ ...props, featureFlags: { ...props.featureFlags } });
  }

  static default(): WhiteLabelConfig {
    return WhiteLabelConfig.create({ brandColor: '#000000', logoUrl: null, customDomain: null, featureFlags: {} });
  }

  get brandColor(): string {
    return this.props.brandColor;
  }

  get logoUrl(): string | null {
    return this.props.logoUrl;
  }

  get customDomain(): string | null {
    return this.props.customDomain;
  }

  get featureFlags(): Record<string, boolean> {
    return { ...this.props.featureFlags };
  }

  equals(other: WhiteLabelConfig): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
