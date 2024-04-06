class myPromise{
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    constructor(func){
        this.status = myPromise.Pending;
        this.result = null;
        this.callbacks = [];
        try{
            func(this.resolve, this.reject);
        }catch(error){
            this.reject(error);
        }
    }

    resolve = (result) => {
        this.status = myPromise.FulFilled;
        this.result = result;
        console.log(this.result);
        this.callbacks.forEach(callback => {
            callback.onFulFilledFunc(this.result);
        });
    }

    reject = (result) => {
        this.status = myPromise.Rejected;
        this.result = result;
        this.callbacks.forEach(callback => {
            callback.onRejectedFunc(this.result);
        });
        return this.result;
    }

    then = (onFulFilledFunc, onRejectedFunc) => {
        return new myPromise((resolve, reject) => {
            if (this.status === myPromise.FulFilled) {
                onFulFilledFunc(this.result);
            }
            if (this.status === myPromise.Rejected) {
                onRejectedFunc(this.result);
            }else{
                this.callbacks.push({onFulFilledFunc, onRejectedFunc});
            }
        });
    }

    catch = (onRejectedFunc) => {
        return new myPromise((resolve, reject) => {
            if (this.status === myPromise.Rejected) {
                onRejectedFunc(this.result);
            }else{
                this.callbacks.push({onRejectedFunc});
            }
        });
    }

}

const myInstance = new myPromise((resolve, reject) => {
    setTimeout(() => {
        reject('rejected');
    }, 2000);
});

myInstance.catch((error) => {
    console.log('catch:', error);
});