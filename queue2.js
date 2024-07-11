class Queue {
  constructor(workerFunction, maxConcurrentTasks) {
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.taskQueue = [];
    this.runningTasks = 0;
    this.isPaused = false;
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
    this.runningTasks += 1; // shorthand way of writing this.runningTasks = this.runningTasks + 1
    this.workerFunction(task).then(() => {
      // processing the task
      this.runningTasks -= 1;
      this.processTasks(); //  ensures that as soon as one task finishes, the next task can start, maintaining a continuous flow of task processing within the constraints.
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
          setTimeout(checkIfDone, 100); // creating a polling mechanism
        }
      };
      checkIfDone();
    });
  }
}

async function main() {
  // Create a queue for an asynch worker function with 3 concurrent workers
  const queue = new Queue(async (x) => {
    const duration = Math.random() * 1000 * x;
    await new Promise((resolve) => setTimeout(resolve, duration));
    console.log(`${x} waited for ${duration}ms`);
  }, 3);
}

queue.push(2);
queue.push(3);
queue.push(4);
queue.push(5);
queue.push(6);

await queue.waitForAll();
console.log("All done");

main();
