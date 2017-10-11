/**
 * Created by wang on 2017/5/25.
 */
import axios from 'axios'
import qs from 'qs'
import {AlertPlugin} from 'vux'
import Vue from 'vue'

Vue.use(AlertPlugin)

// 使用代理
const HOST = '/api/';

// 全局 axios 默认配置
var instance = axios.create({
  //baseURL: "http://121.41.37.19:8081", //配置接口地址
  //baseURL: " https://scm-h5-test-office.urfresh.cn", //测试接口地址
  baseURL: "http://pms-app.urfresh.cn", //上线接口地址
  timeout: 5000,                                            //响应时间
  headers: {'content-Type': 'application/x-www-form-urlencoded'}
});


//POST传参序列化(添加请求拦截器)
instance.interceptors.request.use((config) => {
  //在发送请求之前做某件事
  if (config.method === 'post') {
    config.data = qs.stringify(config.data);
  }
  return config;
}, (error) => {
  console.log(error)
  return Promise.reject(error);
});
//返回一个Promise(发送post请求)
export function fetch(url, data) {
  let jsessionid = localStorage.getItem('userInfo')? JSON.parse(localStorage.getItem('userInfo')).jsessionid : ''
  return new Promise((resolve, reject) => {
    instance.post(url, {
      reqData: JSON.stringify(data),
      jsessionid: jsessionid,
      reqTime: +new Date()
    })
      .then(response => {
        if (response.status === 200) {
          if (response.data.resultCode === -1 || response.data.remark === '登录超时') {
            Vue.$vux.toast.show({
              text: response.data.remark,
              width: '70%',
              type: 'text',
              position: 'middle'
            })
            setTimeout(() => {
              Vue.$router.push('/login');
            }, 2000)
          } else {
            resolve(response.data);
          }
        } else {
          Vue.$vux.alert.show({
            title: '提示',
            content: '服务器错误' + (response.status || '，连接超时')
          })
        }
      })
      .catch((error) => {
        Vue.$vux.alert.show({
          title: '提示',
          content: '连接超时，请稍后再试！'
        })
        reject(error)
      })
  })
}


/*//登录
 doLogin
 //退出登录
 logOut
 //查询仓库列表
 queryWhList
 //查询需求单列表
 queryPurchaseRequisitionList
 //查询po单列表
 queryPurchaseOrderList
 //查询某一个需求单需求认领列表
 queryPRDetailsByIdAndDetailStatus
 //确认领取任务
 holdRequisitionDetailsPurchasing
 //查询我的需求单认领商品详情
 queryMyPRDetails
 //删除商品
 releasePurchasingRequisitionDetails
 //删除商品
 confirmLack
 //5个常用供应商
 queryUserLatestFiveSupplier
 //查询供应商名称
 querySupplierByName
 //查询是否有未审核的po
 queryIsExistPo
 /*
 const api = {
 doLogin: apiUrl + 'pms/app/v1/doLogin', //登录
 logOut: apiUrl + 'pms/app/v1/logOut',//退出登录
 queryWhList: apiUrl + 'pms/app/v1/queryWhList',//查询仓库列表
 queryPurchaseRequisitionList: apiUrl + 'pms/app/v1/queryPurchaseRequisitionList',//查询需求单列表
 queryPRDetailsByIdAndDetailStatus: apiUrl + 'pms/app/v1/queryPRDetailsByIdAndDetailStatus',//查询某一个需求单需求认领列表
 holdRequisitionDetailsPurchasing: apiUrl + 'pms/app/v1/holdRequisitionDetailsPurchasing ',//确认领取任务
 queryMyPRDetails: apiUrl + 'pms/app/v1/queryMyPRDetails ',//查询我的需求单认领商品详情
 releasePurchasingRequisitionDetails: apiUrl + 'pms/app/v1/releasePurchasingRequisitionDetails ',//删除商品
 confirmLack: apiUrl + 'pms/app/v1/confirmLack ',//确认缺货
 queryUserLatestFiveSupplier: apiUrl + 'pms/app/v1/queryUserLatestFiveSupplier ',//5个常用的供应商
 querySupplierByName: apiUrl + 'pms/app/v1/querySupplierByName  ',//输入供应商名字查询
 querySkuBySupplier: apiUrl + 'pms/app/v1/querySkuBySupplier  ',//查询商品名称
 queryIsExistPo: apiUrl + 'pms/app/v1/queryIsExistPo  ',//查询是否有未审核的po
 confirmPurchase: apiUrl + 'pms/app/v1/confirmPurchase  ',//不合并，直接创建PO单
 addSkuToExistPo: apiUrl + 'pms/app/v1/addSkuToExistPo  ',//合并到已有PO单
 queryPurchaseOrderDetailsById: apiUrl + 'pms/app/v1/queryPurchaseOrderDetailsById  ',//合并后的PO详情(查询PO单详情)
queryPurchaseOrderList: apiUrl + 'pms/app/v1/queryPurchaseOrderList  ',//查询po
 auditPOByIds: apiUrl + 'pms/app/v1/auditPOByIds  ',//审核PO

 queryPORelatedPRListById: apiUrl + 'pms/app/v1/queryPORelatedPRListById  ',//PO单列表-->需求单列表
 queryPRRelatedPoListById: apiUrl + 'pms/app/v1/queryPRRelatedPoListById  ',//需求单列表-->PO单列表
 };
 export default api*/
