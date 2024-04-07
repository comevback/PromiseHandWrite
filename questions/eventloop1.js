console.log('X');

setTimeout(() => {
  console.log('Y');
}, 0);

const promise1 = new Promise((resolve, reject) => {
  console.log('Z');
  resolve('Resolved 1');
});

promise1
  .then((res) => {
    console.log(res);
    setTimeout(() => {
      console.log('W');
    }, 0);
    queueMicrotask(() => {
      console.log('V');
    });
    return 'Resolved 2';
  })
  .then((res) => {
    console.log(res);
  });

console.log('U');

// what is the output?

/* explanation:
That's correct! Here's how the execution order plays out:

1. `console.log('X');` is synchronous and logs "X" immediately.

2. `setTimeout` queues "Y" to be logged after all synchronous code, microtasks, and the current macrotask have completed, even though the delay is 0 ms.

3. The executor of `promise1` is run immediately, logging "Z".

4. The last synchronous `console.log('U');` logs "U".

Up to this point, the output is "X", "Z", "U". Now we move to the microtasks:

5. `promise1` is resolved, so its `.then()` is queued in the microtask queue and logs "Resolved 1".

6. Inside the `.then()`, another `setTimeout` is set to log "W", but this will be queued in the macro task queue and will execute in a future tick of the event loop. 
   
7. `queueMicrotask` queues a microtask to log "V".

8. The return statement from the first `.then()` queues another microtask to log "Resolved 2".

At the end of the current task, before the next event loop tick, all microtasks are executed:

9. The microtask queued by `queueMicrotask` logs "V".

10. The second `.then()` of `promise1` logs "Resolved 2".

Now, the microtask queue is empty, and the event loop can move on to the macrotasks:

11. The first `setTimeout` callback logs "Y".

12. The second `setTimeout` inside the `.then()` callback logs "W".

The final output is: "X", "Z", "U", "Resolved 1", "V", "Resolved 2", "Y", "W".
*/