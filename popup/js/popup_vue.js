// 数据库库名：myDB - completed（已完成）/ inprogress（正在进行中）/ abadndon（放弃）
var _objectDB = new ClassIndexedDB(
    'myDB',
    ['completed','inprogress','abandon'],
    [
        {name:'Priority', prop:'Priority', obj:{ unique: false }},
        {name:'Started', prop:'Started', obj:{ unique: false }}
    ],
    );

// 获取存储在 'inprogress' 中的所有原始数据，通过数据遍历完成
var storageData = new Array();

// console.log(_objectDB)
// 哦，想起来了，问题不是遍历数组输出，而是执行 .readAllData 的时候，open 还没有执行完毕
// 向这种在 open 的 onSuccess 中执行的函数，应该在 open 中传入回调。
// _objectDB.readAllData('inprogress',storageData)

// 数据库初始化&打开
// 这块涉及一个传参的坑，例如 var test = function(a,b){console.log(a,b)}
// test(b=3) [out] 3,undefined ——> 也就是说 b=3 的参数指引没有起作用，实际还是顺序传值
_objectDB.openDB(undefined, function(){
    _objectDB.readAllData('inprogress',storageData, function(){
        console.log(storageData);
        todoListInTotals.inTotals = storageData.length;
        updateBrowserAction(storageData.length);
    })
});

// -------------- 数据示例 --------------
// {Text:'test2', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'}
// -------------- 原始数据示例（遍历返回的数据） --------------
// {{id:1, Text:'test2', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'}}



// vue 数据构造
// var vstorageData = new Array();
// for(let i in storageData){
//     let _key = storageData[i].key;
//     let _value = storageData[i].value;
//     // 这个时候 _value 对应的应该是一个数组对象
//     // 判断是否有 push 属性
//     if('push' in _value){
//         _value.id = _key;
//         vstorageData.push(_value);
//     }
// }


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
// 回收站 / 已完成，最简单的实现方案是 todoListContainer.todoList 数据的替换。但是这样会导致数据重新渲染。
var todoListContainer = new Vue({
    el:'#todoList-container',
    data: {
        status: 'Inprogress',
        todoList: storageData,
    },
    components: {
        'todoli':todoItem,
    },
    // computed: {
    //     displayStatus: function(){
    //         if(this.status != 'Inprogress'){
    //             return false
    //         }
    //     },
    // },
});

// SEARCH CONTENT
var searchContainer = new Vue({
    el:"#search-container",
    // 这块做一个双向绑定，以获取搜索输入内容
    data: {
        searchIcon: 'fa-search',
        cacheData:'',
        cacheStatus:'',
        cacheColor:'',
    },
    methods: {
        search: function(){
            if(this.searchIcon == 'fa-search'){
                let _searchContent = this.searchContent;
                if(typeof _searchContent == 'undefined' || $.trim(_searchContent) == false ){
                    // 为空或为null
                    msg('No search content entered.');
                    return false
                }else{
                    _searchContent.toString();
                }
                var searchResult = todoListContainer.todoList.filter(function(item){
                    let text = item.Text.toLowerCase();
                    console.log(text)
                    if(text.indexOf(_searchContent.toLowerCase()) > -1){return true}
                })
                if(searchResult.length > 0){
                    // 状态缓存
                    this.cacheData = todoListContainer.todoList;
                    this.cacheStatus = todoListStatus.status;
                    this.cacheStatus = todoListStatus.backgroundColor;
                    // 数据更新
                    todoListContainer.todoList = searchResult;
                    todoListStatus.status = 'searchResult';
                    todoListContainer.status = 'searchResult';
                    this.searchIcon = 'fa-close';
                    todoListStatus.backgroundColor = '#1e1e1e';
                }else{
                    msg('No matching search terms.')
                }
            }else if(this.searchIcon == 'fa-close'){
                todoListContainer.todoList = this.cacheData;
                todoListStatus.status = this.cacheStatus;
                todoListContainer.status = this.cacheStatus;
                this.searchIcon = 'fa-search';
                todoListStatus.backgroundColor = this.cacheStatus;
            }
        },
    },
})

// SORT CONTENT
var sortContainer = new Vue({
    el:"#sort-container",
    data: {
        sortPriorityIcon: ['fa-angle-down','fa-angle-up'],
        sortDeadlineIcon: ['fa-angle-down','fa-angle-up'],
        sortByPriorityColor: ['black','red'],
        sortByDeadlineColor: ['black','red'],
    },
    methods: {
        refresh: function(){
            location.reload();
        },
        sortByPriority: function(){
            this.colorChange(this.sortByPriorityColor);
            this.iconChange(this.sortPriorityIcon);
            todoListContainer.todoList.sort(this.priorityCompare);
        },
        sortByDeadline: function(){
            this.colorChange(this.sortByDeadlineColor);
            this.iconChange(this.sortDeadlineIcon);
            todoListContainer.todoList.sort(this.deadlineCompare);
        },
        priorityCompare: function(a,b){
            let priorityScore = {
                'low' : 1,
                'medium': 0,
                'high': -1,
            }
            if(this.sortPriorityIcon[0] == 'fa-angle-down'){
                return priorityScore[a.Priority] - priorityScore[b.Priority]
            }else{
                return (priorityScore[a.Priority] - priorityScore[b.Priority])*-1
            }

        },
        deadlineCompare: function(a,b){
            let _a = new Date(a.Deadline);
            let _b = new Date(b.Deadline);
            if(this.sortDeadlineIcon[0] == 'fa-angle-down'){
                return _a - _b;
            }else{
                return (_a - _b)*-1;
            }
        },
        colorChange: function(_who){
            _who.reverse();
        },
        iconChange: function(_who){
            _who.reverse();
        }
    },
})


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

var todoListStatus = new Vue({
    el:'#header-about-left',
    data: {
        status: 'Inprogress',
        backgroundColor: '#5499c7',
    }
});
