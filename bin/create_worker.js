const fs = require('fs');
const workerPath = __dirname + '/../src/workers/worker_code.js';
const wrapperPath = __dirname + '/../src/vendor/wasm/wrapper.js';

const quote = /'/g;
const newline = /\n/g;
const comment = /\/\/.+\n/g;

var wrapperData = fs.readFileSync(wrapperPath);

wrapperData = wrapperData.toString().replace('module.exports = Module;', '');

var data = fs.readFileSync(workerPath);
data = data.toString();
// data = data.replace('%wrapper.js%', wrapperData);
data = data.split("'").join("\\'");
data = data.split('\n').join("");
const searchString = ["/^(", "/?|)([","s","S]*?)((?:",".{1,2}|[^","/]+?|)(",".[^.","/]*|))(?:[","/]*)$/"];
data = data.split("replace(/\\/g,\"/\")").join('replace(/\\\\\\\\/g,"/")');
data = data.split(searchString.join("\\")).join(searchString.join("\\\\"));
data = 'module.exports = \'' + data + '\';';

fs.writeFileSync(__dirname + '/../src/workers/worker.js', data);
