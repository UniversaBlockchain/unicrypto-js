const SHA = require('../hash/sha');

exports.keysEqual = function keysEqual(key1, key2) {
  return key1.getN() === key2.getN() && key1.getE() === key2.getE();
};

exports.defaultPSSConfig = () => ({
  pssHash: "sha3_384",
  mgf1Hash: "sha1"
});

exports.defaultSignatureConfig = (options) => {
  const hashType = SHA.wasmType(options.pssHash || 'sha1');
  const mgf1Type = SHA.wasmType(options.mgf1Hash || 'sha1');
  let saltLength = -1;
  if (typeof options.saltLength === 'number') saltLength = options.saltLength;
  if (options.salt) saltLength = options.salt.length;

  return { hashType, mgf1Type, saltLength };
};
