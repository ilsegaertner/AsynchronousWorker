# Asynchronous Worker Queue

## Overview

This project provides an in-memory queue for managing asynchronous tasks with a specified maximum number of concurrent workers. The queue ensures that the maximum number of concurrent tasks is respected and provides additional functionalities such as pausing, resuming, and handling task completion callbacks.

## Main Features

- **Asynchronous Worker Function**: The queue processes tasks using an async worker function.
- **Concurrency Control**: Set a maximum number of concurrent tasks.
- **Pause/Resume Functionality**: Ability to pause and resume the processing of tasks.
- **Task Completion Callbacks**: Optional callback functions can be specified for task completion.
- **Priority Handling**: Tasks can be pushed with a priority to control their order of execution.
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
