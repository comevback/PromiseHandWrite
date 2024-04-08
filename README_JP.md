# JavaScriptでのPromiseの実践

[中文版](./README_ZH.md)
[日本語版](./README_JP.md)

[実装コード](./PromiseHandWrite.js)

---

## 非同期とイベントループ

> **シングルスレッドのメインスレッドが非同期を必要とする理由**です。非ブロッキングな体験を実現するためです。

> **イベントループは非同期の実装**です。

ブラウザのレンダリングメインスレッドはシングルスレッドであり、一度に1つのタスクしか処理できません。どれだけ時間がかかるかわからない、または長時間かかるジョブや操作がある場合、同期的なメインスレッドは停止してしまいます。それが、メインスレッドで非同期が使用される理由であり、メインスレッドがタスクを開始し、最初のものが完了するのを待たずに他のタスクを続行できるようにします。

非同期はイベントループによって実装され、これは終わりのないforループで、メッセージキューにジョブがあるかどうかを常にチェックします。ジョブがある場合、イベントループはそれをコールスタックに移動し、メインスレッドによって処理されます。

'fetch'を使用してサーバーからデータをリクエストする、'setTimeout'でタイマーを設定する、またはプロミスを使用するなど、非同期操作を行うときは、通常、コールバック関数を提供します。このコールバック関数は、特定のメッセージキューに配置されます。

JSには多くの種類のメッセージキューがあります。最優先キューは常にマイクロタスクキューです。

---

# 手書きのPromise

## 実装コード

[完全なプログラムリンク](./PromiseHandWrite.js)

---

## インスタンス生成時のチェーンコールの順序：

### 前のPromiseが解決された（resolveまたはreject）場合にのみthenがトリガーされます
***最初のthenのコールバック関数がマイクロタスクキューに追加されると、MyInstance Promiseが解決されるのを待ってから実行されます。このコールバック関数の実行中に、新しいPromise（あなたの例のように、新しいMyPromiseインスタンスが返される）が返された場合、次のthenのコールバック関数は、この新しいPromiseが解決されるのを待ってからマイクロタスクキューに追加されます。***

---

**thenを実行するとき、非同期と仮定して、前のPromiseはまだ解決または拒否されておらず、状態はまだPendingです。この時点で、最初にonFulFilledとonRejected関数をコールバックキューに追加します**
```js
if (this.status === MyPromise.Pending) {
    this.callbacks.push({
        onFulFilled: value => handleCallback(onFulFilled, value),
        onRejected: err => handleCallback(onRejected, err)
    });
}
```
===>**前のPromiseが非同期操作を完了すると、状態がFulFilledまたはRejectedに変わり、resolveまたはrejectも実行されます**
```js
resolve = (data) => {
    this.#changeStatus(MyPromise.FulFilled, data);
};
```
===>**resolveとrejectは#changeStatusメソッドを呼び出し、changeStatusメソッド内のsetTimeoutは非同期に内部のステップを実行します**
```js
#changeStatus = (status, value) => {
    setTimeout(() => { // 非同期実行を保証するためにsetTimeoutを使用する
        if (this.status === MyPromise.Pending) { // 状態はPendingからのみ変更可能
            this.status = status; // 状態を変更
            this.value = value; // 値を保存
            this.callbacks.forEach((callback) => { // すべてのコールバックを実行
                if (status === MyPromise.FulFilled) {
                    callback.onFulFilled(this.value); // resolveの場合、これを実行し、value => handleCallback(onFulFilled, value)に転換
                } else if (status === MyPromise.Rejected) {
                    callback.onRejected(this.value); // rejectの場合、これを実行し、err => handleCallback(onRejected, err)に転換
                }
            });
        }
    }, 0);
};
```

===>**以前にコールバックキューに追加されたため**

```js
{
    onFulfilled: value => handleCallback(onFulfilled, value),
    onRejected: err => handleCallback(onRejected, err)
}
```

===>**この時点で実行されるのは**

```js
value => handleCallback(onFulfilled, value)
err => handleCallback(onRejected, err)
```

===>**この時点で、handleCallbackメソッドに戻り、resolveまたはrejectを非同期に実行します。onFulfilledまたはonRejectedを表すコールバックがPromiseインスタンスを返した場合、このインスタンスが解決または拒否されるのを待ちます。**

