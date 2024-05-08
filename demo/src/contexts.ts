import { AsyncLocalStorage } from 'async_hooks';

import { invariant } from 'ts-invariant';

export const describeContext = new AsyncLocalStorage<{ name: string }>();
export const migrateContext = new AsyncLocalStorage<{ name: string }>();

export const cwdContext = new AsyncLocalStorage<{
  cwd: string;
}>();

export const fileContext = new AsyncLocalStorage<{ file: string }>();

export const repositoryContext = new AsyncLocalStorage<{
  repository: string;
  branch: string;
}>();

export const repositoriesContext = new AsyncLocalStorage<{
  repositories: string[];
}>();

export const getCwdContext = () => {
  const cwd = cwdContext.getStore();
  invariant(cwd, 'No cwd context found');
  return cwd;
};

export const getFileContext = () => {
  const file = fileContext.getStore();
  invariant(file, 'No file context found');
  return file;
};

export const getRepositoryContext = () => {
  const repo = repositoryContext.getStore();
  invariant(repo, 'No repository context found');
  return repo;
};

export const getDescribeContext = () => {
  const repo = describeContext.getStore();
  invariant(repo, 'No describe context found');
  return repo;
};
