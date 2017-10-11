<template>
  <div class='po'>
    <div class="po-form">
      <group>
        <x-input title="PO 单号：" type="text" placeholder="请输入PO单号" v-model="poCode"></x-input>
        <x-input title="需求单号：" type="text" placeholder="请输入需求单号" v-model="prCode"></x-input>
        <selector title="所属仓库：" :options="whOptions" v-model="whId" @on-change="poWhChange"></selector>
        <datetime placeholder="请选择开始时间" title="开始时间：" :min-year=2000 :max-year=2030 format="YYYY-MM-DD HH:mm:00"
                  year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分"
                  confirm-text="完成" cancel-text="取消" v-model="gmtCreateFm"
                  :class="gmtCreateFm!==''?'date-time':''"
        ></datetime>
        <datetime placeholder="请选择结束时间" title="结束时间：" :min-year=2000 :max-year=2030 format="YYYY-MM-DD HH:mm:00"
                  year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分"
                  confirm-text="完成" cancel-text="取消" v-model="gmtCreateTo"
                  :class="gmtCreateTo!==''?'date-time':''"
        ></datetime>
        <selector title="PO 状态：" :options="poStatusArr" v-model="poStatus" @on-change="poStatusChange"></selector>
        <div class="po-check weui-cell">
          <div @click="checkClick">
            <icon :type="check" class="check-icon"></icon>
            <input id="my-created" ref="myCreated" type="checkbox" checked>
            <label for="my-created">仅查看我创建的</label>
          </div>
        </div>
      </group>
      <div class="po-btn">
        <x-button mini type="primary" @click.native="poOrderClick">查询</x-button>
      </div>
    </div>
    <div class="po-content">
      <PoList :poList="poInfoList"
              v-infinite-scroll="loadMore"
              infinite-scroll-immediate-check="true"
              infinite-scroll-disabled="busy"
              infinite-scroll-distance="10"></PoList>
      <load-more :tip="loadingMsg" :show-loading="loading" background-color="#ebebeb"></load-more>
    </div>
  </div>
