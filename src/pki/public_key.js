var Module = Module || require('../vendor/wasm/wrapper');

const helpers = require('./helpers');
const utils = require('../utils');
const Boss = require('../boss/protocol');
const SHA = require('../hash/sha');
const { Buffer } = require('buffer');
const AbstractKey = require('./abstract_key');
const KeyAddress = require('./key_address');
const WorkerFactory = require('../workers');

const FINGERPRINT_SHA512 = '07';

const {
  BigInteger,
  bigIntToByteArray,
  byteArrayToBigInt,

  decode58,
  encode58,
  encode64,

  hexToBytes,
  byteStringToArray,
  arrayToByteString,
  crc32,
  isNode
} = utils;

const { wrapOptions, getMaxSalt, normalizeOptions, mapCall } = helpers;

const transit = {
  KEY: {
    unpack: fromKey
  },

  BOSS: {
    pack: toBOSS,
    unpack: fromBOSS
  },

  EXPONENTS: {
    pack: toExponents,
    unpack: fromExponents
  }
};

module.exports = class PublicKey extends AbstractKey {
  constructor(load, unload, raw) {
    super();

    this.load = load;
    this.unload = unload;
    this.raw = raw;
  }

  async verify(data, signature, options) {
    const self = this;
    const hashType = SHA.wasmType(options.pssHash || 'sha1');
    const mgf1Type = SHA.wasmType(options.mgf1Hash || 'sha1');
    let saltLength = -1;
    if (typeof options.saltLength === 'number') saltLength = options.saltLength;
    if (options.salt) saltLength = options.salt.length;

    if (!isNode()) {
      const raw = this.raw;

      return WorkerFactory.runTask('publicKey.verify', {
        raw,
        options: { saltLength, hashType, mgf1Type, data, salt: options.salt, signature }
      });
    } else {
      const key = await this.load();

      return new Promise(resolve => {
        const cb = (result) => {
          self.unload(key);
          resolve(result);
        }

        key.verify(data, signature, hashType, mgf1Type, saltLength, cb);
      });
    }
  }

  async verifyExtended(signature, data) {
    const dataHash = new SHA('512');
    const unpacked = Boss.load(signature);
    const { exts, sign } = unpacked;
    const verified = await this.verify(exts, sign, {
      pssHash: 'sha512'
    });

    if (!verified) return null;

    const targetSignature = Boss.load(exts);
    const { sha512, key, created_at } = targetSignature;

    if (encode64(await dataHash.get(data)) === encode64(sha512))
      return { key, created_at };

    return null;
  }

  async encrypt(data, options = {}) {
    const { oaepHash, seed } = options;
    const self = this;
    const hashType = SHA.wasmType(oaepHash || 'sha1');

    if (!isNode()) {
      const raw = this.raw;

      return WorkerFactory.runTask('publicKey.encrypt', {
        raw,
        options: { hashType, data, seed }
      });
    } else {
      const key = await this.load();

      return new Promise(resolve => {
        const cb = res => {
          self.unload(key);
          resolve(new Uint8Array(res));
        }

        if (seed) key.encryptWithSeed(data, hashType, seed, cb);
        else key.encrypt(data, hashType, cb);
      });
    }
  }

  get fingerprint() {
    return this._fingerprint;
  }

  get packed() {
    return this._packed;
  }

  async pack() {
    return this._packed;
  }

  static async packBOSS(key) {
    return new Promise(resolve => {
      key.pack(packed => resolve(new Uint8Array(packed)));
    });
  }

  encryptionMaxLength(options) {
    const mdHashType = options.pssHash || options.oaepHash || 'sha1';
    const md = new SHA(mdHashType);
    const keyLength = this.getBitStrength() / 8;
    const maxLength = keyLength - 2 * (md.getDigestSize()) - 2;

    return maxLength;
  }

  getN() { return this.n; }
  getE() { return this.e; }
  getBitStrength() { return this.bitStrength; }

  async loadProperties(key, packed) {
    const self = this;

    this.n = key.get_n();
    this.e = key.get_e();
    this.bitStrength = key.getBitStrength();
    key.fingerprint(fp => self._fingerprint = new Uint8Array(fp));

    if (this.bitStrength > 1024) {
      this.shortAddress58 = key.getShortAddress58();
      this.longAddress58 = key.getLongAddress58();
      this.shortAddress = new KeyAddress(this.shortAddress58);
      this.longAddress = new KeyAddress(this.longAddress58);
    }

    if (packed) this._packed = packed;
    else this._packed = await PublicKey.packBOSS(key);
  }

  static async unpack(options) {
    let key;

    if (options.n && options.e) key = await PublicKey.unpackExponents(options);
    else key = await PublicKey.unpackBOSS(options);

    const load = () => PublicKey.unpackBOSS(options);
    const unload = (key) => key.delete();

    const instance = new PublicKey(load, unload, packed);
    await instance.loadProperties(key, options);

    unload(key);

    return instance;
    // return new PublicKey(await PublicKey.unpackBOSS(options));
  }

  static async unpackBOSS(options) {
    const self = this;

    await Module.isReady;

    return new Promise(resolve => {
      Module.PublicKeyImpl.initFromPackedBinary(options, resolve);
    });
  }

  static async unpackExponents(options) {
    await Module.isReady;

    const { e, n } = options;

    return new Promise(resolve => {
      Module.PublicKeyImpl.initFromHexExponents(e, n, (key) => {
        resolve(key);
      });
    });
  }

  static async fromPrivate(priv) {
    const key = new Module.PublicKeyImpl(priv);
    const packed = await PublicKey.packBOSS(key);

    const load = () => PublicKey.unpackBOSS(packed);
    const unload = (key) => key.delete();

    const instance = new PublicKey(load, unload, packed);
    await instance.loadProperties(key, packed);

    unload(key);

    return instance;
  }

  static get DEFAULT_MGF1_HASH() { return 'sha1'; }
  static get DEFAULT_OAEP_HASH() { return 'sha1'; }

  static isValidAddress(address) {
    var decoded;

    if (address instanceof KeyAddress) return address.isValid;

    try {
      decoded = decode58(address);
    } catch (err) { decoded = address; }

    const addr = new KeyAddress(decoded);

    return addr.isValid;
  }
}

function toBOSS(key) {
  const { n, e } = key;

  return Boss.dump([
    1,
    bigIntToByteArray(e),
    bigIntToByteArray(n)
  ]);
}

function fromBOSS(dump) {
  const parts = Boss.load(dump);

  if (parts[0] !== 1) throw new Error('Failed to read key');

  return fromExponents({
    e: byteArrayToBigInt(parts[1]),
    n: byteArrayToBigInt(parts[2])
  });
}

function fromKey(privateKey) {
  return new Module.PublicKeyImpl(privateKey);
}

/**
 * Restores public key from exponents n, e
 *
 * @param {Object} exps - dict of exponents passed to public key.
 *                        Exponents must be in BigInteger format
 */
function fromExponents(exps) {
  const { n, e } = exps;

  return rsa.setPublicKey(n, e);
}

function toExponents(key) {
  return key.params;
}
