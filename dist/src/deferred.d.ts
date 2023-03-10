export declare class Deferred<T> {
    private _promise;
    private _resolve;
    private _reject;
    constructor();
    get promise(): Promise<T>;
    get resolve(): (value: T | PromiseLike<T>) => void;
    get reject(): (reason?: unknown) => void;
}
