const utils = require('../utils');

const { encode58 } = utils;

module.exports = class KeyAddress {
  constructor(bytes) {
    this.bytes = bytes;
  }

  get base58() { return encode58(this.bytes); }

  isLong() { return this.bytes.length === 53; }
}
