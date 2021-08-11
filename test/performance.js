var Unicrypto = Unicrypto || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

const { SHA, decode64, isWorkerAvailable, CryptoWorker } = Unicrypto;

// function countZeroes(bytes) {
//   let mask = 128;
//   let pos = 0;
//   let value = 0;
//   let length = 0;
//   while (true) {
//     if (mask >= 128) {
//       if (pos < bytes.length) {
//         value = bytes[pos++];
//         mask = 1;
//       } else break;
//     } else mask <<= 1;
//     if ((value & mask) == 0) length++;
//     else break;
//   }
//   return length;
// }

// function SolvePOW1Blocking(source, length) {
//   const { SHA, countZeroes } = this;
//   const buffer = Uint32Array.from([0, 0]);
//   let index = 0;
//   const result = new Uint8Array(buffer.buffer);

//   function tryToSolve() {
//     return getHash().then(hash => {
//       if (countZeroes(hash) == length) return result;
//       if (buffer[index]++ == 0xFFFFffff) index++;
//       if (index < 2) return tryToSolve();
//       throw Error("failed to solve POW1 of length " + length);
//     });
//   }

//   function getHash() {
//     const sha = new SHA("sha3_384");
//     return sha.put(result)
//             .then(() => sha.put(source))
//             .then(() => sha.get('bin'));
//   }

//   return tryToSolve();
// }

// class BitMixer {
//   static SHA = SHA;
//   static countZeroes = countZeroes;

//   static SolvePOW1(source, length) {
//     if (!isWorkerAvailable()) return this.SolvePOW1Blocking(source, length);

//     function exec(resolve, reject) {
//       const { length, source } = this.data;

//       this.SolvePOW1Blocking(source, length).then(resolve, reject);
//     }

//     return CryptoWorker.run(exec, {
//       data: { source, length },
//       functions: {
//         countZeroes: BitMixer.countZeroes,
//         SolvePOW1Blocking: BitMixer.SolvePOW1Blocking
//       }
//     });
//   }

//   /**
//    * Find solution for type 1 parsec POW task.
//    *
//    * @param source
//    * @param length
//    */
//   static SolvePOW1Blocking = SolvePOW1Blocking;
// }

//==========================

class BitMixer {
  static SHA = SHA;
  static countZeroes(bytes) {
    let mask = 128;
    let pos = 0;
    let value = 0;
    let length = 0;
    while (true) {
      if (mask >= 128) {
        if (pos < bytes.length) {
          value = bytes[pos++];
          mask = 1;
        } else break;
      } else mask <<= 1;
      if ((value & mask) == 0) length++;
      else break;
    }
    return length;
  }

  static SolvePOW1(source, length) {
    if (!isWorkerAvailable()) return this.SolvePOW1Blocking(source, length);

    function exec(resolve, reject) {
      const { length, source } = this.data;

      this.SolvePOW1Blocking(source, length).then(resolve, reject);
    }

    return CryptoWorker.run(exec, {
      data: { source, length, __debug: true },
      functions: {
        countZeroes: BitMixer.countZeroes,
        SolvePOW1Blocking: BitMixer.SolvePOW1Blocking
      }
    });
  }

  /**
   * Find solution for type 1 parsec POW task.
   *
   * @param source
   * @param length
   */
  static SolvePOW1Blocking(source, length) {
    const { SHA, countZeroes } = this;
    const buffer = Uint32Array.from([0, 0]);
    let index = 0;
    const result = new Uint8Array(buffer.buffer);

    function tryToSolve() {
      return getHash().then(hash => {
        if (countZeroes(hash) == length) return result;
        if (buffer[index]++ == 0xFFFFffff) index++;
        if (index < 2) return tryToSolve();
        throw Error("failed to solve POW1 of length " + length);
      });
    }

    function getHash() {
      const sha = new SHA("sha3_384");
      return sha.put(result)
              .then(() => sha.put(source))
              .then(() => sha.get('bin'));
    }

    return tryToSolve();
  }
}

function freezeWatcher(interval = 200) {
  let lastTime = (new Date()).getTime();

  function checkTime() {
    const time = (new Date()).getTime();
    const diff = time - lastTime;
    if (diff > interval + 10) console.log(`interface response increased by ${diff - interval}ms`);
    lastTime = time;
  }

  setInterval(checkTime, interval);
}

describe('Performance', function() {
  it.only('should not freeze on worker task', async () => {
    freezeWatcher();

    try {
      const solved = await BitMixer.SolvePOW1(decode64('abcabc'), 12);
      // const solved = await BitMixer.SolvePOW1Blocking(decode64('abcabc'), 12);
      console.log('solved!');
    } catch(err) { console.log('w er', err); }
  });
});
