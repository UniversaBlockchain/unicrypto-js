const dh = require('diffie-hellman');

const { encode64Short, decode64 } = require('../utils');

const shortify = (base64String) => base64String.replace(/=/g, '');


class DiffieHellman {
  constructor(prime, generator = 'Ag') {
    this.dh = dh.createDiffieHellman(prime, 'base64', generator, 'base64');

    this.generator = this.dh.getGenerator('base64');
    this.prime = this.dh.getPrime('base64');
    this.secret = null;
  }

  getPublicKey() {
    return this.dh.getPublicKey('base64');
  }

  getPrivateKey() {
    return this.dh.getPrivateKey('base64');
  }

  setPrivateKey(priv, encoding = 'base64') {
    this.dh.setPrivateKey(priv, encoding);
  }

  setPublicKey(pub, encoding = 'base64') {
    this.dh.setPublicKey(pub, encoding);
  }

  generateKeys(encoding = 'base64') {
    this.dh.generateKeys(encoding);
  }

  computeSecret(publicKey) {
    this.secret = this.dh.computeSecret(publicKey, 'base64', 'base64');

    return this.secret;
  }

  static generate(primeLength) {
    const exchangeObject = dh.createDiffieHellman(primeLength);

    return new DiffieHellman(
      exchangeObject.getPrime('base64'),
      exchangeObject.getGenerator('base64')
    );
  }
}

module.exports = {
  DiffieHellman
};

