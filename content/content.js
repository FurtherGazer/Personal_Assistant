console.log('content-Personal_Assistant V1.0 \n当前调试版本：19-02-15 / 0 \n');

// 从 popup 进行信息接收，并调整控制器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.key == 'xxx'){
        // Do Something There
    }
});

