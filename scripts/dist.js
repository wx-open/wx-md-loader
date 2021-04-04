/* eslint-disable @typescript-eslint/no-var-requires */
const { src, dest } = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const merge2 = require('merge2');
const rimraf = require('gulp-rimraf');
const config = {
  loader: {
    output: './lib',
    exp: 'src/**/**.ts',
    assetExp: ['src/**/**.json', 'src/**/**.js'],
  },
};
const ignore = [
  './**/.git/**',
  './**/.svn/**',
  './**/node_modules/**',
  './**/.vscode/**',
  './**/.idea/**',
  './**/.bower_components/**',
  './**/__tests__/**',
  './**/__spec__/**',
];

function compile(options) {
  const tsProject = ts({
    module: 'commonjs',
    target: 'esnext',
    declaration: true,
    esModuleInterop: true,
    moduleResolution: 'node',
    resolveJsonModule: true,
  });
  const { output, exp, assetExp } = options;
  const tsResult = src(exp, {
    ignore,
  }).pipe(tsProject);
  let assetStream = null;
  if (assetExp) {
    assetStream = src(assetExp, { ignore }).pipe(dest(output));
  }
  return merge2(
    [tsResult.js.pipe(babel()).pipe(dest(output)), tsResult.dts.pipe(dest(output)), assetStream].filter(Boolean)
  );
}

function clean() {
  const distDir = config.loader.output;
  return src([distDir], { allowEmpty: true }).pipe(rimraf({ verbose: true }));
}

function compileLoader() {
  return compile(config.loader);
}

module.exports = {
  compileLoader,
  clean,
  config,
};
