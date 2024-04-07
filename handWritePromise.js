class MyPromise{
    static Pending = 'pending';
    static FulFilled = 'fulfilled';
    static Rejected = 'rejected';

    constructor(funct){
        this.status = MyPromise.Pending;
        this.result = null;
        this.callbacks = [];

        const resolve = (data) => {
            if(this.status === MyPromise.Pending){
                this.status = MyPromise.FulFilled;
                this.result = data;
                this.callbacks.forEach(callback => {
                    callback.onFulFilledFunc(this.result);
                });
            }
        }

        const reject = (data) => {
            if(this.status === MyPromise.Pending){
                this.status = MyPromise.Rejected;
                this.result = data;
                this.callbacks.forEach(callback => {
                    callback.onRejectedFunc(this.result);
                })
            }

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
                        resolve(result);
                    }catch{
                        reject(value);
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
}

console.log(1);

const myInstance = new MyPromise((resolve, reject) => {
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