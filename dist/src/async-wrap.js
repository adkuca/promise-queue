import assert from 'node:assert';
export function asyncWrap(fn) {
    assert(typeof fn === 'function', 'fn must be a function');
    return async (...args) => fn(...args);
}
//# sourceMappingURL=async-wrap.js.map