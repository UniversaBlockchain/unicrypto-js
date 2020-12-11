const workerCode = require('./worker');

class BrowserWorker {
  constructor(id) {
    this.id = id;
    let updatedCode = `var BASE_URI="${document.baseURI}"; ${workerCode}`;
    updatedCode = `var WORKER_ID=${id}; ${updatedCode}`;
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
    this.workers = {};
    this.tasks = [];
    this.processing = {};
    this.lastTaskId = 1;

    const self = this;
    const cores = navigator.hardwareConcurrency;

    for (let i = 0; i < cores - 1; i++) {
      const worker = new BrowserWorker(i);
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

    setInterval(() => self.checkTasks(), 100);
  }

  checkTasks() {
    const self = this;
    for (let id in self.workers) {
      const worker = self.workers[id];
      if (worker.state === 'idle' && self.tasks.length) {
        const task = self.tasks.shift();
        self.processing[task.id] = task;
        worker.state = 'busy';
        worker.worker.runTask(task);
      }
    }
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
