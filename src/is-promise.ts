export function isPromise<T>(p: unknown): p is Promise<T> {
  return (
    !!p &&
    (typeof p === 'object' || typeof p === 'function') &&
    typeof (p as Promise<T>).then === 'function'
  );
}
