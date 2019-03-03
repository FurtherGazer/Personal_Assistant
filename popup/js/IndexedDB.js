// 定义一个数据库对象
var ClassIndexedDB = /** @class */ (function () {
    // 初始化的时候传入数据库名 & 表名，完成数据库的初始化
    function ClassIndexedDB(dbName, storesName) {
        this._N = function () { };
        this._dbName = dbName;
        this._storesName = storesName; // 似乎直接在构造器中设计不太好，因为没有考虑到已存在表的情况
        this._DB = {
            name: this._dbName,
            version: 1,
            db: null
        };
    }
    // 打卡数据库
    // 联合类型 number | null
    // 因为新建数据库的时候不需要 version，这块应该选择使用可选类型 version? 标识这个函数可选
    ClassIndexedDB.prototype.openDB = function (version) {
        if (typeof version == 'undefined') {
            // 因为 if 是一个块级作用域，所以在 if 内使用 let,实际定义的 version 是块级作用域内的 version
            // if(this._version){
            // 可以看到如果这块是 let 则编译的时候，会被编译为 version_1 
            // var version = this._version;
            // }else{
            var request = window.indexedDB.open(this._dbName); // IDBOpenDBRequest 对象
            // var version = version || 1; // 这句话是多余的因为如果没有传 version，就默认请求就好
            // this._version = request.result.version; // 这个也会失败，因为 The request has not finished.
            // }
        }
        else {
            var request = window.indexedDB.open(this._dbName, version); // IDBOpenDBRequest 对象
        }
        var openDB_DB = this._DB;
        var openDB_stores = this._storesName;
        // indexedDB.open() 中 version 是 optional 的
        console.log(openDB_DB, openDB_stores, request, version);
        request.onerror = function (e) {
            console.log(e.currentTarget.error.message);
            console.log('openDB Error!');
        };
        request.onsuccess = function (e) {
            openDB_DB.db = e.target.result;
            openDB_stores = openDB_DB.db.objectStoreNames; // 这块现在问题就在于作用域的问题
            console.log(openDB_DB.db);
            console.log('openDB Success!');
        };
        // 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件
        // 通常新建数据库以后，第一件事就是新建对象仓库（表）
        // 后面如果需要新建表，只需要调用方法对实例对象 ClassIndexedDB 进行 push 即可
        // 这里返回的 e 是 IDBVersionChangeEvent 对象
        request.onupgradeneeded = function (e) {
            var db = e.target.result;
            for (var i in openDB_stores) {
                if (!db.objectStoreNames.contains(openDB_stores[i])) {
                    db.createObjectStore(openDB_stores[i], { autoIncrement: true });
                }
            }
            console.log("DB version from " + e.oldVersion + " changed to " + e.newVersion);
        };
    };
    // 添加新的表，就是嵌套一个 openDB ，然后在 _storesName 内 push 新值
    ClassIndexedDB.prototype.addObjectStore = function (newStoreName) {
        // 检查所添加 ObjectStore 是否存在
        if (this._storesName.indexOf(newStoreName) != -1) {
            console.log('The objectStore has already exist!');
            return false;
        }
        this._storesName.push(newStoreName);
        var _version = this._DB.db.version;
        _version++;
        // 似乎对了，确实得先关闭，再打开，不然就无法完成更新
        this.closeDB();
        this.openDB(_version);
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
    ClassIndexedDB.prototype.getData = function (storeName, key, outData) {
        if (typeof storeName == 'undefined' || typeof key == 'undefined') {
            console.error('readData Error! storeName&key is necessary!');
            return false;
        }
        var outData = outData || new Array();
        var db = this._DB.db;
        var stores = [];
        stores.push(storeName);
        var request = db.transaction(stores, 'readonly')
            .objectStore(storeName)
            .get(key);
        var _key = key;
        var _kV = {};
        request.onerror = function (event) {
            console.log('getData Error!');
        };
        request.onsuccess = function (event) {
            if (request.result) {
                console.log('request: ' + request.result);
                // 直接返回 result 会导致失败,必须得用一个承接数组来动态获取传值
                // return request.result
                _kV[_key] = request.result;
                outData.push(_kV);
            }
            else {
                console.log('not Found the key of ', key);
                return null;
            }
        };
        return outData;
    };
    // 遍历数据
    ClassIndexedDB.prototype.readAllData = function (storeName, outDataArray) {
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
    // 删除数据 - 由于 W3C 中注明 delete() 返回值为 undefined. 所以需要先执行 get 当 get 到相关值的时候
    // 再执行删除,并返回删除的值.
    ClassIndexedDB.prototype.deleteData = function (storeName, key) {
        if (typeof storeName == 'undefined' || typeof key == 'undefined') {
            console.error('readData Error! storeName&key is necessary!');
            return false;
        }
        // 这块的问题在于由于是异步的,无法使用这种阻塞式的方式去
        var _getData = this.getData(storeName, key);
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
        return _getData;
    };
    return ClassIndexedDB;
}());
