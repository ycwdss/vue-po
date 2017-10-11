<template>
  <div class='create-order'>
    <x-header :left-options="{backText: ''}" style="background-color:#ebebeb;">创建采购单</x-header>
    <div class="create-hd">
      <div class="hd-list clearfix">
        <span class="fl">需求单：{{codeInfo.prCode}}</span>
        <span class="fr"> {{codeInfo.whName}}</span>
      </div>
      <div class="hd-list">选择供应商：{{supplier.value}}</div>
      <div class="hd-list">预计到货日期：{{endTime}}</div>
    </div>
    <div class="create-bd">
      <div class="bd-all">
        <span @click="delClick">删除</span>
        <span @click="allClick">全选</span>
      </div>
      <ul>
        <li class="bd-list" v-for="(item,index) in skuInfo" :key="index">
          <div class="list-sku clearfix">
            <span>{{item.skuName}}</span>
            <span>{{item.planQty > item.defferentQty ? '超出' : '还需要'}}{{item.planQty > item.defferentQty ? item.planQty - item.defferentQty : item.defferentQty - item.planQty}}{{item.unitName}}</span>
          </div>
          <div class="list-fill">
            <div class="fill">
              <label> 采购数量：</label>
              <div class="fill-text">
                <input type="number" v-model.number="item.planQty" @keyup="planFill(item.skuId)"
                       @blur="planOver(item.planQty,item.defferentQty,item.addOld)">
              </div>
              <div class="fill-unit">{{item.unitName}}</div>
            </div>
            <div class="fill">
              <label> 采购价格：</label>
              <div class="fill-text">
                <input type="number" v-model.number="item.purchaseTaxRealPrice" @keyup="priceFill(item.skuId)">
              </div>
              <group class="fill-unit">
                <selector :options="priceType" v-model="item.billingMethod"></selector>
              </group>
            </div>
          </div>
          <div class="list-total">
            共计：￥{{(item.purchaseTaxRealPrice==null||item.purchaseTaxRealPrice=='') ? '0.0' : ''}}{{item.billingMethod == 'TOTAL_PRICE' ? item.purchaseTaxRealPrice : item.planQty * item.purchaseTaxRealPrice}}元
          </div>
          <Checker class="list-check" v-model="checkedInfo" default-item-class="check-circle"
                   selected-item-class="checked" type="checkbox">
            <CheckerItem :value="item" @on-item-click="itemClick"></CheckerItem>
          </Checker>
        </li>
      </ul>
      <div class="bd-way">
        <span>付款方式：</span>
        <checker v-model="payWay" default-item-class="pay-choose" selected-item-class="pay-choosed">
          <checker-item :value="index+1" :key="index" v-for="(item,index) in payMethods">{{item}}</checker-item>
        </checker>
      </div>
      <div class="bd-add">
        <span @click="createGoods">点击采购商品</span>
        <x-icon type="ios-arrow-right" size="14" class="icon-arrow-right"></x-icon>
      </div>
    </div>
    <div class="create-ft">
      <x-button mini type="warn" @click.native="quitPurchase">取消采购</x-button>
      <x-button mini type="primary" @click.native="okPurchase">确认采购</x-button>
    </div>
    <confirm title="该供应商已有未审核PO单，请选择是否合并PO单！"
             cancel-text="创建新PO"
             confirm-text="合并PO"
             v-model="isExistPoShow"
             @on-cancel="onCancel"
             @on-confirm="onConfirm" class="isExistWrap">
      <select class="isExistPo" v-model="isExistPoId">
        <option v-for="(item,index) in isExistPoInfo" :value="item.poId">{{item.poCode}},{{item.gmtCreate}}</option>
      </select>
    </confirm>
    <p>{{isExistPoId}}</p>
  </div>
