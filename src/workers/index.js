const workerCode = require('./worker');
const { isNode } = require('../utils');

class BrowserWorker {
  constructor(id, scriptSRC) {
    this.id = id;
    let updatedCode = `var WORKER_ID=${id}; ${workerCode}`;
    if (scriptSRC) updatedCode = `var SCRIPT_SRC="${scriptSRC}"; ${updatedCode}`;
    const blob = new Blob([updatedCode.split("\n").join("\\n")], {type: 'application/javascript'});
    this.worker = new Worker(URL.createObjectURL(blob));
  }
  runTask(task) {
    const id = this.id;
    const { command, options } = task;
    this.worker.postMessage({ command, options, taskId: task.id, id  });
  }
  send(data) { this.worker.postMessage(data); }
  addListener(listener) { this.worker.onmessage = listener; }
}

class WorkerFactory {
  constructor() {
    if (isNode()) return;

    this.workers = {};
    this.tasks = [];
    this.processing = {};
    this.lastTaskId = 1;
    this.scriptSRC = typeof document !== 'undefined' && document.currentScript && document.currentScript.src || '';
    this.maxWorkers = navigator.hardwareConcurrency - 1;

    const self = this;
    setInterval(() => self.checkTasks(), 100);
  }

  createWorker(i) {
    const self = this;
    const worker = new BrowserWorker(i, this.scriptSRC);
    worker.addListener(onMessage);

    function onMessage(msg) {
      const { type, value, id, taskId } = msg.data;
      if (type === 'state') self.workers[id].state = value;
      if (type === 'result') {
        self.workers[id].state = 'idle';
        self.processing[taskId].resolve(value);
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

  addTask(name, options, resolve, reject) {
    const lastId = this.lastTaskId;
    this.tasks.push({
      id: lastId,
      command: name,
      options,
      resolve,
      reject
    });

    this.lastTaskId += 1;
  }

  runTask(command, options) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.addTask(command, options, resolve, reject);
    });
  }
}

module.exports = new WorkerFactory();
