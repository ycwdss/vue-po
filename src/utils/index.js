/**
 * Created by wang on 2017/6/1.
 */
import Vue from 'vue'
import {dateFormat} from 'vux'

//全局过滤器 prStatus 数字-->文字  10：待采购     20：采购中   40：已完成   99：已取消 -1全部
Vue.filter('prStatusToText', function (value) {
  // 返回处理后的值
  var prStatusText = ''
  switch (parseInt(value)) {
    case -1:
      prStatusText = '全部';
    case 10:
      prStatusText = '待采购';
      break;
    case 20:
      prStatusText = '采购中';
      break;
    case 40:
      prStatusText = '已完成';
      break;
    case 99:
      prStatusText = '已取消';
      break;
  }
  return prStatusText;
})
//全局过滤器 poStatus 数字-->文字  10：待采购     20：采购中   40：已完成   99：已取消 -1全部
Vue.filter('poStatusToText', function (value) {
  // 返回处理后的值
  var poStatusText = ''
  switch (value) {
    case '-1':
      poStatusText = '全部';
    case '00':
      poStatusText = '初始化';
      break;
    case  '10':
      poStatusText = '已审核';
      break;
    case '30':
      poStatusText = '已收货/退货';
      break;
    case '40':
      poStatusText = '已完成';
      break;
  }
  return poStatusText;
})
//时间转换
Vue.filter('dateFM', function (value) {
  return dateFormat(value, 'YYYY-MM-DD HH:mm')
})


//公共bus
const  bus = new Vue();
export {bus}
