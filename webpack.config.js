const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './pilotsWithinFir.js',
  mode: 'production',
  target: "web",
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  devtool: 'source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
