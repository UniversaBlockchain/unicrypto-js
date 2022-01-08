const { version } = require('../../package.json');
const { isNode, isWorker, dirname } = require('../utils');

class DynamicWorker {
  constructor(id, { scriptURL, libraryPath }) {
    this.id = id;
    const scriptDirectory = dirname(scriptURL);
    const scriptName = `crypto.v${version}.js`;
    let scriptBase = libraryPath ? libraryPath : scriptDirectory;
    if (scriptBase && scriptBase[scriptBase.length - 1] !== '/') scriptBase += '/';

    const CDN_LINK = `https://cdn.jsdelivr.net/npm/unicrypto@${version}/dist/crypto.v${version}.js`;

    const libURL = scriptBase + scriptName;

    const workerBody = `
      var WORKER_ID = ${id};
      var SCRIPT_SRC="${scriptURL}";
      var LIB_SRC="${libURL}";
      var LIBRARY_PATH = "${libraryPath || ''}";
      var CDN_LINK = "${CDN_LINK}";

      try {
        importScripts(LIB_SRC);
      } catch(err) {
        importScripts(CDN_LINK);
      }

      for (let key in Unicrypto) self[key] = Unicrypto[key];

      function sendResult(taskId, extra) {
        const basic = { type: 'result', taskId, workerId: WORKER_ID };
        const full = Object.assign(basic, extra);
        self.data = null;
        postMessage(full);
      }

      const taskResolve = (taskId) => (value) => sendResult(taskId, { value });
      const taskReject = (taskId) => (err) => sendResult(taskId, { err });

      function evalInContext(fn) { eval(fn); }

      onmessage = function(msg) {
        const { fn, data, functions, taskId, debug } = msg.data;
        const currentReject = taskReject(taskId);
        try {
          let declaration = '';
          for (let k in functions) {
            let fnDec = functions[k];
            if (fnDec.indexOf('function') !== 0 && fnDec[0] !== '(') fnDec = 'function ' + fnDec;
            declaration += 'self["'+k+'"] = ' + fnDec + ';';
          }
          const promiseString = declaration + 'new Promise('+fn+').then(taskResolve('+taskId+'), taskReject('+taskId+'))';
          self.data = data;
          if (debug) console.log(promiseString);

          evalInContext.call({ Unicrypto, data }, promiseString);
        } catch(err) { currentReject(err) }
      };

      postMessage({
        type: 'state',
        value: 'idle',
        workerId: WORKER_ID
      });
    `;

    const blob = new Blob(
      [workerBody],
      { type: 'text/javascript' }
    );

    this.worker = new Worker(URL.createObjectURL(blob));
    URL.revokeObjectURL(blob);
  }

  runTask(task) {
    const functions = {};
    const { options } = task;
    for (let name in options.functions || {}) {
      functions[name] = options.functions[name].toString();
    }

    this.worker.postMessage({
      taskId: task.id,
      fn: task.fn,
      data: options.data,
      debug: options.debug,
      functions
    });
  }
  addListener(listener) { this.worker.onmessage = listener; }
}

class CryptoWorker {
  constructor() {
    if (isNode() || isWorker()) return;

    this.workers = {};
    this.tasks = [];
    this.processing = {};
    this.lastTaskId = 1;
    this.maxWorkers = navigator.hardwareConcurrency - 1;
    this.scriptURL = typeof document !== 'undefined' && document.currentScript && document.currentScript.src || '';
    this.libraryPath = '';

    const self = this;
    setInterval(() => self.checkTasks(), 100);
  }

  setup({ libraryPath = '' }) {
    this.libraryPath = libraryPath;
  }

  createWorker(i) {
    const self = this;
    const worker = new DynamicWorker(i, {
      scriptURL: self.scriptURL,
      libraryPath: self.libraryPath
    });
    worker.addListener(onMessage);

    function onMessage(msg) {
      const { type, value, err, workerId, taskId } = msg.data;
      if (type === 'state') self.workers[workerId].state = value;
      if (type === 'result') {
        self.workers[workerId].state = 'idle';
        if (err) self.processing[taskId].reject(err);
        else self.processing[taskId].resolve(value);
        delete self.processing[taskId];
      }
    }

    this.workers[i] = {
      worker,
      id: i,
      state: 'busy'
    };
  }

  checkTasks() {
    const self = this;

    if (self.tasks.length && Object.keys(this.workers).length === 0)
      this.createWorker(1);

    for (let id in self.workers) {
      const worker = self.workers[id];
      if (worker.state === 'idle' && self.tasks.length) {
        const task = self.tasks.shift();
        self.processing[task.id] = task;
        worker.state = 'busy';
        worker.worker.runTask(task);
      }
    }

    const workersTotal = Object.keys(this.workers).length;

    if (self.tasks.length && workersTotal < this.maxWorkers)
      this.createWorker(workersTotal + 1);
  }

  addTask(fn, options, resolve, reject) {
    this.tasks.push({
      id: this.lastTaskId,
      fn,
      options,
      resolve,
      reject
    });

    this.lastTaskId += 1;
  }

  run(fn, options = {}) {
    if (isNode() || isWorker())
      throw new Error('Web worker is not available on this platform');

    const self = this;

    return new Promise((resolve, reject) => self.addTask(
      typeof fn === 'string' ? fn : fn.toString(),
      options,
      resolve,
      reject
    ));
  }
}

module.exports = new CryptoWorker();
