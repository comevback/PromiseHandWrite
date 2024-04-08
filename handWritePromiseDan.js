class MyPromise{

    // set the status of the promise
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    // constructor, is called when a new instance of the class is created.
    // func is the executor function, which is called immediately when the promise is created.
    constructor(func){
        this.status = MyPromise.Pending;
        this.result = null;
        // callbacks is an array to store the callback functions
        this.callbacks = [];
        try{
            func(this.resolve, this.reject);
        }catch(error){
            this.reject(error);
        }
    }

    // function of the instance to resolve the promise
    resolve = (result) => {
        setTimeout(() => {
            this.status = MyPromise.FulFilled;
            this.result = result;
            // call the callback function
            this.callbacks.forEach(callback => {
                callback.onFulFilledFunc(this.result);
            });
        }, 0)
    }

    // function of the instance to reject the promise
    reject = (result) => {
        setTimeout(() => {
            this.status = MyPromise.Rejected;
            this.result = result;
            // call the callback function
            this.callbacks.forEach(callback => {
                callback.onRejectedFunc(this.result);
            });
        }, 0)
        
    }

    // then function to handle the promise
    then = (onFulFilledFunc, onRejectedFunc) => {
        return new MyPromise((resolve, reject) => {

            const handleCallback = (callback, value) => {
                setTimeout(() => {
                    try{
                        const res = callback(value);
                        if(res instanceof MyPromise){
                            res.then(resolve, reject);
                        }else{
                            resolve(res);
                        }
                    }catch(err){
                        reject(err);
                    }
                }, 0);
            }    

            if (this.status === MyPromise.FulFilled) {
                handleCallback(onFulFilledFunc, this.result);
            }
            if (this.status === MyPromise.Rejected) {
                handleCallback(onRejectedFunc, this.result);
            }else if(this.status === MyPromise.Pending){
                // if the promise is pending, push the callback functions to the callbacks array
                this.callbacks.push({
                    onFulFilledFunc : value => handleCallback(onFulFilledFunc, value), 
                    onRejectedFunc : err => handleCallback(onRejectedFunc, err)
                });
            }
        });
    }

    catch = (onRejectedFunc) => {
        return this.then(null, onRejectedFunc);
    }

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