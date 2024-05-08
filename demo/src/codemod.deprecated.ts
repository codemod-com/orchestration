import { repositories } from './git.deprecated';

export function describe(description: string, callback: () => void) {
  console.log(`Running migration campaign: ${description}`);
  callback();
}

export function migrate(
  description: string,
  callback: (inject: {
    repositories: typeof repositories;
  }) => Promise<void> | void
) {
  console.log(`Running migration: ${description}`);
  callback({ repositories });
}
