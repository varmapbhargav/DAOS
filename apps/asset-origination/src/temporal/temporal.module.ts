import { Logger, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client, Connection } from '@temporalio/client';

import { TEMPORAL_CLIENT } from './temporal.tokens';

let sharedConnection: Connection | null = null;

export async function createTemporalConnection(config: ConfigService): Promise<Connection> {
  if (!sharedConnection) {
    const address = config.get('TEMPORAL_ADDRESS', 'localhost:7233');
    sharedConnection = await Connection.connect({ address });
  }
  return sharedConnection;
}

export const temporalClientProvider: Provider = {
  provide: TEMPORAL_CLIENT,
  inject: [ConfigService],
  useFactory: async (config: ConfigService): Promise<Client | null> => {
    if (config.get('TEMPORAL_ENABLED', 'false') !== 'true') {
      return null;
    }
    const connection = await createTemporalConnection(config);
    return new Client({ connection });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [temporalClientProvider],
  exports: [TEMPORAL_CLIENT],
})
export class TemporalModule implements OnApplicationShutdown {
  private readonly logger = new Logger(TemporalModule.name);

  onApplicationShutdown(): void {
    void this.close();
  }

  private async close(): Promise<void> {
    if (sharedConnection) {
      try {
        await sharedConnection.close();
      } catch (error) {
        this.logger.warn(`[temporal] Failed to close connection: ${(error as Error).message}`);
      } finally {
        sharedConnection = null;
      }
    }
  }
}
