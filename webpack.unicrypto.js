const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: ['./index.js'],
    output: {
      globalObject: 'this',
      filename: 'unicrypto.min.js',
      path: __dirname + '/dist',
      library: 'Unicrypto',
      libraryTarget: 'umd'
    },
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: { mangle: { reserved: ["window"]}} })],
    },
    externals: [
      function(context, request, callback) {
        if (/\/wasm\/wrapper/.test(request)){
          return callback(null, 'root ' + 'Module');
        }
        callback();
      }
    ]

  }
];
