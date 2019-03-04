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
                if(_countDown > 1000){
                    return '>1k';
                }else if(_countDown < 0){
                    return '超时';
                }else{
                    return _countDown.toFixed(1) * -1;
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
                    return '#C0392B'
                }else if(_countDown > 24){
                    return '#5499C7'
                }else if(_countDown < 24){
                    return '#58D68D'
                }else if(_countDown < 0){
                    return '#ff0000'
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
            },
        },
        template:  `<div class='todoList-li flex-box'>
                        <div class='todoList-li-label' v-bind:style="{backgroundColor: labelColor}"></div>
                        <div class='todoList-li-Left flex-box' v-bind:style="{color: countDownColor}">
                            <p class='todoList-CountDown'><b>{{ countDown }}</b></p>
                            <i class='todoList-CountDown'>hours</i>
                        </div>
                        <div class='todoList-li-content flex-box'>
                            <div class='todoList-li-content-text'>
                                <p class='todoList-li-content-p'>{{ abstract }}</p>
                            </div>
                        </div>
                        <div class='todoList-li-operation flex-box'>
                            <i class="fa fa-flag-o icon-operation" v-on:click='completeThisItem'></i>
                            <i class="fa fa-trash-o icon-operation" style='padding-left:10px;' v-on:click='delThisItem'></i>
                        </div>
                    </div>`,
};
