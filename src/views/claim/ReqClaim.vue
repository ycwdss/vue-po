<template>
  <div class='req-claim'>
    <x-header :left-options="{backText: ''}" style="background-color:#ebebeb;">需求认领页</x-header>
    <div class="claim-hd">
      <div class="hd-list clearfix">
        <span class="fl">{{codeInfo.prCode}}{{(codeInfo.note == null) ? '' : `(` + codeInfo.note + `)`}}</span>
        <span class="fr"
              :class="(new Date().getTime()-parseInt(codeInfo.gmtCreate)<= 172800000)?'active-red':''"> {{parseInt(codeInfo.gmtCreate) | dateFM}}</span>
      </div>
      <div class="hd-list clearfix">
        <span class="fl"
              :class="(parseInt(codeInfo.prStatus)==10||parseInt(codeInfo.prStatus)==20)?'active-red':'active-green'">
          {{codeInfo.prStatus | prStatusToText}}
        </span>
        <span class="fr">{{codeInfo.whName}}</span>
      </div>
      <div class="hd-list">
        <group>
          <selector title="商品状态：" :options="reqClaimStatusArr" v-model="reqClaimStatus"></selector>
        </group>
      </div>
      <div class="hd-list">
        <x-button mini type="primary" @click.native="reqClaimClick">查询</x-button>
      </div>
    </div>
    <div class="claim-md" @click="claimMy">
      点击查看我认领的
      <x-icon type="ios-arrow-right" size="14" class="icon-arrow-right"></x-icon>
    </div>
    <div class="claim-bd">
      <p class="bd-all" @click="allClick">全选</p>
      <div class="bd-content"
           v-infinite-scroll="loadMore"
           infinite-scroll-immediate-check="true"
           infinite-scroll-disabled="busy"
           infinite-scroll-distance="10">
        <checker type="checkbox" default-item-class="bd-list" selected-item-class="checked" v-model="checkedArr">
          <checker-item :value="item.id"
                        v-for="(item, index) in prDetails"
                        @on-item-click="itemClick"
                        :key="index"
                        :disabled="(parseInt(item.detailStatus)==20||parseInt(item.detailStatus)==40)?true:false"
                        :class="(parseInt(item.detailStatus)==20||parseInt(item.detailStatus)==40)?'gray':'normal'"
          >
            <div class="list-name clearfix">
              <span>{{item.skuName}}</span>
              <span>{{`(` + item.productCode + `)`}}</span>
            </div>
            <div class="list-num clearfix">
              <span>需求量：<em>{{item.needQty}}</em>盒</span>
              <span>已采购量：<em>{{item.hasPurchasedQty}}</em>盒</span>
              <span>差异：<em>{{item.defferentQty}}</em>盒</span>
            </div>
            <div class="list-msg ">{{(item.note == null) ? '' : `备注：(` + item.note + `)`}}</div>
            <div class="list-check"></div>
          </checker-item>
        </checker>
      </div>
    </div>
    <load-more :tip="loadingMsg" :show-loading="loading" background-color="#ebebeb"></load-more>
    <div class="claim-ft">
      <x-button mini type="primary" @click.native="claimOk">确认认领</x-button>
    </div>

  </div>
