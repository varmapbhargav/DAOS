import path from 'node:path';

import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NativeConnection, Worker } from '@temporalio/worker';

import { CaseWorkflowActivitiesService } from '../activities/case-workflow-activities.service';
import { createOriginationCaseWorker } from './create.worker';

@Injectable()
export class TemporalWorkerService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(TemporalWorkerService.name);
  private worker: Worker | null = null;
  private connection: NativeConnection | null = null;

  constructor(
    private readonly config: ConfigService,
    @Inject(CaseWorkflowActivitiesService) private readonly activities: CaseWorkflowActivitiesService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get('TEMPORAL_ENABLED', 'false') !== 'true') {
      this.logger.log('[temporal] Worker disabled (TEMPORAL_ENABLED != true)');
      return;
    }
    if (this.config.get('TEMPORAL_WORKER', 'false') !== 'true') {
      this.logger.log('[temporal] Worker not started (TEMPORAL_WORKER != true)');
      return;
    }

    try {
      const address = this.config.get('TEMPORAL_ADDRESS', 'localhost:7233');
      this.connection = await NativeConnection.connect({ address });
      this.worker = await createOriginationCaseWorker({
        connection: this.connection,
        workflowSourceDir: this.resolveWorkflowSourceDir(),
        activities: this.activities,
      });
      this.logger.log('[temporal] Worker starting; press ctrl+c to exit');
      void this.worker.run();
    } catch (error) {
      this.logger.error(`[temporal] Failed to start worker: ${(error as Error).message}`);
    }
  }

  private resolveWorkflowSourceDir(): string {
    const configured = this.config.get<string>('TEMPORAL_WORKFLOW_SOURCE_DIR');
    if (configured) {
      return configured;
    }
    return path.resolve(
      process.cwd(),
      'apps',
      'asset-origination',
      'src',
      'temporal',
      'workflows',
    );
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.worker) {
      this.logger.log('[temporal] Shutting down worker');
      await this.worker.shutdown();
      this.worker = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
