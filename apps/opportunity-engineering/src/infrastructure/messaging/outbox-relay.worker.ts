import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Kafka } from 'kafkajs';

import { OutboxEventOrmEntity } from '../persistence/entities/outbox-event.orm-entity';

@Injectable()
export class OutboxRelayWorker implements OnModuleInit {
  private readonly logger = new Logger(OutboxRelayWorker.name);
  private readonly kafka: Kafka;
  private readonly producer: any;
  private isRunning = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectDataSource() private readonly ds: DataSource,
    private readonly config: ConfigService,
  ) {
    this.kafka = new Kafka({
      clientId: 'opportunity-engineering-outbox',
      brokers: [config.get('KAFKA_BROKER', 'localhost:9092')],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.startPolling();
  }

  private startPolling(): void {
    this.isRunning = true;
    this.pollInterval = setInterval(() => this.pollAndPublish(), 1000);
    this.logger.log('Outbox relay worker started');
  }

  private async pollAndPublish(): Promise<void> {
    if (!this.isRunning) return;

    const events = await this.ds.transaction(async (manager) => {
      const events = await manager
        .getRepository(OutboxEventOrmEntity)
        .createQueryBuilder()
        .where('published_at IS NULL')
        .andWhere('retry_count < 10')
        .orderBy('occurred_at', 'ASC')
        .take(100)
        .getMany();

      return events;
    });

    for (const event of events) {
      try {
        await this.publishToKafka(event);
        await this.markPublished(event.id);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await this.incrementRetry(event.id, errorMessage);
        this.logger.error(`Failed to publish event ${event.id}: ${errorMessage}`);
      }
    }
  }

  private async publishToKafka(event: OutboxEventOrmEntity): Promise<void> {
    const topic = `daos.${event.aggregateType.toLowerCase()}.${event.eventType.toLowerCase()}`;

    await this.producer.send({
      topic,
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify({
            eventId: event.id,
            eventType: event.eventType,
            eventVersion: event.eventVersion,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            tenantId: event.tenantId,
            occurredAt: event.occurredAt,
            correlationId: event.correlationId,
            causationId: event.causationId,
            actorId: event.actorId,
            payload: event.payload,
          }),
          timestamp: event.occurredAt.getTime().toString(),
        },
      ],
    });
  }

  private async markPublished(eventId: string): Promise<void> {
    await this.ds
      .createQueryBuilder()
      .update(OutboxEventOrmEntity)
      .set({ publishedAt: new Date() })
      .where('id = :id', { id: eventId })
      .execute();
  }

  private async incrementRetry(eventId: string, error: string): Promise<void> {
    await this.ds
      .createQueryBuilder()
      .update(OutboxEventOrmEntity)
      .set({
        retryCount: () => 'retry_count + 1',
        lastError: error,
      })
      .where('id = :id', { id: eventId })
      .execute();
  }

  async onModuleDestroy(): Promise<void> {
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    await this.producer.disconnect();
    this.logger.log('Outbox relay worker stopped');
  }
}