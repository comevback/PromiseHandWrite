class MyPromise{
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    constructor(executor){
        this.status = MyPromise.Pending;
        this.value = null;
        this.callbacks = [];

        try{
            executor(this.resolve, this.reject);
        }catch(err){
            this.reject(err);
        }
    }

    #changeStatus = (status, value) => {
        setTimeout(() => {
            if(this.status === MyPromise.Pending){
                this.status = status;
                this.value = value;
                this.callbacks.forEach((callback) => {
                    if(status === MyPromise.FulFilled){
                        callback.onFulFilled(this.value);
                    }
                    else if(status === MyPromise.Rejected){
                        callback.onRejected(this.value);
                    }
                })
            }
        }, 0)
    }

    resolve = (data) => {
        this.#changeStatus(MyPromise.FulFilled, data);
    }

    reject = (data) => {
        this.#changeStatus(MyPromise.Rejected, data);
    }


    then = (onFulFilled, onRejected) => {
        return new MyPromise((resolve, reject) => {
            onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : (value) => {value};
            onRejected = typeof onRejected === 'function' ? onRejected : (err) => {throw new Error(err)};

            const handleCallback = (callback, value) => {
                setTimeout(() => {
                    try{
                        const result = callback(value);
                        if(result instanceof MyPromise){
                            result.then(resolve,reject);
                        }else{
                            resolve(result);
                        }
                        
                    }catch(err){
                        reject(err);
                    }
                }, 0);  
            }

            if(this.status === MyPromise.Pending){
                this.callbacks.push({
                    onFulFilled : value => handleCallback(onFulFilled, value),
                    onRejected : err => handleCallback(onRejected, err)
                });
            }
            else if(this.status === MyPromise.FulFilled){
                handleCallback(onFulFilled, this.value);
            }
            else if(this.status === MyPromise.Rejected){
                handleCallback(onRejected, this.value);
            }
        })
    }


    // 必须加上return，如果不加，这个catch函数就会返回undefined，而不是then(null,onRejected)的结果MyPromise。
    catch = (onRejected) => {
        return this.then(null,onRejected);
    }

    // finally = (onFinally) => {
    //     return this.then(
    //         (value) => {
    //             onFinally()
    //         }
    //     )
    // }
}

const MyInstance = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('this is a test for MyPromise.')
    }, 1000)
});

MyInstance.then((value) => {
    console.log(`First then: ${value}`);
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve("Second value");
        }, 1000);
    });
})
.then((value) => {
    console.log(`Second then: ${value}`);
    return "Third value";
})
.then((value) => {
    console.log(`Third then: ${value}`);
    throw new Error("An error occurred");
})
.catch((error) => {
    console.error(`Catch: ${error.message}`);
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve("Recovered value");
        }, 1000);
    });
})
.then((value) => {
    console.log(`Fourth then: ${value}`);
})
