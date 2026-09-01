import { DomainEvent } from '../domain-event';

export interface ProjectionHandler {
  handle(event: DomainEvent): Promise<void>;
}
