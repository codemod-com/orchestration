import { useState } from 'react';

class A {
  fn() {
    useState(1);
  }
}

const withJsFiles = new A();

export const codemod = () => {
  withJsFiles.react19UseStateToUseTransition();
  withJsFiles.react19UseStateToUseTransition();
  withJsFiles.react19UseStateToUseTransition();
  withJsFiles.react19UseStateToUseTransition();
  withJsFiles.react19UseStateToUseTransition();
  withJsFiles.react19UseStateToUseTransition();
};
