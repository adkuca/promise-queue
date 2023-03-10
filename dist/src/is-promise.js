export function isPromise(p) {
    return (!!p &&
        (typeof p === 'object' || typeof p === 'function') &&
        typeof p.then === 'function');
}
//# sourceMappingURL=is-promise.js.map