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
    if (task.isCancelled) {
      this.processTasks();
      return;
    }

    try {
      this.runningTasks += 1;
      await this.workerFunction(task.taskData);
      if (task.callback) task.callback();
    } catch (error) {
      console.error(`Error processing task ${task.id}: ${error.message}`);
      if (task.retries < this.retryLimit) {
        console.log(
          `retrying task ${task.id} (${task.retries + 1}/${this.retryLimit})`
        );
        task.retries += 1;
        this.push(task);
      } else {
        console.error(
          `Task ${task.id} failed after ${this.retryLimit} retries.`
        );
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

  cancelQueuedTask(taskId) {
    if (this.taskQueue.length > 0) {
      this.taskQueue.forEach((task) => {
        if (task.id === taskId) {
          task.isCancelled = true;
        }
      });
    }
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

  queue.push(
    new Task(1, 10, () => {
      console.log("this was task 1");
    }),
    7
  );

  queue.push(new Task(2, 2));
  queue.push(new Task(3, 5, null, 5));
  queue.push(
    new Task(4, 9, () => {
      console.log("task 4");
    }),
    9
  );
  queue.push(new Task(5, 4));

  await queue.waitForAll();
  console.log("All done");
}

main();
