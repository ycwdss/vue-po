<template>
  <div class='query'>
    <div class="header">
      <div class="header-inner clearfix">
        <router-link to="req" active-class="active">需求单</router-link>
        <router-link to="po" active-class="active">PO单</router-link>
      </div>
      <a class="sign-out" @click="signOut">退出登录</a>
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
  import * as api from './../../api/'
  import * as utils from './../../utils/'
  import Req from './Req'
  import Po from './Po'
  import {dateFormat} from 'vux'
  import {mapActions,mapGetters} from 'vuex'

  export default {
    data() {
      return {}
    },
    components: {
      Req,
      Po
    },
    computed: {
      ...mapGetters([
        'userInfo',
      ]),
    },
    mounted() {
      //清除codeInfo
      localStorage.removeItem('codeInfo')
      //查询仓库
      this.getWhList(this.userInfo.id)
    },
    methods: {
      ...mapActions([
        'getWhList',
      ]),
      //退出登录
      signOut() {
        api.fetch('/urfresh/pms/app/v1/logOut', {
          userId: this.userInfo.id
        }).then(res=> {
          if (res.result) {
            localStorage.clear();
            this.$router.push('/login');
          }
        }).catch(err=> {
          this.$vux.toast.text(err, 'middle')
        })
      }
    }
  }
</script>
<style lang="less" type="text/less" scoped>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 666;
    width: 100%;
    height: 0.40rem;
    line-height: 0.40rem;
    background-color: #ebebeb;
    border-bottom: 1px solid #e4e4e4;
    box-sizing: border-box;
  }

  .header-inner {
    position: absolute;
    left: 50%;
    top: 0.05rem;
    margin-left: -25%;
    width: 50%;
    height: 0.30rem;
    line-height: 0.30rem;
    font-size: 0;
    -webkit-border-radius: 0.05rem;
    -moz-border-radius: 0.05rem;
    border-radius: 0.05rem;
    border: 1px solid #04BE02;
    box-sizing: border-box;
    overflow: hidden;

    a {
      display: block;
      float: left;
      width: 50%;
      height: 0.3rem;
      line-height: 0.3rem;
      font-size: 0.14rem;
      color: #333;
      text-align: center;
    }
  }

  .sign-out {
    position: absolute;
    top: 0;
    right: 0.1rem;
    font-size: 0.13rem;
  }

  .content {
    margin-top: 0.4rem;
  }

</style>
