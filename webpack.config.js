const path = require('path');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'index.js'
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new HardSourceWebpackPlugin()
  ]
};



// const path = require('path');
// var webpack = require('webpack');

// var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

// module.exports = {
//   entry: './src/index.js',
//   output: {
//     path: path.resolve(__dirname, './out/'),
//     filename: 'index.js'
//   },
//   optimization: {
//     minimize: false
//   },
//   module: {
//     loaders: [
//         {
//             test: /\.js$/,
//             loader: 'babel-loader',
//             query: {
//                 presets: ['es2015']
//             }
//         }
//     ]
//   },
//   devtool: 'source-map',
//   plugins: [
//     new HardSourceWebpackPlugin()
//   ]
// };
