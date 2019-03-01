// 数据库库名：myDB - completed（已完成）/ inprogress（正在进行中）/ abadndon（放弃）
var _objectDB = new ClassIndexedDB('myDB',['completed','inprogress','abandon']);
// 数据库初始化&打开
_objectDB.openDB();

// 获取存储在 'inprogress' 中的所有原始数据，通过数据遍历完成
var storageData = new Array();
_objectDB.readAllData('inprogress',DB_storageData)



// 存储在 localStorage 中的原始数据内容（这块考虑要不要分日期存储），如果分日期存储，可能需要考虑组件嵌套的情况
// var storageData = localStorage.getItem('myToDo');
// 如果没有则为 null，此处考虑应该做一个格式检查
// ToDo 分成两类，一个是需要做的，一类是已完成的，已完成的存在另一个 storage 中
// 另外为了避免影响效率，myToDo 应该做长度限制

// 页面初始化过程中，需要从本地仓库获取存储的数据，并进行解析，解析为格式化的数据，并加载到 todoList 中。
// test  initialization('test2<*>2019/2/16<*>2019/3/1<*>high;')
// function initialization(thisStorageData){
//     try{
//         if(typeof thisStorageData == null){
//             return [];
//         }
//         // 为了节约空间，数据存储不应该是
//         // {Text:'test2', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'}, 形式
//         // 而应是 test2<*>2019/2/16<*>2019/3/1<*>high;...这种形式
//         var todoListData = new Array();
//         var storageDataArray = thisStorageData.split('</;>');
//         for(let i=0;i<storageDataArray.length; i++){
//             var todoItemData = {};
//             var storageDataItem = storageDataArray[i].split('<*>');
//             if(storageDataItem.length == 4){
//                 todoItemData.Text = storageDataItem[0];
//                 todoItemData.Started = storageDataItem[1];
//                 todoItemData.Deadline = storageDataItem[2];
//                 todoItemData.Priority = storageDataItem[3];
//                 todoListData.push(todoItemData)
//             }
//         }
//         return todoListData;
//     }catch(err){
//         return [];
//     };
// }
// TODO LIST CONTNT
// var initializationData = initialization(storageData);


// 这块有个问题，由于 VUE 的数据绑定是绑定在 getter / setter 方法上的 ×
// 经过测试发现，VUE 的绑定，绑定在引用元素上也是可以的。深度绑定？也就说给 initializationData 对象也绑定了 setter/getter 属性；
var todoListContainer = new Vue({
    el:'#todoList-container',
    data: {
        todoList: storageData,
    },
    components: {
        'todoli':todoItem,
    }
});

// 这个文件是实例化的 Vue 对象
// todoListInTotals
// 了解了，因为 js 当中，数据赋值，赋值的是整个数组的话，是对数组的引用
// 所以initializationData的变更，会显示，而这块引用的是一个数据，则数据的引用不会同步
// var initializationDataLength = initializationData.length;
var todoListInTotals = new Vue({
    el:'#header-about-right',
    data: {
        inTotals: storageData.length,
    }
});

