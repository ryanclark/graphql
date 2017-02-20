const path = require('path');
const webpack = require('webpack');
const typescript = require('typescript');
const aotLoader = require('@ultimate/aot-loader');

const plugins = [];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      beautify: false,
      mangle: {
        screw_ie8: true
      },
      compress: {
        unused: true,
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        evaluate: true,
        drop_console: true,
        sequences: true,
        booleans: true,
        screw_ie8: true,
        warnings: false
      },
      comments: false
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: (module) => /node_modules/.test(module.resource)
    })
  );
} else {
  plugins.push(
    new webpack.NamedModulesPlugin(),
    new webpack.DllReferencePlugin({
      context: './',
      manifest: require(path.resolve(__dirname, 'vendor/vendor-manifest.json'))
    })
  );
}

module.exports = {
  cache: true,
  context: __dirname,
  devServer: {
    contentBase: __dirname,
    stats: {
      chunks: true,
      chunkModules: true,
      chunkOrigins: true,
      errors: true,
      errorDetails: true,
      hash: true,
      timings: true,
      modules: true,
      warnings: true
    },
    setup: function (app) {
      app.get('/build/vendor.js', function (req, res) {
        res.sendFile(path.join(__dirname, '/build/vendor.js'));
      });
      app.get('/build/vendor.map', function (req, res) {
        res.sendFile(path.join(__dirname, '/build/vendor.map'));
      });
    },
    publicPath: '/build/',
    port: 2000,
    proxy: {
      '*': 'http://localhost:3000'
    }
  },
  devtool: 'sourcemap',
  entry: {
    app: ['zone.js/dist/zone', './app/main.ts']
  },
  output: {
    filename: '[name].js',
    publicPath: '/build/',
    path: path.resolve(__dirname, 'build')
  },
  node: {
    console: false,
    global: true,
    process: true,
    Buffer: false,
    setImmediate: false
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loaders: ['raw-loader']
      },
      {
        test: /\.scss$/,
        loaders: ['raw-loader', 'sass-loader?sourceMap']
      },
      {
        test: /\.ts$/,
        loaders: ['@ultimate/aot-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../angular/dist/packages-dist')]
  },
  plugins: [
    new aotLoader.AotPlugin({
      tsConfig: './tsconfig.json'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ].concat(plugins)
};
