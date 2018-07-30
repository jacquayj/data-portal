const path = require('path');
const basename = process.env.BASENAME || '/';
const webpack = require('webpack');

const plugins = [
  new webpack.EnvironmentPlugin(['STORYBOOK_PROJECT_ID']),
  new webpack.EnvironmentPlugin(['STORYBOOK_ARRANGER_API']),
];

module.exports = {
  entry: ['babel-polyfill', '../src/index.jsx'],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: basename
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: [
          'babel-loader',
        ],
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.less$/,
        loaders: [
          'style-loader',
          'css-loader',
          'less-loader',
        ]
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.svg$/,
        loaders: ['babel-loader', 'react-svg-loader'],
      },
      {
        test: /\.(png|jpg|eot|ttf|woff)$/,
        loader: 'url-loader',
      },
      { test: /\.flow$/, loader: 'ignore-loader' },
    ]
  },
  plugins,
  resolve: {
    alias: {
      graphql:  path.resolve('./node_modules/graphql'),
      react:    path.resolve('./node_modules/react')                // Same issue.
    },
    extensions: [ '.js', '.jsx', '.json' ]
  }
};
