const fs = require('fs');
const workerPath = __dirname + '/../src/workers/worker_code.js';

const quote = /'/g;
const newline = /\n/g;
const comment = /\/\/.+\n/g;

var data = fs.readFileSync(workerPath);
data = data.toString();
data = data.replace(quote, '"');
data = data.replace(comment, " ");
data = data.replace(newline, "\\n");
data = 'module.exports = \'' + data + '\';';

fs.writeFileSync(__dirname + '/../src/workers/worker.js', data);
