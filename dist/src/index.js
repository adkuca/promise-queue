import assert from 'node:assert';
import { Deferred } from './deferred.js';
import { isPromise } from './is-promise.js';
export class Queue {
    concurrency;
    _pendingQueue = [];
    _runningQueue = [];
    isTaskExecutionScheduled = false;
    running = false;
    constructor(concurrency) {
        assert(Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY, 'Concurrency must be a positive integer or positive infinity');
        assert(concurrency > 0, 'Concurrency must be greater than zero');
        this.concurrency = concurrency;
    }
    get pendingCount() {
        return this._pendingQueue.length;
    }
    get runningCount() {
        return this._runningQueue.length;
    }
    static _createQueueTask(task) {
        const queueTask = {
            asyncFn: () => (isPromise(task) ? task : Promise.resolve(task())),
            deferred: new Deferred(),
        };
        return queueTask;
    }
    enqueue(task) {
        assert(isPromise(task) || typeof task === 'function', 'task must be a promise or a function');
        const queueTask = Queue._createQueueTask(task);
        this._pendingQueue.push(queueTask);
        this._scheduleRunPendingTasksUpToConcurrencyLimit();
        return queueTask.deferred.promise;
    }
    _scheduleRunPendingTasksUpToConcurrencyLimit() {
        if (this.isTaskExecutionScheduled)
            return;
        this.isTaskExecutionScheduled = true;
        queueMicrotask(() => {
            this.isTaskExecutionScheduled = false;
            this._runPendingTasksUpToConcurrencyLimit();
        });
    }
    _runPendingTasksUpToConcurrencyLimit() {
        assert(this.runningCount >= 0 && this.runningCount <= this.concurrency, 'Invalid Queue state');
        if (this.runningCount === this.concurrency)
            return;
        const queueTask = this._pendingQueue.shift();
        if (!queueTask)
            return;
        this.handleTaskExecution(queueTask);
        this._runPendingTasksUpToConcurrencyLimit();
    }
    handleTaskExecution(queueTask) {
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
//# sourceMappingURL=index.js.map