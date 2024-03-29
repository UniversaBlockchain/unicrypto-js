var Module = Module || require('../vendor/wasm/wrapper');
const SHA = require('./sha');

class HMAC {
  /**
   * Returns instance of HMAC message digest function
   *
   * @param {Hash} hash - hash instance, for example SHA256
   * @param {String} key - key to use with HMAC
   */
  constructor(hashStringType, key) {
    this.hashType = SHA.wasmType(hashStringType);
    this.key = key;
  }

  async get(data) {
    const self = this;

    await Module.init();

    return new Promise((resolve, reject) => {
      Module.calcHmac(self.hashType, self.key, data, res => {
        resolve(new Uint8Array(res));
      });
    });
  }

  getSync(data) {
    const self = this;

    let digest;

    Module.calcHmac(self.hashType, self.key, data, res => {
      digest = new Uint8Array(res);
    });

    return digest;
  }
}

module.exports = HMAC;
