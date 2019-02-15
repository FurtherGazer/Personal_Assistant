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

function updateBrowserAction(ifStart) {
    chrome.browserAction.setTitle({
        title: ifStart ? '测试用纯净谷歌拓展: ON' : '测试用纯净谷歌拓展: OFF'
    });
    chrome.browserAction.setIcon({
        path: ifStart ? {'16': 'img/icon-on-16.png', '32': 'img/icon-on-32.png'} :
                    {'16': 'img/icon-off-16.png', '32': 'img/icon-off-32.png'}
    });
    chrome.browserAction.setBadgeText({
        text: ifStart ? 'ON' : ''
    });
};

// 初始化状态
// 初始化状态会导致每次点击的时候都默认为 false，这是不合理的
// popup的生命周期，仅保持在展开和缩回的一短暂时间内，其状态是固定的
// updateBrowserAction(false);

$(document).ready(function(){
    // 点击开始测试
    $('#start_test p').on('click',function(){
        updateBrowserAction(true);
        sendMessageToContentScript({key:'controllerStart'});
    });
    // 点击结束测试
    $('#finish_test p').on('click',function(){
        updateBrowserAction(false);
        sendMessageToContentScript({key:'controllerStop'});
    });
    // 编辑测试设置1
    $('#editPassWord p').on('click',function(){
        sendMessageToContentScript({key:'controllerEditPassWord'});
    });
})
