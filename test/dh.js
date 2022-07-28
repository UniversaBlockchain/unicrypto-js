var Minicrypto = Minicrypto || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

describe('Diffie-Hellman', function() {
  it.only('should create keys and same secrets', async () => {
    const { DiffieHellman } = Minicrypto;

    const alice = DiffieHellman.generate(256);
    const alicePrime = alice.prime;
    const aliceGenerator = alice.generator;
    alice.generateKeys();

    const alicePublic = alice.getPublicKey();

    const bob = new DiffieHellman(alicePrime, aliceGenerator);
    bob.generateKeys();
    const bobPublic = bob.getPublicKey();

    const bobSecret = bob.computeSecret(alicePublic);

    const aliceSecret = alice.computeSecret(bobPublic);

    expect(aliceSecret).to.be.equal(bobSecret);
  });

  // it.only('should work with java 2', async () => {
  //   const { DiffieHellman } = Minicrypto;

  //   const alice = DiffieHellman.generate(512);
  //   const alicePrime = alice.prime;
  //   const aliceGenerator = alice.generator;
  //   const alicePublic = alice.generateKeys();

  //   console.log(alicePrime, aliceGenerator);

  //   const bob = new DiffieHellman(alicePrime, aliceGenerator);
  //   const bobPublic = bob.generateKeys();

  //   console.log(bobPublic);

  //   const bobSecret = bob.computeSecret(alicePublic);

  //   const aliceSecret = alice.computeSecret(bobPublic);

  //   expect(aliceSecret).to.be.equal(bobSecret);
  // });

  // it.only('should work with java', async () => {
  //   const { DiffieHellman } = Minicrypto;

  //   const alicePrime = "AKXjwFVAZhj2yVryCFffL0gyfDIrcLo+epNaNSlH3YQC9v9OP5AV5GOxHmbgwFdMh2dxOhzqWLK9mD/iCVG5FE8=";
  //   const aliceGenerator = "GsOUYeuiSL3ztbHhu6bi4RHTWnptdnFg2QFV3lL85nEQ3OZRhpWQi52hzu1DnEYWp/RvbGd9NwBzdMHODTrG+Q==";
  //   const alicePublic = "V/dOLgykaUNQUXzlq0ymBEL7US/sIXcBV0SWl1eIJz3RGD2uN1C/Ru/3EIPCyIJsmg/c7A1rK4YJD0yXvX42+g==";

  //   const bob = new DiffieHellman(alicePrime, aliceGenerator);
  //   const bobPublic = bob.generateKeys();
  //   console.log('>>>> pub: ', bobPublic);
  //   const bobSecret = bob.computeSecret(alicePublic);
  //   console.log('>>>> sec: ', bobSecret);
  //   // const aliceSecret = alice.computeSecret(bobPublic);


  //   // const alice = DiffieHellman.generate(128);
  //   // const alicePrime = alice.prime;
  //   // const aliceGenerator = alice.generator;
  //   // const alicePublic = alice.generateKeys();

  //   // const bob = new DiffieHellman(alicePrime, aliceGenerator);
  //   // const bobPublic = bob.generateKeys();

  //   // const bobSecret = bob.computeSecret(alicePublic);
  //   // const aliceSecret = alice.computeSecret(bobPublic);

  //   expect("").to.be.equal('');
  // });
});