</template>
<script>
  import * as api from './../../api/'
  import * as utils from './../../utils/'
  import {mapGetters} from 'vuex'
  import {XHeader, Selector, Group, XButton, Checker, CheckerItem, dateFormat, Icon, LoadMore} from 'vux'

  export default {
    name: 'req-claim',
    data() {
      return {
        reqClaimStatusArr: [
          {key: '10', value: '待认领'},
          {key: '20', value: '采购中'},
          {key: '40', value: '已完成'},
          {key: '99', value: '已取消'},
          {key: '-1', value: '全部'},
        ],
        params: {},//需求单查看详情参数
        reqClaimStatus: 10, //商品状态
        prDetails: [], //数据集合
        filterPrDetails: [],//过滤不可选的
        checkAll: true,//全选开关
        currentPage: 1,//当前页
        pageSize: 10, //加载数据条数
        totalCount: 0,//总共有多少条数据
        totalPages: '',//总页数
        loading: false, //控制loading
        loadingMsg: '正在加载...',//控制loading文字
        checkedArr: [],
        isChecked: false,
        busy: false,
      }
    },
    components: {
      XHeader,
      Selector,
      Group,
      XButton,
      Icon,
      LoadMore,
      Checker,
      CheckerItem
    },
    mounted() {
      //loading
      this.$vux.loading.show({
        text: '加载中...'
      })
      //获取数据集合
      this.reqClaimAjax(this.currentPage)
      //清除供应商
      localStorage.removeItem('supplier')
      //清除日期
      localStorage.removeItem('endTime')
      //清除需求单头部
      localStorage.removeItem('prHeaderInfo')
    },
    computed: {
      ...mapGetters([
        'userInfo',//用户信息
        'codeInfo',//共享需求单，仓库信息等数据
      ])
    },

    watch: {
      //筛选符合条件才能选中的商品信息集合
      prDetails() {
        this.filterPrDetails = this.prDetails.filter(item => {
          if (!(parseInt(item.detailStatus) === 20 || parseInt(item.detailStatus) === 40)) {
            return item
          }
        })
      },
      //全选与取消全选条件
      checkedArr() {
        if (this.checkedArr.length === this.filterPrDetails.length) {
          this.checkAll = false
        } else {
          this.checkAll = true
        }
      },
      //检测加载的数据 全选与取消条件
      filterPrDetails() {
        if (this.checkedArr.length === this.filterPrDetails.length) {
          this.checkAll = false
        } else {
          this.checkAll = true
        }
      }
    },
    methods: {
      //点击查询
      reqClaimClick() {
        this.prDetails = [];
        this.checkedArr = [];
        this.currentPage = 1;
        this.loading = true
        this.loadingMsg = '正在加载...'
        this.reqClaimAjax(this.currentPage);
      },
      //请求数据
      reqClaimAjax(currentPage) {
        const that = this
        that.loading = true;
        api.fetch('/urfresh/pms/app/v1/queryPRDetailsByIdAndDetailStatus', {
          userId: this.userInfo.id,//必填
          prId: this.codeInfo.prId,
          whId: this.codeInfo.whId, //必填
          prDetailStatus: this.reqClaimStatus,
          currentPage: currentPage,//必填
          pageSize: this.pageSize //必填
        })
          .then(res => {
            //隐藏loading
            that.$vux.loading.hide()
            //查有数据
            if (res.result) {
              that.prDetails = that.prDetails.concat(res.content.prDetails)
              that.totalCount = res.content.totalCount;
              that.totalPages = Math.ceil(that.totalCount / that.pageSize); //总共页数
              //暂无更多数据
              if (that.totalCount == that.prDetails.length) {
                that.loading = false
                that.loadingMsg = '暂无更多数据'
              }
              //查无数据
              if (that.totalCount == 0 || that.prDetails == null) {
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
      },
      //获取更多数据
      loadMore: function () {
        const that = this
        that.busy = true;
        that.currentPage++
        setTimeout(() => {
          if (this.currentPage <= that.totalPages) {
            console.log('总计totalPages:' + that.totalPages);
            console.log('当前页数currentPage:' + that.currentPage);
            this.reqClaimAjax(that.currentPage)
          } else {
            that.loading = false
            that.loadingMsg = '暂无更多数据'
          }
          that.busy = false;
        }, 1000);
      },
      //多选
      allClick() {
        this.checkedArr = []
        if (this.checkAll) {
          //都选中
          this.filterPrDetails.forEach((val, index) => {
            this.checkedArr.push(this.filterPrDetails[index].id)
          })
        }
      },
      //单个点击
      itemClick(value, disabled) {
        console.log(value, disabled)
      },
      //确认认领
      claimOk() {
        const that=this
        if (that.checkedArr.length == 0) {
          that.$vux.alert.show({
            title: '提示',
            content: '请选择要认领的商品'
          })
        } else {
          api.fetch('/urfresh/pms/app/v1/holdRequisitionDetailsPurchasing', {
            userId: that.userInfo.id,
            userName: that.userInfo.realName,
            prId: that.codeInfo.prId,
            whId: that.codeInfo.whId,
            prDetailIds: that.checkedArr,
          })
            .then(res => {
              //认领成功
              if (res.content.result) {
                that.$vux.toast.show({
                  text: '认领成功',
                  width: '50%',
                  type: 'text',
                  position: 'middle'
                })
                setTimeout(() => {
                  that.$router.push('/claimdetail');
                }, 1000)
              } else {//认领失败
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

      },
      //查看我的
      claimMy() {
        this.$router.push('/claimdetail');
      }
    }
  }
</script>
<style lang="less" type="text/less">


  .req-claim {
    padding-bottom: 0.5rem;
  }

  .claim-hd {
    padding: 0 0.2rem;
    background-color: #fff;
    .hd-list {
      line-height: 0.24rem;
      span {
        font-size: 0.14rem;
      }
      span:first-child {
        width: 60%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      span:last-child {
        width: 40%;
        text-align: right;
      }

      .weui-cells {
        margin-top: 0;
        font-size: 0.14rem;
        padding-bottom: 0.08rem;
        &:before {
          border: 0;
        }
        .weui-select {
          height: 0.24rem;
          line-height: 0.24rem;
        }
        .vux-selector.weui-cell_select-after {
          padding-left: 0;
        }
      }

    }

    .hd-list:first-child {
      span {
        font-size: 0.13rem;
      }
      span:first-child {
        font-weight: 600;
      }

    }

    .hd-list:last-child {
      text-align: center;
      padding: 0.08rem 0;
      button {
        display: block;
      }

    }
  }

  .claim-md {
    position: relative;
    margin: 0.1rem auto;
    height: 0.4rem;
    line-height: 0.4rem;
    font-size: 0.14rem;
    background-color: #fff;
    text-align: right;
    padding: 0 0.4rem 0 0.2rem;
    .icon-arrow-right {
      display: block;
      position: absolute;
      top: 0.12rem;
      right: 0.15rem;
      width: 0.16rem;
      height: 0.16rem;
      fill: #C8C8CD;
    }

  }

  .claim-bd {
    padding: 0.1rem 0.2rem;
    background-color: #fff;
    margin-bottom: 0.2rem;

    .bd-list {
      width: 100%;
      position: relative;
      font-size: 0.13rem;
      padding: 0.1rem 0;
      border-bottom: 1px solid #ededed;
    }
    .bd-all {
      text-align: right;
      font-size: 0.14rem;
      color: #007aff;
    }
    .list-name span {
      font-weight: 600;
      font-size: 0.13rem;
      &:first-child {
        float: left;
        max-width: 60%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      &:last-child {
        float: right;
        width: 40%;
        text-align: right;
      }
    }
    .list-num {
      font-size: 0.12rem;
      span {
        display: block;
        width: 50%;
        float: left;
        line-height: 0.2rem;
        em {
          color: #f00;
        }
      }
    }
    .list-msg {
      font-size: 0.12rem;
    }
    .list-check {
      position: absolute;
      right: -0.03rem;
      top: 0.4rem;
      z-index: 1;
      display: block;
      width: 0.16rem;
      height: 0.16rem;
      background-color: #fff;
      border-radius: 50%;
      border: 1px solid #c9c9c9;
      box-sizing: border-box;
    }
    .checked {
      .list-check {
        border: 0;
        background: url("../../assets/images/success.png") no-repeat;
        background-size: 100% 100%;
      }
    }
  }

  .claim-ft {
    width: 100%;
    position: fixed;
    bottom: 0;
    z-index:10;
    height: 0.5rem;
    line-height: 0.5rem;
    text-align: center;
    background-color: #fff;
    .weui-btn {
      display: block;
      height: 0.3rem;
      margin: 0.1rem auto;
    }
  }


</style>
