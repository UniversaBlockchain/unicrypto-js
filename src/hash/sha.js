var Module = Module || require('../vendor/wasm/wrapper');
const { bytesToHex } = require('../utils/bytes');

const StringTypes = {
  "sha1": 0,
  "sha256": 1,
  "sha512": 2,
  "sha3_256": 3,
  "sha3_384": 4,
  "sha3_512": 5
};

class SHA {
  constructor(hashType) {
    this.hashType = hashType + '';
    // console.log(this.hashType);
    const wasmTpe = SHA.wasmType(this.hashType);
    const tpe = typeof wasmTpe === 'number' ? wasmTpe : this.hashType;
    this.wasmType = tpe;
    this.empty = true;
    this.hash = null;
  }

  getInstance() {
    return new Module.DigestImpl(this.wasmType);
  }

  delete() {
    this.hash.delete();
  }

  async update(data) {
    await this.init();
    this.empty = false;
    return this.hash.update(data);
  }

  updateSync(data) {
    this.initSync();
    this.empty = false;
    return this.hash.update(data);
  }

  async put(data) {
    return this.update(data);
  }

  putSync(data) {
    this.updateSync(data);
  }

  async doFinal() {
    await this.init();
    this.hash.doFinal();
  }

  doFinalSync() {
    this.initSync();
    this.hash.doFinal();
  }

  getDigestSize() {
    const instance = this.getInstance();
    const size = instance.getDigestSize();
    instance.delete();

    return size;
  }

  async getDigest(encoding) {
    await this.init();
    const hash = this.hash;

    const digest = await new Promise((resolve, reject) => {
      hash.getDigest(res => {
        const bytes = new Uint8Array(res);
        if (encoding === 'hex') resolve(bytesToHex(bytes));
        else resolve(bytes);
      });
    });

    this.delete();

    return digest;
  }

  getDigestSync(encoding) {
    this.initSync();
    const hash = this.hash;
    let digest;

    hash.getDigest(res => {
      const bytes = new Uint8Array(res);
      if (encoding === 'hex') digest = bytesToHex(bytes);
      else digest = bytes;
    });

    this.delete();

    return digest;
  }

  async get(data, encoding) {
    if ((typeof data !== 'string' && data) || this.empty)
      await this.update(data);
    else encoding = data;

    await this.doFinal();

    return this.getDigest(encoding);
  }

  getSync(data, encoding) {
    if ((typeof data !== 'string' && data) || this.empty)
      this.updateSync(data);
    else encoding = data;

    this.doFinalSync();

    return this.getDigestSync(encoding);
  }

  static async hashId(data) {
    await Module.isReady;

    return new Promise(resolve => {
      Module.calcHashId(data, res => resolve(new Uint8Array(res)));
    });
  }

  static wasmType(stringType) {
    if (typeof stringType !== 'string') return false;

    const lower = stringType.toLowerCase();
    let tpe = SHA.StringTypes[lower];
    if (typeof tpe !== 'number') tpe = SHA.StringTypes[`sha${lower}`];
    if (typeof tpe !== 'number') return false;

    return tpe;
  }

  async init(wasmType) {
    if (this.hash) return;

    await Module.isReady;

    if (!this.hash) this.hash = new Module.DigestImpl(this.wasmType);
  }

  initSync(wasmType) {
    if (this.hash) return;
    this.hash = new Module.DigestImpl(this.wasmType);
  }

  static async getDigest(hashType, data) {
    const sha = new SHA(hashType);

    return sha.get(data);
  }

  static getDigestSync(hashType, data) {
    if (!Module.isInitialized) throw new Error('unicrypto is not ready');
    const sha = new SHA(hashType);

    return sha.getSync(data);
  }
}

SHA.StringTypes = StringTypes;

module.exports = SHA;
