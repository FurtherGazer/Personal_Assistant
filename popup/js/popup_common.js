// 主要涉及的通信包括：
// - popup 发给 backgroud.js --> background.js 发送给 content.js —— 为了保持状态的统一。
// popup 可以直接调用 background.js 中的 js 方法和 DOM。
// popup 和 background 共享 js 和 DOM，但是 console 是不共享的

function sendMessageToContentScript(message, callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		chrome.tabs.sendMessage(tabs[0].id, message, function(response)
		{
			if(callback) callback(response);
		});
	});
};

// function updateBrowserAction(ifStart) {
//     chrome.browserAction.setTitle({
//         title: ifStart ? '测试用纯净谷歌拓展: ON' : '测试用纯净谷歌拓展: OFF'
//     });
//     chrome.browserAction.setIcon({
//         path: ifStart ? {'16': 'img/icon-on-16.png', '32': 'img/icon-on-32.png'} :
//                     {'16': 'img/icon-off-16.png', '32': 'img/icon-off-32.png'}
//     });
//     chrome.browserAction.setBadgeText({
//         text: ifStart ? 'ON' : ''
//     });
// };

// 初始化状态
// 初始化状态会导致每次点击的时候都默认为 false，这是不合理的
// popup的生命周期，仅保持在展开和缩回的一短暂时间内，其状态是固定的
// updateBrowserAction(false);

// footer 组件实例



$(document).ready(function(){
    // 点击开始测试
    // $('#start_test p').on('click',function(){
    //     updateBrowserAction(true);
    //     sendMessageToContentScript({key:'controllerStart'});
    // });
    // 两个主要内容区
    var contentToDoList = $('#content-toToList');
    var contentEditToDoItem = $('#content-editToDoItem');

    // 点击 header-top-tool 时展开 header-operation;
    $('#header-top-tool i').on('click', function(){
        $('#header-operation').toggle();
    });

    // header-operation-delAll 唤起询问框 - 执行全部清除命令；
    $('#header-operation-delAll').on('click', function(){
        //询问框
        layer.open({
            content: '您是否确定清空 todoList？',
            btn: ['确定', '返回'],
            yes: function(index){
                localStorage.clear();
                initializationData = [];
                todoListContainer.todoList = [];
                todoListInTotals.inTotals = 0;
                // 插入一个提示框
                msg('todoList 已清空，你可以在回收车中找到清空内容')
            }
        });
    });

    // 点击 header-operation-about 时
    $('#header-operation-about').on('click', function(){
        msg('当前版本：beta v0.01')
    });

    // 点击 icon-operation 时展开 todo 属性
    // 尝试替换为 vue 模块
    // todoItemOperation(true);

    // todoliRemove 控制删除（vue 列表 & 数据库）
    $('div.todoList-li-operation i.icon-operation').on('click',function(){
        let _index = $(this).parents('.todoList-li').attr('key');
        // 数据刷新
        initializationData.splice(_index,1);
        // 数据存储
        let storageData = localStorage.getItem('myToDo');
        // 这块产生的原因时，splice 会抛出删除的内容，哦 storageData.split('</;>') 返回一个新数组
        let newStorageData = storageData.split('</;>');
        newStorageData.splice(_index,1);
        newStorageData = newStorageData.join('</;>')
        // console.log(_index, storageData);
        localStorage.setItem('myToDo', newStorageData);
        todoListInTotals.inTotals--;
    });

    // 所有展开元素绑定一个自动缩回的行为
    // 感觉逻辑有些不慎合理，最好还是修改成，当点击这个元素时，其他元素都缩回
    var allHide = $('#header-operation, .todoList-li-content-property');
    allHide.mouseleave(function(){
        let _this = $(this);
        setTimeout(function(){
            _this.hide();
        },500)
    });

    // footer 下各BT点击
    $('#addMore').on('click', function(){
        $(this).hide();
        contentToDoList.hide();
        contentEditToDoItem.show();
        $('#saveOrCancel').show();
    });
    // save
    $('#save').on('click', function(){
        if(CheckSaveAndPush()){
            // 重新加载（这种方法有点取巧）
            location.reload();
        }
    });
    // cancel
    $('#cancel').on('click', function(){
        $('#saveOrCancel').hide();
        contentToDoList.show();
        contentEditToDoItem.hide();
        $('#addMore').show();
    });

});

