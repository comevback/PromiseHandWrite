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
        this.status = myPromise.FulFilled;
        this.result = result;
        console.log(this.result);
        // call the callback function
        this.callbacks.forEach(callback => {
            callback.onFulFilledFunc(this.result);
        });
    }

    // function of the instance to reject the promise
    reject = (result) => {
        this.status = myPromise.Rejected;
        this.result = result;
        // call the callback function
        this.callbacks.forEach(callback => {
            callback.onRejectedFunc(this.result);
        });
        return this.result;
    }

    // then function to handle the promise
    then = (onFulFilledFunc, onRejectedFunc) => {
        return new myPromise((resolve, reject) => {
            if (this.status === myPromise.FulFilled) {
                onFulFilledFunc(this.result);
            }
            if (this.status === myPromise.Rejected) {
                onRejectedFunc(this.result);
            }else{
                // if the promise is pending, push the callback functions to the callbacks array
                this.callbacks.push({onFulFilledFunc, onRejectedFunc});
            }
        });
    }

}

const myInstance = new myPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('resolved');
    }, 2000);
});

myInstance.then((result) => {
    console.log('then:', result);
});