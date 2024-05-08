import * as clc from 'cli-color';
import { warn } from 'console';

export const promiseTimeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const logger = (message: string) => {
  console.info(`${clc.blueBright('RUN ')} ${message}`);

  return {
    success: (output?: string) =>
      console.info(
        `${clc.green('SUCC')} ${message}${
          output
            ? `\n  ${output
                .split('\n')
                .map((line) => `\n    ${line}`)
                .join('')
                .trim()}`
            : ''
        }`
      ),
    fail: (error: string) =>
      console.error(`${clc.red('ERR ')} ${message} - ${error}`),
    warn: (warning: string) =>
      warn(`${clc.yellow('WARN')} ${message} - ${warning}`),
  };
};
