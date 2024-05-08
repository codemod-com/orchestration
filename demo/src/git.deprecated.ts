/* eslint-disable @typescript-eslint/ban-ts-comment */
import { identity, mapValues, merge } from 'lodash';
import {
  getBranch,
  getRepository,
  wrapWithBranch,
  wrapWithRepositories,
  wrapWithRepository,
} from './contexts.deprecated';
import invariant from 'ts-invariant';

const ora = async (text: string) => {
  const oraItself = (await eval("import('ora')")).default;
  return oraItself(text).start();
};

const promiseTimeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// https://github.com/sindresorhus/p-lazy
// @ts-ignore
class PLazy<ValueType> extends Promise<ValueType> {
  #executor;
  #promise?: Promise<ValueType>;

  constructor(
    executor: (
      resolve: (resolvedValue: ValueType) => void,
      reject: (error: any) => void
    ) => void
  ) {
    super((resolve) => {
      // @ts-ignore
      resolve();
    });

    this.#executor = executor;
  }

  // @ts-ignore
  static from(function_) {
    // @ts-ignore
    return new PLazy((resolve) => {
      resolve(function_());
    });
  }

  // @ts-ignore
  static resolve(value) {
    // @ts-ignore
    return new PLazy((resolve) => {
      resolve(value);
    });
  }

  // @ts-ignore
  static reject(error) {
    return new PLazy((resolve, reject) => {
      reject(error);
    });
  }

  override then<TResult1 = ValueType, TResult2 = never>(
    onFulfilled:
      | ((resolvedValue: ValueType) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onRejected:
      | ((error: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ) {
    // TODO: Use `??=` when targeting Node.js 16.
    this.#promise = this.#promise || new Promise<ValueType>(this.#executor);
    return this.#promise.then(onFulfilled, onRejected);
  }

  // @ts-ignore
  catch(onRejected) {
    this.#promise = this.#promise || new Promise(this.#executor);
    return this.#promise.catch(onRejected);
  }
}

const repositoriesFn =
  (
    arg0?: string | ReadonlyArray<string> | ((children: any) => Promise<void>)
  ) =>
  async (callback: () => Promise<void>, children: any) => {
    console.log(children);
    let values: string[] = [];

    if (typeof arg0 === 'string') {
      values = arg0
        .split(/[\n,; ]/)
        .map((repository) => repository.trim())
        .filter(identity);
    } else if (typeof arg0 === 'undefined') {
      await callback();
    } else {
      // values = flattenDeep(
      //   arg0.map((repository) =>
      //     repository.split(/[\n, ;]/).map((repository) => repository.trim())
      //   )
      // ).filter(identity);
    }

    await wrapWithRepositories({ repositories: values }, () =>
      Promise.all(
        values.map((repository) =>
          wrapWithRepository({ repository }, () =>
            wrapWithBranch({ branch: 'main' }, async () => {
              const spinner = await ora(`Cloning repository: ${repository}`);
              await promiseTimeout(2000);
              spinner.succeed();

              await callback();
            })
          )
        )
      )
    );
  };

const branchFn =
  (branchName: string) => async (callback: () => Promise<void> | void) => {
    const repository = getRepository()?.repository;
    invariant(typeof repository === 'string', 'No repository context found');

    const spinner = await ora(
      `Creating branch ${branchName} for repository: ${repository}`
    );
    await promiseTimeout(2000);
    spinner.succeed();

    return wrapWithBranch({ branch: branchName }, callback);
  };

const commitFn = async (commitName?: string) => {
  const repository = getRepository()?.repository;
  const branch = getBranch()?.branch;
  invariant(typeof repository === 'string', 'No repository context found');
  invariant(typeof branch === 'string', 'No branch context found');

  const spinner = await ora(
    `Committing to repository: ${repository} to branch: ${branch} with message "${commitName}"`
  );
  await promiseTimeout(2000);
  spinner.succeed();

  return commitName;
};

const constructBranchCorrectTypes = <A extends any[], C>(
  name: string,
  main: (
    ...args: A
  ) => (callback: () => Promise<void>, children: C) => Promise<void>,
  children: C
) => {
  // const wrap = () => main<C>(...args);

  // const children = mapValues(constructChildren, (child) => child(path));

  const branchFunction = (...args: A) => {
    // const path = `${parentPath ? `${parentPath}.` : ''}${name}`;
    // console.log(`> init ${path}`);
    // const wrap = (cb: () => Promise<void>) =>
    //   parentWrap ? parentWrap(() => main(...args)(cb)) : main(...args)(cb);
    // @ts-ignore
    // console.log(constructChildren?.branch?.(wrap, path)?.toString());
    const branchPromise = new PLazy<C>((resolve, reject) => {
      // console.log(`> run ${path}`);
      // wrap(async () => {
      //   // resolve(children);
      // });
    });

    const branchPromiseWithChildren = merge(branchPromise, children, {
      forEach: async (callback: (c: C) => Promise<void>) => {
        await callback(children);
      },
    });

    return branchPromiseWithChildren;
  };

  return branchFunction;
};

const constructBranch: typeof constructBranchCorrectTypes = (<
    A extends any[],
    C extends {
      [K in keyof C]: (
        parentWrap: Parameters<C[keyof C]>[0],
        parentPath?: string
      ) => ReturnType<C[keyof C]>;
    },
    R extends { [P in keyof C]: ReturnType<C[keyof C]> },
    W extends (callback: () => Promise<void>) => Promise<void>
  >(
    name: string,
    main: (...args: A) => (callback: () => Promise<void>) => Promise<void>,
    constructChildren: C
  ) =>
  (parentWrap?: W, parentPath?: string) => {
    // const wrap = () => main<C>(...args);

    // const children = mapValues(constructChildren, (child) => child(path));

    const branchFunction = (...args: A) => {
      const path = `${parentPath ? `${parentPath}.` : ''}${name}`;
      console.log(`> init ${path}`);
      const wrap = (cb: () => Promise<void>) =>
        parentWrap ? parentWrap(() => main(...args)(cb)) : main(...args)(cb);
      // @ts-ignore
      // console.log(constructChildren?.branch?.(wrap, path)?.toString());
      const children = mapValues(constructChildren, (child) =>
        child(wrap, path)
      );
      const branchPromise = new PLazy<R>((resolve, reject) => {
        console.log(`> run ${path}`);
        wrap(async () => {
          resolve(children as any);
        });
      });

      const branchPromiseWithChildren = merge(branchPromise, children, {
        forEach: async (callback: (c: C) => Promise<void>) => {
          await wrap(() => callback(children as any));
        },
      });

      return branchPromiseWithChildren;
    };

    return branchFunction;
  }) as any;

const constructLeafWithCorrectTypes =
  <A extends any[], R>(name: string, main: (...args: A) => Promise<R>) =>
  async (...args: A) => {
    return main(...args);
  };

const constructLeaf: typeof constructLeafWithCorrectTypes = (<
    A extends any[],
    R
  >(
    name: string,
    main: (...args: A) => Promise<R>
  ) =>
  (parentWrap: any = (cb: any) => cb(), parentPath?: string) =>
  async (...args: A) => {
    const path = `${parentPath ? `${parentPath}.` : ''}${name}`;
    console.log(`> run ${path}`);
    return parentWrap(() => main(...args));
  }) as any;

const constructRepositories = constructBranch('repositories', repositoriesFn, {
  branch: constructBranch('branch', branchFn, {
    commit: constructLeaf('commit', commitFn),
  }),
  commit: constructLeaf('commit', commitFn),
});

export const repositories: typeof constructRepositories =
  // @ts-ignore
  constructRepositories() as any;
