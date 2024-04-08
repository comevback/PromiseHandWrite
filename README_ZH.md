# A practice of Promise in Javascript

[English Version](./README.md)
[日本語版](./README_JP.md)

[完整实现程序](./PromiseHandWrite.js)

---

## 事件循环与异步

> 单线程的主线程是需要异步的原因，以实现非阻塞体验。

> 事件循环是异步的实现方式。

浏览器的渲染主线程是单线程的，这意味着它一次只能处理一个任务。
如果有一个我们不知道会花多长时间或者会花很长时间的工作或操作，同步主线程将会被阻塞，这就是为什么在主线程中使用异步的原因，它允许主线程启动一个任务，然后继续执行其他任务，而不用等待第一个任务完成。

异步是通过事件循环实现的，它是一个无尽的for循环，不断检查消息队列（Message queue）中是否有任何工作，当有工作时，事件循环会将其移至调用栈（Call Stack），然后由主线程处理。

当你执行一个异步操作时，比如用'fetch'从服务器请求数据，用'setTimeout'设置计时器，或者使用promises，你通常会提供一个回调函数。这个回调函数将被放置到某个消息队列中。

在JS中，有很多种消息队列。优先级最高的队列始终是Microtask队列。

# 手写Promise




[完整代码](./PromiseHandWrite.js)

```javascript
class MyPromise {
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    constructor(executor) {
        this.status = MyPromise.Pending; // 初始状态为 pending
        this.value = null; // 用于存储 resolve 或 reject 传递的值
        this.callbacks = []; // 用于存储 then 方法注册的回调

        try {
            executor(this.resolve, this.reject); // 执行 executor，并传入 resolve 和 reject 方法
        } catch (err) {
            this.reject(err); // 如果 executor 执行出错，直接 reject
        }
    }

    // 私有方法，用于改变状态并执行相应的回调
    #changeStatus = (status, value) => {
        setTimeout(() => { // 使用 setTimeout 确保异步执行
            if (this.status === MyPromise.Pending) { // 状态只能从 pending 改变
                this.status = status; // 改变状态
                this.value = value; // 保存值
                this.callbacks.forEach((callback) => { // 执行所有回调
                    if (status === MyPromise.FulFilled) {
                        callback.onFulFilled(this.value);
                    } else if (status === MyPromise.Rejected) {
                        callback.onRejected(this.value);
                    }
                });
            }
        }, 0);
    };

    // resolve 方法
    resolve = (data) => {
        this.#changeStatus(MyPromise.FulFilled, data);
    };

    // reject 方法
    reject = (data) => {
        this.#changeStatus(MyPromise.Rejected, data);
    };

    // then 方法
    then = (onFulFilled, onRejected) => {
        return new MyPromise((resolve, reject) => {
            // 为了链式调用，需要保证 onFulFilled 和 onRejected 总是返回值
            onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : (value) => { return value; };
            onRejected = typeof onRejected === 'function' ? onRejected : (err) => { throw new Error(err); };

            // 用于处理回调的函数
            const handleCallback = (callback, value) => {
                setTimeout(() => {
                    try {
                        const result = callback(value); // 执行回调
                        if (result instanceof MyPromise) { // 如果回调返回的是 MyPromise 实例，等待其解决
                            result.then(resolve, reject);
                        } else {
                            resolve(result); // 否则直接 resolve 结果
                        }
                    } catch (err) {
                        reject(err); // 如果回调执行出错，直接 reject
                    }
                }, 0);
            };

            // 根据当前状态执行相应操作
            if (this.status === MyPromise.Pending) {
                this.callbacks.push({
                    onFulFilled: value => handleCallback(onFulFilled, value),
                    onRejected: err => handleCallback(onRejected, err)
                });
            } else if (this.status === MyPromise.FulFilled) {
                handleCallback(onFulFilled, this.value);
            } else if (this.status === MyPromise.Rejected) {
                handleCallback(onRejected, this.value);
            }
        });
    };

    // catch 方法
    catch(onRejected) {
        return this.then(null, onRejected); // 调用 then 方法处理拒绝的情况,必须加上return，如果不加，这个catch函数就会返回undefined，而不是then(null,onRejected)的结果MyPromise。
    }
}

```


## 生成实例，链式调用时的顺序：

### then是在前一个Promise被解决（resolve或reject）时才会触发
***当第一个 then 中的回调函数被加入到微任务队列中时，它会等待 MyInstance Promise 解决后才会执行。在这个回调函数执行期间，如果它返回了一个新的 Promise（比如在您的示例中返回了一个新的 MyPromise 实例），那么第二个 then 中的回调函数会等待这个新的 Promise 解决后才会被加入到微任务队列中。***

---

**执行then时，假设异步，前一个Promise还没有resolve或reject，状态还是Pending，此时先把onFulFilled和onRejected函数加入callbacks队列**
```js
if (this.status === MyPromise.Pending) {
    this.callbacks.push({
        onFulFilled: value => handleCallback(onFulFilled, value),
        onRejected: err => handleCallback(onRejected, err)
    });
}
```

===>**前一个Promise完成异步操作，状态变为FulFilled或Rejected之后，resolve或者reject也被执行**