</template>
<script>
  import * as api from './../../api/'
  import * as utils from './../../utils/'
  import {Group, XInput, Selector, Datetime, XButton, Icon, dateFormat, LoadMore} from 'vux'
  import {mapGetters} from 'vuex'
  import PoList from './../../components/PoList'

  export default {
    name: 'po',
    data() {
      return {
        whOptions: [],
        poStatusArr: [
          {key: '-1', value: '全部'},
          {key: '00', value: '初始化'},
          {key: '10', value: '已审核'},
          {key: '30', value: '已收货/退货'},
          {key: '40', value: '已完成'}
        ],
        check: 'success',
        poCode: '', //PO单号
        prCode: '', //需求单号
        prId: '',//需求单ID
        whId: 1, //仓库ID
        params: {},//传的参数
        gmtCreateFm: '',//开始时间
        gmtCreateTo: '',//结束时间
        poStatus: -1, //PO状态
        onlyQueryMyCreate: 1,//是不是自己创建的 1是0否
        poInfoList: [],
        currentPage: 1,//当前页
        pageSize: 10, //加载数据条数
        totalPages: '',//总共页数
        totalCount: 0,//总共有多少条数据
        loading: false, //控制loading
        loadingMsg: '正在加载...',//控制loading文字
      }
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'whList'
      ])
    },
    components: {
      Group,
      XInput,
      Selector,
      Datetime,
      XButton,
      Icon,
      LoadMore,
      PoList,
    },
    mounted() {
      //loading
      this.$vux.loading.show({
        text: '加载中...'
      })
      //仓库列表
      this.whOptions = this.whList
      //保存仓库
      const poWh = localStorage.getItem('poWh') || 1;
      this.whId = parseInt(poWh);
      //保存PO状态
      const poStatus = localStorage.getItem('poStatus') || -1;
      this.poStatus = parseInt(poStatus);

      //相关需求单传过来的参数 显示PO单列表
      this.params = this.$route.params
      console.log(this.params)
      if (this.params.prId) {
        this.prCode = this.params.prCode
        this.prId = this.params.prId
        this.whId = this.params.whId
        this.reqToPoAjax(this.currentPage)
      } else {
        this.poOrderAjax(this.currentPage);
      }
    },
    methods: {
      poWhChange(val) {
        localStorage.setItem('poWh', val)
        this.whId = val;
      },
      //选择PO状态
      poStatusChange(val) {
        localStorage.setItem('PoStatus', val)
      },
      //是否选中自己创建
      checkClick() {
        if (this.$refs.myCreated.checked) {
          this.check = 'success'
          this.onlyQueryMyCreate = 1
        } else {
          this.check = 'circle'
          this.onlyQueryMyCreate = 0
        }
      },
      //查询PO单函数
      poOrderAjax(currentPage) {
        const that = this
        that.loading = true;
        api.fetch('/urfresh/pms/app/v1/queryPurchaseOrderList', {
          userId: that.userInfo.id,//必填
          poCode: that.poCode,
          prCode: that.prCode,
          whId: that.whId, //必填
          gmtCreateFm: that.gmtCreateFm,
          gmtCreateTo: that.gmtCreateTo,
          poStatus: that.poStatus,
          currentPage: currentPage,//必填
          pageSize: that.pageSize, //必填
          onlyQueryMyCreate: that.onlyQueryMyCreate,//1是0否
        })
          .then(res => {
            //隐藏loading
            that.$vux.loading.hide()
            //查有数据
            if (res.result) {
              if (res.content.totalCount !== 0) {
                that.poInfoList = that.poInfoList.concat(res.content.poInfoList)
                that.totalCount = res.content.totalCount;
                that.totalPages = Math.ceil(that.totalCount / that.pageSize); //总共页数
                if (that.totalCount === that.poInfoList.length) {
                  that.loading = false
                  that.loadingMsg = '暂无更多数据'
                }
              } else {
                that.loading = false
                that.loadingMsg = '暂无数据'
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
      poOrderClick() {
        this.poInfoList = [];
        this.params={};
        this.currentPage = 1;
        this.loading = true
        this.loadingMsg = '正在加载...'
        this.poOrderAjax(this.currentPage);
      },
      //获取更多数据
      loadMore() {
        const that = this
        that.busy = true;
        that.currentPage++
        setTimeout(() => {
          if (that.currentPage <= that.totalPages) {
            console.log('总计totalPages:' + that.totalPages);
            console.log('当前页数currentPage:' + that.currentPage);
            if (that.params.prId) {
              that.reqToPoAjax(that.currentPage)
            } else {
              that.poOrderAjax(that.currentPage);
            }
          } else {
            that.loading = false
            that.loadingMsg = '暂无更多数据'
          }
          that.busy = false;
        }, 2000);
      },
      //需求单查看相关PO单
      reqToPoAjax(currentPage) {
        const that = this
        console.log(currentPage)
        api.fetch('/urfresh/pms/app/v1/queryPRRelatedPoListById', {
          userId: that.userInfo.id,
          prId: that.prId,
          whId: that.whId,
          currentPage: currentPage,
          pageSize: that.pageSize,
        })
          .then(res => {
            //隐藏loading
            that.$vux.loading.hide()
            if (res.result) {
              if (res.content !== null) {
                that.poInfoList = that.poInfoList.concat(res.content.poInfoList)
                that.totalCount = res.content.totalCount;
                that.totalPages = Math.ceil(that.totalCount / that.pageSize); //总共页数
                if (that.totalCount === that.poInfoList.length) {
                  that.loading = false
                  that.loadingMsg = '暂无更多数据'
                }
              } else {
                that.loading = false
                that.loadingMsg = '暂无数据'
              }
            }else {
              that.$vux.alert.show({
                title: '提示',
                content: res.content
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    }

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
  .po-form {
    background-color: #fff;
  }

  .po-btn {
    text-align: center;
    padding: 0.1rem 0;

    button {
      display: block;
    }
  }

  .po-check {
    padding: 10px 0 10px 120px;
    label {
      margin-left: -0.05rem;
      vertical-align: middle;
    }
  }

  .check-icon {
    font-size: 20px;
  }

  #my-created {
    position: absolute;
    top: 12px;
    left: 125px;
    width: 20px;
    height: 20px;
    opacity: 0;
  }
</style>
