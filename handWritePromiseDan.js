class myPromise{

    // set the status of the promise
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    // constructor, is called when a new instance of the class is created.
    // func is the executor function, which is called immediately when the promise is created.
    constructor(func){
        this.status = myPromise.Pending;
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
            this.status = myPromise.FulFilled;
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
            this.status = myPromise.Rejected;
            this.result = result;
            // call the callback function
            this.callbacks.forEach(callback => {
                callback.onRejectedFunc(this.result);
            });
        }, 0)
        
    }

    // then function to handle the promise
    then = (onFulFilledFunc, onRejectedFunc) => {
        return new myPromise((resolve, reject) => {

            const handleCallback = (callback, value) => {
                setTimeout(() => {
                    try{
                        const res = callback(value);
                        resolve(res);
                    }catch(err){
                        reject(err);
                    }
                }, 0);
            }    

            if (this.status === myPromise.FulFilled) {
                handleCallback(onFulFilledFunc, this.result);
            }
            if (this.status === myPromise.Rejected) {
                handleCallback(onRejectedFunc, this.result);
            }else if(this.status === myPromise.Pending){
                // if the promise is pending, push the callback functions to the callbacks array
                this.callbacks.push({
                    onFulFilledFunc : value => handleCallback(onFulFilledFunc, value), 
                    onRejectedFunc : err => handleCallback(onRejectedFunc, err)
                });
            }
        });
    }

}

console.log(1);

const myInstance = new myPromise((resolve, reject) => {
    setTimeout(() => {
        console.log(2);
        reject('resolved');
    }, 2000);
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