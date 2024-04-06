class myPromise {
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    constructor(executor) {
        this.status = myPromise.Pending;
        this.result = null;

        executor(this.resolve, this.reject);
    }


    // Arrow function is used to bind the context of this to the class instance, if use function(){} instead, this will be undefined. we can also use bind(this) to bind the context of this to the class instance.
    resolve = (result) => {
        this.status = myPromise.FulFilled;
        this.result = result;
        console.log(this.result);
    }

    reject = (result) => {
        this.status = myPromise.Rejected;
        this.result = result;
    }
}

const myInstance = new myPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('resolved');
    }, 2000);
});