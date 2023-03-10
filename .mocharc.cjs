// @ts-check
module.exports = {
  // require: ['ts-node/register', 'source-map-support/register'], // commonjs
  // require: ['source-map-support/register'], // doesn't work, idk
  loader: 'ts-node/esm', // esm, type: module, don't use NODE_OPTIONS="--loader ts-node/esm" alongside this prop - it double loads; takes longer
  extension: [['ts', 'tsx', 'cts', 'mts', 'js', 'jsx', 'cjs', 'mjs']],
  // spec: ['tests/'], // depends on extension
  spec: 'tests/**/*.test.{ts,tsx,cts,mts,js,jsx,cjs,mjs}',
  // watch: true, // does not work with esm, use nodemon instead
  watchFiles: ['src', 'tests'],
  watchIgnore: ['node_modules', '.git'],
  reporter: 'spec',
  recursive: true, // when looking for test files, recurse into subdirectories
  ui: 'tdd', // default is bdd
  diff: true,
  inlineDiffs: true,
  fullTrace: false,
  // parallel: true,
  package: './package.json', // default, for mocha prop in package.json if there is any
};