</template>
<script>

  import * as api from './../../api/'
  import * as utils from './../../utils/'
  import {mapGetters} from 'vuex'
  import {XHeader, Group, Selector, Checker, CheckerItem, XButton, dateFormat, Confirm} from 'vux'
  import Popup from '../../components/Pop'

  export default {
    name: 'create-order',
    data() {
      return {
        priceType: [{key: 'TOTAL_PRICE', value: '总价'}, {key: 'UNIT_PRICE', value: '单价'}],
        skuInfo: [],//商品信息
        supplier: {},//供应商
        endTime: '',//预计到货日期
        checkedInfo: [],//选中商品的所有信息
        checkedAll: true,//全选开关
        skuDetailInfoList: [],//商品信息集合
        poDetailOpts: {},//po详情参数
        isExistPoShow: false,//检测是否合并po
        isExistPoInfo: [],//存在po的信息
        isExistPoId: '',//存在po的id信息
        payMethods: ['货到付款', '预付款'],//付款方式
        payWay: 1,//付款方式
      }
    },
    components: {
      XHeader,
      XButton,
      Popup,
      Selector,
      Group,
      Confirm,
      Checker,
      CheckerItem
    },
    mounted() {
      //预计到货日期
      this.endTime = dateFormat(parseInt(localStorage.getItem('endTime')), 'YYYY-MM-DD HH:mm:ss');
      this.supplier = localStorage.getItem('supplier') ? JSON.parse(localStorage.getItem('supplier')) : {}
      //保存的传过来的商品信息
      this.skuInfo = JSON.parse(localStorage.getItem('skuInfo'));

    },
    computed: {
      ...mapGetters([
        'userInfo',
        'codeInfo',
      ]),
    },
    watch: {
      checkedInfo() {
        if (this.checkedInfo.length == this.skuInfo.length) {
          this.checkedAll = false
        } else {
          this.checkedAll = true
        }
      }
    },
    methods: {
      //单选
      itemClick(value, disable) {
        console.log(value)
        console.log(this.checkedInfo)
      },
      //多选
      allClick() {
        this.checkedInfo = []
        //都选中
        if (this.checkedAll) {
          this.checkedInfo = this.skuInfo.filter(item => {
            return item
          })
        }
        console.log(this.checkedInfo)
      },
      //删除
      delClick() {
        const that = this
        if (this.checkedInfo.length == 0) {
          that.$vux.alert.show({
            title: '提示',
            content: '请选择要删除的商品!'
          })
        } else {
          this.checkedInfo.forEach((cval, cindex) => {
            this.skuInfo.forEach((sval, sindex) => {
              if (cval.skuId === sval.skuId) {
                console.log(sval.skuId)
                this.skuInfo.splice(sindex, 1)
                //选中的checkedInfo清空
                this.checkedInfo = []
                return this.skuInfo
              }
            })
          })
          //删除后重置本地存储
          localStorage.setItem('skuInfo', JSON.stringify(this.skuInfo));
          //删除完，跳转到认领详情页
          if (this.skuInfo.length === 0) {
            this.$router.push('/claimdetail')
          }
        }
      },
      //添加商品
      createGoods() {
        this.$router.push('/createsku')
      },
      //检测输入是不是数字
      planFill(skuId) {
        this.skuInfo.map(item => {
          if (item.skuId == skuId) {
            if (isNaN(item.planQty) || Number(item.planQty) <= 0) {
              item.planQty = ''
            }
            return this.skuInfo
          }
        })
      },
      //超出提示
      planOver(planNum, diffNum,addOld) {
        if (planNum > diffNum * 1.3&&addOld) {
          this.$vux.alert.show({
            title: '提示',
            content: '采购量已超出需求量的30%，是否继续采购？',
          })
        }
      },
      //是不是数字
      priceFill(skuId) {
        this.skuInfo.map(item => {
          if (item.skuId == skuId) {
            if (isNaN(item.purchaseTaxRealPrice) || Number(item.purchaseTaxRealPrice) < 0) {
              item.purchaseTaxRealPrice = ''
            }
            return this.skuInfo
          }
        })
      },
      //取消采购
      quitPurchase() {
        const that = this
        that.$vux.confirm.show({
          title: '提示',
          content: '是否确认取消本批次采购？',
          onCancel() {
            console.log('取消')
          },
          onConfirm() {
            that.$router.push('/claimdetail')
          }
        })
      },
      //确定采购
      okPurchase() {
        const that = this
        let flagAlert = true;
        if (that.checkedInfo.length == 0) {
          that.$vux.alert.show({
            title: '提示',
            content: '请选择要采购的商品！'
          })
        } else {
          that.checkedInfo.map((item) => {
            //采购量为空
            if (Number(item.planQty) == 0) {
              that.$vux.alert.show({
                title: '提示',
                content: '请输入采购数量!',
              })
              flagAlert = false
            }
            //采购价格
            if (Number(item.purchaseTaxRealPrice) <= 0) {
              that.$vux.alert.show({
                title: '提示',
                content: '请输入采购价格!',
              })
              flagAlert = false
            }
          })
          //完成
          if (flagAlert) {
            that.skuDetailInfoList = []
            that.checkedInfo.map((item) => {
              that.skuDetailInfoList.push({
                skuId: item.skuId,
                planQty: item.planQty,
                unitName: item.unitName,
                purchaseTaxRealPrice: item.purchaseTaxRealPrice,
                billingMethod: item.billingMethod,
              })
            })
            that.$vux.confirm.show({
              title: '提示',
              content: '是否确认完成本批次采购？',
              onCancel() {
                that.$vux.confirm.hide()
              },
              onConfirm() {
                that.isExistPo()
              }
            })
          }
        }

      },
      //查询是否有未审核的po
      isExistPo() {
        const that = this
        api.fetch('/urfresh/pms/app/v1/queryIsExistPo', {
          userId: that.userInfo.id,
          supplierId: that.supplier.key,
          whId: that.codeInfo.whId,
          payMethod: that.payWay
        }).then(res => {
          if (res.result) {
            if (res.content.length !== 0) {//有需要合并的需求单，是-合并，否-另外新生PO单
              that.isExistPoShow = true
              that.isExistPoInfo = res.content
              that.isExistPoId = res.content[0].poId //select选中
            } else {//没有需要合并的需求单，直接创建PO详情单
              that.directCreatePo()
            }
          } else {
            that.$vux.alert.show({
              title: '提示',
              content: res.content,
            })
          }
        }).catch(err => {
          console.log(err)
        })
      },
      //直接创建PO单
      directCreatePo() {
        const that = this
        api.fetch('/urfresh/pms/app/v1/confirmPurchase', {
          userId: that.userInfo.id,
          userName: that.userInfo.realName,
          prId: that.codeInfo.prId,
          whId: that.codeInfo.whId,
          supplierId: that.supplier.key,
          expireReceiveTime: that.endTime,
          skuDetailInfoList: that.skuDetailInfoList, //采购商品明细信息集合
          payMethod: that.payWay
        })
          .then(res => {
            if (res.result) {
              console.log(res)
              const poDetailParams = {
                poId: res.content.id,
                whId: that.codeInfo.whId,
                poStatus: '00',
                poType:'MARKET'
              }
              localStorage.setItem('poDetailParams', JSON.stringify(poDetailParams));
              that.$router.push('/podetail')
            } else {
              that.$vux.alert.show({
                title: '提示',
                content: res.content,
              })
            }
          }).catch(err => {
          console.log(err)
        })
      },
      //合并至已有PO
      mergeExistPo(poId) {
        const that = this
        api.fetch('/urfresh/pms/app/v1/addSkuToExistPo', {
          userId: that.userInfo.id,
          userName: that.userInfo.realName,
          prId: that.codeInfo.prId,
          whId: that.codeInfo.whId,
          poId: poId,
          skuDetailInfoList: this.skuDetailInfoList //采购商品明细信息集合
        }).then(res => {
          if (res.result) {
            const poDetailOpts = {
              poId: poId,
              whId: that.codeInfo.whId
            }
            localStorage.setItem('poDetailOpts', JSON.stringify(poDetailOpts));
            that.$vux.toast.show({
              text: '合并成功!', width: '50%', type: 'text', position: 'middle'
            })
            that.$router.push('/podetail')
          } else {
            that.$vux.alert.show({
              title: '提示',
              content: res.content,
            })
          }
        }).catch(err => {
          console.log(err)
        })
      },
      //不合并直接创建Po
      onCancel() {
        this.directCreatePo()
      },
      //合并Po
      onConfirm() {
        this.mergeExistPo(this.isExistPoId)
      }
    },

  }
