<template>
  <div class='req'>
    <div class="req-form">
      <group>
        <x-input title="需求单号：" type="text" v-model="prCode" placeholder="请输入需求单号"></x-input>
        <selector title="所属仓库：" :options="whOptions" v-model="whId" @on-change="reqWhChange"></selector>
        <datetime placeholder="请选择开始时间" title="开始时间：" :min-year=2000 :max-year=2030 format="YYYY-MM-DD HH:mm:00"
                  year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分"
                  confirm-text="确认" cancel-text="取消" v-model="gmtCreateFm"
                  :class="gmtCreateFm!==''?'date-time':''"
        ></datetime>
        <datetime placeholder="请选择结束时间" title="结束时间：" :min-year=2000 :max-year=2030 format="YYYY-MM-DD HH:mm:00"
                  year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分"
                  confirm-text="确认" cancel-text="取消" v-model="gmtCreateTo"
                  :class="gmtCreateTo!==''?'date-time':''"
        ></datetime>
        <selector title="采购状态：" :options="reqStatusArr" v-model="prStatus" @on-change="reqStatusChange"></selector>
      </group>
      <div class="req-btn">
        <x-button mini type="primary" @click.native="reqOrderClick">查询</x-button>
      </div>
    </div>
    <div class="req-content">
      <ReqList :reqList="prInfoList" :userId=userId
               v-infinite-scroll="loadMore"
               infinite-scroll-disabled="busy"
               infinite-scroll-immediate-check="true"
               infinite-scroll-distance="10"></ReqList>
      <load-more :tip="loadingMoreMsg" :show-loading="loadingMore" background-color="#ebebeb"></load-more>
    </div>
  </div>
