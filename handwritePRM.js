const Pending = 'pending';
const FulFilled = 'fulfilled';
const Rejected = 'rejected';

class MyPromise {
    constructor(executor){
        this.status = Pending;
        this.value = null;
        this.callbacks = [];

        try{
            executor(this.resolve, this.reject);
        }catch(err){
            this.reject(err);
        }
    }

    resolve = (data) => {
        setTimeout(() => {
            if(this.status === Pending){
                this.status = FulFilled;
                this.value = data;
                this.callbacks.forEach((callback) => {
                    callback.onFulFilled(this.value);
                });
            }
        }, 0);
        
    }

    reject = (data) => {
        setTimeout(() => {
            if(this.status === Pending){
                this.status = Rejected;
                this.value = data;
                this.callbacks.forEach((callback) => {
                    callback.onRejected(this.value)
                });
            }
        }, 0);
        
    }

    then = (onFulFilled, onRejected) => {
        return new MyPromise((resolve, reject) => {
            onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : () => {};
            onRejected = typeof onRejected === 'function' ? onRejected : () => {};

            if(this.status === Pending){
                this.callbacks.push({onFulFilled, onRejected});
            }
            else if(this.status === FulFilled){
                setTimeout(() => {
                    resolve(onFulFilled(this.value));
                }, 0);
            }
            else if(this.status === Rejected){
                setTimeout(() => {
                    reject(onRejected(this.value));
                }, 0)
            }
        })
    }
}

console.log(1);

const myInstance = new MyPromise((resolve, reject) => {
    console.log(2);
    setTimeout(() => {
        resolve('sorry');
        console.log(4);
    }, 1000);   
})

myInstance.then(
    (data) => {console.log(data);},
    (data) => {console.log(data);}
)
myInstance.then(
    (data) => {console.log(data);},
    (data) => {console.log(data);}
)

console.log(3);