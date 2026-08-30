export class Permission {
  private constructor(
    public readonly resource: string,
    public readonly action: string,
  ) {}

  static of(resource: string, action: string): Permission {
    if (!resource || !action) throw new Error('Permission requires resource and action');
    return new Permission(resource, action);
  }

  static parse(value: string): Permission {
    const [resource, action] = value.split(':');
    if (!resource || !action) throw new Error(`Invalid permission string: ${value}`);
    return new Permission(resource, action);
  }

  toString(): string {
    return `${this.resource}:${this.action}`;
  }

  equals(other: Permission): boolean {
    return this.resource === other.resource && this.action === other.action;
  }
}
