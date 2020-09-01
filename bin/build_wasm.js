const fs = require('fs');
const path = require('path');
const VERSION = process.env.npm_package_version;

module.exports = new Promise((resolve, reject) => {
  const modulePath = path.resolve(__dirname, "..", "src/vendor/wasm/crypto.wasm");
  const wrapperPath = path.resolve(__dirname, "..", "src/vendor/wasm/wrapper.js");
  let wrapper = fs.readFileSync(wrapperPath, 'utf-8');
  wrapper = wrapper.replace('crypto.wasm', `crypto.v${VERSION}.wasm`);

  fs.writeFileSync(`dist/crypto.v${VERSION}.js`, wrapper);
  fs.writeFileSync(wrapperPath, wrapper);

  fs.copyFileSync(modulePath, path.resolve(__dirname, "..", `src/vendor/wasm/crypto.v${VERSION}.wasm`));
  fs.copyFileSync(modulePath, path.resolve(__dirname, "..", `dist/crypto.v${VERSION}.wasm`));
});
