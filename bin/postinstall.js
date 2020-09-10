const fs = require('fs');
const path = require('path');
const gentlyCopy = require('gently-copy');
const buildWASM = require('./build_wasm');
const VERSION = process.env.npm_package_version;

const distPaths = ['build', 'public', 'dist'];

let copied = false;

// node_modules/unicrypto/bin
let projectRoot = path.dirname(require.main.filename);

projectRoot = path.dirname(projectRoot);
projectRoot = path.dirname(projectRoot);
projectRoot = path.dirname(projectRoot);

function copyWASM(destination) {
  gentlyCopy([`./dist/crypto.v${VERSION}.wasm`], `${destination}/crypto.v${VERSION}.wasm`);
  copied = true;
}

function tryToCopy() {
  distPaths.map(distPath => {
    const relative = path.resolve(projectRoot, distPath);

    if (!fs.existsSync(relative)) return;

    if (distPath !== "public") return copyWASM(relative);

    const jsPath = relative + '/js';

    if (fs.existsSync(jsPath)) copyWASM(jsPath);
    else copyWASM(relative);
  });

  if (!copied) console.log(`WARNING: Cannot find destination directory. Please, copy node_modules/unicrypto/dist/crypto.v${VERSION}.wasm to your frontend public directory`);
}

buildWASM.then(tryToCopy);
