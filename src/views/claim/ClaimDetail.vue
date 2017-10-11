<template>
  <div class='claim-detail' v-cloak>
    <x-header :left-options="{backText: ''}" style="background-color:#ebebeb;">认领商品详情页</x-header>
    <div class="detail-hd">
      <div class="hd-list clearfix">
        <span
          class="fl">{{prHeaderInfo.prCode}}{{(prHeaderInfo.note == null) ? '' : `(` + prHeaderInfo.note + `)`}}</span>
        <span class="fr"
              :class="(new Date().getTime()-prHeaderInfo.gmtCreate<= 172800000)?'active-red':''"> {{parseInt(prHeaderInfo.gmtCreate) | dateFM}}</span>
      </div>
      <div class="hd-list clearfix">
        <span class="fl"
              :class="(parseInt(prHeaderInfo.prStatus)==10||parseInt(prHeaderInfo.prStatus)==20)?'active-red':'active-green'">
          {{prHeaderInfo.prStatus | prStatusToText}}
        </span>
        <span class="fr">{{prHeaderInfo.whName}}</span>
      </div>
      <div class="hd-list">认领人：{{prHeaderInfo.userName == '' ? '暂无' : prHeaderInfo.userName}}</div>
    </div>
    <div class="detail-md" v-show="showMark">
      <div class="md-list clearfix">
        <router-link to="/supdate" class="clearfix">
          <span>选择供应商：</span>
          <input placeholder="请选择供应商" readonly="readonly" v-model="this.supplier.value">
          <x-icon type="ios-arrow-right" size="14" class="icon-arrow-right"></x-icon>
        </router-link>
      </div>
      <div class="md-list">
        <router-link to="/supdate" class="clearfix">
          <span>预计到货日期：</span>
          <input placeholder="请选择预计到货日期" readonly="readonly" v-model="this.endTime">
          <x-icon type="ios-arrow-right" size="16" class="icon-arrow-right"></x-icon>
        </router-link>
      </div>
    </div>
    <div class="detail-bd">
      <div class="bd-all" v-if="showMark">
        <span @click="deleteClick">删除</span>
        <span @click="allClick">全选</span>
      </div>
      <div class="bd-content"
           v-infinite-scroll="loadMore"
           infinite-scroll-disabled="busy"
           infinite-scroll-immediate-check="true"
           infinite-scroll-distance="10">
        <checker type="checkbox" v-model="skuInfo" default-item-class="bd-list" selected-item-class="checked">
          <checker-item :value="item"
                        v-for="(item, index) in prDetails"
                        :key="index"
                        @on-item-click="itemClick"
                        :disabled="(item.needQty>item.hasPurchasedQty&& item.note == null&& userInfo.id==codeInfo.claimId)?false:true"
                        :class="(item.needQty>item.hasPurchasedQty&& item.note == null&& userInfo.id==codeInfo.claimId)?'normal':'gray'"
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
            <div class="list-msg " v-if="item.note!==null">{{(item.note == null) ? '' : `备注：(` + item.note + `)`}}</div>
            <div class="list-check"></div>
          </checker-item>
        </checker>
      </div>
    </div>
    <load-more :tip="loadingMsg" :show-loading="loading" background-color="#ebebeb"></load-more>
    <div class="detail-ft" v-if="showMark">
      <x-button mini type="warn" @click.native="stockOut">确认缺货</x-button>
      <x-button mini type="primary" @click.native="purchase">继续采购</x-button>
    </div>

    <!--弹窗-->
    <Pop :show='causeMark' @OnClose="OnClose('causeMark')" @OnSure="OnSure('causeMark')">
      <h2 slot="hd" class="p-hd">请出入缺货原因</h2>
      <div slot="bd" class="p-bd">
        <input type="text" @keyup="stockFill" v-model="stockCauseFill" ref='input' placeholder="如无以下选项原因，请输入！">
        <Checker class="clearfix" :selected-item-class="stocked" type="radio">
          <CheckerItem v-for="(item,index) in stockArr"
                       class="stock-list"
                       :value="index"
                       :key="index"
                       @on-item-click="stockClick(item)"
          >
            {{item}}
          </CheckerItem>
        </Checker>
      </div>
    </Pop>

  </div>
