# Asynchronous Worker Queue

## Overview

This small challenge involved the creation of an in-memory queue for managing asynchronous tasks with a specified maximum number of concurrent workers. The queue ensures that the maximum number of concurrent tasks is respected and provides additional functionalities such as pausing, resuming, and handling task completion callbacks.

## Main Features

- **Asynchronous Worker Function**: The queue processes tasks using an async worker function. The `push()` method adds tasks to the queue and calls the worker function at some point in the future.
- **Concurrency Control**: Set a maximum number of concurrent tasks.
- **Pause/Resume Functionality**: Ability to pause and resume the queue from starting new tasks.
- **Task Completion Callbacks**: Optional callback function to the `push()` method which will be called after the task finished successfully.
- **Wait for Completion**: An async function to wait until all tasks are processed.

## Installation

No installation is required. Just copy the `Queue` class into your project.

## Usage

### Creating a Queue

Create a queue with an async worker function and a specified number of concurrent tasks.

```javascript
const queue = new Queue(async (x) => {
  const duration = Math.random() * 1000 * x;
  await new Promise((r) => setTimeout(r, duration));
  console.log(`${x} waited for ${duration} ms`);
}, 3);
```

### Adding Tasks to the Queue

Add tasks to the queue using the `push()` method. Optionally, specify a callback function and priority.

```javascript
queue.push(10);
queue.push(9);
queue.push(8);
queue.push(7, () => {
  console.log("This was task 7");
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
```

### Waiting for All Tasks to Complete

Use the `waitForAll()` method to wait until all tasks are processed.

```javascript
await queue.waitForAll();
console.log("All done!");
```

### Pausing and Resuming the Queue

Pause the queue to stop starting new tasks and resume it to continue processing.

```javascript
queue.pause();
queue.resume();
```

### Challenges and Solutions

#### Understanding the Problem

- **Research**: Investigated queue mechanisms and asynchronous processing to understand best practices.

#### Gathering Requirements and Methods

- **Concurrency Control**: Identified the need for a method to control the number of concurrent tasks (`limitConcurrentTasks`).
- **Parameter Definition**: Determined essential parameters (`maxConcurrentTasks` and `workerFunction`) for flexibility and functionality.

#### Decision Making and Implementation

- **Parameter Setup**: Defined `maxConcurrentTasks` and `workerFunction` as parameters for use in the `async main()` function.
- **State Management**: Established a `taskQueue` array to hold tasks and a `runningTasks` variable to track active tasks.
- **Concurrency Logic**: Implemented `limitConcurrentTasks` to check if the number of running tasks is within the limit:

  ```javascript
  limitConcurrentTasks() {
    return this.runningTasks < this.maxConcurrentTasks;
  }
  ```

- **Push Method**: Created `push()` to add tasks to the queue and initiate task processing:

  ```javascript
  push(task) {
    this.taskQueue.push(task);
    this.processTasks();
  }
  ```

- **Task Processing**: Developed `processTasks()` to handle task execution while respecting concurrency limits:

  - Ensured the method runs only if the queue is not paused and the concurrency limit is not exceeded.
  - Destructured the task from the queue, added it to `runningTasks`, executed the worker function, removed it from `runningTasks`, and processed the next task.

- **Pause and Resume**: Implemented methods to control the queue's ability to start new tasks:

  ```javascript
  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.processTasks();
  }
  ```

- **Wait for All Tasks**: Created `waitForAll()` using a continuous `checkIfDone` promise to check if all tasks are completed:
  ```javascript
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
  ```

#### Final Steps

- **Refactoring**: Integrated the sample usage provided, structured the `main()` function to initialize the worker function, and added tasks using the `push()` method:

  ```javascript
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
  ```

### Reflections and Learnings

- **Challenges**: Managing concurrency limits and implementing robust error handling.
- **Improvements**: Refined task sorting for priority handling and adjusted error-handling strategies.
- **Learnings**: Enhanced understanding of asynchronous programming and concurrency control, improved skills in designing robust, maintainable code.
