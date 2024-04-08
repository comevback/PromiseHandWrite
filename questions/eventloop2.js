console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve()
    .then(() => {
      console.log('3');
      return new Promise((resolve, reject) => {
        console.log(11);
        setTimeout(() => console.log('4'), 0);
        resolve(12);
      })
    })
    .then(() => {
      console.log('5');
    });
}, 0);

Promise.resolve().then(() => console.log('6'));

setTimeout(() => console.log('7'), 0);

Promise.resolve().then(() => {
  console.log('8');
  Promise.resolve().then(() => console.log('9'));
});

console.log('10');

// what is the output?
// 1
// 10
// 6
// 8
// 9
// 2
// 3
// 11
// 5
// 7
// 4
/* explanation:
Correct! That's the expected order of output. Here's the explanation:

1. `console.log('1');` logs "1" synchronously.

2. The first `setTimeout` is set up, but it won't execute until after the current call stack is clear and it's the oldest task in the task queue.

3. The first promise resolution with `then(() => console.log('6'));` is scheduled as a microtask, which will run immediately after the current script execution but before any task queued with `setTimeout`.

4. The second `setTimeout` is set up to log "7", which will also wait until the task queue is processed after the current script and microtasks.

5. Another promise is resolved with chained `then(() => console.log('8'));` and nested `then(() => console.log('9'));` which are both microtasks and will run in order immediately after the current script execution, following the microtask queuing rules.

6. `console.log('10');` logs "10" synchronously.

After the execution of the synchronous script, the engine starts processing microtasks:

7. The microtask from the first promise resolves, logging "6".

8. The microtask from the third promise resolves, logging "8".

9. The nested microtask from the third promise resolves immediately after its parent, logging "9".

Now that all microtasks have been processed, the engine moves on to the task queue (macrotasks):

10. The first `setTimeout` callback executes, logging "2".

11. Inside the first `setTimeout`, a promise resolves, adding a `.then()` callback to the microtask queue to log "3", which is processed immediately after the current task completes.

12. The same promise chain has another `.then()` which logs "5" as part of the microtask processing after "3".

13. The second `setTimeout` callback executes, logging "7".

14. Inside the first `setTimeout`, after logging "3", a nested `setTimeout` is set up to log "4". Since this is a new task, it won't execute until after the current task and any other pending tasks complete.

15. Finally, the nested `setTimeout` inside the promise in the first `setTimeout` callback logs "4".
*/