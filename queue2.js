class Queue {
  constructor(workerFunction, maxConcurrentTasks) {
    this.workerFunction = workerFunction;
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.taskQueue = [];
    this.runningTasks = 0;
    this.isPaused = false;
  }

  limitConcurrentTasks() {
    return this.runningTasks < this.maxConcurrentTasks;
  }

  push(task, callback) {
    this.taskQueue.push({ task, callback });
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
    const { task, callback } = this.taskQueue.shift();
    try {
      this.runningTasks += 1;
      await this.workerFunction(task);
      if (callback) callback();
    } catch {
      (error) => {
        console.error(error.message);
      };
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

async function main() {
  const queue = new Queue(async (x) => {
    const duration = Math.random() * 1000 * x;
    await new Promise((resolve) => setTimeout(resolve, duration));
    console.log(`${x} waited for ${duration}ms`);
  }, 3);

  queue.push(10);
  queue.push(9);
  queue.push(8);
  queue.push(7, () => {
    console.log("this was the beautiful task 7");
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
