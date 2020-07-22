const fs = require('fs');
const path = require('path');
const VERSION = process.env.npm_package_version;

module.exports = new Promise((resolve, reject) => {
  const quote = /'/g;
  const newline = /\n/g;
  const comment = /\/\/.+\n/g;
  const wasmPath = path.resolve(__dirname, "..", "src/vendor/wasm/crypto.js");

  let data = fs.readFileSync(wasmPath);
  data = data.toString();
  data = data.replace('crypto.wasm', `crypto.v${VERSION}.wasm`)

  // data += 'Module.isReady = new Promise(resolve => { Module.onRuntimeInitialized = resolve; });';

  fs.writeFile(`dist/crypto.v${VERSION}.js`, data, () => resolve());
  const fromPath = path.resolve(__dirname, "..", "src/vendor/wasm/crypto.wasm");
  fs.copyFileSync(fromPath, `dist/crypto.v${VERSION}.wasm`);
});
