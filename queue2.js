class Queue {
  constructor(maxConcurrentTasks) {
    this.maxConcurrentTasks = maxConcurrentTasks;
    this.taskQueue = [];
    this.runningTasks = 0;
    this.isPaused = false;
  }

  limitConcurrentTasks() {
    return this.runningTasks < this.maxConcurrentTasks;
  }

  async workerFunction(task) {
    const randomTime = Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, randomTime)); // setTimeout is asynchronous. doesnt block the rest of the code
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

const queue = new Queue(3);

queue.push(2);
queue.push(3);
queue.push(4);
queue.push(5);
queue.push(6);

queue.waitForAll().then(() => {
  console.log("All done");
});
