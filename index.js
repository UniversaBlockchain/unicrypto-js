var Module = Module || require('./src/vendor/wasm/wrapper');

const hash = require('./src/hash');
const dh = require('./src/dh');
const pki = require('./src/pki');
const utils = require('./src/utils');
const cipher = require('./src/cipher');
const Boss = require('./src/boss/protocol');
const universa = require('./src/universa');
const WorkerFactory = require('./src/workers');

exports.unicryptoReady = Module.isReady;
exports.Boss = Boss;

for (var key in universa) { exports[key] = universa[key]; }
for (var key in hash) { exports[key] = hash[key]; }
for (var key in pki.rsa) { exports[key] = pki.rsa[key]; }
for (var key in pki) { exports[key] = pki[key]; }
for (var key in utils) { exports[key] = utils[key]; }
for (var key in cipher) { exports[key] = cipher[key]; }
for (var key in dh) { exports[key] = dh[key]; }
