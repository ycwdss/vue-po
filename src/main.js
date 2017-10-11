// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'babel-polyfill'
import store from './store'
import utils from './utils' //全局
Vue.config.productionTip = false

const FastClick = require('fastclick')
FastClick.attach(document.body)
//提示插件
import  { ToastPlugin } from 'vux'
Vue.use(ToastPlugin)
//alert插件
import  { AlertPlugin } from 'vux'
Vue.use(AlertPlugin)
//comfirm
import  { ConfirmPlugin } from 'vux'
Vue.use(ConfirmPlugin)

//loading插件
import  { LoadingPlugin } from 'vux'
Vue.use(LoadingPlugin)
//滚动加载
import infiniteScroll from 'vue-infinite-scroll'
Vue.use(infiniteScroll)


new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
