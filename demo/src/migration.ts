import * as semver from 'semver';
import { describe, migrate } from './codemod';
import { repositories } from './git';
import { spawn } from './spawn';
import { getCwdContext } from './contexts';

const recipe = async () => {
  // when taken from parent call
  await repositories(
    async ({ branch, commit, codemod, directories, jsonFiles }) => {
      await branch('update-frontend-version');

      await spawn('pnpm', ['install']);

      await directories('apps/*', async () => {
        const { cwd } = getCwdContext();
        if (cwd.endsWith('docs')) {
          return;
        }
        await codemod('react-native/74/remove-event-listener-callback');
        await commit('single fetch convert json to response');
      });

      await jsonFiles<{ version: string }>(
        '**/package.json',
        async ({ update }) => {
          await update((contents) => ({
            ...contents,
            version: semver.inc(contents.version, 'minor') as string,
          }));
        }
      );

      await commit('bump version');
    }
  );
};

describe('codemode.com migration', () => {
  migrate('update frontend version', async ({ repositories }) => {
    await repositories(
      ` https://github.com/codemod-com/codemod
        https://github.com/codemod-com/react-codemod`,
      async () => {
        await recipe();
      }
    );
    // // parent with recipe
    // await repositories(
    //   ` https://github.com/codemod-com/codemod
    //     https://github.com/codemod-com/react-codemod`,
    //   async ({ branch }) => {
    //     // await branch('asdasd');
    //     await recipe();
    //   }
    // );

    // // when function callback
    // const codemodRepositories = await repositories(
    //   ` https://github.com/codemod-com/codemod
    //     https://github.com/codemod-com/react-codemod`,
    //   async ({ branch, commit }) => {
    //     await branch('update-frontend-version');
    //     await commit();
    //     // await repositories(async ({ branch }) => {
    //     //   await branch('update-frontend-version');
    //     // });
    //   }
    // );
    // await codemodRepositories.branch('another-branch');
    // await codemodRepositories.commit('fix');
    // // when returned functions
    // const repositories1 =
    //   await repositories` https://github.com/codemod-com/codemod
    //                       https://github.com/codemod-com/react-codemod`;
    // await repositories1.branch('update-frontend-version');
    // await repositories1.commit();
  });
});
