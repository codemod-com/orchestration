/* eslint-disable @typescript-eslint/ban-types */
import ts = require('typescript');

// src/index.ts
function init({
  typescript: ts,
}: {
  typescript: typeof import('typescript/lib/tsserverlibrary');
}) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => {
        info.project.projectService.logger.info(k);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return x.apply(info.languageService, args);
      };
    }
    info.project.projectService.logger.info('Hello from remove use state!');

    // proxy.getCompletionsAtPosition = (fileName, position, options) => {};

    // proxy.getDefinitionAndBoundSpan = (fileName, position) => {
    //   const prior = info.languageService.getDefinitionAndBoundSpan(
    //     fileName,
    //     position
    //   );
    //   if (!prior) {
    //     return;
    //   }
    //   prior.definitions = prior.definitions?.filter(
    //     (def) => def.name !== 'useState'
    //   );

    //   return prior;
    // };

    // proxy.getCompletionsAtPosition = (fileName, position, options) => {
    //   const prior = info.languageService.getCompletionsAtPosition(
    //     fileName,
    //     position,
    //     options
    //   );
    //   if (!prior) {
    //     return;
    //   }
    //   const entry: ts.CompletionEntry = {
    //     name: 'React 19 useState to useTransition conversion',
    //     kind: ts.ScriptElementKind.memberFunctionElement,
    //     kindModifiers: '(method) A.asd(): void',
    //     filterText: 'React 19 useState to useTransition conversion ',
    //     isSnippet: true,
    //     hasAction: true,
    //     sortText: '22',
    //     insertText: 'react19UseStateToUseTransition',
    //     source: 'source',
    //     sourceDisplay: [
    //       { text: 'sourceDisplay1', kind: 'sourceDisplay1' },
    //       { text: 'sourceDisplay2', kind: 'sourceDisplay2' },
    //     ],
    //     labelDetails: {
    //       description:
    //         'Converts \nReact 19 useState to useTransition\n Example: \n```tsx\nconst [count, setCount] = useState(0);\n```',
    //       detail:
    //         'Converts \nReact 19 useState to useTransition\n Example: \n```tsx\nconst [count, setCount] = useState(0);\n```',
    //     },
    //   };
    //   prior.entries = [...prior.entries, entry];

    //   return prior;
    // };

    // proxy.getQuickInfoAtPosition = (fileName, position) => {
    //   const prior = info.languageService.getQuickInfoAtPosition(
    //     fileName,
    //     position
    //   );
    //   if (!prior) {
    //     return;
    //   }
    //   if (prior.displayParts) {
    //     prior.displayParts = [
    //       ...prior.displayParts.filter((part) => part.text !== 'useState'),
    //       {
    //         text: '(method) A.fn(): void',
    //         kind: ts.ScriptElementKind.functionElement,
    //       },
    //     ];
    //   } else {
    //     prior.displayParts = [
    //       {
    //         text: '(method) A.fn(): void',
    //         kind: ts.ScriptElementKind.functionElement,
    //       },
    //     ];
    //   }
    //   prior.documentation = [
    //     {
    //       text: '123123',
    //       kind: '123123',
    //     },
    //   ];
    //   prior.kind = ts.ScriptElementKind.alias;
    //   prior.tags = [
    //     { name: '123123', text: [{ text: '99999', kind: '99999' }] },
    //   ];
    //   return prior;
    // };

    // proxy.getSemanticDiagnostics = (fileName) => {
    //   const prior = info.languageService.getSemanticDiagnostics(fileName);

    //   return prior.filter((diag) => {
    //     if (diag.messageText) {
    //       return (
    //         diag.messageText.toString().indexOf('asd') === -1 &&
    //         diag.messageText
    //           .toString()
    //           .indexOf('react19UseStateToUseTransition') === -1
    //       );
    //     }
    //     return true;
    //   });
    // };

    return proxy;
  }
  return { create };
}

export = init;
