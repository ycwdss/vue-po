<template>
  <div class='po-detail'>
    <x-header :left-options="{preventGoBack: true,backText:''}" @on-click-back="backToPo"
              style="background-color:#ebebeb;">
      {{this.params.poType==='COMPENSATE'?'PO补损详情':'PO详情'}}
    </x-header>
    <ul class="po-info">
      <li class="info-list list1 clearfix">
        <div class="info-code fl">{{poHeaderInfo.poCode}}({{poHeaderInfo.supplierName}})</div>
        <div class="info-date fr"
             :class="(new Date().getTime()-parseInt(poHeaderInfo.gmtCreate)<= 172800000)?'active-red':''">
          {{parseInt(poHeaderInfo.gmtCreate)|dateFM}}
        </div>
      </li>
      <li class="info-list list2" v-if="poHeaderInfo.prInfos!==null">
        <router-link tag="p" class="clearfix"
                     :to="{name:'req',params:{ poCode: poHeaderInfo.poCode,poId: poHeaderInfo.id,whId: poHeaderInfo.whId}}">
          <span>需求单：<em v-for="(item,index) in poHeaderInfo.prInfos">{{item.prCode}}{{index < poHeaderInfo.prInfos.length-1?',':''}}</em></span>
          <x-icon type="ios-arrow-right" size="14" class="icon-arrow-right"></x-icon>
        </router-link>
      </li>
      <li class="info-list list3" v-if="poHeaderInfo.refOrderCode!==null">关联单号：{{poHeaderInfo.refOrderCode}}</li>
      <li class="info-list list4">供应商：{{poHeaderInfo.supplierName}}</li>
      <li class="info-list list5"><span>SKU总数：<em
        class="active-red">{{poHeaderInfo.purchaseSkuCount}}</em></span><span>总计：<em
        class="active-red">￥{{poHeaderInfo.totalPurchaseMoney}}</em>元</span></li>
      <li class="info-list list6">预计到货日期：<em class="active-red">{{parseInt(poHeaderInfo.receiveTime)|dateFM}}</em></li>
      <li class="info-list list7" v-if="poHeaderInfo.poType!=='COMPENSATE'">付款方式：<em class="active-red">{{poHeaderInfo.payMethod==1?'货到付款':'预付款'}}</em></li>
      <li class="info-list list8"><span>采购人：{{poHeaderInfo.createrName}}</span><span>{{poHeaderInfo.whName}}</span></li>
    </ul>
    <div v-if="lossShow" class="po-operate" @click="lossAll">全选</div>
    <div class="po-list">
      <checker type="checkbox" default-item-class="list" selected-item-class="checked" v-model="lossSku">
        <checker-item :value="item"
                      v-for="(item,index) in poHeaderInfo.poDetails"
                      @on-item-click="itemClick"
                      :key="index"
        >
          <div class="op-name ">
            <div class="name">
              <span>{{item.skuName}}</span>
              <span>({{item.productCode}})</span>
            </div>
            <div v-if="lossShow" class="list-check"></div>
          </div>
          <!--如果是补损的-->
          <div v-if="params.poType==='COMPENSATE'" class="op-num">
            <p><span>{{item.purchaseReason=='COMPENSATE_DIFF'?'补差':'补损'}}数量：<em class="active-red">{{item.planQty}}</em>{{item.unitName}}</span><span>单价：￥<em class="active-red">{{item.purchaseTaxPrice}}</em>元</span></p>
            <p><span>计费方式：{{item.billingMethod=='TOTAL_PRICE'?'总价':'单价'}}</span><span>共计：￥<em class="active-red">{{item.totalPurchaseTaxPrice}}</em>元</span>
            </p>
          </div>
          <!--如果是po的-->
          <div v-if="params.poType!=='COMPENSATE'" class="op-num">
            <p><span>数量：<em class="active-red">{{item.planQty}}</em>{{item.unitName}}</span><span>单价：￥<em class="active-red">{{item.purchaseTaxPrice}}</em>元</span></p>
            <p><span>计费方式：{{item.billingMethod=='TOTAL_PRICE'?'总价':'单价'}}</span><span>共计：￥<em class="active-red">{{item.totalPurchaseTaxPrice}}</em>元</span>
            </p>
          </div>

        </checker-item>
      </checker>

    </div>
    <!-- <load-more :tip="loadingMsg" :show-loading="loading" background-color="#ebebeb"></load-more>-->
    <!--审核-->
    <div class="po-ft" v-if="auditShow">
      <x-button mini type="primary" @click.native="auditPo">审核通过</x-button>
    </div>
    <!--补损-->
    <div class="po-ft" v-if="lossShow">
      <x-button mini type="primary" @click.native="lossPo">创建补损PO</x-button>
    </div>
  </div>
