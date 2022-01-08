const fs = require('fs');
const path = require('path');

const { version } = require('../package.json');
const wrapperPath = __dirname + '/../src/vendor/wasm/wrapper_patched.js';
var wrapperData = fs.readFileSync(wrapperPath);

wrapperData = wrapperData.toString().replace('crypto.wasm',  `crypto.v${version}.wasm`).replace('%version%', version);
fs.writeFileSync(__dirname + '/../src/vendor/wasm/wrapper.js', wrapperData);

const modulePath = path.resolve(__dirname, "..", "src/vendor/wasm/crypto.wasm");
fs.copyFileSync(modulePath, path.resolve(__dirname, "..", `src/vendor/wasm/crypto.v${version}.wasm`));

const webpack = require('webpack');
const cryptoConfig = require('../webpack.unicrypto');

function build(config) {
  return new Promise((resolve, reject) => {
    webpack(config, err => err ? reject(err) : resolve());
  });
}

build(cryptoConfig).then((done) => {
  fs.copyFileSync(__dirname + `/../dist/crypto.v${version}.js`, __dirname + `/../test/worker/crypto.v${version}.js`);
  fs.copyFileSync(__dirname + '/../src/vendor/wasm/crypto.wasm', __dirname + `/../test/worker/crypto.v${version}.wasm`);
  fs.copyFileSync(__dirname + '/../src/vendor/wasm/crypto.wasm', __dirname + `/../dist/crypto.v${version}.wasm`);


  console.log("Done without errors.", done);
}, (er) => console.log("got err", er));
