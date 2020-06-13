module.exports = (function() {
  var ALPHABET, ALPHABET_MAP, Base58, i;
  ALPHABET = void 0;
  ALPHABET_MAP = void 0;
  Base58 = void 0;
  i = void 0;
  new Function('x', 'Base58 = x;')(Base58 = {});
  ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  ALPHABET_MAP = {};
  i = 0;
  while (i < ALPHABET.length) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
    i++;
  }
  Base58.encode = function(buffer) {
    var i;
    var carry, digits, j, l;
    carry = void 0;
    digits = void 0;
    j = void 0;
    if (buffer.length === 0) {
      return '';
    }
    i = void 0;
    j = void 0;
    digits = [0];
    i = 0;
    while (i < buffer.length) {
      j = 0;
      while (j < digits.length) {
        digits[j] <<= 8;
        j++;
      }
      digits[0] += buffer[i];
      carry = 0;
      j = 0;
      while (j < digits.length) {
        digits[j] += carry;
        carry = digits[j] / 58 | 0;
        digits[j] %= 58;
        ++j;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = carry / 58 | 0;
      }
      i++;
    }
    i = 0;
    while (buffer[i] === 0 && i < buffer.length - 1) {
      digits.push(0);
      i++;
    }
    digits.reverse();
    i = 0;
    l = digits.length;
    while (i < l) {
      digits[i] = ALPHABET.charAt(digits[i]);
      ++i;
    }
    return digits.join('');
  };
  Base58.decode = function(string) {
    var bytes, c, carry, j;
    bytes = void 0;
    c = void 0;
    carry = void 0;
    j = void 0;
    if (string.length === 0) {
      return [];
    }
    i = void 0;
    j = void 0;
    bytes = [0];
    i = 0;
    while (i < string.length) {
      c = string[i];
      if (!(c in ALPHABET_MAP)) {
        throw 'Base58.decode received unacceptable input. Character \'' + c + '\' is not in the Base58 alphabet.';
      }
      j = 0;
      while (j < bytes.length) {
        bytes[j] *= 58;
        j++;
      }
      bytes[0] += ALPHABET_MAP[c];
      carry = 0;
      j = 0;
      while (j < bytes.length) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
        ++j;
      }
      while (carry) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
      i++;
    }
    i = 0;
    while (string[i] === '1' && i < string.length - 1) {
      bytes.push(0);
      i++;
    }
    return bytes.reverse();
  };
  return Base58;
}).call(this);
