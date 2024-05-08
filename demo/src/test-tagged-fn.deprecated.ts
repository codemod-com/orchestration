import { TaggedTemplateExpression } from 'typescript';

// const allFns = { react19UseContext: () => allFns };
// const allFns = new Proxy(
//   {
//     react19UseContext: () => {
//       const thenable: Promise<string> & {
//         react19UseContext: () => typeof thenable;
//         react19SomeOtherCodemod: () => typeof thenable;
//       } = {
//         then(onfulfilled, onrejected) {
//           console.log({ onfulfilled, onrejected });
//           return Promise.resolve('asd');
//         },
//         catch(onrejected) {
//           console.log({ onrejected });
//           return Promise.reject('asd');
//         },
//         finally(onfinally) {
//           console.log({ onfinally });
//           return Promise.resolve('asd');
//         },
//         // then: (resolve, reject) => {
//         //   resolve('as');
//         //   reject('asd');

//         //   return 'asd';
//         // },
//         react19UseContext: () => thenable,
//         react19SomeOtherCodemod: () => thenable,
//       };
//       return thenable;
//     },
//     react19SomeOtherCodemod: () => {
//       const thenable: Promise<string> & {
//         react19UseContext: () => typeof thenable;
//         react19SomeOtherCodemod: () => typeof thenable;
//       } = {
//         then(onfulfilled, onrejected) {
//           console.log({ onfulfilled, onrejected });
//           return Promise.resolve('asd');
//         },
//         catch(onrejected) {
//           console.log({ onrejected });
//           return Promise.reject('asd');
//         },
//         finally(onfinally) {
//           console.log({ onfinally });
//           return Promise.resolve('asd');
//         },
//         // then: (resolve, reject) => {
//         //   resolve('as');
//         //   reject('asd');

//         //   return 'asd';
//         // },
//         react19UseContext: () => thenable,
//         react19SomeOtherCodemod: () => thenable,
//       };
//       return thenable;
//     },
//   },
//   {
//     get: (target, name) => {
//       console.log({ name });
//       return () => allFns;
//     },
//   }
// );

// const jsFiles = <
//   Elem extends string,
//   Template extends ReadonlyArray<Elem>,
//   Arg extends string,
//   Args extends Arg[]
// >(
//   template: Template,
//   ...args: [...Args]
// ) => {
//   return allFns;
// };

// jsFiles.react19UseContext = allFns.react19UseContext;
// jsFiles.react19SomeOtherCodemod = allFns.react19SomeOtherCodemod;

// async () => {
//   await jsFiles.react19UseContext(); // existing codemod
//   await jsFiles.react19SomeOtherCodemod(); // existing codemod
//   await jsFiles.react19UseContext(); // existing codemod
//   await jsFiles.react19SomeOtherCodemod(); // existing codemod
//   await jsFiles.react19UseStateToUseTransition(); // codemod from registry;

//   jsFiles |> console.log;
// };

const migrate = async () => {};
