const dh = require('diffie-hellman');

const { encode64Short, decode64 } = require('../utils');

const shortify = (base64String) => base64String.replace(/=/g, '');


class DiffieHellman {
  constructor(prime, generator = 'Ag') {
    this.dh = dh.createDiffieHellman(prime, 'base64', generator, 'base64');

    this.generator = this.dh.getGenerator('base64');
    this.prime = this.dh.getPrime('base64');
    this.publicKey = null;
    this.secret = null;
  }

  generateKeys() {
    this.publicKey = this.dh.generateKeys('base64');

    return this.publicKey;
  }

  computeSecret(publicKey) {
    this.secret = this.dh.computeSecret(publicKey, 'base64', 'base64');

    return this.secret;
  }

  static generate(primeLength, generator = 2) {
    const exchangeObject = dh.createDiffieHellman(primeLength, generator);

    return new DiffieHellman(
      exchangeObject.getPrime('base64'),
      exchangeObject.getGenerator('base64')
    );
  }
}

module.exports = {
  DiffieHellman
};

