console.log('run test');
const { decode64, PrivateKey } = require('./index');


async function main() {
  const k = await PrivateKey.generate({ strength: 2048 });
  console.log(k);
}

main();

