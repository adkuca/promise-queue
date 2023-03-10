import assert from 'node:assert';
import { Deferred } from './deferred.js';
import { isPromise } from './is-promise.js';

interface QueueTask<T> {
  asyncFn: () => Promise<T>;
  deferred: Deferred<T>;
}

type Task<T> = Promise<T> | (() => T | Promise<T>);

// eslint-disable-next-line import/prefer-default-export
export class Queue {
  readonly concurrency: number;

  private _pendingQueue: QueueTask<unknown>[] = [];

  private _runningQueue: QueueTask<unknown>[] = [];

  private isTaskExecutionScheduled = false;

  public running = false;

  constructor(concurrency: number) {
    assert(
      Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY,
      'Concurrency must be a positive integer or positive infinity'
    );
    assert(concurrency > 0, 'Concurrency must be greater than zero');
    this.concurrency = concurrency;
  }

  get pendingCount() {
    return this._pendingQueue.length;
  }

  get runningCount() {
    return this._runningQueue.length;
  }

  private static _createQueueTask<T>(task: Task<T>): QueueTask<T> {
    const queueTask: QueueTask<T> = {
      asyncFn: () => (isPromise(task) ? task : Promise.resolve(task())),
      deferred: new Deferred<T>(),
    };

    return queueTask;
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    assert(
      isPromise(task) || typeof task === 'function',
      'task must be a promise or a function'
    );

    // eslint-disable-next-line no-underscore-dangle
    const queueTask = Queue._createQueueTask(task);

    this._pendingQueue.push(queueTask as QueueTask<unknown>);

    this._scheduleRunPendingTasksUpToConcurrencyLimit();

    return queueTask.deferred.promise;
  }

  private _scheduleRunPendingTasksUpToConcurrencyLimit() {
    if (this.isTaskExecutionScheduled) return;

    this.isTaskExecutionScheduled = true;
    queueMicrotask(() => {
      this.isTaskExecutionScheduled = false;
      this._runPendingTasksUpToConcurrencyLimit();
    });
  }

  private _runPendingTasksUpToConcurrencyLimit(): void {
    assert(
      this.runningCount >= 0 && this.runningCount <= this.concurrency,
      'Invalid Queue state'
    );
    if (this.runningCount === this.concurrency) return;

    const queueTask = this._pendingQueue.shift();
    if (!queueTask) return;

    this.handleTaskExecution(queueTask);

    this._runPendingTasksUpToConcurrencyLimit();
  }

  private handleTaskExecution(queueTask: QueueTask<unknown>): void {
    this._runningQueue.push(queueTask);
    queueMicrotask(() => {
      queueTask
        .asyncFn()
        .then((result) => {
          queueTask.deferred.resolve(result);
          return result;
        })
        .catch((error) => {
          queueTask.deferred.reject(error);
        })
        .finally(() => {
          const taskIndex = this._runningQueue.indexOf(queueTask);
          assert(taskIndex !== -1, 'Invalid Queue state');
          this._runningQueue.splice(taskIndex, 1);

          this._scheduleRunPendingTasksUpToConcurrencyLimit();
        })
        .catch((error) => {
          throw error;
        });
    });
  }
}
