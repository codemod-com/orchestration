import { describe, migrate } from './codemod.deprecated';
import { getBranch, getRepository } from './contexts.deprecated';
import { recipe } from './recipe';

describe('codemode.com migration', () => {
  migrate('update frontend version', async ({ repositories }) => {
    // // parent with recipe
    // await repositories(
    //   `https://github.com/codemod-com/codemod https://github.com/codemod-com/react-codemod`,
    //   async () => {
    //     await recipe();
    //   }
    // );

    // // when function callback
    // await repositories(
    //   `
    //         https://github.com/codemod-com/codemod
    //         https://github.com/codemod-com/react-codemod
    //     `,
    //   async ({ branch, commit }) => {
    //     await branch('update-frontend-version');
    //     await commit();
    //     // await repositories(async ({ branch }) => {
    //     //   await branch('update-frontend-version');
    //     // });
    //   }
    // );
    // // when returned functions
    // const repositories1 =
    //   await repositories`   https://github.com/codemod-com/codemod
    //                         https://github.com/codemod-com/react-codemod`;
    // await repositories1.branch('update-frontend-version');
    // await repositories1.commit();

    // const codemodRepositories =
    //   await repositories(`  https://github.com/codemod-com/codemod
    //                         https://github.com/codemod-com/react-codemod`).forEach(
    //     async ({ branch, commit }) => {
    //       await branch('update-frontend-version').forEach(
    //         async ({ commit }) => {
    //           await commit('asdasd');
    //         }
    //       );
    //       await commit('asdasd');
    //     }
    //   );

    await repositories(`
      https://github.com/codemod-com/codemod
      https://github.com/codemod-com/react-codemod
    `)
      .branch('test-branch')
      .forEach(async ({ commit }) => {
        console.log(`repository: ${getRepository()?.repository}`);
        console.log(`branch: ${getBranch()?.branch}`);
        await commit('test');
      });

    // const repositories = await withRepositories(`
    //   https://github.com/codemod-com/codemod
    //   https://github.com/codemod-com/react-codemod
    //   `);
    // const branch = await repositories.branch('asdasd');
    // const commit = await branch.commit('asda');
    // const branch = repositories.branch('asd');
    // console.log({ repositories });

    // const repositoriesBranch = await repositories.branch('update-frontend-version');
    // console.log({ repositoriesBranch });

    // const repositoriesBranchBranch = await repositoriesBranch.branch(
    //   'repositoriesBranchBranch'
    // );
    // console.log({ repositoriesBranchBranch });
  });

  // migrate('move app', async ({ repositories }) => {
  //   await repositories(async ({ branch, commit }) => {
  //     await branch('move-app');
  //     await commit();
  //   });
  // });
});
