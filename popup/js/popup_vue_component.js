// 这个 js 文件用来构建组件

// todoli 组件
Vue.component('todoli', {
    props: ['todoli'],
    template:  `<div class='todoList-li flex-box'>
                    <div class='todoList-li-Left flex-box'>
                        <p class='todoList-CountDown'><b></b></p>
                        <i class='todoList-CountDown'>hours</i>
                    </div>
                    <div class='todoList-li-content flex-box'>
                        <div class='todoList-li-content-text'>
                            <p class='todoList-li-content-p'>{{ todoli.Text.substring(0,45) }}...</p>
                        </div>
                        <div class='todoList-li-content-property'>
                            <div>
                                <p class='todoList-li-content-property-p'>TimeRange: <i class='todoList-li-content-property-timerange'>{{ todoli.Started }} - {{ todoli.Deadline }}</i></p>
                            </div>
                            <div>
                                <p class='todoList-li-content-property-p'>Priority: {{ todoli.Priority }}</p>
                            </div>
                        </div>
                    </div>
                    <div class='todoList-li-operation flex-box'>
                        <i class="fa fa-cogs icon-operation"></i>
                    </div>
                </div>`
})

