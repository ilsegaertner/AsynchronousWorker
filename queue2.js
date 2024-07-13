class Task {
  constructor(id, taskData, callback = null, retries = 4) {
    (this.id = id),
      (this.taskData = taskData),
      (this.callback = callback),
      (this.retries = retries);
    this.isCancelled = false;
  }
}

const task = new Task();

class Queue {
  constructor(workerFunction, maxConcurrentTasks, retryLimit) {
    this.workerFunction = workerFunction;
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.taskQueue = [];
    this.runningTasks = 0;
    this.isPaused = false;
    this.retryLimit = retryLimit;
    this.cancelQueuedTask = false;
  }

  limitConcurrentTasks() {
    return this.runningTasks < this.maxConcurrentTasks;
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
    try {
      this.runningTasks += 1;
      await this.workerFunction(task);
      if (task.callback) callback();
    } catch (error) {
      console.error(`Error processing task ${task}: ${error.message}`);
      if (retries < this.retryLimit) {
        console.log(
          `retrying task ${task} (${retries + 1}/${this.retryLimit})`
        );
        this.push(task, callback, retries + 1);
      } else {
        console.error(`Task ${task} failed after ${this.retryLimit} retries.`);
      }
    } finally {
      this.runningTasks -= 1;
      this.processTasks();
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.processTasks();
  }

  cancelQueuedTask() {
    if (this.taskQueue) this.cancelQueuedTask = true;
  }

  waitForAll() {
    return new Promise((resolve) => {
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

async function main() {
  const queue = new Queue(
    async (x) => {
      const duration = Math.random() * 1000 * x;
      await new Promise((resolve) => setTimeout(resolve, duration));
      console.log(`${x} waited for ${duration}ms`);
    },
    3,
    4
  );

  queue.push(10);
  queue.push(9);
  queue.push(8);
  queue.push(7, () => {
    console.log("this was task 7");
  });
  queue.push(6);
  queue.push(5);
  queue.push(4);
  queue.push(3);
  queue.push(2);
  queue.push(1);

  await queue.waitForAll();
  console.log("All done");
}

main();
