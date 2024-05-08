import { PluginObj } from '@babel/core';
import {
  identifier,
  variableDeclaration,
  variableDeclarator,
  VariableDeclaration,
  callExpression,
  awaitExpression,
} from '@babel/types';

export default (): PluginObj => {
  return {
    name: 'example',
    visitor: {
      VariableDeclaration(nodePath) {
        const { node } = nodePath;
        const nodes = node.declarations
          .map((declaration) => {
            if (
              !declaration.init ||
              (declaration.id.type === 'Identifier' &&
                declaration.id.name.includes('constant'))
            ) {
              return undefined;
            }

            return variableDeclaration(node.kind, [
              variableDeclarator(
                identifier(
                  `constant${
                    declaration.id.type === 'Identifier'
                      ? declaration.id.name.toLocaleUpperCase()
                      : ''
                  }`
                ),
                awaitExpression(
                  callExpression(identifier('cm.DefineConstant'), [
                    declaration.init,
                  ])
                )
              ),
            ]);
          })
          .filter((node) => node !== undefined) as VariableDeclaration[];

        if (nodes.length) {
          nodePath.insertBefore(nodes);
        }
      },
    },
  };
};
