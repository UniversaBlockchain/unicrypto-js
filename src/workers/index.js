const path = require('path');
const { version } = require('../../package.json');
const { isNode, isWorker } = require('../utils');

class DynamicWorker {
  constructor(id, scriptURL) {
    this.id = id;
    const scriptDirectory = path.dirname(scriptURL);
    const libURL = path.join(scriptDirectory, `crypto.v${version}.js`);

    const workerBody = `
      var WORKER_ID = ${id};
      var SCRIPT_SRC="${scriptURL}";
      var LIB_SRC="${libURL}";

      importScripts(LIB_SRC);

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
        const { fn, data, taskId } = msg.data;
        const promiseString = 'new Promise('+fn+').then(taskResolve('+taskId+'), taskReject('+taskId+'))';
        self.data = data;
        evalInContext.call({ Unicrypto, data }, promiseString);
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
    this.worker.postMessage({ taskId: task.id, fn: task.fn, data: task.data });
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
    this.scriptSRC = typeof document !== 'undefined' && document.currentScript && document.currentScript.src || '';

    const self = this;
    setInterval(() => self.checkTasks(), 100);
  }

  createWorker(i) {
    const self = this;
    const worker = new DynamicWorker(i, this.scriptSRC);
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

  addTask(fn, data, resolve, reject) {
    this.tasks.push({
      id: this.lastTaskId,
      fn,
      data,
      resolve,
      reject
    });

    this.lastTaskId += 1;
  }

  run(fn, options = {}) {
    const self = this;

    return new Promise((resolve, reject) => self.addTask(
      typeof fn === 'string' ? fn : fn.toString(),
      options.data || {},
      resolve,
      reject
    ));
  }
}

module.exports = new CryptoWorker();
