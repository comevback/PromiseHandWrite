new Promise((resolve, reject) => {
    console.log(1);
    resolve(2);
}).then((data) => {console.log(data);});

console.log(3);

/*
当这段代码执行时，其运行顺序如下：

创建 Promise 对象： new Promise((resolve, reject) => {...}) 创建一个新的 Promise 对象。这时，传入的执行器函数 (resolve, reject) => {...} 会立即执行。

执行器函数执行： 执行器函数开始执行，打印出 1。

调用 resolve 函数： 在执行器函数内部，调用 resolve(2)。这将会把 Promise 的状态从 "pending"（待定）变为 "fulfilled"（已完成），并且设置 Promise 的结果值为 2。

执行同步代码： 执行器函数执行完毕后，继续执行同步代码，打印出 3。

处理 Promise 的解决状态： 事件循环继续运行，并检查微任务队列。因为 Promise 已经解决了，所以 .then((data) => {console.log(data);}) 中的回调函数会被放入微任务队列。

执行 .then() 中的回调函数： 一旦当前的执行栈为空（即所有同步代码执行完毕），事件循环会从微任务队列中取出 .then() 的回调函数并执行它。这时，会打印出 Promise 的结果值 2。

因此，这段代码的输出顺序将是：

1
3
2

首先打印 1（Promise 执行器内的同步代码），然后打印 3（Promise 外的同步代码），最后打印 2（Promise 解决后的异步回调）。
*/