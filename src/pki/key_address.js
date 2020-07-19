const utils = require('../utils');
const Boss = require('../boss/protocol');

const { encode58 } = utils;

class KeyAddress {
  constructor(bytes) {
    this.bytes = bytes;
  }

  get base58() { return encode58(this.bytes); }

  isLong() { return this.bytes.length === 53; }

  static deserializeFromBOSS(serialized) {
    return new KeyAddress(serialized.uaddress);
  }

  serializeToBOSS() { return { uaddress: this.bytes }; }
}

KeyAddress.className = "KeyAddress";

Boss.register("KeyAddress", KeyAddress);

module.exports = KeyAddress;


