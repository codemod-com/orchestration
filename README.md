# Demo of migration engine

### Prerequisites
- [pnpm](https://pnpm.io/)
- [Node.js](https://nodejs.org/en/)
- [codemod](https://docs.codemod.com/deploying-codemods/cli#installation)

### Installation
```bash
pnpm i
```

### Run
```bash
pnpm demo
```
After you run, you can edit file `demo/src/migration.ts` - on every change migration will be rerunning. So far there is no memoization, so it will rerun from scratch every time.
