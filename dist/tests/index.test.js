import chai, { assert } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { Queue } from '../src/index.js';
chai.use(deepEqualInAnyOrder);
chai.use(chaiAsPromised);
const syncTask = () => 'syncTask result';
const asyncTask = () => new Promise((resolve) => setTimeout(() => resolve('asyncTask result'), 0));
const promiseTask = new Promise((resolve) => setTimeout(() => resolve('promiseTask result'), 0));
suite('Queue', function () {
    test('should throw an error for invalid concurrency value', function () {
        assert.throws(() => void new Queue(2.5));
        assert.throws(() => void new Queue(-3));
    });
    test('should accept valid values for concurrency', function () {
        assert.doesNotThrow(() => void new Queue(3));
        assert.doesNotThrow(() => void new Queue(Number.POSITIVE_INFINITY));
    });
    suite('enqueue()', function () {
        let queue;
        setup(function () {
            queue = new Queue(3);
        });
        test('should be a method of Queue', function () {
            assert.property(Queue.prototype, 'enqueue');
            assert.isFunction(Reflect.get(Queue.prototype, 'enqueue'));
        });
        test('should accept a function as the first parameter', function () {
            assert.doesNotThrow(() => void queue.enqueue(syncTask));
            assert.doesNotThrow(() => void queue.enqueue(asyncTask));
        });
        test('should accept a promise as the first parameter', function () {
            assert.doesNotThrow(() => void queue.enqueue(promiseTask));
        });
        test('should throw an error if first parameter is not a function or a promise', function () {
            for (const value of [undefined, null, 'string', true, 1, [], {}, true]) {
                assert.throws(() => void queue.enqueue(value));
            }
        });
        test('should add task to queue', function () {
            assert.strictEqual(queue.pendingCount, 0);
            assert.strictEqual(queue.runningCount, 0);
            void queue.enqueue(syncTask);
            assert.strictEqual(queue.pendingCount, 1);
            assert.strictEqual(queue.runningCount, 0);
            void queue.enqueue(asyncTask);
            assert.strictEqual(queue.pendingCount, 2);
            assert.strictEqual(queue.runningCount, 0);
            void queue.enqueue(promiseTask);
            assert.strictEqual(queue.pendingCount, 3);
            assert.strictEqual(queue.runningCount, 0);
        });
        test('should return a promise', function () {
            const promise1 = queue.enqueue(syncTask);
            const promise2 = queue.enqueue(asyncTask);
            assert.typeOf(promise1, 'promise');
            assert.typeOf(promise2, 'promise');
        });
        test('should return a promise that resolves with the result of the task', function () {
            const syncTaskSpy = sinon.spy(syncTask);
            const asyncTaskSpy = sinon.spy(asyncTask);
            const promiseTaskSpy = sinon.spy(promiseTask);
            const syncTaskResultPromise = queue.enqueue(syncTaskSpy);
            const asyncTaskResultPromise = queue.enqueue(asyncTaskSpy);
            const promiseTaskResultPromise = queue.enqueue(promiseTaskSpy);
            const assertedsyncTaskResultPromise = syncTaskResultPromise.then((result) => {
                const syncTaskSpyResult = syncTaskSpy.returnValues[0];
                if (syncTaskSpyResult)
                    assert.strictEqual(result, syncTaskSpyResult);
                else
                    throw new Error('syncTaskSpyResult should exist');
                return result;
            });
            const assertedAsyncTaskResultPromise = asyncTaskResultPromise.then((result) => {
                const asyncTaskSpyResultPromise = asyncTaskSpy.returnValues[0];
                if (asyncTaskSpyResultPromise)
                    return asyncTaskSpyResultPromise.then((asyncTaskSpyResult) => {
                        assert.strictEqual(result, asyncTaskSpyResult);
                        return asyncTaskSpyResult;
                    });
                throw new Error('asyncTaskSpyResultPromise should exist');
            });
            const assertedPromiseTaskResultPromise = promiseTaskResultPromise.then((result) => {
                return promiseTaskSpy.then((promiseTaskSpyResult) => {
                    assert.strictEqual(result, promiseTaskSpyResult);
                    return promiseTaskSpyResult;
                });
            });
            return Promise.all([
                assertedsyncTaskResultPromise,
                assertedAsyncTaskResultPromise,
                assertedPromiseTaskResultPromise,
            ]);
        });
    });
});
//# sourceMappingURL=index.test.js.map