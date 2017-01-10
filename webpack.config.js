"use strict";

const webpack = require('webpack');

// http://stackoverflow.com/a/38733864/1748595
function isExternal(module) {
  const userRequest = module.userRequest;

  if (typeof userRequest !== 'string') {
    return false;
  }

  return userRequest.indexOf('bower_components') >= 0 ||
         userRequest.indexOf('node_modules') >= 0;
}

let plugins = [
  new webpack.ProvidePlugin({
    jQuery: 'jquery',
    $: 'jquery',
    jquery: 'jquery'
  }),

  // Chunk out the common behaviour
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: function(module, count) {
      return isExternal(module) && count >= 2;
    },
  })
];

if (process.env['NODE_ENV'] === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    output: {
      comments: false,
    }
  }));
}

module.exports = {
  entry: {
    main: './templates/main.ts',
    index: './src/index.ts',

    labs: './templates/labs/labs.ts',
    lectures: './templates/lectures/lectures.ts'
  },
  output: {
    filename: '[name].bundle.min.js'
  },
  cache: true,
  // Turn on sourcemaps
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },

  plugins: plugins,

  module: {
    loaders: [
      { test: require.resolve("reveal.js"), loader: "expose-loader?Reveal" },
      { test: require.resolve('bootstrap'), loader: "imports?jQuery=jquery" },
      { test: /\.ts$/, loader: 'ts-loader' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          "presets": ["es2016", "es2015"]
        }
      },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
};
