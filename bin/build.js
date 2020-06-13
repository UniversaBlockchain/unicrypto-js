const fs = require('fs');
const webpack = require('webpack');
const cryptoConfig = require('../webpack.unicrypto');
const buildWASM = require('./build_wasm');

function build(config) {
  return new Promise((resolve, reject) => {
    webpack(config, err => err ? reject(err) : resolve());
  });
}

build(cryptoConfig)
  .then(buildWASM)
  .then(
    () => console.log("Done without errors."),
    (err) => console.log(`Done with errors: ${err}`)
  );

