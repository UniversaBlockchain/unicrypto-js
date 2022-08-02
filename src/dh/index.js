const dh = require('diffie-hellman');

const { encode64Short, decode64 } = require('../utils');

const shortify = (base64String) => base64String.replace(/=/g, '');

// 2
const DEFAULT_GENERATOR = decode64('Ag');

class DiffieHellman {
  constructor(prime, generator = DEFAULT_GENERATOR) {
    this.dh = dh.createDiffieHellman(prime, generator);

    this.generator = decode64(this.dh.getGenerator('base64'));
    this.prime = decode64(this.dh.getPrime('base64'));

    this.secret = null;
  }

  getPublicKey() {
    return decode64(this.dh.getPublicKey('base64'));
  }

  getPrivateKey() {
    return decode64(this.dh.getPrivateKey('base64'));
  }

  setPrivateKey(priv, encoding) {
    this.dh.setPrivateKey(priv, encoding);
  }

  setPublicKey(pub, encoding) {
    this.dh.setPublicKey(pub, encoding);
  }

  generateKeys() {
    this.dh.generateKeys();
  }

  computeSecret(publicKey) {
    this.secret = decode64(this.dh.computeSecret(publicKey, 'binary', 'base64'));

    return this.secret;
  }

  static generate(primeLength, generator) {
    const exchangeObject = dh.createDiffieHellman(primeLength, generator);

    return new DiffieHellman(
      exchangeObject.getPrime(),
      exchangeObject.getGenerator()
    );
  }
}

module.exports = {
  DiffieHellman
};

