/**
 * Created by wang on 2017/6/8.
 */
var Toast = {};
Toast.install = function (Vue, options) {
  var opt = {
    defaultType: 'center',// 默认显示位置
    duration: '2000',   // 持续时间
    skip: false   //如果是true跳转到login
  }
  for (var property in options) {
    opt[property] = options[property];// 使用 options 的配置
  }
  //添加实例
  Vue.prototype.$toast = function (obj) {

    var direction = obj.direction ? obj.direction : opt.defaultType;
    var duration = obj.duration ? obj.duration : opt.duration;
    var skip = obj.skip ? obj.skip : opt.skip;

    // 如果toast还在，则不再执行
    if (document.querySelector('.toast')) {
      return;
    }
    // 1、创建构造器，定义好提示信息的模板
    var toastTpl = Vue.extend({
      template: '<div class="toast toast-' + direction + '">' + obj.msg + '</div>'
    });
    // 2、创建实例，挂载到文档以后的地方
    var tpl = new toastTpl().$mount().$el;
    // 3、把创建的实例添加到body中
    document.body.appendChild(tpl);
    // 4、延迟2秒后移除该提示
    setTimeout(() => {
      document.body.removeChild(tpl);
      if (skip) {
        this.$router.push('/login');
        localStorage.clear();
      }
    }, duration)
  };

}
module.exports = Toast;
/*
 https://zhuanlan.zhihu.com/p/26057542*/
