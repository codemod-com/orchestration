const pluginBabel = require('@rollup/plugin-babel');

module.exports = {
  plugins: [pluginBabel.getBabelOutputPlugin({ plugins: ['./dist/babel-plugin'] })],
};