// Create start date
function get_datepicker_option (sHours,setMinutes){
    let start = new Date(),prevDay,startHours = 9;
    start.setHours(sHours);
    start.setMinutes(setMinutes);
    let datepicker_option = {
        timepicker: true,
        language: 'en',
        startDate: start,
        minHours: startHours,
        maxHours: 18,
        onSelect: function (fd, d, picker) {
            if (!d) return;
            var day = d.getDay();
            if (prevDay != undefined && prevDay == day) return;
            prevDay = day;
            picker.update({
                minHours: 9,
                maxHours: 18
            })
        }
    }
    return datepicker_option
};
var Started_option = get_datepicker_option(9,30);
var Deadline_option = get_datepicker_option(18,30);
$('#timepicker-Started').datepicker(Started_option);
$('#timepicker-Deadline').datepicker(Deadline_option);

// 时间格式选项
var timeOptions = {
    day:'numeric', month:'numeric', year:'numeric'
};

// 执行数据保存，并向 todolist 中 push 新数据
function CheckSaveAndPush(){
    // 获取表单信息
    let todoTextarea = $('#todoTextarea').val();
    let selectPriority = $('#selectPriority').val();
    // 更新：不获取开始时间，而默认以创建时时间为准；
    // let timepickerStarted = $('#timepicker-Started').val();
    let timepickerStarted = new Date();
    // 不用检测，直接输入为 r-可验证的内容
    let rtimepickerStarted = new Intl.DateTimeFormat('en-US', timeOptions).format(timepickerStarted);
    let timepickerDeadline = $('#timepicker-Deadline').val();
    // 进行表单信息审核
    // 时间信息审核，使用正则表达式
    let timeCheck = /(\d{2}\/\d{2}\/\d{4}\s{1}\d{2}\:\d{2}\s{1}(am|pm))/i;
    let selectPriorityCheck = /(low|medium|high)/i;
    if(timeCheck.test(timepickerDeadline)){
        var rtimepickerDeadline = RegExp.$1;
        // 此时需要进行一个检测 Started 就是初始时间即可
        var _rtimepickerDeadline = new Date(rtimepickerDeadline);
        // 这块检测的就是实际时间，但是保存的是天
        if(timepickerStarted.getTime() > _rtimepickerDeadline.getTime()){
            msg('结束时间不得小于开始时间');
            return false
        };
        if(todoTextarea.length > 0){
            if(selectPriorityCheck.test(selectPriority)){
                var rselectPriority = RegExp.$1;
                // 此处应该执行一个保存和push的函数
                saveData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea);
                // 由于 save 后直接重新加载，故现在没有必要 push
                // pushData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea);
                return true;
            }else{
                msg('请勿直接输入或修改内容');
                return false;
            }
        }else{
            msg('输入内容不可为空');
            return false;
        }
    }else{
        msg('请点击选择有效日期');
        return false;
    }
}

// saveData 保存数据到 localStorage 中
// storageData 页面加载完毕后，从本地数据库中获取的原始数据。
// 获取原始数据，在原始数据中添加内容，然后再保存进去
function saveData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea){
    try{
        let storageData = localStorage.getItem('myToDo');
        // 第一次保存时 storage 显示为空 null 
        storageData == null ? storageData = '': storageData;
        let _saveData = todoTextarea + '<*>' + rtimepickerStarted + '<*>' + rtimepickerDeadline + '<*>' + rselectPriority;
        let newStorageData = storageData + _saveData + '</;>';
        localStorage.setItem('myToDo', newStorageData);
    }catch(err){}
}

// pushData 将数据 push 到当前 todoListContainer.todoList 中
// function pushData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea){
//     try{
//         let _pushData = {};
//         _pushData.Text = todoTextarea;
//         _pushData.Started = rtimepickerStarted;
//         _pushData.Deadline = rtimepickerDeadline;
//         _pushData.Priority = rselectPriority;
//         initializationData.push(_pushData);
//         todoListInTotals.inTotals = todoListInTotals.inTotals + 1;
//     }catch(err){}
// }

// 提示框
function msg(text, t=2){
    //提示
    layer.open({
        content: text, skin: 'msg', time: t //2秒后自动关闭
    });
}

// // 绑定一个方法，但是问题是这样会不会导致一个 list 上绑定过度事件？
// // 尝试直接绑定在组件上
// function todoItemOperation(ifInitialization){
//     if(ifInitialization){
//         $('.icon-operation').on('click', function(){
//             $(this).parent().prev().find('.todoList-li-content-property').toggle();
//         });
//     }else{
//         $('.icon-operation:last').on('click', function(){
//             $(this).parent().prev().find('.todoList-li-content-property').toggle();
//         });
//     }
// }
