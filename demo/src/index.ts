// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

function recipe() {
  files.rename(({ name }) => name.replace('.js', '.ts'));
}

describe('frontend migration', () => {
  migrate('javascript to typescript', async ({ withRepositories }) => {
    repositories``(({ jsFiles }) => {
      jsFiles`src/**/*.js,src/**/*.jsx`.react19UseContext({
        functionToReplace: 'useContext',
      });
    });

    const repositories = await withRepositories`
        https://github.com/company/frontend
    `(async ({ withJsFiles }) => {
      await withJsFiles`src/**/*.js,src/**/*.jsx`.renameExtension(
        (extension) => `${extension}x`
      );
    });

    await repositories(async ({ commit, name, exec }) => {
      await exec`pnpm install`;
      await Promise.all([exec`pnpm run build`, exec`pnpm run test`]);
      await commit(`feat: ${name} migrate to typescript`);
    });
  });

  migrate('move all code to monorepo', async ({ withRepositories }) => {
    const monorepo = createInstance(
      await withRepositories`https://github.com/company/monorepo`
    );

    const websites = await withRepositories`
        https://github.com/company/website-one
        https://github.com/company/website-two
        https://github.com/company/website-three
    `;

    const websiteNames = await websites.map(
      ({ withJsonFiles }) => withJsonFiles`package.json`.getJson()?.name
    );

    const monorepoName = await monorepo.withJsonFiles`package.json`.getJson()
      ?.name;

    await websites(async ({ dir, commit }) => {
      await dir`src`.moveTo(monorepo.dir`packages/${dir.name}`);
      await commit`Move code to monorepo`;
    });

    await monorepo(async ({ exec }) => {
      await exec`pnpm install`;
      await exec`pnpm run build`;
      await exec`pnpm run test`;
    });

    await monorepo.commit`feat: Move to ${monorepoName} ${websiteNames.join(
      ', '
    )}`;
  });
});

describe('some-company migration', () => {
  // Inside one repo
  migrate(async ({ withRepositories }) => {
    const a = 1; //
    await withRepositories(
      `
			https://github.com/some/website
			https://github.com/some/other-website`,
      async ({
        branch,
        moveDirectory,
        withJsFiles,
        withRust,
        withJava,
        withJsonFiles,
        version,
        exec,
        push,
      }) => {
        await branch`next-migration`;
        await moveDirectory({ from: 'src/app', to: 'src/js/web-app' });
        // Codemod
        await withJsFiles(`**/*.jsx,src/app.js`)
          .astGrep(({ astGrep }) => astGrep`console.log($A)`)
          .jscodeShift(({ j, root }) => {})
          .nextjs13RouterToNavigation()
          .reactClassToFunctionComponent()
          .composeAnyCodemod()
          .react()
          .recipeRelatedToReact();
        // Like this
        await withJsFiles(`**/*.jsx,src/app.js`, ({ astGrep }) => {
          return astGrep`console.log($$$ALL)`
            .replaceWith`console.error($$$ALL)`;
        });
        // Or like this
        await withJsFiles`**/*.jsx,src/app.jsx`.astGrep`console.log($$$ALL)`
          .replaceWith`console.error($$$ALL)`;
        // Or like this
        const functionFromFileOne = await withJsFiles`file1.ts`
          .astGrep`$METHOD($$$ARGS){$$$BODY}`.remove();
        await withJsFiles`file2.ts`.insertAt(0, functionFromFileOne);
        // Or vump version
        await withJsonFiles`package.json`.update((json) => ({
          ...json,
          version: version`${a}`.bump('patch'),
        }));
        // Run checks
        await Promise.all([
          exec`pnpm test`,
          exec(`pnpm build`),
          exec`pnpm e2e`,
        ]);
        await push();
      }
    );
  });

  // Between repositories
  migrate(async ({ withRepository }) => {
    const dir1 = withRepository`https://github.com/some/website`
      .dir`apps/website`;
    dir1.moveTo(
      withRepository`https://github.com/some/other-website`
        .dir`apps/website-from-other-repo`
    );
  });

  // Merge all repositories into monorepo
  migrate(async ({ withRepository, mail }) => {
    const allApps = withRepository`
			https://github.com/some/website
			https://github.com/some/other-website`.dirs`apps/*`;
    allApps.moveTo(withRepository`https://github.com/some/monorepo`.dir`apps`);

    const repoOne = withRepository`one-repo`;
    const repoTwo = withRepository`secondrepo`;

    repoOne.branch`migration`;
    repoTwo.branch`migration`;

    const appFile = repoOne.jsFile`app.jsx`;
    const fn = appFile.astGrep`render($ARG){$$$BODY}`.remove();

    const secondAppFile = repoTwo.jsFile`app.jsx`;
    secondAppFile.astGrep(({ insert }) => {
      insert(fn);
    });

    repoOne.createPr();
    repoTwo.createPr();
    mail();
  });
});
