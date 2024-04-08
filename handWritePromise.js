class MyPromise{
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    constructor(funct){
        this.status = MyPromise.Pending;
        this.result = null;
        this.callbacks = [];

        const resolve = (data) => {
            setTimeout(() => {
                if(this.status === MyPromise.Pending){
                    this.status = MyPromise.FulFilled;
                    this.result = data;
                    this.callbacks.forEach(callback => {
                        callback.onFulFilledFunc(this.result);
                    });
                }
            }, 0)
        }

        const reject = (data) => {
            setTimeout(() => {
                if(this.status === MyPromise.Pending){
                    this.status = MyPromise.Rejected;
                    this.result = data;
                    this.callbacks.forEach(callback => {
                        callback.onRejectedFunc(this.result);
                    })
                }
            }, 0)
        }

        try{
            funct(resolve, reject);
        }catch(error){
            reject(error);
        }
    }

    then = (onFulFilledFunc, onRejectedFunc) => {
        
        return new MyPromise((resolve, reject) => {

            const handleCallback = (callback, value) => {
                setTimeout(() => {
                    try{
                        const result = callback(value);
                        if(result instanceof MyPromise){
                            result.then(resolve, reject);
                        }else{
                            resolve(result);
                        }
                    }catch(err){
                        reject(err);
                    }
                }, 0)
            }

            onFulFilledFunc = typeof onFulFilledFunc === 'function' ? onFulFilledFunc : () => {};
            onRejectedFunc = typeof onRejectedFunc === 'function' ? onRejectedFunc : () => {};

            if(this.status === MyPromise.Pending){
                this.callbacks.push({
                    onFulFilledFunc : value => handleCallback(onFulFilledFunc, this.result), 
                    onRejectedFunc : error => handleCallback(onRejectedFunc, this.result)
                });
            }
            if(this.status === MyPromise.FulFilled){
                handleCallback(onFulFilledFunc, this.result);
            }
            if(this.status === MyPromise.Rejected){
                handleCallback(onRejectedFunc, this.result);
            }
        })
    }

    catch = (onRejectedFunc) => {
        return this.then(null, onRejectedFunc);
    }
}

console.log(1);

const myInstance = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        console.log(2);
        reject('resolved');
    }, 500);
});

myInstance.then(
    (result) => {
        console.log('then:', result);
        return 'result from then';
    },
    (result) => {
        console.log('catch:', result);
        return 'result from then';
    }
).then(
    (result) => {
        console.log('then2:', result);
        return 'result from then2';
    }
).then(
    (result) => {
        console.log('then3:', result);
        throw new Error ('error2');
    }
).then(
    (result) => {
        console.log('then:', result);
        return 'result from then';
    },
    (result) => {
        console.log('catch2:', result);
        return 'result from then';
    }
)


console.log(3);

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