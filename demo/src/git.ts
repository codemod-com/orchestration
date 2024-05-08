import { flattenDeep, identity } from 'lodash';
import { invariant } from 'ts-invariant';
import * as clc from 'cli-color';
import { logger, promiseTimeout } from './helpers';
import { directories, files, getTmpDir, jsonFiles, rm } from './fs';
import { cwdContext } from './contexts';
import { getCwdContext } from './contexts';
import { spawn } from './spawn';
import { codemod } from './runner';
import { repositoryContext } from './contexts';
import { repositoriesContext } from './contexts';

const gitBranch = async (dir: string) => {
  const { stdout } = await spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: dir,
  });
  const branch = stdout.join('').trim();
  return branch;
};

const checkoutBranch = async (dir: string, branch: string) => {
  const response = await spawn('git', ['checkout', branch], {
    cwd: dir,
    doNotThrowError: true,
  });
  const stderr = response.stderr.join('').trim();
  if (stderr.match(/did not match any file/)) {
    console.warn(
      `${clc.yellow('WARN')} Branch ${JSON.stringify(branch)} does not exist`
    );
    await spawn('git', ['checkout', '-b', branch], {
      cwd: dir,
    });
  }
};

export const branch = async (branchName: string) => {
  const repoContext = repositoryContext.getStore();
  invariant(repoContext, 'No repository context found');
  const cwdContext = getCwdContext();

  await checkoutBranch(cwdContext.cwd, branchName);

  const newBranch = await gitBranch(cwdContext.cwd);

  repoContext.branch = newBranch;
  const log = logger(
    `Creating branch: ${repoContext.repository}/tree/${branchName}`
  );
  await promiseTimeout(5000 * Math.random());
  log.success();
};

export const commit = async (commitName = 'no commit message provided') => {
  const repoContext = repositoryContext.getStore();
  invariant(repoContext, 'No repository context found');
  const cwdContext = getCwdContext();

  const log = logger(
    `Committing to ${repoContext.repository}/tree/${repoContext.branch}${
      commitName ? ` with message: ${JSON.stringify(commitName)}` : ''
    }`
  );
  try {
    await spawn('git', ['add', '.'], { cwd: cwdContext.cwd });
    const { stdout } = await spawn('git', ['commit', '-m', commitName], {
      cwd: cwdContext.cwd,
      doNotThrowError: true,
    });
    if (stdout.join('').match(/nothing to commit, working tree clean/gm)) {
      log.warn('Nothing to commit');
    } else {
      log.success(stdout.join(''));
    }
  } catch (e: any) {
    log.fail(e.toString());
  }
};

export const push = async ({ force }: { force?: boolean } = {}) => {
  const repoContext = repositoryContext.getStore();
  invariant(repoContext, 'No repository context found');
  const cwdContext = getCwdContext();

  const log = logger(
    `Pushing to ${repoContext.repository}/tree/${repoContext.branch}`
  );
  await spawn('git', ['push', ...(force ? ['-f'] : [])], {
    cwd: cwdContext.cwd,
  });
  log.success();
};

const repositoriesHelpers = {
  branch,
  commit,
  push,
  codemod,
  directories,
  files,
  jsonFiles,
};

type RepositoriesHelpers = typeof repositoriesHelpers;

interface RepositoriesHelpersWithPromise
  extends RepositoriesHelpers,
    Promise<RepositoriesHelpers> {}

type RepositoriesHelpersCallback = (
  callbackArgs: RepositoriesHelpers
) => Promise<void>;

export const repositories: {
  // string with callback
  (
    values: string,
    callback: RepositoriesHelpersCallback
  ): RepositoriesHelpersWithPromise;
  // callback as first argument
  (callback: RepositoriesHelpersCallback): RepositoriesHelpersWithPromise;
  // tagged template literal
  <Elem extends string, Template extends ReadonlyArray<Elem>>(
    template: Template
  ): RepositoriesHelpersWithPromise;
} = (
  arg0: string | RepositoriesHelpersCallback | ReadonlyArray<string>,
  arg1?: RepositoriesHelpersCallback
) => {
  let values: string[] = [];

  const wrap =
    <F extends (...args: any[]) => Promise<void>>(cb: F) =>
    (...args: Parameters<F>) =>
      new Promise<void>((resolve, reject) => {
        repositoriesContext.run({ repositories: values }, () => {
          Promise.all(
            values.map(
              (repository) =>
                new Promise((resolve, reject) => {
                  repositoriesContext.run({ repositories: values }, () => {
                    repositoryContext.run(
                      { repository, branch: 'main' },
                      () => {
                        cb(...args)
                          .then(resolve)
                          .catch(reject);
                      }
                    );
                  });
                })
            )
          )
            .then(() => resolve())
            .catch(reject);
        });
      });

  const branch = wrap(repositoriesHelpers.branch);

  const commit = wrap(repositoriesHelpers.commit);

  const push = wrap(repositoriesHelpers.push);

  const codemod = wrap(repositoriesHelpers.codemod);

  const directories = wrap(repositoriesHelpers.directories);

  const files = wrap(repositoriesHelpers.files);

  const jsonFiles = wrap(repositoriesHelpers.jsonFiles);

  const cloneRepository = async (repositoryUrl: string) => {
    const tmpDir = await getTmpDir(repositoryUrl);
    const cwd = cwdContext.getStore();
    if (cwd) {
      cwd.cwd = tmpDir;
    }

    const log = logger(`Cloning repository: ${repositoryUrl} to ${tmpDir}`);
    await rm(tmpDir);
    await spawn('git', ['clone', repositoryUrl, tmpDir]);
    const branch = await gitBranch(tmpDir);
    log.success();

    return branch;
  };

  const runCallback = (
    resolve: (helpers: RepositoriesHelpers) => void,
    reject: (reason?: any) => void
  ) =>
    Promise.all(
      values.map(async (repository) => {
        await repositoriesContext.run({ repositories: values }, async () => {
          await cwdContext.run({ cwd: process.cwd() }, async () => {
            const branch = await cloneRepository(repository);
            await repositoryContext.run({ repository, branch }, async () => {
              await arg1?.(repositoriesHelpers);
            });
          });
        });
      })
    )
      .then(() =>
        resolve({
          branch,
          commit,
          push,
          codemod,
          directories,
          files,
          jsonFiles,
        })
      )
      .catch(reject);

  const promise = new Promise<RepositoriesHelpers>((resolve, reject) => {
    if (typeof arg0 === 'string') {
      values = arg0
        .split(/[\n,; ]/)
        .map((repository) => repository.trim())
        .filter(identity);
      runCallback(resolve, reject);
    } else if (typeof arg0 === 'function') {
      const repositoriesFromContext =
        repositoriesContext.getStore()?.repositories;
      invariant(repositoriesFromContext, 'No repositories context found');
      values = repositoriesFromContext;
      invariant(
        repositoryContext.getStore()?.repository,
        'No repository context found'
      );
      arg0(repositoriesHelpers)
        .then(() => resolve(repositoriesHelpers))
        .catch(reject);
    } else {
      values = flattenDeep(
        arg0.map((repository) =>
          repository.split(/[\n, ;]/).map((repository) => repository.trim())
        )
      ).filter(identity);
      resolve({ branch, commit, push, codemod, directories, files, jsonFiles });
    }
  }) as RepositoriesHelpersWithPromise;

  promise.branch = branch;
  promise.commit = commit;

  return promise;
};
