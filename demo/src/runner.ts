import { getCwdContext } from './contexts';
import { getRepositoryContext } from './contexts';
import { logger } from './helpers';
import { spawn } from './spawn';

export const codemod = async (name: string) => {
  const { cwd } = getCwdContext();
  const { repository, branch } = getRepositoryContext();
  const log = logger(
    `Running codemod: ${name} for ${repository}/tree/${branch} in ${cwd}`
  );
  try {
    await spawn('npx', ['codemod', name], { cwd });
    log.success();
  } catch (e: any) {
    log.fail(e.toString());
  }
};
