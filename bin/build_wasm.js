const fs = require('fs');
const path = require('path');
const VERSION = process.env.npm_package_version;

module.exports = new Promise((resolve, reject) => {
  console.log("WASM build started...");
  const modulePath = path.resolve(__dirname, "..", "src/vendor/wasm/crypto.wasm");
  const wrapperPath = path.resolve(__dirname, "..", "src/vendor/wasm/wrapper.js");
  const workerPath = path.resolve(__dirname, "..", "src/workers/worker.js");
  let wrapper = fs.readFileSync(wrapperPath, 'utf-8');
  wrapper = wrapper.replace('crypto.wasm', `crypto.v${VERSION}.wasm`);

  let worker = fs.readFileSync(workerPath, 'utf-8');
  worker = worker.replace('crypto.wasm', `crypto.v${VERSION}.wasm`);

  fs.writeFileSync(`dist/crypto.v${VERSION}.js`, wrapper);
  fs.writeFileSync(wrapperPath, wrapper);
  fs.writeFileSync(workerPath, worker);

  fs.copyFileSync(modulePath, path.resolve(__dirname, "..", `src/vendor/wasm/crypto.v${VERSION}.wasm`));
  fs.copyFileSync(modulePath, path.resolve(__dirname, "..", `dist/crypto.v${VERSION}.wasm`));

  console.log("WASM build done.");

  resolve();
});
