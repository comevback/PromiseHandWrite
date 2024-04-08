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
            this.reject(err); // 如果 executor 执行出错，直接被reject捕获，不会中断整个程序。
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

    // finally 方法（未完成）
    // finally = (onFinally) => {
    //     return this.then(
    //         (value) => {
    //             onFinally();
    //             return value; // 保证 finally 后可以继续链式调用
    //         },
    //         (reason) => {
    //             onFinally();
    //             throw reason; // 保证错误可以继续传递
    //         }
    //     );
    // };
}

// 生成正确的测试实例
const MyInstance = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('this is a test for MyPromise.'); // 异步解决
    }, 1000);
});

MyInstance.then((value) => {
    console.log(`First then: ${value}`);
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve("Second value"); // 返回一个新的 MyPromise 实例
        }, 1000);
    });
})
.then((value) => {
    console.log(`Second then: ${value}`);
    return "Third value"; // 返回一个普通值
})
.then((value) => {
    console.log(`Third then: ${value}`);
    throw new Error("An error occurred"); // 抛出一个错误
})
.catch((error) => {
    console.error(`Catch: ${error.message}`);
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve("Recovered value"); // 错误处理后返回一个新的 MyPromise 实例
        }, 1000);
    });
})
.then((value) => {
    console.log(`Fourth then: ${value}`); // 处理最终结果
});

//生成错误的测试实例，测试构造函数是否能捕获。
const ErrInstance = new MyPromise((resolve, reject) => {
    throw new Error ('error')
});

ErrInstance.catch(
    (data) => {console.log(data)}
);