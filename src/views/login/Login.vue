<template>
  <div class='login'>
    <group>
      <x-input title="账户：" type="text" placeholder="请输入账户" v-model="account"></x-input>
      <x-input title="密码：" type="password" placeholder="请输入密码" v-model="password"></x-input>
    </group>
    <x-button type="primary" :show-loading="loginLoading" action-type="button" class="login-btn" @click.native='login'>
      {{loginText}}
    </x-button>
  </div>
</template>
<script>
  import * as api from './../../api/'
  import * as types from './../../store/types'
  import {Group, XInput, XButton} from 'vux'
  import {mapMutations} from 'vuex'

  export default {
    name: 'login',
    data() {
      return {
        account: '',
        password: '',
        loginText: '登录',
        loginLoading: false
      }
    },
    components: {
      Group,
      XInput,
      XButton,
    },
    mounted() {
      localStorage.clear();
    },
    methods: {
      ...mapMutations({
        setUserInfo: 'SET_USER_INFO'
      }),
      //用户登录
      login() {
        const that = this
        //用户名或密码为空
        if (that.account == '' || that.password == '') {
          that.$vux.alert.show({
            title: '提示',
            content: '账号或密码不能为空，请重新输入！',
          })
          that.loginLoading=false
        } else {
          that.loginLoading = true
          that.loginText = '登录中'
          api.fetch('/urfresh/pms/app/v1/doLogin', {
            userName: this.account,
            password: this.password
          })
            .then(res => {

              if (res.result) {
                //保存用户信息
                that.setUserInfo(res.content)
                setTimeout(() => {
                  that.$router.push('/home/req')
                }, 2000);
              } else {
                that.loginText = '登录'
                that.loginLoading=false
                //错误信息
                that.$vux.alert.show({
                  title: '提示',
                  content: res.remark,
                })
              }
            }).catch(err => {
            console.log(err)
          })
        }
      }
    },

  }
</script>
<style lang="less" type="text/less" scoped>
  .login {
    margin-top: 0.4rem;
  }

  .login-btn {
    width: 80%;
    color: #fff;
    margin-top: 0.2rem;
  }
</style>
