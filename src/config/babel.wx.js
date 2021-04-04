function getBabelConfig(modules) {
  const resolve = require.resolve;
  return {
    presets: [
      [
        resolve('@babel/preset-env'),
        {
          modules,
          targets: {
            browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'],
          },
        },
      ],
      [
        resolve('@babel/preset-typescript'),
        {
          allowDeclareFields: false,
        },
      ],
      resolve('@babel/preset-react'),
    ],
    plugins: [
      [require.resolve('@babel/plugin-transform-typescript'), { allowDeclareFields: false }],
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
      [resolve('@babel/plugin-syntax-dynamic-import')],
      [resolve('@babel/plugin-transform-regenerator')],
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
          camel2DashComponentName: true,
        },
        'antd-import',
      ],
      // [
      //   resolve('@babel/plugin-transform-runtime'),
      //   {
      //     absoluteRuntime: false,
      //     corejs: false,
      //     helpers: true,
      //     regenerator: true,
      //   },
      // ],
    ],
  };
}

module.exports = getBabelConfig();
