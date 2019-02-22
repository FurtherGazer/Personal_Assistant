import Vue from 'vue'
import Datetime from 'vue-datetime'
// You need a specific loader for CSS files
import 'vue-datetime/dist/vue-datetime.css'

Vue.use(Datetime)


// 这个 js 文件用来构建组件

// todoli 组件
Vue.component('todoli', {
    props: ['todoli'],
    template:  `<div class='todoList-li flex-box'>
                    <div class='todoList-li-content flex-box'>
                        <div class='todoList-li-content-text'>
                            <p class='todoList-li-content-p'>{{ todoli.Text }}</p>
                        </div>
                        <div class='todoList-li-content-time flex-box'>
                            <div>
                                <p class='todoList-li-content-time-p'>Started: {{ todoli.Started }}</p>
                            </div>
                            <div>
                                <p class='todoList-li-content-time-p'>Deadline: {{ todoli.Deadline }}</p>
                            </div>
                            <div>
                                <p class='todoList-li-content-time-p'>Priority: {{ todoli.Priority }}</p>
                            </div>
                        </div>
                    </div>
                    <div class='todoList-li-operation flex-box'>
                        <i class="fa fa-cogs icon-operation"></i>
                    </div>
                </div>`
})

