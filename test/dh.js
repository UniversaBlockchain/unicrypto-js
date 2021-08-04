var Minicrypto = Minicrypto || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

describe('Diffie-Hellman', function() {
  it('should create keys and same secrets', async () => {
    const { DiffieHellman } = Minicrypto;

    const alice = DiffieHellman.generate(128);
    const alicePrime = alice.prime;
    const aliceGenerator = alice.generator;
    const alicePublic = alice.generateKeys();

    const bob = new DiffieHellman(alicePrime, aliceGenerator);
    const bobPublic = bob.generateKeys();

    const bobSecret = bob.computeSecret(alicePublic);

    const aliceSecret = alice.computeSecret(bobPublic);

    expect(aliceSecret).to.be.equal(bobSecret);
  });
});
