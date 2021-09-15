const Module = require('./src/vendor/wasm/wrapper');

const hash = require('./src/hash');
const dh = require('./src/dh');
const pki = require('./src/pki');
const utils = require('./src/utils');
const cipher = require('./src/cipher');
const Boss = require('./src/boss/protocol');
const universa = require('./src/universa');
const CryptoWorker = require('./src/workers');

const exportObject = {
  get unicryptoReady() {
    Module.init();

    Object.defineProperty(this, "unicryptoReady", {
        value: Module.isReady,
        writable: false,
        configurable: false,
        enumerable: false
    });

    return Module.isReady;
  }
};

exportObject.Boss = Boss;
exportObject.CryptoWorker = CryptoWorker;

for (var key in universa) { exportObject[key] = universa[key]; }
for (var key in hash) { exportObject[key] = hash[key]; }
for (var key in pki.rsa) { exportObject[key] = pki.rsa[key]; }
for (var key in pki) { exportObject[key] = pki[key]; }
for (var key in utils) { exportObject[key] = utils[key]; }
for (var key in cipher) { exportObject[key] = cipher[key]; }
for (var key in dh) { exportObject[key] = dh[key]; }

exportObject.setup = function({ libraryPath }) {
  Module.libraryPath = libraryPath;

  CryptoWorker.setup({ libraryPath });
};

module.exports = exportObject;
