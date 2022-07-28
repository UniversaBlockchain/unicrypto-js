const dh = require('diffie-hellman');

const { encode64, decode64, bytesToHex, hexToBytes } = require('../src/utils');

const primeHex = 'f72deb7047e3957811c7f01a686c81ae77e48eee77e1608e0c87acc34c0b248e6801885e6a1591f33c8927571fadf94afc381115a3d2065ad997cc7ced6b81a3';
const prime = '9y3rcEfjlXgRx/AaaGyBrnfkju534WCODIesw0wLJI5oAYheahWR8zyJJ1cfrflK/DgRFaPSBlrZl8x87WuBow==';

const generatorHex = '02';
const generator = 'Ag==';

const alicePublicHex = '6db5ae64f28468275f5e368a7e70a319200123db389458582b84c53e0020cbd5bd30108b17d1583679025b1180ef5bd7f65097b9c56b6133d411745c5e4823be';
const alicePublic = 'bbWuZPKEaCdfXjaKfnCjGSABI9s4lFhYK4TFPgAgy9W9MBCLF9FYNnkCWxGA71vX9lCXucVrYTPUEXRcXkgjvg==';

const alicePrivateHex = '42c011e09888dffd5872fd8104f7f53aa1050e99a602b9424567f13a2db0fae5ade66104dd7261436605910a3ddb26147032e6db444582bc32116bdeffe7e82e';
const alicePrivate = 'QsAR4JiI3/1Ycv2BBPf1OqEFDpmmArlCRWfxOi2w+uWt5mEE3XJhQ2YFkQo92yYUcDLm20RFgrwyEWve/+foLg==';


const hell = dh.createDiffieHellman(prime, 'base64', generator, 'base64');
hell.setPublicKey(alicePublic, 'base64');
hell.setPrivateKey(alicePrivate, 'base64');

console.log(decode64(prime));
console.log(hell.computeSecret('AKe8H4p8DYDpcTUHuzteJCX0xc/nxTRSYCzvD/n7p7rvMmwW6CutzEJImi6DmCN1JH96yfVAp9R9l/XH2cLOmqk=', 'base64', 'base64'));

// console.log(hell.computeSecret('14e8d64de122bd5b54530fbe60208162d70c9f9baeb841e99ac7d820c6eb72af24f36a64a5150e95d5569dc9efdffda9387588169335b22dfeed597c7f678243', 'hex', 'hex'));