</template>
<script>

  import * as api from './../../api/'
  import * as utils from './../../utils/'
  import {mapGetters} from 'vuex'
  import {
    XHeader,
    Group,
    XButton,
    dateFormat,
    Icon,
    LoadMore,
    Checker,
    CheckerItem
  } from 'vux'
  import Pop from '../../components/Pop'

  export default {
    name: 'claim-detail',
    data() {
      return {
        busy: false,
        prHeaderInfo: {},
        prDetails: [], //数据集合
        filterPrDetails: [],//过滤不可选的
        checkAll: true,//全选开关
        currentPage: 1,//当前页
        pageSize: 10, //加载数据条数
        totalCount: 0,//总共有多少条数据
        totalPages: '',//总页数
        loading: false, //控制loading
        loadingMsg: '正在加载...',//控制loading文字
        checkedArr: [], //选中商品的id
        skuInfo: [],//选中商品的所有信息
        showMark: true, //是否显示删除，全选
        stockArr: [
          '市场货源不足',
          '商品品质差',
          '商品价格太高',
          '未开柜'
        ], //缺货原因
        stocked: 'stocked',//缺货选中class
        stockCause: '',//缺货原因
        stockCauseFill: '',//输入的缺货原因
        stockCauseClick: '',//点击的缺货原因
        causeMark: false,//显示弹框
        endTime: '',//预计到货日期
        supplier: {},//供应商
        showSupplier: false,//显示选择供应商
      }
    },

    components: {
      XHeader,
      Group,
      XButton,
      Icon,
      LoadMore,
      Checker,
      CheckerItem,
      Pop,
    },
    mounted() {
      //loading
      this.$vux.loading.show({
        text: '加载中...'
      })
      //查看登录者的详情
      if (this.userInfo.id === this.codeInfo.claimId) {
        this.showMark = true;
      } else {
        //查看别的认领人的详情页 去掉删除，确认缺货，继续采购
        this.showMark = false;
      }

      //预计到货日期
      this.endTime = localStorage.getItem('endTime') ? dateFormat(parseInt(localStorage.getItem('endTime')), 'YYYY-MM-DD HH:mm:ss') : ''
      this.supplier = localStorage.getItem('supplier') ? JSON.parse(localStorage.getItem('supplier')) : {}
      console.log(this.endTime)
      console.log(this.supplier)
      //如果选择供应商
      if(this.supplier.key){
        console.log(1)
        this.claimSupplierDetailAjax(this.currentPage)
      }else{
        //获取数据集合
        this.claimDetailAjax(this.currentPage)
      }
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'codeInfo',
      ]),
    },
    watch: {
      //筛选符合条件才能选中的商品信息集合
      prDetails() {
        this.filterPrDetails = this.prDetails.filter(item => {
          if (item.needQty > item.hasPurchasedQty && item.note == null && this.userInfo.id == this.codeInfo.claimId) {
            return item
          }
        })
      },
      //全选与取消全选条件
      skuInfo() {
        if (this.skuInfo.length === this.filterPrDetails.length) {
          this.checkAll = false
        } else {
          this.checkAll = true
        }
      },
      //检测加载的数据 全选与取消条件
      filterPrDetails() {
        if (this.skuInfo.length === this.filterPrDetails.length) {
          this.checkAll = false
        } else {
          this.checkAll = true
        }
      }
    },

    methods: {
      //请求数据
      claimDetailAjax(currentPage) {
        const that = this
        that.loading = true;
        api.fetch('/urfresh/pms/app/v1/queryMyPRDetails', {
          userId: that.codeInfo.claimId,//必填
          prId: that.codeInfo.prId,
          whId: that.codeInfo.whId, //必填
          currentPage: currentPage,//必填
          pageSize: that.pageSize //必填
        })
          .then(res => {
            console.log(res)
            //隐藏loading
            that.$vux.loading.hide()
            //查有数据
            if (res.result) {
              that.prHeaderInfo = res.content.prHeaderInfo
              that.prDetails = that.prDetails.concat(res.content.prHeaderInfo.prDetails)
              that.totalCount = res.content.totalCount;
              that.totalPages = Math.ceil(that.totalCount / that.pageSize); //总共页数
              //存储prHeaderInfo
              localStorage.setItem('prHeaderInfo',JSON.stringify(that.prHeaderInfo))
              if (res.content.totalCount === 0) {
                that.loading = false
                that.loadingMsg = '暂无数据'
              }
              if (res.content.totalCount === this.prDetails.length) {
                that.loading = false
                that.loadingMsg = '暂无更多数据'
              }
            } else {
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
      //查询供应商后请求数据
      claimSupplierDetailAjax(currentPage) {
        const that = this
        that.loading = true;
        api.fetch('/urfresh/pms/app/v1/queryMyPRDetailsBySupplier', {
          userId: that.codeInfo.claimId,//必填
          prId: that.codeInfo.prId,
          whId: that.codeInfo.whId, //必填
          supplierId:that.supplier.key,
          currentPage: currentPage,//必填
          pageSize: that.pageSize //必填
        })
          .then(res => {
            console.log(res)
            //隐藏loading
            that.$vux.loading.hide()
            if (res.result) {
              that.prHeaderInfo=JSON.parse(localStorage.getItem('prHeaderInfo'))
              //查有数据
              if(res.content.length!==0){
                that.prDetails = res.content
              }else {
                //没有查到数据
                that.loading=false
                that.loadingMsg = '暂无数据'
              }
            } else {
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
      loadMore() {
        const that = this
        that.busy = true;
        setTimeout(() => {
          that.currentPage++
          if (that.currentPage <= that.totalPages) {
            console.log('总计totalPages:' + that.totalPages);
            console.log('当前页数currentPage:' + that.currentPage);
            that.claimDetailAjax(that.currentPage)
          } else {
            that.loading = false
            that.loadingMsg = '暂无更多数据'
          }
          that.busy = false;
        }, 2000);
      },
      //多选
      allClick() {
        this.skuInfo = []
        if (this.checkAll) {
          //都选中
          this.skuInfo = this.filterPrDetails.filter(item => {
            return item
          })
        }
      },
      //单选
      itemClick(value, disabled) {

      },
      //删除商品
      deleteClick() {
        const that = this
        //删除商品的id 并删除后重置选中商品信息为空
        that.skuInfo.forEach((val, index) => {
          that.checkedArr.push(that.skuInfo[index].id)
        })
        if (that.checkedArr.length == 0) {
          that.$vux.alert.show({
            title: '提示',
            content: '请选择要删除的商品'
          })
        } else {
          that.$vux.loading.show({
            text: '加载中...'
          })
          api.fetch('/urfresh/pms/app/v1/releasePurchasingRequisitionDetails', {
            userId: that.userInfo.id,//必填
            prId: that.codeInfo.prId,
            whId: that.codeInfo.whId, //必填
            prDetailIds: that.checkedArr,
          })
            .then(res => {
              //隐藏loading
              that.$vux.loading.hide()
              //删除成功
              if (res.result && res.content.result) {
                that.$vux.toast.show({
                  text: '删除成功!', width: '50%', type: 'text', position: 'middle'
                })
                that.skuInfo = [];//清空选中商品集合
                that.checkedArr = [];//清空选中商品id的集合
                that.prDetails = [];//清空所有商品的集合
                that.currentPage = 1;
                that.claimDetailAjax(that.currentPage)
              } else {//认领失败
                that.$vux.alert.show({
                  title: '提示',
                  content: res.content.msg
                })
              }
            })
            .catch(err => {
              console.log(err)
            })
        }

      },
      //点确认显示缺货弹框
      stockOut() {
        //确认缺货商品的id
        this.skuInfo.forEach((val, index) => {
          this.checkedArr.push(this.skuInfo[index].id)
        })
        if (this.checkedArr.length === 0) {
          this.$vux.alert.show({
            title: '提示',
            content: '请选择缺货的商品!'
          })
        } else {
          this.causeMark = true;
        }
      },
      //输入缺货原因
      stockFill() {
        this.stocked = ''
        this.stockCauseClick = ''
        this.stockCause = this.stockCauseFill;
      },
      //选中缺货原因
      stockClick(value, disabled) {
        if (!disabled) {
          this.stocked = 'stocked'
          this.stockCauseFill = ''
          this.stockCauseClick = value
          this.stockCause = this.stockCauseClick
        }
      },
      //关闭弹框
      OnClose(attr) {
        this[attr] = false;
        this.stocked = '';
        this.stockCauseFill = '';
        this.stockCauseClick = '';
        this.stockCause = '';
      },
      //确定缺货
      OnSure(attr) {
        const that = this
        if (that.stockCause == '') {
          that.$vux.toast.show({
            text: '请选择或者输入缺货原因!', width: '70%', type: 'text', position: 'middle'
          })
        } else {
          that.$vux.loading.show({
            text: '加载中...'
          })
          api.fetch('/urfresh/pms/app/v1/confirmLack', {
            userId: that.userInfo.id,//必填
            prId: that.codeInfo.prId,
            whId: that.codeInfo.whId,
            prDetailIds: that.checkedArr,
            lackReason: that.stockCause
          })
            .then(res => {
              //隐藏loading
              that.$vux.loading.hide()
              if (res.result && res.content.result) {
                that[attr] = false
                that.skuInfo = [];//清空选中商品集合
                that.checkedArr = [];//清空选中商品id的集合
                that.prDetails = [];//清空所有商品的集合
                that.currentPage = 1;
                that.claimDetailAjax(that.currentPage)
              } else {
                that.$vux.alert.show({
                  title: '提示',
                  content: res.content.msg
                })
              }
            })
            .catch(err => {
              console.log(err)
            })
        }

      },
      //继续采购
      purchase() {
        if (this.filterPrDetails.length !== 0 && this.skuInfo.length == 0) {
          this.$vux.alert.show({
            title: '提示',
            content: '请选择所要采购的商品!'
          })
        } else if (this.filterPrDetails.length === 0) {
          this.$vux.alert.show({
            title: '提示',
            content: '认领商品状态为已完成或已取消，不能再采购!'
          })
        } else if (this.endTime === '') {
          this.$vux.alert.show({
            title: '提示',
            content: '请选择供应商或到货日期！'
          })
        } else {
          localStorage.removeItem('skuInfo')       //先清空选中商品的信息集合
          //创建采购单保存的信息格式化
          const newSkuInfo = []
          this.skuInfo.map((item) => {
            return newSkuInfo.push({
              addOld:1,
              skuId: item.skuId,
              skuName: item.skuName,
              productCode: item.productCode,
              defferentQty: item.defferentQty,
              unitName: item.unitName,
              refund: null,
              planQty: null,
              purchaseTaxRealPrice: null,
              billingMethod: 'TOTAL_PRICE',
            })
          })
          console.log(newSkuInfo)
          localStorage.setItem('skuInfo', JSON.stringify(newSkuInfo));
          this.$router.push('/createorder');
        }
      }
    },

  }
</script>
<style lang="less" type="text/less">
  [v-cloak] {
    display: none;
  }

  .claim-detail {
    padding-bottom: 0.5rem;
  }

  .detail-hd {
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

    .hd-list:nth-child(1) {
      span {
        font-size: 0.13rem;
      }
      span:first-child {
        font-weight: 600;
      }

    }

    .hd-list:nth-child(2) {

    }
    .hd-list:nth-child(3) {
      font-size: 0.14rem;
      text-align: left;
      padding-bottom: 0.05rem;
    }
  }

  .detail-bd {
    margin-top: 0.1rem;
    padding: 0.1rem 0.2rem;
    background-color: #fff;
    margin-bottom: 0.2rem;

    .bd-list {
      position: relative;
      font-size: 0.13rem;
      padding: 0.1rem 0;
      border-bottom: 1px solid #ededed;
    }
    .bd-all {
      text-align: right;
      font-size: 0.14rem;
      color: #007aff;
      span:first-child {
        padding-right: 0.2rem;
      }
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

  .vux-checker-item {
    display: block !important;
  }

  .detail-ft {
    width: 100%;
    position: fixed;
    z-index:10;
    bottom: 0;
    height: 0.5rem;
    line-height: 0.5rem;
    text-align: center;
    background-color: #fff;
    .weui-btn {
      position: absolute;
      top: 0.1rem;
      display: inline-block;
      height: 0.3rem;
    }
    button:first-child {
      right: 50%;
      margin-right: 0.1rem;
    }
    button:last-child {
      left: 50%;
      margin-left: 0.1rem;
    }
    .weui-btn + .weui-btn {
      margin-top: 0;
    }
  }

  .p-hd {
    font-size: 0.16rem;
  }

  .p-bd {
    input {
      display: block;
      width: 100%;
      line-height: 0.32rem;
      border: 1px solid #ebebeb;
      border-radius: 5px;
      font-size: 0.14rem;
      text-indent: 0.1rem;
    }
    .stock-list {
      width: 50%;
      float: left;
      line-height: 0.32rem;
      text-align: center;
    }
    .stocked {
      color: #f90;
    }
  }

  .detail-md {
    margin-top: 0.1rem;
    padding: 0.1rem 0.2rem;
    background-color: #fff;

    .md-list {
      position: relative;
      color: #333;
      width: 100%;
      font-size: 0.14rem;
      line-height: 0.28rem;
      a {
        display: block;
      }
    }
    .md-list:nth-child(1), .md-list:nth-child(2) {
      span {
        font-size: 0.14rem;
        color: #333;
        float: left;
        width: 1rem;
        vertical-align: middle;
      }
      input {
        float: left;
        width: 1.8rem;
        line-height: 0.28rem;
        vertical-align: middle;
        font-size: 0.14rem;
        color: #333;
        border: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .icon-arrow-right {
      display: block;
      position: absolute;
      top: 0.05rem;
      right: 0;
      width: 0.16rem;
      height: 0.16rem;
      fill: #C8C8CD;
    }
  }

  .vux-popup-dialog {
    background: #ebebeb !important;
  }

  .supplier-content {

  }
</style>
