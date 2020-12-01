const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const Safe58 = {
  ALPHABET: ALPHABET,
  BASE_58: ALPHABET.length,
  BASE_256: 256,

  INDEXES: buildIndexes(ALPHABET),

  copyOfRange: (source, from, to) => {
    const range = [];
    for (let i = from; i < to; i++) range.push(source[i]);

    return range;
  },

  divmod58: (number, startAt) => {
    let remainder = 0;
    let number2 = [];

    for (let i = startAt; i < number.length; i++) {
      let digit256 = number[i] & 0xFF;
      let temp = remainder * Safe58.BASE_256 + digit256;

      number2[i] = temp / Safe58.BASE_58;
      remainder = temp % Safe58.BASE_58;
    }

    return { number: new Uint8Array(number2), remainder };
  },

  divmod256: (number58, startAt) => {
    let remainder = 0;
    let number2 = [];

    for (let i = startAt; i < number58.length; i++) {
      let digit58 = number58[i] & 0xFF;
      let temp = remainder * Safe58.BASE_58 + digit58;

      number2[i] = temp / Safe58.BASE_256;
      remainder = temp % Safe58.BASE_256;
    }

    return { number: new Uint8Array(number2), remainder };
  },

  decode: (input, strict = false) => {
    const replaces = {
      'I': '1',
      '!': '1',
      '|': '1',
      'l': '1',
      'O': 'o',
      '0': 'o'
    };

    let cleaned = input;

    if (!strict) {
      for (let find in replaces) {
        let escaped = find.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(escaped, 'g'), replaces[find]);
      }
    }

    return Safe58.doDecode(cleaned);
  },

  doDecode: (input) => {
    // paying with the same coin
    if (input.length === 0) return new Uint8Array([0]);

    let input58 = new Array(input.length);

    for (let i = 0; i < input.length; i++) {
      let c = input.charCodeAt(i);
      let digit58 = -1;
      if (c >= 0 && c < 128) digit58 = Safe58.INDEXES[c];
      if (digit58 < 0) throw new Error(`Not a Base58 input: ${input}`);
      input58[i] = digit58;
    }

    let zeroCount = 0;
    while(zeroCount < input58.length && input58[zeroCount] === 0) zeroCount++;

    let temp = new Array(input.length);
    let j = temp.length;
    let startAt = zeroCount;

    while (startAt < input58.length) {
      let { remainder, number } = Safe58.divmod256(input58, startAt);
      input58 = number;
      if (input58[startAt] === 0) startAt++;
      temp[--j] = remainder;
    }

    while (j < temp.length && temp[j] === 0) {
      j++;
    }

    return new Uint8Array(Safe58.copyOfRange(temp, j - zeroCount, temp.length));
  },

  encode: (input) => {
    if (input.length === 0) return '';

    let inputCopy = [];
    for (let i = 0; i < input.length; i++) inputCopy[i] = input[i];

    let zeroCount = 0;
    while(zeroCount < inputCopy.length && inputCopy[zeroCount] === 0) zeroCount++;

    let temp = new Array(input.length * 2);
    let j = temp.length;

    let startAt = zeroCount;
    while (startAt < input.length) {
      const { number, remainder } = Safe58.divmod58(inputCopy, startAt);
      inputCopy = number;
      if (inputCopy[startAt] === 0) startAt++;
      temp[--j] = Safe58.ALPHABET[remainder];
    }

    while (j < temp.length && temp[j] === Safe58.ALPHABET[0]) {
      j++;
    }

    while (--zeroCount >= 0) {
      temp[--j] = Safe58.ALPHABET[0];
    }

    // console.log("<<<<", temp);

    let output = Safe58.copyOfRange(temp, j, temp.length);
    // console.log(output);
    return output.join('');
  }
}

function buildIndexes(alphabet) {
  const indexes = {};

  for (let i = 0; i < 128; i++) indexes[i] = -1;
  for (let j = 0; j < alphabet.length; j++) indexes[alphabet.charCodeAt(j)] = j;

  return indexes;
}

module.exports = Safe58;