```js
const handleCallback = (callback, value) => {
    setTimeout(() => {
        try {
            const result = callback(value); // コールバックの実行
            if (result instanceof MyPromise) { // コールバックがMyPromiseインスタンスを返した場合、解決を待つ
                result.then(resolve, reject);
            } else {
                resolve(result); // そうでなければ、結果を直接解決
            }
        } catch (err) {
            reject(err); // コールバックの実行中にエラーが発生した場合、直接拒否
        }
    }, 0);
};
```

### 簡単な要約：

1. thenメソッドの呼び出し：.then()が呼び出されると、Promiseの状態を確認します。状態がPendingの場合、コールバック関数（onFulfilledとonRejected）をコールバックキューに追加して実行を待ちます。

2. Promise

の解決：Promiseの非同期操作が完了すると、resolveまたはrejectメソッドを呼び出してPromiseの状態（FulfilledまたはRejected）を変更し、結果の値を設定します。

3. コールバックの実行：状態を変更した後、コールバックキューのコールバック関数を非同期に実行します。これは、現在の実行スタックが完了した後に実行されるようにsetTimeoutを使用して実装されます。

4. チェーン：.then()のコールバック関数が新しいPromise（result）を返す場合、次の.then()のコールバックは、この新しいPromiseが解決されるまで実行を待ちます。コールバックが非Promise値を返すか、値を返さない場合、この値を直接次の.then()への入力として渡します。

5. エラー処理：コールバックの実行中にエラーが発生した場合、またはコールバック関数がRejected状態のPromiseを返した場合、チェーン内で最も近い.catch()または.onRejectedコールバックを持つ.then()にジャンプしてエラーを処理します。

---

## thenが実際に返すものは何か？

.then()メソッドは、新しいPromiseオブジェクトを返します。この新しいPromiseオブジェクトの解決状態（fulfilledまたはrejected）および値は、.then()メソッドに渡されたコールバック関数の実行結果に依存します。

```js
// thenメソッド
then = (onFulfilled, onRejected) => {
    return new MyPromise((resolve, reject) => { // <== この新しいPromiseオブジェクトを返します。新しいPromiseの状態は、コールバック関数（onFulfilledまたはonRejected）の実行結果に依存します。
    // ...その他のコード
```

#### 1. コールバック関数が値を返す場合

コールバック関数が値（Promiseではない）を返す場合、新しいPromiseオブジェクトは解決（fulfilled）され、その返り値を持ちます。

```javascript
let promise = new Promise((resolve, reject) => {
    resolve(10);
});

promise
    .then((result) => {
        console.log(result); // 出力：10
        return result * 2;   // 値を返す
    })
    .then((result) => {
        console.log(result); // 出力：20
    });
```
この例では、最初の.then()が値20を返すので、次の.then()が受け取るresultは20です。

#### 2. コールバック関数がエラーを投げる場合

コールバック関数がエラーを投げる場合、新しいPromiseオブジェクトは拒否され、そのエラーが理由として持ちます。

```js
let promise = new Promise((resolve, reject) => {
    resolve(10);
});

promise
    .then((result) => {
        throw new Error('Something went wrong'); // エラーを投げる
    })
    .catch((error) => {
        console.error(error.message); // 出力："Something went wrong"
    });
```
この例では、最初の.then()がエラーを投げるので、次の.catch()がこのエラーをキャッチします。

#### 3. コールバック関数が別のPromiseオブジェクトを返す場合

コールバック関数が別のPromiseオブジェクトを返す場合、新しいPromiseオブジェクトはこの返されたPromiseに「従

います」。つまり、新しいPromiseの状態と値は、返されたPromiseと同じになります。

```js
let promise = new Promise((resolve, reject) => {
    resolve(10);
});

promise
    .then((result) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(result * 2); // Promiseを返す
            }, 1000);
        });
    })
    .then((result) => {
        console.log(result); // 出力：20（1秒後）
    });
```
この例では、最初の.then()が新しいPromiseオブジェクトを返します。この新しいPromiseは1秒後に解決され、その値は20です。したがって、次の.then()のresultは20であり、前のPromiseが解決された後に実行が開始されます。
