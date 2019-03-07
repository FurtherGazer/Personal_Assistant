// 这个 js 文件用来构建组件

// todoItem 组件，局部注册
// 通过计算属性，计算得出倒计时，避免了通过 DOM 元素直接进行渲染
var todoItem = {
        props: ['todoli'],
        computed: {
            countDown: function(){
                let now = new Date();
                let Deadline = new Date(this.todoli.Deadline);
                let _countDown = (Deadline - now)/1000/60/60;
                if(_countDown > 2160){
                    return {day:'>3M',hours:''};
                }else if(_countDown < 0){
                    return {day:'超时',hours:''};
                }else{
                    let _countDownDay = _countDown / 24;
                    _countDownDay = _countDownDay.toFixed(0) + ' D';
                    _countDown = _countDown.toFixed(0);
                    let _countDownHour = _countDown % 24;
                    _countDownHour > 9 ? _countDownHour = 9 : _countDownHour;
                    _countDownHour = _countDownHour.toFixed(0) + ' H';
                    return {day:_countDownDay, hours:_countDownHour};
                }
            },
            abstract: function(){
                // abstract 提取摘要，避免太长的 todo 内容；
                let text = this.todoli.Text;
                if(text.length > 45){
                    let _abstract = text.substring(0,45) + '...';
                    return _abstract
                }else{
                    return text
                }
            }, 
            labelColor: function(){
                let _Priority = this.todoli.Priority;
                let _colorHigh = '#C0392B'; // 低饱和红色
                let _colorMedium = '#5499C7'; // 低饱和蓝色
                let _colorLow = '#58D68D'; // 低饱和绿色
                if(_Priority == 'low'){
                    return _colorLow
                }else if(_Priority == 'medium'){
                    return _colorMedium
                }else if(_Priority == 'high'){
                    return _colorHigh
                }else{
                    return '#566573' // 默认黑色
                }
            },
            countDownColor: function(){
                let now = new Date();
                let Deadline = new Date(this.todoli.Deadline);
                let _countDown = (Deadline - now)/1000/60/60;
                if(_countDown > 168){
                    return '#58D68D'
                }else if(_countDown > 24){
                    return '#5499C7'
                }else if(_countDown < 24){
                    return '#C0392B'
                }else if(_countDown < 0){
                    return '#ff0000'
                }
            },
            // 计算属性给予它们的依赖进行缓存，这意味着如果 this.$options.parent; 
            // 则 displayStatus 缓存保持不变；
            displayStatus: function(){
                let _parent = this.$options.parent; 
                let status = _parent.status;
                if(status != 'Inprogress'){
                    return false;
                }else{
                    return true;
                }
            },
        },
        methods: {
            // 删除并加入回收站
            delThisItem: function(){
                // console.log(this) // 进行一下测试，发现完全可以指向自身实例(this)
                // console.log(this.$el.attributes) // 此处返回的是一个 element 元素
                var _thisElement = this.$el;
                let _key = _thisElement.getAttribute('key');
                let _dbId = _thisElement.getAttribute('dbid');
                // 这块应该直接对其父实例的元素进行修改，不绑定外面定义的变量。
                let _parent = this.$options.parent; // 此处的引用指向同一个作用域
                // console.log(_parent.todoList);
                // 加入回收站
                _objectDB.addData('abandon', _parent.todoList[_key]);
                // 实例中数据删除
                _parent.todoList.splice(_key,1);
                // 这块因为 _dbId: stirng 的原因，卡了很久，因为这块必须要用 number
                _objectDB.deleteData('inprogress', _dbId*1);
                todoListInTotals.inTotals--;
                updateBrowserAction(storageData.length);
            },
            // 完成
            completeThisItem: function(){
                var _thisElement = this.$el;
                let _key = _thisElement.getAttribute('key');
                let _dbId = _thisElement.getAttribute('dbid');
                let _parent = this.$options.parent; 
                _objectDB.addData('completed', _parent.todoList[_key]);
                _parent.todoList.splice(_key,1);
                _objectDB.deleteData('inprogress', _dbId*1);
                todoListInTotals.inTotals--;
                updateBrowserAction(storageData.length);
            },
            // 编辑
            editThisItem: function(){
                var _thisElement = this.$el;
                let _dbId = _thisElement.getAttribute('dbid');
                layer.open({
                    type:1,
                    content: `		
                    <!-- EDIT -->
                    <div id='popup-editToDoItem' class='flex-box' >
                        <div class='popup-center-content' key='${_dbId}'>
                            <div>
                                <input type='text' id='popup-timepicker-started' style='display:none'
                                    value='${this.todoli.Deadline}'
                                />
                                <p>Started: ${this.todoli.Deadline}</p>
                            </div>

                            <div>
                                <p>Deadline:</p>
                                <input type='text' id='popup-timepicker-Deadline' 
                                    value='${this.todoli.Deadline}'
                                />
                            </div>
                            <div>
                                <p>ToDo:</p>
                                <textarea id='popup-todoTextarea'
                                    value="${this.todoli.Text}"
                                >${this.todoli.Text}</textarea>
                            </div>
                            <div>
                                <p>Priority:</p>
                                <select id="popup-selectPriority" value='${this.todoli.Priority}'>
                                    <option>low</option><option>medium</option><option>high</option>
                                </select>
                            </div>
                            <div id='popup-save-bt-container'>
                                <button id='popup-save-bt'><i class="fa fa-check icon-plus"></i>save</button>
                            </div>
                        </div>
                    </div>`,
                    success: function(){
                        $('#popup-save-bt').on('click',function(){
                            editSave();
                        })
                    },
                });
            },
            // 展示详情
            showDetail: function(){
                // 希望达到的效果：点击后弹出底部弹窗包含详细文本信息。以便于查看，而且文本背景色和优先级有关
                let text = this.todoli.Text;
                layer.open({
                    content:text,
                    style: `background-color:${this.labelColor}`,
                })
            },
        },
        template:  `<div class='todoList-li flex-box'>
                        <div class='todoList-li-label' v-bind:style="{backgroundColor: labelColor}"></div>
                        <div class='todoList-li-Left flex-box' v-bind:style="{color: countDownColor}">
                            <p class='todoList-CountDown'><b>{{ countDown.day }}</b></p>
                            <i class='todoList-CountDown'>{{ countDown.hours }}</i>
                        </div>
                        <div class='todoList-li-content flex-box' v-on:click='showDetail'>
                            <div class='todoList-li-content-text'>
                                <p class='todoList-li-content-p'>{{ abstract }}</p>
                            </div>
                        </div>
                        <div class='todoList-li-operation flex-box'
                            v-if='displayStatus'
                        >
                            <i class="fa fa-check-square-o icon-operation" v-on:click='completeThisItem'></i>
                            <i class="fa fa-edit icon-operation" style='padding-left:10px;' v-on:click='editThisItem'></i>
                            <i class="fa fa-trash-o icon-operation" style='padding-left:10px;' v-on:click='delThisItem'></i>
                        </div>
                    </div>`,
};
