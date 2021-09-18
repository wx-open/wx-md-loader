import traverse from '@babel/traverse';
import generator from '@babel/generator';
import { types } from '@babel/core';
import babel = require('@babel/core');

export default function transformReact(source: string) {
  const d = babel.transformSync(source, {
    filename: 'demo.jsx',
    ast: true,
    babelrc: false,
    configFile: false,
    ...getBabelConfig(),
  });
  const errC = `
      const React = require('React');
      export default ()=>React.createElement('div',{className:'v-code-ast-error'},'React Component Error')
    `;
  if (!d) {
    return errC;
  }
  let r = false;
  const codeAst = d.ast;
  if (!codeAst) {
    return errC;
  }
  traverse(codeAst, {
    ImportDeclaration(path) {
      const impNode = path.node;
      const specifiers = impNode.specifiers;
      const source = impNode.source;
      if (source.value === 'react' && specifiers && specifiers.length) {
        r = specifiers.some((i) => i.type === 'ImportNamespaceSpecifier' || i.type === 'ImportDefaultSpecifier');
      }
    },
  });
  const astProgramBody = codeAst.program.body;
  if (!r) {
    astProgramBody.unshift(requireGenerator('React', 'react'));
  }
  return generator(codeAst, {}, 'module').code;
}

function requireGenerator(varName: string, moduleName: string) {
  return types.variableDeclaration('var', [
    types.variableDeclarator(
      types.identifier(varName),
      types.callExpression(types.identifier('require'), [types.stringLiteral(moduleName)])
    ),
  ]);
}

function getBabelConfig(modules = false) {
  const resolve = require.resolve;
  return {
    presets: [
      resolve('@babel/preset-react'),
      [
        resolve('@babel/preset-env'),
        {
          modules,
          targets: {
            browsers: ['last 2 versions', 'Firefox ESR', '> 1%'],
          },
        },
      ],
      [
        resolve('@babel/preset-typescript'),
        {
          allowDeclareFields: false,
        },
      ],
    ],
    plugins: [
      // [require.resolve('@babel/plugin-transform-typescript'), {
      //   allowDeclareFields: false,
      //   isJSX: true,
      // }],
      [
        resolve('@babel/plugin-proposal-decorators'),
        {
          legacy: true,
        },
      ],
      [
        resolve('@babel/plugin-proposal-class-properties'),
        {
          loose: true,
        },
      ],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { 'loose': true }],
      [resolve('@babel/plugin-syntax-dynamic-import')],
      [resolve('@babel/plugin-transform-regenerator')],
    ],
  };
}
