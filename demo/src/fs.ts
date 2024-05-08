/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fg from 'fast-glob';
import { getCwdContext, cwdContext, fileContext } from './contexts';

const DIRECTORY = 'cm';

const filenamify = async (a: string) => {
  const module = (
    (await eval('import("filenamify")')) as typeof import('filenamify')
  ).default;
  return module(a);
};

const slugify = async (a: string) => {
  const module = (
    (await eval(
      'import("@sindresorhus/slugify")'
    )) as typeof import('@sindresorhus/slugify')
  ).default;
  return module(a);
};

export const getTmpDir = async (...rawParts: string[]) => {
  const parts = await Promise.all(
    rawParts.map(async (part) => {
      const slug = await slugify(part);
      return await filenamify(slug);
    })
  );
  const dirpath = path.join(os.tmpdir(), DIRECTORY, ...parts);

  await fs.mkdir(dirpath, { recursive: true });

  return dirpath;
};

export const rm = async (dir: string) => {
  await fs.rm(dir, {
    recursive: true,
    force: true,
    retryDelay: 1000,
    maxRetries: 5,
  });
};

export const directories = async (
  pattern: string | string[],
  cb: () => Promise<void>
) => {
  const { cwd } = getCwdContext();
  const dirs = await fg(pattern, { cwd, onlyDirectories: true });
  // await Promise.all(
  //   dirs.map((dir) => cwdContext.run({ cwd: path.join(cwd, dir) }, cb))
  // );
  for (const dir of dirs) {
    await cwdContext.run({ cwd: path.join(cwd, dir) }, cb);
  }
};

export const files = async (
  pattern: string | string[],
  cb: () => Promise<void>
) => {
  const { cwd } = getCwdContext();
  const files = await fg(pattern, { cwd, onlyFiles: true });
  // await Promise.all(
  //   files.map((file) => fileContext.run({ file: path.join(cwd, file) }, cb))
  // );
  for (const file of files) {
    await fileContext.run({ file: path.join(cwd, file) }, cb);
  }
};

export const jsonFiles = async <T>(
  pattern: string | string[],
  cb: (args: {
    update: (updater: T | ((input: T) => T | Promise<T>)) => Promise<void>;
  }) => Promise<void>
) => {
  const { cwd } = getCwdContext();
  const files = await fg(pattern, { cwd, onlyFiles: true });
  await cb({
    update: async (updater: T | ((input: T) => T | Promise<T>)) => {
      // await Promise.all(
      //   files.map(async (file) => {
      //     const filepath = path.join(cwd, file);
      //     if (typeof updater === 'function') {
      //       const contents = JSON.parse(await fs.readFile(filepath, 'utf-8'));
      //       // @ts-ignore
      //       const updatedContents = (await updater(contents)) as T;
      //       await fs.writeFile(
      //         filepath,
      //         JSON.stringify(updatedContents, null, 2)
      //       );
      //     } else {
      //       await fs.writeFile(filepath, JSON.stringify(updater, null, 2));
      //     }
      //   })
      // );
      for (const file of files) {
        const filepath = path.join(cwd, file);
        if (typeof updater === 'function') {
          const contents = JSON.parse(await fs.readFile(filepath, 'utf-8'));
          // @ts-ignore
          const updatedContents = (await updater(contents)) as T;
          await fs.writeFile(
            filepath,
            JSON.stringify(updatedContents, null, 2)
          );
        } else {
          await fs.writeFile(filepath, JSON.stringify(updater, null, 2));
        }
      }
    },
  });
};
