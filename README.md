# Asynchronous Worker Queue

## Overview

This project provides an in-memory queue for managing asynchronous tasks with a specified maximum number of concurrent workers. The queue ensures that the maximum number of concurrent tasks is respected and provides additional functionalities such as pausing, resuming, and handling task completion callbacks.

## Main Features

- **Asynchronous Worker Function**: The queue processes tasks using an async worker function.
- **Concurrency Control**: Set a maximum number of concurrent tasks.
- **Pause/Resume Functionality**: Ability to pause and resume the processing of tasks.
- **Task Completion Callbacks**: Optional callback functions can be specified for task completion.
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
