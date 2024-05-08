import { repositories } from './git.deprecated';

export const recipe = async () => {
  // when taken from parent call
  await repositories(async ({ branch, commit }) => {
    await branch('update-frontend-version');

    await commit();
  });
};