</script>
<style lang="less" type="text/less">


  .create-hd {
    padding: 0.05rem 0.2rem;
    background-color: #fff;
    .hd-list {
      color: #333;
      width: 100%;
      font-size: 0.14rem;
      line-height: 0.28rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .hd-list:nth-child(1) {
      span:first-child {
        font-weight: 600;
      }
    }

  }

  .create-bd {
    margin-top: 0.1rem;
    padding: 0.1rem 0.2rem;
    background-color: #fff;
    margin-bottom: 1rem;
    .bd-all {
      text-align: right;
      font-size: 0.14rem;
      color: #007aff;
      margin-right: -0.1rem;
      span:first-child {
        padding-right: 0.2rem;
      }
    ;
    }
    .bd-ul {
      font-size: 0.14rem;
    }
    .bd-way {
      padding: 0.1rem 0;
      background-color: #fff;
      display: flex;
      flex-direction: row;
      .vux-checker-box{
        flex: 1;
        display: flex;
        flex-direction: row;
      }
      .pay-choose {
        flex: 1;
        padding-left: 0.2rem;
        position: relative;
        &:after {
          position: absolute;
          top: 0.01rem;
          left: 0.02rem;
          content: '';
          display: block;
          width: 0.16rem;
          height: 0.16rem;
          background-color: #fff;
          border-radius: 50%;
          border: 1px solid #c9c9c9;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
        }
      }
      .pay-choosed{
        &:after {
          border: 0;
          background: url("../../assets/images/success.png") no-repeat;
          background-size: 100% 100%;
        }
      }
    }
    .bd-add {
      position: relative;
      font-size: 0.14rem;
      text-align: right;
      margin-top: 0.1rem;
      padding-right: 0.2rem;
      .icon-arrow-right {
        top: 0.01rem;
      }
    }
    .bd-list {
      position: relative;
      padding: 0.05rem 0.2rem 0.05rem 0;
      border-bottom: 1px solid #ededed;
    }

    .list-sku {
      line-height: 0.24rem;
      span {
        display: block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: 0.13rem;
      }
      span:first-child {
        float: left;
        max-width: 60%;
        font-weight: 600;
      }
      span:last-child {
        float: right;
        width: 40%;
        text-align: right;
        color: #f00;
      }
    }

    .fill {
      height: 0.36rem;
      line-height: 0.36rem;
      position: relative;
      label {
        position: absolute;
        top: 0;
        left: 0;
        width: 0.8rem;
      }
      .fill-unit {
        position: absolute;
        top: 0;
        right: 0;
        width: 0.6rem;
        text-align: left;
      }
      .fill-text {
        padding-left: 0.8rem;
        padding-right: 0.8rem;

      }
      .vux-no-group-title {
        margin-top: 0 !important;
      }
      .weui-select {
        height: 0.32rem;
        line-height: 0.32rem;
        padding-right: 0 !important;
        padding-left: 0 !important;
        font-size: 0.14rem;
        color: #333;
      }
      .weui-cell {
        padding-left: 0 !important;
      }
      .weui-cells {
        &:before {
          border-top: 0 !important;
        }
      }
      .weui-cell_select .weui-cell__bd:after {
        right: 5px !important;
        border-width: 1px 1px 0 0 !important;
      }
      input {
        width: 100%;
        height: 0.28rem;
        line-height: 0.28rem;
        font-size: 0.14rem;
        border: 1px solid #ebebeb;
        -webkit-border-radius: 0.05rem;
        -moz-border-radius: 0.05rem;
        border-radius: 0.05rem;
        box-sizing: border-box;
        text-indent: 0.1rem;
      }
    }
    .list-total {
      height: 0.24rem;
      line-height: 0.24rem;
      text-align: right;
    }
    .list-check {
      position: absolute;
      right: -0.03rem;
      top: 0.1rem;
      z-index: 1;
      display: block;
      width: 0.12rem;
      height: 0.12rem;
    }
    .check-circle {
      position: absolute;
      top: -0.02rem;
      right: -0.02rem;
      z-index: 99;
      display: block;
      width: 0.16rem;
      height: 0.16rem;
      background-color: #fff;
      border-radius: 50%;
      border: 1px solid #c9c9c9;
      box-sizing: border-box;
    }
    .checked {
      border: 0;
      background: url("../../assets/images/success.png") no-repeat;
      background-size: 100% 100%;
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

  .create-ft {
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
.fill-unit{
  .weui-cell_select .weui-cell__bd:after {
    -webkit-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    -moz-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    -ms-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    -o-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    right: 10px !important;
    margin-top: -6px !important;
  }
}
  /*合并Po*/
  .isExistWrap {
    .weui-dialog__title {
      font-size: 0.14rem;
    }
    .weui-dialog__ft a {
      font-size: 0.14rem;
    }
  }

  .isExistPo {
    font-size: 0.12rem;
    width: 100%;
    height: 0.32rem;
    line-height: 0.32rem;
    border: 1px solid #eee;
    -webkit-border-radius: 0.05rem;
    -moz-border-radius: 0.05rem;
    border-radius: 0.05rem;
    background-color: #fff;
  }
</style>
