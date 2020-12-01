const utils = require('../utils');
const Boss = require('../boss/protocol');

const { encode58, decode58, crc32 } = utils;

class KeyAddress {
  constructor(bytes) {
    if (typeof bytes === 'string') this.bytes = decode58(bytes);
    else this.bytes = bytes;

    if (!this.isValid) throw new Error('key address is invalid');
  }

  get asBinary() { return this.bytes; }
  get asString() { return encode58(this.bytes); }

  // DEPRECATED
  get base58() { return encode58(this.bytes); }

  get isValid() {
    const bytes = this.bytes;
    const bytesLength = bytes.length;

    if ([37, 53].indexOf(bytesLength) === -1) return false;
    if ([16, 32].indexOf(bytes[0]) === -1) return false;

    let shaLength = 48;
    if (bytesLength == 37) shaLength = 32;

    const hashed = bytes.slice(0, 1 + shaLength);
    let checksum = crc32(hashed);

    if (checksum.length < 4) {
      const buf = new Uint8Array(new ArrayBuffer(4));
      buf.set(checksum, 4 - checksum.length);
      checksum = buf;
    }

    const decodedPart = bytes.slice(bytesLength - 4, bytesLength);
    const checksumLast4 = checksum.slice(checksum.length - 4, checksum.length);

    return encode58(checksumLast4) === encode58(new Uint8Array(decodedPart));
  }

  static checkAddress(src) {
    try {
      const addr = new KeyAddress(src);

      return true;
    } catch (err) {
      return false;
    }
  }

  get isLong() { return this.bytes.length === 53; }

  static deserializeFromBOSS(serialized) {
    return new KeyAddress(serialized.uaddress);
  }

  serializeToBOSS() { return { uaddress: this.bytes }; }
}

KeyAddress.className = "KeyAddress";

Boss.register("KeyAddress", KeyAddress);

module.exports = KeyAddress;


