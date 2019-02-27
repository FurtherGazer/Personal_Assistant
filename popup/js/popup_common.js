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
            content: '您是否确定清空所有 todoList 内容？',
            btn: ['确定', '返回'],
            yes: function(index){
                localStorage.clear();
                initializationData = [];
                todoListContainer.todoList = [];
                todoListInTotals.inTotals = 0;
                // 插入一个提示框
                msg('所有 toDOList 已清空，你可以在回收车中找到清空内容')
            }
        });
    });

    // 点击 header-operation-about 时
    $('#header-operation-about').on('click', function(){
        msg('当前版本：beta v0.01')
    });

    // 点击 icon-operation 时展开 todo 属性
    // 重新渲染时，在绑定一下
    todoItemOperation(true);

    // 倒计时渲染
    countDown()

    // 所有展开元素绑定一个自动缩回的行为
    // 感觉逻辑有些不慎合理，最好还是修改成，当点击这个元素时，其他元素都缩回
    var allHide = $('#header-operation, .todoList-li-content-property');
    allHide.mouseleave(function(){
        let _this = $(this);
        setTimeout(function(){
            _this.hide();
        },500)
    });
    // 这种方案可行，但是得配置关联，下面 allHide 是隐藏区域，但是隐藏区域是靠其他按钮控制的。
    // // 第二种方案，当一个点击时，其他都关闭
    // allHide.on('click', function(){
    //     // 所有元素都缩回
    //     allHide.hide();
    //     // 点击元素展开
    //     $(this).show();
    // });

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
}

var Started_option = get_datepicker_option(9,30);
var Deadline_option = get_datepicker_option(18,30);

$('#timepicker-Started').datepicker(Started_option);
$('#timepicker-Deadline').datepicker(Deadline_option);


// 执行数据保存，并向 todolist 中 push 新数据
function CheckSaveAndPush(){
    // 获取表单信息
    let todoTextarea = $('#todoTextarea').val();
    let selectPriority = $('#selectPriority').val();
    let timepickerStarted = $('#timepicker-Started').val();
    let timepickerDeadline = $('#timepicker-Deadline').val();
    // 进行表单信息审核
    // 时间信息审核，使用正则表达式
    let timeCheck = /(\d{2}\/\d{2}\/\d{4}\s{1}\d{2}\:\d{2}\s{1}(am|pm))/i;
    let selectPriorityCheck = /(low|medium|high)/i;
    if(timeCheck.test(timepickerStarted)){
        // 获取匹配到有用部分，以避免添加前缀后缀
        var rtimepickerStarted = RegExp.$1;
        if(timeCheck.test(timepickerDeadline)){
            var rtimepickerDeadline = RegExp.$1;
            // 此时需要进行一个检测
            var _rtimepickerStarted = new Date(rtimepickerStarted);
            var _rtimepickerDeadline = new Date(rtimepickerDeadline);
            if(_rtimepickerStarted.getTime() > _rtimepickerDeadline.getTime()){
                msg('结束时间不得小于开始时间');
                return false
            }
            if(todoTextarea.length > 0){
                if(selectPriorityCheck.test(selectPriority)){
                    var rselectPriority = RegExp.$1;
                    // 此处应该执行一个保存和push的函数
                    saveData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea);
                    pushData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea);
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
    }else{
        msg('请点击选择有效日期');
        return false;
    }
}

// 封装一个 tips 函数，用于 tips 的出现和消失以及后面可能制作的其他动效
function tipsShow(tipId){
    let $tipId = '#' + tipId;
    $($tipId).show();
    setTimeout(function(){
        $($tipId).hide();
    },1500)
}

// saveData 保存数据到 localStorage 中
// storageData 页面加载完毕后，从本地数据库中获取的原始数据。
// 获取原始数据，在原始数据中添加内容，然后再保存进去
function saveData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea){
    try{
        let storageData = localStorage.getItem('myToDo');
        let _saveData = todoTextarea + '<*>' + rtimepickerStarted + '<*>' + rtimepickerDeadline + '<*>' + rselectPriority;
        let newStorageData = storageData + _saveData + ';';
        localStorage.setItem('myToDo', newStorageData);
    }catch(err){}
}

// pushData 将数据 push 到当前 todoListContainer.todoList 中
function pushData(rtimepickerStarted,rtimepickerDeadline,rselectPriority,todoTextarea){
    try{
        let _pushData = {};
        _pushData.Text = todoTextarea;
        _pushData.Started = rtimepickerStarted;
        _pushData.Deadline = rtimepickerDeadline;
        _pushData.Priority = rselectPriority;
        initializationData.push(_pushData);
        todoListInTotals.inTotals = todoListInTotals.inTotals + 1;
    }catch(err){}
}

// 提示框
function msg(text, t=2){
    //提示
    layer.open({
        content: text, skin: 'msg', time: t //2秒后自动关闭
    });
}

// 绑定一个方法，但是问题是这样会不会导致一个 list 上绑定过度事件？
function todoItemOperation(ifInitialization){
    if(ifInitialization){
        $('.icon-operation').on('click', function(){
            $(this).parent().prev().find('.todoList-li-content-property').toggle();
        });
    }else{
        $('.icon-operation:last').on('click', function(){
            $(this).parent().prev().find('.todoList-li-content-property').toggle();
        });
    }

}

// ToDoItem 倒计时渲染
function countDown(){
    $('.todoList-li').each(
        function(){
            let _timeRange = $(this).find('i.todoList-li-content-property-timerange').text();
            let _Deadline = new Date(_timeRange.split('-')[1]);
            let _countDown = _Deadline - new Date();
            // 转换为小时
            let _countDownHour = _countDown/1000/60/60 * -1;
            $(this).find('p.todoList-CountDown b').text(_countDownHour.toFixed(1)); 
        }
    )
}