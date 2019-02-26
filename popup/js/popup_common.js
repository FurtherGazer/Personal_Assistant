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

    $('.add-more').on('click', function(){
        // 此处应该修改为这个控件的两种状态，状态一是添加
        // 状态二是保存，而且应该是可扩展的
        // 可以试试使用面向对象的方法，每种一个状态，状态上加参数
        contentToDoList.toggle();
        contentEditToDoItem.toggle();
    });
});
  
// Create start date
var start = new Date(),prevDay,startHours = 9;
start.setHours(9);
start.setMinutes(30);
datepicker_option = {
    timepicker: true,
    language: 'en',
    startDate: start,
    minHours: startHours,
    maxHours: 18,
    onSelect: function (fd, d, picker) {
        // Do nothing if selection was cleared
        if (!d) return;
        var day = d.getDay();
        // Trigger only if date is changed
        if (prevDay != undefined && prevDay == day) return;
        prevDay = day;
        // If chosen day is Saturday or Sunday when set
        // hour value for weekends, else restore defaults
        if (day == 6 || day == 0) {
            picker.update({
                minHours: 10,
                maxHours: 16
            })
        } else {
            picker.update({
                minHours: 9,
                maxHours: 18
            })
        }
    }
}
$('#timepicker-Started').datepicker(datepicker_option);
$('#timepicker-Deadline').datepicker(datepicker_option);