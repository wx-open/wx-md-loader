// eslint-disable-next-line @typescript-eslint/no-var-requires
const { watch, parallel, series } = require('gulp');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { clean, config, compileLoader } = require('./scripts/dist');
exports.clean = clean;
exports.default = series(clean, compileLoader);

function watchLoader() {
  return watch(config.loader.exp, { events: ['change'] }, series(compileLoader));
}
const watchLd = parallel(compileLoader, watchLoader);
exports.watchLd = watchLd;
