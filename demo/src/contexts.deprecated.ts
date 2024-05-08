import { AsyncLocalStorage } from 'node:async_hooks';

interface RepositoryContext {
  repository: string;
}

interface RepositoriesContext {
  repositories: string[];
}

interface BranchContext {
  branch: string;
}

const repositoryContext = new AsyncLocalStorage<RepositoryContext>();
const repositoriesContext = new AsyncLocalStorage<RepositoriesContext>();
const branchContext = new AsyncLocalStorage<BranchContext>();

export const getRepository = () => repositoryContext.getStore();
export const getRepositories = () => repositoriesContext.getStore();
export const getBranch = () => branchContext.getStore();

const constructWithContext =
  <T extends object>(asyncContext: AsyncLocalStorage<T>) =>
  <R, TArgs extends any[]>(
    context: T,
    callback: (...args: TArgs) => R,
    ...args: TArgs
  ) => {
    // console.log(`Running with context: ${JSON.stringify(context)}`);
    return asyncContext.run(context, callback, ...args);
  };

export const wrapWithRepository = constructWithContext(repositoryContext);

export const wrapWithRepositories = constructWithContext(repositoriesContext);

export const wrapWithBranch = constructWithContext(branchContext);