</template>
<script>
  import {XHeader, XButton, LoadMore, Checker, CheckerItem} from 'vux'
  import * as api from './../../api/'
  import {mapGetters} from 'vuex'

  export default {
    name: 'po-detail',
    data() {
      return {
        currentPage: 1,//当前页数
        pageSize: 10,
        poHeaderInfo: {},//po详情页头部信息
        totalCount: 0,//总共有多少条数据
        // totalPages:'',//共多少页
        loading: false, //控制loading
        loadingMsg: '正在加载...',//控制loading文字
        params: {},//po详情参数集合
        poStatus: '',//po状态
        auditShow: false,//是否显示审核通过
        lossShow: false,//是否显示补损
        lossSku: [],//选中的要补损的po
        checkAll: true,//是否全选
      }
    },
    components: {
      XHeader,
      XButton,
      LoadMore,
      Checker,
      CheckerItem
    },
    computed: {
      ...mapGetters([
        'userInfo',
        'codeInfo',
      ]),
    },
    mounted() {
      //loading
      this.$vux.loading.show({
        text: '加载中...'
      })

      this.params = JSON.parse(localStorage.getItem('poDetailParams'))
      this.poStatus = this.params.poStatus;
      this.poType = this.params.poType;
      //审核PO（初始化的显示审核按钮 00）
      if (this.poStatus && this.poStatus === '00') {
        this.auditShow = true
        if(this.poType==='COMPENSATE'){
          this.lossShow = false
        }
      }
      //po补损（已审核的显示创建po补损 10）
      if (this.poStatus && this.poStatus !== '00'&&this.poType!=='COMPENSATE') {
        this.lossShow = true
      }
      this.poDetail(this.currentPage)
    },
    watch: {
      //全选与取消全选条件
      lossSku() {
        if (this.lossSku.length === this.poHeaderInfo.poDetails.length) {
          this.checkAll = false
        } else {
          this.checkAll = true
        }
      },
    },
    methods: {
      //po详情
      poDetail(currentPage) {
        const that = this
        api.fetch('/urfresh/pms/app/v1/queryPurchaseOrderDetailsById', {
          userId: that.userInfo.id,
          poId: that.params.poId,
          whId: that.params.whId,
          currentPage: currentPage,
          pageSize: that.pageSize
        })
          .then(res => {
            that.$vux.loading.hide()
            if (res.result) {
              that.poHeaderInfo = res.content.poHeaderInfo
            } else {
              that.$vux.alert.show({
                title: '提示',
                content: res.content,
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      },
      //审核po
      auditPo() {
        const that = this
        that.$vux.confirm.show({
          title: '提示',
          content: '审核通过后，手机端不支持撤销审核，需在web端修改!',
          onCancel() {
            that.$vux.confirm.hide()
          },
          onConfirm() {
            that.aduitPoAjax()
          }
        })
      },
      //审核po请求
      aduitPoAjax() {
        const that = this
        api.fetch('/urfresh/pms/app/v1/auditPOByIds', {
          userId: that.userInfo.id,
          userName: that.userInfo.realName,
          poIds: that.params.poId
        })
          .then(res => {
            if (res.result) {
              that.auditShow = false
              //补损后新生成的po通过审核后不能创建新po
              if(that.poType=='COMPENSATE'){
                that.lossShow = false
              }else {
                //老的po通过审核后修改po状态
                that.lossShow = true
                const params = {
                  poId: that.params.poId,
                  whId: that.params.whId,
                  poStatus: '10'
                }
                localStorage.setItem('poDetailParams', JSON.stringify(params));
              }
              that.$vux.toast.show({
                text: '审核成功!', width: '50%', type: 'text', position: 'middle'
              })
            } else {
              that.$vux.alert.show({
                title: '提示',
                content: res.content,
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      },
      //返回po列表
      backToPo() {
        this.$router.push('/home/po')
      },
      //选中单选
      itemClick() {

      },
      //全选
      lossAll() {
        this.lossSku = []
        if (this.checkAll) {
          //都选中
          this.poHeaderInfo.poDetails.forEach(item => {
            this.lossSku.push(item)
          })
        }
      },
      //po补损
      lossPo() {
        if (this.lossSku.length == 0) {
          this.$vux.alert.show({
            title: '提示',
            content: '请选择要补损的商品！',
          })
        } else {
          //头部信息
          localStorage.setItem('poHeaderInfo', JSON.stringify(this.poHeaderInfo))
          //要补损的商品
          localStorage.setItem('lossSku', JSON.stringify(this.lossSku))
          this.$router.push('/poloss')
        }
      }
    }
  }
</script>
<style lang="less" type="text/less" scoped>
  .po-info {
    padding: 0.05rem 0.2rem;
    background-color: #fff;
    .info-list {
      font-size: 0.13rem;
      line-height: 0.24rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .info-code {
        width: 60%;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .info-date {
        width: 40%;
        text-align: right;
      }
    }
    .list2{
      position: relative;
      span {
        float: left;
        width: 80%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
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
    .list5{
      span {
        display: inline-block;
        width: 50%;
      }
      span:last-child {
        text-align: right;
      }
    }
    .list8{
      span:last-child {
        float: right;
      }
    }
  }

  .po-operate {
    padding: 0.1rem 0.1rem 0;
    margin-top: 0.1rem;
    font-size: 0.14rem;
    color: #007aff;;
    text-align: right;
    background-color: #fff;
  }

  .po-list {
    margin-bottom: 1rem;
    padding: 0 0.2rem 0.1rem 0.2rem;
    background-color: #fff;
    .list {
      position: relative;
      width: 100%;
      border-bottom: 1px solid #ededed;
      padding: 0.1rem 0;
      .op-name {
        width: 100%;
        padding-bottom: 0.05rem;
        display: flex;
        flex-direction: row;
        .name {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: center;
          font-weight: 600;
          span {
            display: inline-block;
          }
          span:first-child {
            width: 1.3rem;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
        .list-check {
          width: 0.16rem;
          height: 0.16rem;
          background-color: #fff;
          border-radius: 50%;
          border: 1px solid #c9c9c9;
          box-sizing: border-box;
        }

      }
      .op-num {
        p {
          font-size: 0.12rem;
          height: 0.2rem;
          line-height: 0.2rem;
        }
        p {
          span:first-child {
            float: left;
            text-align: left;
            width: 40%;
          }
          span:last-child {
            float: right;
            text-align: right;
            width: 60%;
          }

        }

      }
    }
    .checked {
      .list-check {
        border: 0 !important;
        background: url("../../assets/images/success.png") no-repeat;
        background-size: 100% 100%;
      }
    }
  }

  .po-ft {
    width: 100%;
    position: fixed;
    z-index:10;
    bottom: 0;
    height: 0.5rem;
    line-height: 0.5rem;
    text-align: center;
    background-color: #fff;
  }
</style>
