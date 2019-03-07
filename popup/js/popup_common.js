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

function updateBrowserAction(len){
    var len = len.toString() || '0';
    chrome.browserAction.setBadgeText({
        text: len
    });
};

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
            content: '您是否确定要对 todoList 进行初始化？',
            btn: ['确定', '返回'],
            yes: function(index){
                _objectDB.deleteDB('myDB');
                storageData = [];
                todoListContainer.todoList = [];
                todoListInTotals.inTotals = 0;
                // 插入一个提示框
                msg('已完成初始化');
                setTimeout(function(){location.reload(); },1000);
            }
        });
    });

    // 点击 header-operation-about 时
    $('#header-operation-about').on('click', function(){
        msg('当前版本：V1.0')
    });

    // 点击 icon-operation 时展开 todo 属性
    // 尝试替换为 vue 模块
    // todoItemOperation(true);

    // todoliRemove 控制删除（vue 列表 & 数据库）
    // 由于数据异步渲染的问题，此处涉及到数据增加/修改，都需要重新渲染
    // $('div.todoList-li-operation i.icon-operation').on('click',function(){
    //     let _key = $(this).parents('.todoList-li').attr('key');
    //     let _dbId = $(this).parents('.todoList-li').attr('dbid')
    //     // 数据刷新 - 刷新 vue 的绑定的数组对象
    //     // 这块删除的数据的id 和 key 不一定一致。这块可以创建一个函数
    //     // 获取需要删除 _index
    //     // var _index = findTheKeyValue('id',_key,storageData);
    //     // console.log(_index);
    //     storageData.splice(_key,1);
    //     // 所删除数据,在 abandon 中添加
    //     _objectDB.addData('abandon', storageData[_dbId]);
    //     // 数据删除 - 删除指定 inprogress 内的数据
    //     _objectDB.removeData('inprogress', _dbId);

    //     // // 数据存储
    //     // let storageData = localStorage.getItem('myToDo');
    //     // // 这块产生的原因时，splice 会抛出删除的内容，哦 storageData.split('</;>') 返回一个新数组
    //     // let newStorageData = storageData.split('</;>');
    //     // newStorageData.splice(_index,1);
    //     // newStorageData = newStorageData.join('</;>')
    //     // // console.log(_index, storageData);
    //     // localStorage.setItem('myToDo', newStorageData);
    //     todoListInTotals.inTotals--;
    // });

    // 所有展开元素绑定一个自动缩回的行为
    // 感觉逻辑有些不慎合理，最好还是修改成，当点击这个元素时，其他元素都缩回
    var allHide = $('#header-operation, .todoList-li-content-property');
    allHide.mouseleave(function(){
        let _this = $(this);
        setTimeout(function(){
            _this.hide();
        },500)
    });

    // addMore
    $('#addMore').on('click', function(){
        $(this).hide();
        contentToDoList.hide();
        contentEditToDoItem.show();
        $('#saveOrCancel').show();
    });
    // save
    $('#save').on('click', function(){
        if(CheckSaveAndPush()){
            // 重新加载（这种方法有点取巧）- 由于现在方法直接绑定在组件上，所以无需如此
            // 但是由于没有办法直接获取 新生成实例的 id / key 
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

    // header-operation-*
    $('#header-operation-inprogress').on('click', function(){
        todoListContainer.todoList = storageData;
        todoListInTotals.inTotals = storageData.length;
        todoListStatus.status = 'Inprogress';
        todoListContainer.status = 'Inprogress';
        todoListStatus.backgroundColor = '#5499c7';
    });
    $('#header-operation-abandon').on('click', function(){
        if(typeof abandonStorage == 'undefined'){
            var abandonStorage = new Array();
            _objectDB.readAllData('abandon',abandonStorage, function(){
                todoListInTotals.inTotals = abandonStorage.length;
            })
        }
        todoListContainer.todoList = abandonStorage;
        todoListInTotals.inTotals = abandonStorage.length;
        todoListStatus.status = 'Abandon';
        todoListContainer.status = 'Abandon';
        todoListStatus.backgroundColor = '#c0392b';
    });
    $('#header-operation-completed').on('click', function(){
        if(typeof completedStorage == 'undefined'){
            var completedStorage = new Array();
            _objectDB.readAllData('completed',completedStorage, function(){
                todoListInTotals.inTotals = completedStorage.length;
            })
        }
        todoListContainer.todoList = completedStorage;
        todoListInTotals.inTotals = completedStorage.length;
        todoListStatus.status = 'Completed';
        todoListContainer.status = 'Completed';
        todoListStatus.backgroundColor = '#58d68d';
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
                // 此处应该执行一个save和push的函数
                saveData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea);
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
// 获取原始数据，在原始数据中添加内容，然后再保存进去 - 使用 indexedDB 每条数据都是独立的，所以此处不用转换格式先取出再替换
// 直接调用接口存入即可
function saveData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea){
    try{
        // let storageData = localStorage.getItem('myToDo');
        // // 第一次保存时 storage 显示为空 null 
        // storageData == null ? storageData = '': storageData;
        // let _saveData = todoTextarea + '<*>' + rtimepickerStarted + '<*>' + rtimepickerDeadline + '<*>' + rselectPriority;
        // let newStorageData = storageData + _saveData + '</;>';
        // localStorage.setItem('myToDo', newStorageData);
        let storageData = new Array();
        storageData.Text = todoTextarea;
        storageData.Started = rtimepickerStarted;
        storageData.Deadline = rtimepickerDeadline;
        storageData.Priority = rselectPriority;
        _objectDB.addData('inprogress',storageData);
        // 因为 storageData 对应的是 inprogress，所以此处无问题
        updateBrowserAction(storageData.length);
    }catch(err){console.log('func saveData Error!')}
}

// pushData 将数据 push 到当前 todoListContainer.todoList 中
// 不能使用 push 的原因在于，不确定数据的 key 和 id.
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

// /**
//  * 
//  * @param {string} key 所需查找的键
//  * @param {string} value 所需查找的值
//  * @param {Array} arrayLike 所需查找的Array对象
//  */
// function findTheKeyValue(key, value, arrayLike){
//     for(let i in arrayLike){
//         if(arrayLike[i][key] == value){
//             return i;
//         }
//     }
// }

// 保存修改
function editSave(){
    let key = $('.popup-center-content').attr('key') * 1;
    let rtimepickerStarted = $('#popup-timepicker-started').val();
    let timepickerStarted = new Date(rtimepickerStarted);
    let timepickerDeadline = $('#popup-timepicker-Deadline').val();
    let selectPriority = $('#popup-selectPriority').val();
    let todoTextarea = $('#popup-todoTextarea').val();
    let timeCheck = /(\d{2}\/\d{2}\/\d{4}\s{1}\d{2}\:\d{2}\s{1}(am|pm))/i;
    let selectPriorityCheck = /(low|medium|high)/i;
    if(timeCheck.test(timepickerDeadline)){
        var rtimepickerDeadline = RegExp.$1;
        var _rtimepickerDeadline = new Date(rtimepickerDeadline);
        // 这块检测的就是实际时间，但是保存的是天
        if(timepickerStarted.getTime() > _rtimepickerDeadline.getTime()){
            msg('结束时间不得小于开始时间');
            return false
        };
        if(todoTextarea.length > 0){
            if(selectPriorityCheck.test(selectPriority)){
                var rselectPriority = RegExp.$1;
                let storageData = new Array();
                storageData.Text = todoTextarea;
                storageData.Started = rtimepickerStarted;
                storageData.Deadline = rtimepickerDeadline;
                storageData.Priority = rselectPriority;
                _objectDB.updateData('inprogress', key, storageData, function(){
                    msg('数据更新完毕');
                    layer.closeAll();
                    setTimeout(function(){location.reload(); },2000);
                });
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
};