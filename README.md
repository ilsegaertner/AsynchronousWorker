# Asynchronous Worker Queue

## Overview

This small challenge involved the creation of an in-memory queue for managing asynchronous tasks with a specified maximum number of concurrent workers. The queue ensures that the maximum number of concurrent tasks is respected and provides additional functionalities such as pausing, resuming, and handling task completion callbacks.

## Main Features

- **Asynchronous Worker Function**: The queue processes tasks using an async worker function. The `push()` method adds tasks to the queue and calls the worker function at some point in the future.
- **Concurrency Control**: Set a maximum number of concurrent tasks.
- **Wait for Completion**: An async function to wait until all tasks are processed.

## Additional Goals

- **Pause/Resume Functionality**: Ability to pause and resume the queue from starting new tasks.
- **Task Completion Callbacks**: Optional callback function to the `push()` method which will be called after the task finished successfully.
- **Other functionalities**: Which other functionalities could be useful?

## Recollections, Challenges and Solutions

#### Understanding the Problem

To understand the problem correctly, I investigated and researched on queue mechanisms to understand best practices for queues.

#### Gathering Requirements and Methods

- **Concurrency Control** Identified the need for a method to control the number of concurrent tasks (`limitConcurrentTasks`).
- **Parameter Defintion** Defined `maxConcurrentTasks` as parameter for use in the `async main()` function (The second paramter `workerFunction` was added later on).

#### Decision Making and Implementation

- Established a `taskQueue` array to hold tasks and a `runningTasks` variable to track active tasks.
- **LimitConcurrentTasks():** Implemented `limitConcurrentTasks` to check if the number of running tasks is within the limit:

  ```javascript
  limitConcurrentTasks() {
  return this.runningTasks < this.maxConcurrentTasks;
  }
  ```

- **Push Method:** Created `push()` to add tasks to the queue (`taskQueue`) and initiate task processing `processTasks()`:

  ```javascript
  push(task) {
  this.taskQueue.push(task);
  this.processTasks();
  }
  ```

- **Task Processing:** Developed `processTasks()`:

  - Ensured the method runs only if the queue is not empty, not paused and the concurrency limit is not exceeded.
  - Destructured the task from the queue, added it to `runningTasks`, executed the worker function, removed it from `runningTasks`, and processed the next task.

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

## Reflections and Learnings

Completing the backend task was a fun and rich experience, in which I strengthened my skills of how to think asynchronous problems in code.

**Additional Goals:**

1. **Pause and Resume:** Implemented by setting a flag.
2. **Optional Callback:** Added to the `push` method and processed in `processTasks()`:
   - In `push(task, callback)`:
     ```javascript
     push(task, callback, priority = 1) {
       this.taskQueue.push({ task, callback, priority });
       this.processTasks();
     }
     ```
   - In `processTasks()`:
     ```javascript
     const { task, callback, priority } = this.taskQueue.shift();
     ```
3. **Additional functionality**

- **Task Priority:** Add a task priority to allow certain tasks to be processed before others. Managed by including a `priority` parameter in the `push` method and sorting the queue:

  - In `push(task, callback, priority = 1)`:

  ```javascript
    push(task, callback, priority = 1) {
    this.taskQueue.push({ task, callback, priority });
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    this.processTasks();
    }
  ```

  - In `processTasks()`:

  ```javascript
  const { task, callback, priority } = this.taskQueue.shift();
  ```

  Sorting again after processing:
  In `processTasks()`:

  ```javascript
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
  ```

- **Cancellation method:** Another useful functionality would be a cancellation method to stop tasks, e.g. after taking a specific amount of time.

Completing this backend task was a valuable learning experience, enhancing my skills in handling asynchronous programming challenges.