</template>
<script>
  import * as api from './../../api/'
  import * as utils from './../../utils/'
  import {mapGetters} from 'vuex'
  import {Group, XInput, Selector, Datetime, XButton, dateFormat, LoadMore} from 'vux'
  import ReqList from './../../components/ReqList'

  export default {
    name: 'req',
    data() {
      return {
        busy: false,
        userId: '',//登录者id
        whOptions: [],
        reqStatusArr: [
          {key: '-1', value: '全部'},
          {key: '10', value: '待采购'},
          {key: '20', value: '采购中'},
          {key: '40', value: '已完成'},
          {key: '99', value: '已取消'}
        ],
        prCode: '', //需求单号
        whId: 1, //仓库ID
        params:{},//po->需求单参数
        gmtCreateFm: '',//开始时间
        gmtCreateTo: '',//结束时间
        prStatus: -1, //采购状态
        prInfoList: [],
        currentPage: 1,//当前页
        pageSize: 10, //加载数据条数
        totalPages:'',//总页数
        totalCount: 0,//总共有多少条数据
        loadingMore: false, //是否显示loadingMore
        loadingMoreMsg: '正在加载...',//控制loadingMore文字
      }
    },
    mounted() {
      //loading
      this.$vux.loading.show({
        text: '加载中...'
      })

      //仓库列表
      this.whOptions = this.whList
      //保存仓库
      const reqWh = localStorage.getItem('reqWh') || 1;
      this.whId = parseInt(reqWh);
      //保存采购状态
      const reqStatus = localStorage.getItem('reqStatus') || -1;
      this.prStatus = parseInt(reqStatus);
      //用户ID
      this.userId = this.userInfo.id
      //相关po单传过来的参数 显示PO单列表
      this.params=this.$route.params
      if(this.params.poId){
        this.whId=this.params.whId
        this.poToReqAjax(this.currentPage)
      }else {
        this.reqOrderAjax(this.currentPage);
      }
      //清除codeInfo
      localStorage.removeItem('codeInfo')
      //清除供应商
      localStorage.removeItem('supplier')
      //清除日期
      localStorage.removeItem('endTime')
      //清除需求单头部
      localStorage.removeItem('prHeaderInfo')
    },
    components: {
      Group,
      XInput,
      Selector,
      Datetime,
      XButton,
      ReqList,
      LoadMore
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'whList'
      ])
    },
    methods: {
      //选择仓库
      reqWhChange(val) {
        localStorage.setItem('reqWh', val)
        this.whId = val;
      },
      //选择采购状态
      reqStatusChange(val) {
        localStorage.setItem('reqStatus', val)
      },
      //查询需求单函数
      reqOrderAjax(currentPage) {
        const that = this
        that.loadingMore = true;
        api.fetch('/urfresh/pms/app/v1/queryPurchaseRequisitionList', {
          userId: that.userInfo.id,//必填
          prCode: that.prCode,
          whId: that.whId, //必填
          gmtCreateFm: that.gmtCreateFm,
          gmtCreateTo: that.gmtCreateTo,
          prStatus: that.prStatus,
          currentPage: currentPage,//必填
          pageSize: that.pageSize //必填
        })
          .then(res => {
            //隐藏loading
            that.$vux.loading.hide()
            if (res.result) {
              //有数据
              if (res.content !== null) {
                that.prInfoList = that.prInfoList.concat(res.content.prInfoList)
                that.totalCount = res.content.totalCount;
                that.totalPages = Math.ceil(this.totalCount / this.pageSize); //总共页数
                //暂无更多数据
                if (that.totalCount === that.prInfoList.length) {
                  that.loadingMore = false
                  that.loadingMoreMsg = '暂无更多数据'
                }
              } else {
                //查无数据
                that.loadingMore = false
                that.loadingMoreMsg = '暂无数据'
              }
            }else {
              that.$vux.alert.show({
                title: '提示',
                content: res.content
              })
            }
          })
          .catch(err => {
            that.$vux.alert.show({
              title: '提示',
              content: '连接超时，请稍后再试！'
            })
          })
      },
      //点击查询需求单
      reqOrderClick() {
        this.prInfoList = [];
        this.params={};
        this.currentPage = 1;
        this.loadingMore = true
        this.loadingMoreMsg = '正在加载...'
        this.reqOrderAjax(this.currentPage);
      },
      //获取更多数据
      loadMore() {
        const that = this;
        that.busy = true;
        console.log('到底了')
        console.log(that.currentPage)
        console.log(that.totalPages)
        console.log(typeof that.totalPages)
        that.currentPage++
        setTimeout(() => {
          if (that.currentPage <= that.totalPages) {
            console.log('总计totalPages:' + that.totalPages);
            console.log('当前页数currentPage:' + that.currentPage);
            that.reqOrderAjax(that.currentPage)
          } else {
            that.loadingMore = false
            that.loadingMoreMsg = '暂无更多数据'
          }
          that.busy = false;
        }, 2000);
      },
      //po->需求单queryPORelatedPRListById
      poToReqAjax(currentPage) {
        const that = this
        that.loadingMore = true;
        api.fetch('/urfresh/pms/app/v1/queryPORelatedPRListById', {
          userId: that.userInfo.id,//必填
          poId: that.params.poId,
          whId: that.params.whId,
          currentPage: currentPage,
          pageSize: that.pageSize
        })
          .then(res => {
            //隐藏loading
            that.$vux.loading.hide()
            if (res.result) {
              //有数据
              if (res.content !== null) {
                that.prInfoList = that.prInfoList.concat(res.content.prInfoList)
                that.totalCount = res.content.totalCount;
                that.totalPages = Math.ceil(this.totalCount / this.pageSize); //总共页数
                //暂无更多数据
                if (that.totalCount === that.prInfoList.length) {
                  that.loadingMore = false
                  that.loadingMoreMsg = '暂无更多数据'
                }
              } else {
                //查无数据
                that.loadingMore = false
                that.loadingMoreMsg = '暂无数据'
              }
            }else {
              that.$vux.alert.show({
                title: '提示',
                content: res.content
              })
            }
          })
          .catch(err => {
            that.$vux.alert.show({
              title: '提示',
              content: '连接超时，请稍后再试！'
            })
          })
      },
    },

  }
</script>
<style lang="less" type="text/less">
  .vux-datetime div:first-child p {
    width: 6em;
  }

  .vux-datetime-value {
    text-align: left !important;
  }

  .date-time .vux-cell-value {
    color: #333;
  }

  .req-form {
    background-color: #fff;
  }

  .req-btn {
    text-align: center;
    padding: 0.1rem 0;
    button {
      display: block;
    }
  }

</style>
