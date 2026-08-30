export interface IdempotencyStore {
  seen(key: string): Promise<boolean>;
  mark(key: string): Promise<void>;
}
