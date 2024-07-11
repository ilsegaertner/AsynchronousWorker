class Queue {
  constructor(maxConcurrentTasks) {
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.taskQueue = [];
    this.runningTasks = 0;
    this.isPaused = false;
    this.hasError = false;
  }

  limitConcurrentTasks() {
    return this.runningTasks < this.maxConcurrentTasks;
  }

  async workerFunction(task) {
    const randomTime = Math.random() * 1000;
    await new Promise((resolve, reject) => {
      if (!this.hasError) {
        setTimeout(resolve, randomTime);
      } else {
        reject(new Error("task encountered an error"));
      }
    });
    console.log(`${task} waited for ${randomTime}`);
  }

  push(task) {
    this.taskQueue.push(task);
    this.processTasks();
  }

  async processTasks() {
    if (
      this.isPaused ||
      !this.limitConcurrentTasks() ||
      this.taskQueue.length <= 0
    ) {
      return;
    }
    const task = this.taskQueue.shift();
    this.runningTasks += 1;
    this.workerFunction(task)
      .then(() => {
        this.runningTasks -= 1;
        this.processTasks();
      })
      .catch((error) => {
        console.error(`Error in processing task: ${error.message}`);
        this.runningTasks -= 1;
        this.processTasks();
      });
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.processTasks();
  }

  waitForAll() {
    return new Promise((resolve, reject) => {
      const checkIfDone = () => {
        if (this.taskQueue.length === 0 && this.runningTasks === 0) {
          resolve();
        } else {
          setTimeout(checkIfDone, 100);
        }
      };
      checkIfDone();
    });
  }
}

const queue = new Queue(3);

queue.push(2);
queue.push(3);
queue.push(4);
queue.push(5);
queue.push(6);

queue.waitForAll().then(() => {
  console.log("All done");
});
