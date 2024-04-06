function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('データを取得中...');
            const data = { id: 1, name: 'John Doe' };
            resolve(data);
        }, 2000);
    });
}

function processData(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('データを処理中...');
            const processedData = { ...data, age: 30 };
            resolve(processedData);
        }, 2000);
    });
}

const saveData = (data) => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('データを保存中...');
        const savedData = { ...data, status: 'saved' };
        resolve(savedData);
    }, 2000);
});

// 関数を順番に実行
fetchData()
    .then(data => {
        console.log('取得したデータ:', data);
        return processData(data);
    })
    .then(processedData => {
        console.log('処理したデータ:', processedData);
        return saveData(processedData);
    })
    .then(savedData => {
        console.log('保存したデータ:', savedData);
    })
    .catch(error => {
        console.error('エラー発生:', error);
    })
    .finally(() => {
        setTimeout(() => {
            console.log('プログラム終了。');
        }, 2000);
    });
