// 定义一个数据库对象
var ClassIndexedDB = /** @class */ (function () {
    // 初始化的时候传入数据库名 & 表名，完成数据库的初始化
    function ClassIndexedDB(dbName, storesName) {
        this._dbName = dbName;
        this._storesName = storesName;
        this._DB = {
            name: this._dbName,
            version: 1,
            db: null
        };
    }
    // 打开数据库
    ClassIndexedDB.prototype.openDB = function (version) {
        if (typeof version == 'undefined') {
            if (this._version) {
                var version = this._version;
            }
            else {
                var version = version || 1;
                this._version = version;
            }
        }
        var openDB_DB = this._DB;
        var openDB_stores = this._storesName;
        var request = window.indexedDB.open(this._dbName, version);
        request.onerror = function (e) {
            console.log(e.currentTarget.error.message);
            console.log('openDB Error!');
        };
        request.onsuccess = function (e) {
            openDB_DB.db = e.target.result;
            console.log('openDB Success!');
        };
        // 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件
        // 通常新建数据库以后，第一件事就是新建对象仓库（表）
        request.onupgradeneeded = function (e) {
            var db = e.target.result;
            for (var i in openDB_stores) {
                if (!db.objectStoreNames.contains(openDB_stores[i])) {
                    var store = db.createObjectStore(openDB_stores[i], { autoIncrement: true });
                }
            }
            console.log('DB version changed to ' + version);
        };
    };
    // 关闭数据库
    ClassIndexedDB.prototype.closeDB = function () {
        this._DB.db.close();
    };
    // 删除数据库 - 删除数据库后，IndexedDB 中相应的数据库消失，但是会保留 a 对象中的数据
    ClassIndexedDB.prototype.deleteDB = function () {
        indexedDB.deleteDatabase(this._dbName);
    };
    // 添加数据
    ClassIndexedDB.prototype.addData = function (storeName, addObject) {
        if (typeof storeName == 'undefined' || typeof addObject == 'undefined') {
            console.error('addData Error! storeName&addObject is necessary!');
            return false;
        }
        var db = this._DB.db;
        var stores = [];
        // push 返回值 - 把指定的值添加到数组后的新长度；
        stores.push(storeName);
        // console.log(stores, storeName);
        var request = db.transaction(stores, 'readwrite')
            .objectStore(storeName)
            .add(addObject);
        request.onsuccess = function (event) {
            console.log('addData Success!');
        };
        request.onerror = function (event) {
            console.log('addData Error!');
        };
    };
    // 读取数据 - 读取指定表中的数据
    ClassIndexedDB.prototype.readData = function (storeName, key) {
        if (typeof storeName == 'undefined' || typeof key == 'undefined') {
            console.error('readData Error! storeName&key is necessary!');
            return false;
        }
        var db = this._DB.db;
        var stores = [];
        stores.push(storeName);
        var request = db.transaction(stores, 'readonly')
            .objectStore(storeName)
            .get(key);
        request.onerror = function (event) {
            console.log('readData Error!');
        };
        request.onsuccess = function (event) {
            if (request.result) {
                console.log('request: ' + request.result);
                return request.result;
            }
            else {
                console.log('not Found the key of ', key);
                return null;
            }
        };
    };
    // 遍历数据
    ClassIndexedDB.prototype.readAllData = function (storeName, outDataArray) {
        // || typeof outDataArray == 'undefined'
        if (typeof storeName == 'undefined') {
            console.error('readData Error! storeName is necessary!');
            return false;
        }
        var outDataArray = outDataArray || new Array();
        var db = this._DB.db;
        var stores = [];
        stores.push(storeName);
        var objectStore = db.transaction(stores, 'readonly')
            .objectStore(storeName);
        // openCursor 也是一个异步操作
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                var _key = cursor.key, _value = cursor.value;
                var _kV = {};
                _kV[_key] = _value;
                console.log('key: ' + _key);
                console.log('value: ' + _value);
                outDataArray.push(_kV);
                cursor["continue"]();
            }
            else {
                console.log('Finished, no more data!');
            }
        };
        return outDataArray;
    };
    // 更新数据 - updateDate 几乎可以拿来当 add 用
    ClassIndexedDB.prototype.updateData = function (storeName, key, value) {
        if (typeof storeName == 'undefined' || typeof value == 'undefined' || typeof key == 'undefined') {
            console.error('readData Error! storeName&value&key is necessary!');
            return false;
        }
        var db = this._DB.db;
        var stores = [];
        stores.push(storeName);
        var request = db.transaction(stores, 'readwrite')
            .objectStore(storeName)
            .put(value, key);
        request.onsuccess = function (event) {
            console.log('updateData Success!');
        };
        request.onerror = function (event) {
            console.log('updateData Error!');
        };
    };
    // 删除数据
    ClassIndexedDB.prototype.removeData = function (storeName, key) {
        if (typeof storeName == 'undefined' || typeof key == 'undefined') {
            console.error('readData Error! storeName&key is necessary!');
            return false;
        }
        var db = this._DB.db;
        var stores = [];
        stores.push(storeName);
        var request = db.transaction(stores, 'readwrite')
            .objectStore(storeName)["delete"](key);
        request.onsuccess = function (event) {
            console.log('delete Success!');
        };
        request.onerror = function (event) {
            console.log('delete Error!');
        };
    };
    return ClassIndexedDB;
}());
