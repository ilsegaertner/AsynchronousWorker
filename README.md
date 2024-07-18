# Asynchronous Worker Queue

## Overview

This small challenge involved the creation of an in-memory queue for managing asynchronous tasks with a specified maximum number of concurrent workers. The queue ensures that the maximum number of concurrent tasks is respected and provides additional functionalities such as pausing, resuming, and handling task completion callbacks.

## Main Features

- **Asynchronous Worker Function**: The queue processes tasks using an async worker function. The `push()` method adds tasks to the queue and calls the worker function at some point in the future.
- **Concurrency Control**: Set a maximum number of concurrent tasks.
- **Wait for Completion**: An async function to wait until all tasks are processed.

## Additional Requirements

- **Pause/Resume Functionality**: Ability to pause and resume the queue from starting new tasks.
- **Task Completion Callbacks**: Optional callback function to the `push()` method which will be called after the task finished successfully.

### Recollections, Challenges and Solutions

#### Understanding the Problem

To understand the problem correctly, I investigated and researched on queue mechanisms to understand best practices for queues.

#### Gathering Requirements and Methods

- Decision for creating the queue with a class due to flexibility.
- Identified the need for a method to control the number of concurrent tasks (`limitConcurrentTasks`).
- Defined `maxConcurrentTasks` as parameter for use in the `async main()` function (added `workerFunction` as a parameter later).

#### Decision Making and Implementation

In the next step the methods were written from simple to more advanced

- Established a `taskQueue` array to hold tasks and a `runningTasks` variable to track active tasks.
- Implemented `limitConcurrentTasks` to check if the number of running tasks is within the limit:
- Created `push()` to add tasks to the queue (`taskQueue`) and initiate task processing `processTasks()`:

- **Pause and Resume**: Implemented methods to control the queue's ability to start new tasks with `isPaused` flag:

  ```javascript
  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.processTasks();
  }
  ```

- Developed `processTasks()`:

  - Ensured the method runs only if the queue is not empty, not paused and the concurrency limit is not exceeded.
  - Destructured the task from the queue, added it to `runningTasks`, executed the worker function, removed it from `runningTasks`, and processed the next task.

- Created `waitForAll()` using a continuous `checkIfDone` promise to check if all tasks are completed:

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

- Integrated the sample usage provided, structured the `main()` function to initialize the worker function(included the worker function as a parameter), and added tasks using the `push()` method:

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

- **Additional Goals:**

  1. Implementing the pause() and resume() methods was straightforward and achieved with setting a flag.
  2. The optional callback was achieved through adding it to the push method: `push(task, callback) { this.taskQueue.push({ task, callback, priority });`

  and

  processTasks():
  `const { task, callback } = this.taskQueue.shift();`

- **Challenges**: Managing concurrency limits and implementing robust error handling.
- **Improvements**: Refined task sorting for priority handling and adjusted error-handling strategies.
- **Learnings**: Enhanced understanding of asynchronous programming and concurrency control, improved skills in designing robust, maintainable code.

```

```
