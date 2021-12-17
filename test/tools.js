var Unicrypto = Unicrypto || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

describe('Tools', function() {
  const {
    crc32,
    bytesToHex: hex,
    decode64,
    encode64,
    randomBytes,
    byteStringToArray,
    arrayToByteString,
    hashId,
    textToBytes,
    bytesToText,
    bytesToHex,
    CryptoWorker,
    PrivateKey
  } = Unicrypto;

  const { randomByteString } = Unicrypto.bytes;

  it('should encode text to bytes and back', async () => {
    expect(bytesToText(textToBytes("123"))).to.equal('123');
  });

  it.skip('should run crypto worker', async () => {
    const packed = "JgAcAQABxAAC99KCimkzv77oDlxlFN8S4VER1S+v9N2hZUnZZr43/RLIbC+9W2t9bEor4iPNo8nowZ+q7OA9wXJmfpI3ocdadhYWOyLIsCIGScvgJufDCEMkYtIt/lJBgbpKLzWWohD10pFO3CiBG55zKcuy2wD3S1Yq7Ac9fMVMzg6hNpf2wvhoqwCpBY0kJTfBTW29eq7WcDaSUb2o2JPeq1uK0pUfUcvX2UcfGk0ABDRD8F7FZ/FVudCjOLW1gGU/5UTSgyp0gjMhPFEQWfLOGzkgj3wxOldfcof6IJVbQOXrJQbdOqwr2WQ0vsWrgZWTeKF/eLjxJvqgqnTcj1JPdJL3Fz9KkEa/Tu8AhSVCmJlxp24MRC08D3zSP7D6peOltEfIi0xdrqDVCH+TkeL7JV0Ro5K1D/GZAK94Cnq3xXAX20lJ8yZYExZuj8XYuP1wHAfcRxXTwW6R/qahgUjwMPB59zH03FlBLsohuzq6UBl7YKvcQibTXMyp7Es7Zcky9zpfEJxa+XXWYVnyycWr3oee2B/5A6YGKnqzXnRkwAhOi8/fofysva/4cbihIJ0D9yjj1C2weFx/h8ngevZjlkiVRAgpQHA/2j8PjDNibM4uXPFaLW80DXjMjr64peTsXG7dt/VFEn6CVIpUwLTDTf9JQWVQRo4jtvNm7BZz10zO2PP+q4nEAALuEsSqRqYVnMv7p8uym7uY2HJU+bX2TLEGg0NYp8Pv+JCd5jtjDcoysOfyv550cxBiTyECmvwgG//6P+fJNOy6+56TPVRzM3jP3DqXMMfbAeJpWgIPf8whB/y0IbY5rE3IvitRJRDwYTSeDgDSSwyua5UmG/woF9T5q/tMnEjWMs/1zl9oPxtLwA8Ewna+mOIHVo93H3B0tZyHQkOGBi3WGt+e6+ZGzBl1HXO74W5+qCPCWxxe7Hd0sEn2YzRfRWRcU0oVJrouafwfvOnLeOl3IkDlHAFlmcHgHEM8KsKx7zrim/CFZH2HRSeS/QmcMBiV9y2yO2JS6BdV4sRnYtwBEzkXByqGXW1sMsw+KWuNfOPOsOGgMXXxfdrLL0BBfgYjOtUvxOn0Gxw1kcWyyD0DWVeyTshnR21dwZq7qS6RdiBjzDKvDffmmaanSJcDRFHiuBlo+DTnIJgai8bcHOtJfd5BLUZm/lawDAnI+jGF0H/lMbz/1VH3FTrlCgxk5RrpwoxxwIuo2P5szpFEmP3MwnN2XPZesU4VovULFzWuvkf1a9QrxDwZrdskAjhQYXsFRVjI/9kPSVA2LwT1lFgq7nvLwhYC/pHkgtTzgLFP8RnZF3qnN6WAWPUN1utca7N2zKJxI+JtV639xEG28TNCyg4lwihyGTRAuKlg9P3tmw==";
    const key = await PrivateKey.unpack(decode64(packed));

    const addr = await CryptoWorker.run(`async (resolve, reject) => {
      const { PrivateKey } = this.Unicrypto;
      const { packed } = this.data;
      const key = await PrivateKey.unpack(packed);
      resolve(key.publicKey.shortAddress.base58);
    }`, { data: { packed: await key.pack() } });

    expect(addr).to.equal('2dwybLfSX4vaeW4joP5odqvnpp2k1XiFcky5HB4NbEfchDYrSrZ');
  }).timeout(10000);

  it.skip('should generate random bytes', () => {
    const bytes = randomBytes(16);

    expect(bytes.constructor.name).to.equal('Buffer');
    // console.log(bytes);
  });

  it('should convert text to bytes', () => {
    const msg = "life happens, дерьмо случается";
    expect(bytesToHex(textToBytes(msg))).to.equal("6c6966652068617070656e732c20d0b4d0b5d180d18cd0bcd0be20d181d0bbd183d187d0b0d0b5d182d181d18f");
  });

  it.skip('should calc crc32 for bin', function() {
    const data = decode64('gvyrDZKjMVPIhManWZaKNMQIgSb6jpUles+5LvB8EVwRlqk5BACZN1J9L59ZOz1a+cEOt0vjOYoww7M5EjyurHgVc3ht7ras4Iocej2FnoSeGlx1sWe/NdpfXZtDSCKLRlRmIS2bjUbURDk=');
    const digest = crc32(data);

    // ? 0bb5eaa121
    expect(hex(digest)).to.equal("b5eaa121");
  });

  it.skip('should convert binaries by parts or not similar', function() {
    const sample = randomByteString(5000);

    const converted = arrayToByteString(byteStringToArray(sample), 13);
    const converted2 = arrayToByteString(byteStringToArray(sample));

    expect(sample).to.equal(converted);
    expect(sample).to.equal(converted2);
  });

  it('should calculate hashId', async () => {
    const data = decode64('gvyrDZKjMVPIhManWZaKNMQIgSb6jpUles+5LvB8EVwRlqk5BACZN1J9L59ZOz1a+cEOt0vjOYoww7M5EjyurHgVc3ht7ras4Iocej2FnoSeGlx1sWe/NdpfXZtDSCKLRlRmIS2bjUbURDk=');
    const result = decode64('DdNQDJ5NBT8JKi1TEm+ZxTgFmW8Yh1YD0sWxqCqOjAw4vAzDDImHMJcpOeqijjRPr72mdXugR55Fyl8TCIjI7+FP+wsbf/eewiTHPW6B/kUTJ8JwgrR/BGUlaUwiHv7n');

    expect(hex(await hashId(data))).eql(hex(result));
  });

  it('should calc b64 from array', function() {
    const b64 = encode64([169, 159, 176, 211, 190, 63, 226, 212, 158, 113, 84, 67, 47, 113, 181, 139, 123, 163, 20, 86, 14, 204, 132, 124, 93, 136, 147, 174, 229, 108, 79, 251, 111, 46, 248, 228, 253, 185, 105, 62, 108, 97, 33, 186, 46, 54, 85, 253, 209, 26, 82, 171, 91, 209, 193, 157, 194, 167, 81, 97, 46, 105, 173, 247, 90, 255, 109, 228, 73, 244, 192, 22, 222, 171, 165, 148, 165, 103, 51, 225, 228, 24, 4]);
    expect(b64).to.equal("qZ+w074/4tSecVRDL3G1i3ujFFYOzIR8XYiTruVsT/tvLvjk/blpPmxhIbouNlX90RpSq1vRwZ3Cp1FhLmmt91r/beRJ9MAW3qullKVnM+HkGAQ=");
  });

  it('should decode64', function() {
    expect(decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20").length).to.equal(32);
  });

  it('should convert bytes to text and back', () => {
    const str = "ll3bklbj123klbj2b34ljk234=sd dfg*)&#$)*^!#%";
    const bytes = textToBytes(str);
    expect(bytesToText(bytes)).to.equal(str);
  });
});
