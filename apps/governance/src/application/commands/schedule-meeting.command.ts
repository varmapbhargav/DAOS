export class ScheduleMeetingCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly type: string,
    public readonly scheduledAt?: string,
    public readonly location?: string,
  ) {}
}
