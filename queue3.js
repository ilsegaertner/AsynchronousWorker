class Queue {
  constructor(workerFn, maxConcurrentTasks) {
    this.workerFn = workerFn;
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.taskQueue = [];
    this.runningTasks = 0;
    this.isPaused = false;
  }

  limitConcurrentTasks() {
    return this.runningTasks < this.maxConcurrentTasks;
  }

  push(task, callback, priority = 1) {
    this.taskQueue.push({ task, callback, priority });
    this.taskQueue.sort((a, b) => b.priority - a.priority);
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
    const { task, callback, priority } = this.taskQueue.shift();
    try {
      this.runningTasks += 1;
      await this.workerFn(task);
      if (callback) callback(task);
    } catch (error) {
      console.error(error.message);
    } finally {
      this.runningTasks -= 1;
      this.taskQueue.sort((a, b) => b.priority - a.priority);
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
  const queue = new Queue(async (x) => {
    const duration = Math.random() * 1000 * x;
    await new Promise((r) => setTimeout(r, duration));
    console.log(`${x} waited for ${duration} ms`);
  }, 3);

  queue.push(10);
  queue.push(9);
  queue.push(8);
  queue.push(7, () => {
    console.log("this was task 7");
  });
  queue.push(6);
  queue.push(
    5,
    () => {
      console.log("This is task 5");
    },
    9
  );
  queue.push(
    4,
    () => {
      console.log("This is task 4");
    },
    3
  );
  queue.push(3);
  queue.push(2);
  queue.push(1);

  await queue.waitForAll();
  console.log("All done!");
}

main();
