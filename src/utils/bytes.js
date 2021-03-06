const { Buffer } = require('buffer');
const jsbn = require('jsbn');

const randomBytes = require('randombytes');

const { BigInteger } = jsbn;

const hexToBytes = (hexString) => Uint8Array.from(Buffer.from(hexString, 'hex'));
const bytesToHex = (data) => Buffer.from(data).toString('hex');

function textToHex(text) {
  var result = [];

  for (var n = 0, len = text.length; n < len; n ++)
    result.push(Number(text.charCodeAt(n)).toString(16));

  return result.join('');
}

exports.bigIntToBin = num => hexToBytes(num.toString(16));
exports.binToBigInt = bin => new BigInteger(bytesToHex(bin), 16);
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
exports.textToHex = textToHex;



exports.textToBytes = (text) => {
  if (typeof TextEncoder !== 'function') {
    const polyfill = require("fastestsmallesttextencoderdecoder");
    TextEncoder = polyfill.TextEncoder;
  }

  const te = new TextEncoder();

  return new Uint8Array(te.encode(text));
};
exports.bytesToText = (bytes) => {
  if (typeof TextDecoder !== 'function') {
    const polyfill = require("fastestsmallesttextencoderdecoder");
    TextDecoder = polyfill.TextDecoder;
  }
  const td = new TextDecoder("utf-8");

  return td.decode(bytes);
};
exports.ensureBytes = (bytes) => {
  return bytes.constructor.name == 'Array' ? new Uint8Array(bytes) : bytes;
}

exports.byteStringToBytes = function(str, output, offset) {
  var out = output;
  if(!out) {
    out = new Uint8Array(str.length);
  }
  offset = offset || 0;
  var j = offset;
  for(var i = 0; i < str.length; ++i) {
    out[j++] = str.charCodeAt(i);
  }
  return output ? (j - offset) : out;
};

exports.bytesToByteString = (bytes) => String.fromCharCode.apply(null, bytes);

const bufferToArray = function(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
  }
  return view;
};

exports.bufferToArray = bufferToArray;

exports.randomBytes = (size) => Uint8Array.from(randomBytes(size));
