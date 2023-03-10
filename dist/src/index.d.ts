type Task<T> = Promise<T> | (() => T | Promise<T>);
export declare class Queue {
    readonly concurrency: number;
    private _pendingQueue;
    private _runningQueue;
    private isTaskExecutionScheduled;
    running: boolean;
    constructor(concurrency: number);
    get pendingCount(): number;
    get runningCount(): number;
    private static _createQueueTask;
    enqueue<T>(task: Task<T>): Promise<T>;
    private _scheduleRunPendingTasksUpToConcurrencyLimit;
    private _runPendingTasksUpToConcurrencyLimit;
    private handleTaskExecution;
}
export {};
