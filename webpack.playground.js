const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const config = [{
  entry: path.resolve(__dirname, 'playground', 'index.ts'),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index-bundle.js',
  },
  devtool: 'source-map',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {}
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader'
        }]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'playground', 'index.html'),
    }),
    new webpack.DefinePlugin({
      __DEBUG__: true,
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 9000
  }
}];

module.exports = config;
