import {
  describeContext,
  getDescribeContext,
  migrateContext,
} from './contexts';
import { repositories } from './git';
import { logger } from './helpers';

export function describe(description: string, callback: () => void) {
  // Clear screen
  console.log('\x1b[2J');
  describeContext.run({ name: description }, callback);
}

export function migrate(
  description: string,
  callback: (inject: {
    repositories: typeof repositories;
  }) => Promise<void> | void
) {
  migrateContext.run({ name: description }, async () => {
    const { name } = getDescribeContext();
    const log = logger(`Migrating ${name}/${description}`);
    try {
      await callback({ repositories });
      log.success();
    } catch (e: any) {
      log.fail(e.toString());
    }
  });
}
