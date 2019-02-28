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
                let _countDown = this.countDown;
                if(_countDown == '>1k' || _countDown < -168){
                    return '#58D68D'
                }else if(_countDown > -24){
                    return '#C0392B'
                }else if(_countDown < -24){
                    return '#5499C7'
                }else if(_countDown == '超时'){
                    return '#ff0000'
                }

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
                            <i class="fa fa-trash-o icon-operation"></i>
                        </div>
                    </div>`,
};



// 之前的模板，对此进行简化
// var template2 = `<div class='todoList-li flex-box'>
// <div class='todoList-li-label' v-bind:style="{backgroundColor: labelColor}"></div>
// <div class='todoList-li-Left flex-box' v-bind:style="{color: countDownColor}">
//     <p class='todoList-CountDown'><b>{{ countDown }}</b></p>
//     <i class='todoList-CountDown'>hours</i>
// </div>
// <div class='todoList-li-content flex-box'>
//     <div class='todoList-li-content-text'>
//         <p class='todoList-li-content-p'>{{ abstract }}</p>
//     </div>
//     <div class='todoList-li-content-property'>
//         <div>
//             <p class='todoList-li-content-property-p'>TimeRange: <i class='todoList-li-content-property-timerange'>{{ todoli.Started }} - {{ todoli.Deadline }}</i></p>
//         </div>
//         <div>
//             <p class='todoList-li-content-property-p'>Priority: {{ todoli.Priority }}</p>
//         </div>
//     </div>
// </div>
// <div class='todoList-li-operation flex-box'>
//     <i class="fa fa-cogs icon-operation"></i>
// </div>
// </div>`