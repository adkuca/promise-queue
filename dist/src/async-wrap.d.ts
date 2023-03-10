export declare function asyncWrap<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => Promise<R>;