```js
resolve = (data) => {
    this.#changeStatus(MyPromise.FulFilled, data);
};
```
===>**resolve和reject会调用#changeStatus方法,changeStatus方法里的setTimeout会异步执行里面的步骤**
```js
#changeStatus = (status, value) => {
    setTimeout(() => { // 使用 setTimeout 确保异步执行
        if (this.status === MyPromise.Pending) { // 状态只能从 pending 改变
            this.status = status; // 改变状态
            this.value = value; // 保存值
            this.callbacks.forEach((callback) => { // 执行所有回调
                if (status === MyPromise.FulFilled) {
                    callback.onFulFilled(this.value); // 如果是resolve执行这个，转到 value => handleCallback(onFulFilled, value)
                } else if (status === MyPromise.Rejected) {
                    callback.onRejected(this.value); // 如果是reject执行这个，转到 err => handleCallback(onRejected, err)
                }
            });
        }
    }, 0);
};
```
===>**因为之前在callbacks队列里加入了**

```js
{
    onFulFilled: value => handleCallback(onFulFilled, value),
    onRejected: err => handleCallback(onRejected, err)
}
```

**所以这时候执行的是**

```js
value => handleCallback(onFulFilled, value)
err => handleCallback(onRejected, err)
```

===>**此时回到handleCallback方法，异步执行resolve或者reject，如果callback代表的onFulFilled或onRejected返回的是一个Promise实例，等待这个实例resolve或reject。**

```js
const handleCallback = (callback, value) => {
    setTimeout(() => {
        try {
            const result = callback(value); // 执行回调
            if (result instanceof MyPromise) { // 如果回调返回的是 MyPromise 实例，等待其解决
                result.then(resolve, reject);
            } else {
                resolve(result); // 否则直接 resolve 结果
            }
        } catch (err) {
            reject(err); // 如果回调执行出错，直接 reject
        }
    }, 0);
};
```


### 简单总结：

1. then方法调用：当 .then() 被调用时，它会检查 Promise 的状态。如果状态是 Pending，则将回调函数（onFulfilled 和 onRejected）添加到回调队列中等待执行。

2. Promise 解决：当 Promise 的异步操作完成后，会调用 resolve 或 reject 方法来改变 Promise 的状态（Fulfilled 或 Rejected）并设置结果值。

3. 执行回调：改变状态后，会异步执行回调队列中的回调函数。这是通过 setTimeout 实现的，以确保它们在当前执行栈完成后才运行。

4. 链式调用：如果 .then() 中的回调函数返回一个新的 Promise（result），则下一个 .then() 中的回调会等待这个新 Promise 解决后才执行。如果回调返回一个非 Promise 值，或者没有返回值，则直接将该值作为下一个 .then() 的输入。

5. 错误处理：如果在执行回调过程中发生错误，或者回调函数返回一个处于 Rejected 状态的 Promise，则会跳到链中最近的一个 .catch() 或 .then() 的 onRejected 回调中处理错误。

---



## then返回的到底是什么

.then() 方法返回的是一个新的 Promise 对象。这个新的 Promise 对象的解决状态（fulfilled 或 rejected）和值取决于 .then() 方法中传入的回调函数的执行结果

```js
// then 方法
then = (onFulFilled, onRejected) => {
    return new MyPromise((resolve, reject) => { // <== 返回这个新Promise对象，新Promise的状态取决于回调函数（onFulFilled或onRejected）的执行结果
    // ...其他代码
```


#### 1. 回调函数返回一个值

如果回调函数返回一个值（不是 Promise），那么新的 Promise 对象会被解决（fulfilled）并且带有该返回值。

```javascript
let promise = new Promise((resolve, reject) => {
    resolve(10);
});

promise
    .then((result) => {
        console.log(result); // 输出：10
        return result * 2;   // 返回一个值
    })
    .then((result) => {
        console.log(result); // 输出：20
    });
```
在这个例子中，第一个 .then() 返回的是一个值 20，因此第二个 .then() 接收到的 result 是 20。

#### 2. 回调函数抛出一个错误

如果回调函数抛出一个错误，那么新的 Promise 对象会被拒绝（rejected）并且带有该错误作为原因。

```js
let promise = new Promise((resolve, reject) => {
    resolve(10);
});

promise
    .then((result) => {
        throw new Error('Something went wrong'); // 抛出一个错误
    })
    .catch((error) => {
        console.error(error.message); // 输出："Something went wrong"
    });
```
在这个例子中，第一个 .then() 抛出了一个错误，所以接下来的 .catch() 捕获到了这个错误。

#### 3. 回调函数返回另一个 Promise 对象

如果回调函数返回另一个 Promise 对象，那么新的 Promise 对象将会"跟随"这个返回的 Promise。也就是说，新 Promise 的状态和值会和返回的 Promise 相同。

```javascript
let promise = new Promise((resolve, reject) => {
    resolve(10);
});

promise
    .then((result) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(result * 2); // 返回一个 Promise
            }, 1000);
        });
    })
    .then((result) => {
        console.log(result); // 输出：20（在1秒后）
    });
```
在这个例子中，第一个 .then() 返回了一个新的 Promise 对象。这个新的 Promise 在 1 秒后被解决，并且其值是 20。因此，第二个 .then() 中的 result 是 20，并且它的执行会在前一个 Promise 解决后才开始。