import Vue from 'vue'
import Router from 'vue-router'
import Login from './../views/login/Login'
import Home from './../views/query/Home'
import Req from './../views/query/Req'
import Po from './../views/query/Po'
import Test from './../views/Test'
import NoFind from './../views/404/NoFind'
import ReqClaim from './../views/claim/ReqClaim'
import ClaimDetail from './../views/claim/ClaimDetail'
import CreateOrder from './../views/create/CreateOrder'
import SupDate from './../views/claim/SupDate'
import CreateSku from './../views/create/CreateSku'
import PoDetail from './../views/podetail/PoDetail'
import PoLoss from './../views/podetail/PoLoss'

Vue.use(Router)

const router = new Router({
/*  mode: 'history',*/
  base: __dirname,
  routes: [
    //重定向到login
    {
      path: '/',
      redirect: '/login',
      meta: { requiresAuth: true },
    },
    //登录
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    //首页
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'req',
          name: 'req',
          meta: { requiresAuth: true },
          component: Req
        },
        {
          path: 'po',
          name: 'po',
          meta: { requiresAuth: true },
          component: Po
        },
      ]
    },
    //需求认领页
    {
      path:'/reqclaim',
      name:'reqclaim',
      meta: { requiresAuth: true },
      component: ReqClaim
    },
    //认领详情页
    {
      path:'/claimdetail',
      name:'claimdetail',
      meta: { requiresAuth: true },
      component: ClaimDetail
    },
    //创建采购单
    {
      path:'/createorder',
      name:'createorder',
      meta: { requiresAuth: true },
      component: CreateOrder
    },
    //选择供应商
    {
      path:'/supdate',
      name:'supdate',
      meta: { requiresAuth: true },
      component: SupDate
    },
    //创建采购单
    {
      path:'/createsku',
      name:'createsku',
      meta: { requiresAuth: true },
      component: CreateSku
    },
    //po详情单
    {
      path:'/podetail',
      name:'podetail',
      meta: { requiresAuth: true },
      component: PoDetail
    },
    //po补损
    {
      path:'/poloss',
      name:'poloss',
      meta: { requiresAuth: true },
      component: PoLoss
    },

    //测试
    {
      path: '/test',
      name: 'test',
      component: Test,
    },
    // path 找不到组件 404
    { path: '*', component: NoFind }
  ]
})


router.beforeEach((to, from, next) => {
  let userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  if (to.matched.some(record => record.meta.requiresAuth) && (!userInfo || userInfo === null)) {
    next({
      path: '/login',
      //query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
