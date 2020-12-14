async function main() {
  setInterval(() => console.log("alive!"), 100);
  // console.log("START");
  // const k = await Unicrypto.PrivateKey.gTest({ strength: 4096 });
  // console.log("AFTER CALL", k);
  // const worker = new Worker("./worker.js");
  // worker.onmessage = function(msg) {
  //   console.log("RECEIVED FROM WORKER", msg);

  //   if (msg.data.type === "init") worker.postMessage({
  //     command: "PrivateKey.generate",
  //     options: { strength: 4096 }
  //   });
  // };

  // console.log("AFTER CALL");
  for (let i = 0; i< 10; i++) {
    // setTimeout(() => )
    // Unicrypto.PrivateKey.gTest({ strength: 4096 }).then((k) => console.log("done!!!"));
    Unicrypto.PrivateKey.generate({ strength: 4096 }).then(k => console.log(k.publicKey.shortAddress.asString));

    var password = 'test';
    var rounds = 50000;
    var keyLength = 26;
    var salt = Unicrypto.decode64('KFuMDXmo');
    var standard = Unicrypto.decode64('yPsu5qmQto99vDqAMWnldNuagfVl5OhPr6g=');

    // Unicrypto.pbkdf2('sha512', {
    //   password,
    //   salt,
    //   rounds,
    //   keyLength
    // }).then((res) => console.log("calculated", res));
    // console.log(k);
  }
}
main();
