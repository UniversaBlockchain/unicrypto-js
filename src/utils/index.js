const jsbn = require('jsbn');
const bytes = require('./bytes');
const base58 = require('./base58');
const base64 = require('./base64');
const idGenerators = require('./id_generators');
const crc32 = require('../hash/crc32');
const SHA = require('../hash/sha');

const { BigInteger } = jsbn;

const engLower = "qwertyuiopasdfghjklzxcvbnm";
const idChars = (engLower + engLower.toUpperCase() + "_1234567890").split("");

crc32.bytes = (data) => {
  const hex = (new BigInteger(crc32(data) + '', 10)).toString(16);

  var a = [];

  for (var i = hex.length; i > 0; i -= 2) {
    var start = i - 2;
    var len = 2;

    if (start < 0) {
      start = 0;
      len = 1;
    }

    a.unshift(parseInt(hex.substr(start, len), 16));
  }

  return Uint8Array.from(a);
}
//--------------------------------------------------------------

exports.hashId = SHA.hashId;
exports.guid = idGenerators.guid;
exports.shortId = idGenerators.shortId;

exports.crc32 = crc32.bytes;

exports.BigInteger = BigInteger;

//--------------------------------------------------------------

exports.bytes = bytes;

exports.bigIntToByteArray = bytes.bigIntToBin;
exports.byteArrayToBigInt = bytes.binToBigInt;

// internal use only
exports.byteStringToArray = bytes.byteStringToArray;
exports.arrayToByteString = bytes.arrayToByteString;

exports.hexToBytes = bytes.hexToBytes;
exports.bytesToHex = bytes.bytesToHex;
exports.textToBytes = bytes.textToBytes;
exports.bytesToText = bytes.bytesToText;
exports.byteStringToBytes = bytes.byteStringToBytes;
exports.bytesToByteString = bytes.bytesToByteString;
exports.textToHex = bytes.textToHex;
exports.randomBytes = bytes.randomBytes;

//--------------------------------------------------------------
const isBrowser = () => typeof window === "object";

exports.encode64 = base64.encode64;
exports.decode64 = base64.decode64;
exports.encode64Short = base64.encode64Short;
exports.decode64Short = base64.decode64Short;
exports.encode58 = base58.encode;
exports.decode58 = base58.decode;
exports.isBrowser = isBrowser;
exports.isWorkerAvailable = () => isBrowser() && typeof window.Worker === 'function';
exports.isNode = () => typeof process === "object"
  && typeof process.versions === "object"
  && typeof process.versions.node === "string";
exports.isWorker = () => typeof importScripts === "function";

exports.concatBytes = function(a, b) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
};

exports.randomAlnums = (size) => {
  const idCharsTotal = idChars.length;
  let result = "";

  for (let _i = 0; _i < size; _i++) {
    result += idChars[Math.floor(Math.random() * idCharsTotal)];
  }

  return result;
};

exports.dirname = (path) => {
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = (code === 47/*/*/);
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47/*/*/) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1)
    return hasRoot ? '/' : '.';
  if (hasRoot && end === 1)
    return '//';
  return path.slice(0, end);
}
