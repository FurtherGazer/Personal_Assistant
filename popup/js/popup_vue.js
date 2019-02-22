// 这个文件是实例化的 Vue 对象
// todoListInTotals
var todoListInTotals = new Vue({
    el:'#header-about-right',
    data: {
        inTotals: 100,
    }
});

// footer
var footer = new Vue({
    el:'#footer',
    data: {
        text: 'creat a new todo...',
    }
});

// TODO LIST CONTNT
var todoListContainer = new Vue({
    el:'#todoList-container',
    data: {
        todoList: [
            {Text:'test1xxxxxxxxxxxxxxxxx', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'},
            {Text:'test2', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'},
            {Text:'test3', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'},
            {Text:'test4', Started:'2019/2/16', Deadline:'2019/3/1', Priority:'high'},
        ]
    }
});

