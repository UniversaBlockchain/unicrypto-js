var Minicrypto = Minicrypto || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

class TestClass {
  constructor(a, b, c) {
    this.data = [a, b, c];
  }

  static deserializeFromBOSS(serialized) {
    return new TestClass(serialized.a, serialized.b, serialized.c);
  }

  serializeToBOSS() {
    return {
      a: this.data[0],
      b: this.data[1],
      c: this.data[2]
    };
  }
}

TestClass.className = "TestClass";

describe('BOSS Protocol', function() {
  const vectors = [
    ['8', 7],
    ['\xb8F', 70],
    ['\xc8p\x11\x01', 70000],
    ['.\x00\x08\n8:', [0, 1, -1, 7, -7]],
    ['+Hello', 'Hello']
  ];

  const {
    hexToBytes,
    bytesToHex: hex,
    arrayToByteString,
    byteStringToArray,
    Boss,
    encode64,
    decode64
  } = Minicrypto;

  it('should ignore functions', function() {
    const hash = { a: 1, b: 2, c: function() {} };
    const decoded = Boss.load(Boss.dump(hash));

    expect("undefined").to.equal(typeof decoded.c);
  });

  it('should pack doubles', function() {
    const double = 3.75;
    const encoded = Boss.dump(double);

    expect(Boss.load(encoded)).to.equal(3.75);
  });

  it('should cache equal byte arrays', function() {
    const d = decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20");
    const hash = { a: 1, b: d, c: d };
    const decoded = Boss.load(Boss.dump(hash));

    expect("object").to.equal(typeof decoded.c);
  });

  it('should pack date', function() {
    const d = new Date('2218 07 Mar 21:39');
    const encoded = Boss.dump(d);

    expect(hex(encoded)).to.equal("79446b3e169d");
  });

  it('should read date', function() {
    const encoded = hexToBytes('79446b3e169d');
    const decoded = Boss.load(encoded);

    expect(decoded.getTime()).to.equal(7831795140000);
  });

  it('should encode false', function() {
    expect(Boss.load(Boss.dump({ a: false }))).to.deep.equal({ a: false });
  });

  it('should encode null', function() {
    expect(Boss.load(Boss.dump({ a: null }))).to.deep.equal({ a: null });
  });

  it('should encode utf8 strings', function() {
    // console.log(Boss.dump('АБВГД'));

    expect(Boss.load(Boss.dump('АБВГД'))).to.equal('АБВГД');
  });

  it('should cache similar objects', function() {
    const txt = { __type: 'text', value: "" };
    const obj = { binary: hexToBytes('aa'), text: txt };
    const unpacked = Boss.load(Boss.dump(obj));

    expect(obj.text).to.deep.equal(unpacked.text);
  });

  // FIXME: need to deprecate byte strings
  it.skip('should perform compatible encode', function() {
    for (const [a, b] of vectors)
      expect(arrayToByteString(Boss.dump(b))).to.equal(a);
  });

  // FIXME: need to deprecate byte strings
  it.skip('should perform compatible decode', function() {
    for (const [a, b] of vectors)
      expect(hex(Boss.load(byteStringToArray(a)))).to.equal(hex(b));
  });

  it('should properly encode positive and negative floats', function() {
    round(0);
    round(1.0);
    round(-1.0);
    round(2.0);
    round(-2.0);
    round(1.11);
    round(-1.11);
  });

  it('should properly encode rounded Dates', function() {
    const seconds = 1507766400;
    const d = new Date(seconds * 1000);

    expect(Boss.load(Boss.dump(d)).getTime()).to.equal(d.getTime());
  });

  it('should encode booleans', function() {
    round(true);
    round(false);
  });

  it('should properly encode null', function() {
    round(1);
    round(null);
    round([1]);
    round([null, null, null, 3, 4, 5, null]);
  });

  it('should encode Date', function() {
    const now = new Date();

    // Time is rounded to seconds on serialization, so we need
    // take care of the comparison
    expect(Boss.load(Boss.dump(now)).getTime()).to
      .equal(parseInt(now.getTime() / 1000) * 1000);
  });

  it('should encode in stream mode', function() {
    const writer = new Boss.Writer();

    writer.write(0);
    writer.write(1);
    writer.write(2);
    writer.write(3);

    const dump = writer.get();

    expect(hex(dump)).to.equal('00081018');
  });

  it('should decode in stream mode', function() {
    const reader = new Boss.Reader(hexToBytes('00081018'));

    const arg1 = reader.read();
    const arg2 = reader.read();
    const arg3 = reader.read();
    const arg4 = reader.read();
    const arg5 = reader.read();

    expect(arg1).to.equal(0);
    expect(arg2).to.equal(1);
    expect(arg3).to.equal(2);
    expect(arg4).to.equal(3);
    expect(arg5).to.equal(undefined);
  });

  it('should cache data', function() {
    const a = [1, 2, 3, 4];
    const ca = { 1: 55 };
    const data = [a, a, ca, ca, 'oops', 'oops'];

    const t = Boss.load(Boss.dump(data));
    const [b, c, d, e, f, g] = t;

    expect(a).to.deep.equal(b);
    expect(b).to.equal(c);

    expect(ca).to.deep.equal(d);
    expect(ca).to.deep.equal(e);
    expect(d).to.equal(e);

    expect(f).to.equal('oops');

    expect(g).to.equal(f);
    expect(Object.isFrozen(g)).to.equal(true);
  });

  it('should properly encode very big intergers', function() {
    const value = 1 << 1024 * 7 + 117;
    round(value);
  });

  it('should cache arrays and hashed', function() {
    const dictionary = { 'Hello': 'world' };
    const array = [112, 11];
    const data = [
      array,
      dictionary,
      array,
      dictionary
    ];

    const result = Boss.loadAll(Boss.dump(...data));

    expect(data).to.deep.equal(result);
    expect(result[0]).to.deep.equal(result[2]);
    expect(result[1]).to.deep.equal(result[3]);
  });

  it('should properly encode multilevel structures', function() {
    const main = { level: 1 };
    var p = main;

    for (let i = 0; i < 200; i++) {
      const x = { level: i + 2 };

      p.data = x;
      p.payload = 'great';
      p = x;
    }

    round(main);
  });

  it('has shortcuts', function() {
    const source = ['foo', 'bar', { 'hello': 'world' }];

    expect(Boss.unpack(Boss.pack(source))).to.deep.equal(source);
  });

  it.skip('should register and dump custom classes', function() {
    Boss.register("MyTestClass", TestClass);

    const instance = new TestClass("1", 2, { "3": 3 });
    const dump = Boss.dump(instance);

    expect(encode64(dump)).to.equal("JwthCzELYhALYw8LMxgbX190W015VGVzdENsYXNz");
  });

  it('should read custom classes', function() {
    Boss.register("MyTestClass", TestClass);

    const instance = Boss.load(decode64("JwthCzELYhALYw8LMxgbX190W015VGVzdENsYXNz"));

    expect(instance).to.be.instanceof(TestClass);
    expect(instance.data[0]).to.be.equal("1");
    const c = instance.data[2];
    const cKeys = Object.keys(c);
    expect(cKeys[0]).to.be.equal("3");
  });

  it('should read unknown classes as objects', function() {
    const obj = Boss.load(decode64("JwthCzELYhALYw8LMxgbX190Y015VGVzdENsYXNzMg=="));

    expect(obj['__t']).to.equal("MyTestClass2");
    expect(obj["a"]).to.equal("1");
  });

  it('should pack Map', function() {
    const map = new Map();
    const a = { c: 1 };

    map.set("k1", 1);
    map.set("k2", 2);
    map.set(a, 3);

    const packed = Boss.dump(map);
    const loaded = Boss.load(packed);

    expect(loaded.get("k2")).to.be.equal(2);
  });

  it('should unpack Map', function() {
    const bin = decode64("H4NlbmNyeXB0ZWRQYXlsb2FkxF4Cuxzgeaxa+BEjWtpyQNy1DdsomdNOkTKm8ryRO7k1nn2b6U6ldvOp/jQa9cKrwjqSF5A5n4WjMWD09pSIfKdyzvwZ1dPNmAB3o8jWJPyIPg8lGp8VBkm7TVzofV3KqmmN8XsQ6uCnEq9eG2rik7wpWrXeGHRe2MxvKvhNgyi2/Skpj8+L4tGvO1przlYAaDZ1OhBqty4VWp7wsGbeTKH7X5jXRGdESgXb9njRJvCmn4kY80i5Lg25nZGjn999/31gnMd2TKwQp3KCUaBfbpqcoGBqgXbYu/hF+mVYDKUVGv4ZXYIM+hCR+SrHGQRrMjebMoA7jEtOM/CovHZvMbSPnnChMwxGVrs6ofc+0cJe8OnJqw0GQGadaL0VykEMFHhwhbqsPIucMV3S4n3g5UWatEiA6jn9hIuWXKnw5ljxnHwtaJMsD+abxpAnA4kBZJNQb1FqpuVUknmhCB60hisIjVZr3WxbM+vm+fU/JtaGke3rqCjlzC1xMyULW6sUxG/2/I/PV0xwbSnOCkkgdTddJJY4k+XLFcxw1gKzzKMQCs+SRPOdRQZM2dM8tkToFPCQYKAO9IhrqyaEyJeJ9A2w4ITWxftbgBgp9oHRlnSOVyw6ShJ7HdTpx7dC5W1secqUlFnhVaZJUCczIR5a0unx6JKNqU3idxkkzB4ipA8u+33Z0YRif8oWJVEjHiOdlRSfEKBzg42pkjMUkNEJvDsdSNlma4jfJmT/7e/+1vSOT0IDXzBn6xl60M8s8fDuzgyWucgLsfXzTL+37Zf2mmZrKTDJhFLGNstq4fwEE4byCyRLU2hhcmVkQm94e3BhY2tlZEFjY2Vzc29ycw9HS2tleUxlbmd0aLggI3NhbHR8bXlvLmNsb3VkLmxvZ2luJatQYXNzd29yZEtleUFubm90YXRpb24zZGlnZXN0DyNuYW1lM1NIQTI1NlNmdWxsTGVuZ3RouGATaWS8IGpmiLRmmhRoBzuuH+7Ou8lR5o97qhA6nOHsfiOY5gSaS2tleU9mZnNldAAzcm91bmRzyPBJArxQ2++Qq5jOy6uEsqzivMncSkkZwqBj81kpxvDCTw8Y6yAcXjkQjQNp8Plcbx10FOQfbb8RF8a/91+Aohp91dk6bezefW7fL03s6D3MG4ZFgho=");
    const loaded = Boss.load(bin);

    expect(loaded.packedAccessors.constructor.name).to.be.equal('Map');
  });

  function round(value) {
    expect(value).to.deep.equal(Boss.load(Boss.dump(value)));
  }
});
