const { chmod } = require('node:fs/promises');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');

module.exports = [
  {
    input: 'cli.js',
    output: { file: 'duration', format: 'cjs', exports: 'named' },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      terser(),
      {
        writeBundle({ file }) {
          return chmod(file, '755'); // Make the file executable
        },
      },
    ],
  },
  {
    input: 'index.js',
    output: { file: 'index.min.js', format: 'umd', name: 'duration', exports: 'named' },
    plugins: [commonjs(), terser()],
  },
];
