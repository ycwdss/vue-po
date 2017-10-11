<template>
  <div class='po-detail'>
    <x-header :left-options="{backText:''}"
              style="background-color:#ebebeb;">创建PO补损单
    </x-header>
    <ul class="loss-hd">
      <li class="list"><span>关联PO单号：{{poHeaderInfo.poCode}}</span><span>{{poHeaderInfo.whName}}</span>
      </li>
      <li class="list ">供应商：{{poHeaderInfo.supplierName}}</li>
      <li class="list">预计到货日期：<em class="active-red">{{parseInt(poHeaderInfo.receiveTime)|dateFM}}</em></li>
    </ul>
    <div class="loss-bd">
      <div class="bd-all">
        <span @click="lossDelete">删除</span>
        <span @click="lossAll">全选</span>
      </div>
      <div class="bd-content">
        <div class="list" v-for="(item, index) in lossSku">
          <div class="list-name clearfix">
            <span>{{item.skuName}}</span>
            <span>{{`(` + item.productCode + `)`}}</span>
          </div>
          <div class="list-fill">
            <selector class="select" :options="addType" v-model="item.addType" ></selector>
            <input class="input" type="number" v-model.number="item.addNum" @keyup="LossAddNum(item.id)">
            <checker class="list-check" type="checkbox" v-model="lossChecked" default-item-class="check"
                     selected-item-class="checked">
              <checker-item :value="item"></checker-item>
            </checker>
          </div>
        </div>
      </div>

    </div>
    <div class="loos-ft">
      <x-button mini type="warn" @click.native="quitLoss">取消补损</x-button>
      <x-button mini type="primary" @click.native="okLoss">确认补损</x-button>
    </div>
  </div>
</template>
<script>
  import {XHeader, XButton, Selector, Checker, CheckerItem,dateFormat } from 'vux'
  import * as api from './../../api/'
  import {mapGetters} from 'vuex'

  export default {
    name: 'po-detail',
    data() {
      return {
        poHeaderInfo: {},//po详情页头部信息
        lossSku: {},//补损的商品
        lossChecked: [],//选中的商品
        addType: [{key: 'compensate_damage', value: '补损数'},{key: 'compensate_diff', value: '补差数'}],
        checkAll: true,//选中
        receiveTime:'',
        newLossSku:[],

      }
    },
    components: {
      XHeader,
      XButton,
      Checker,
      Selector,
      CheckerItem
    },
    computed: {
      ...mapGetters([
        'userInfo',
      ]),
    },
    mounted() {
      this.poHeaderInfo = JSON.parse(localStorage.getItem('poHeaderInfo'))
      const before = JSON.parse(localStorage.getItem('lossSku'))
      this.lossSku = before.map(item => {
        item.addType = 'compensate_damage'
        item.addNum=''
        return item
      })
      //预计到货时间
      this.receiveTime=dateFormat(this.poHeaderInfo.receiveTime, 'YYYY-MM-DD HH:mm:ss')
    },
    watch: {
      //全选与取消全选条件
      //全选与取消全选条件
      lossChecked() {
        if (this.lossChecked.length === this.lossSku.length) {
          this.checkAll = false
        } else {
          this.checkAll = true
        }
      },
    },
    methods: {


      //选中单选
      itemClick() {

      },
      //全选
      lossAll() {
        this.lossChecked = []
        if (this.checkAll) {
          //都选中
          this.lossSku.forEach(item => {
            this.lossChecked.push(item)
          })
        }
      },
      //删除
      lossDelete() {
        const that = this
        if (that.lossChecked.length == 0) {
          that.$vux.alert.show({
            title: '提示',
            content: '请选择要删除的商品!'
          })
        } else {
          that.lossChecked.forEach((cval, cindex) => {
            that.lossSku.forEach((sval, sindex) => {
              if (cval.id === sval.id) {
                console.log(sval.skuId)
                this.lossSku.splice(sindex, 1)
                //选中的lossChecked清空
                this.lossChecked = []
                return this.lossSku
              }
            })
          })
          //删除完，跳转到认领详情页
          if (this.lossSku.length === 0) {
            //删除后重置本地存储
            localStorage.setItem('lossSku', JSON.stringify(this.lossSku));
            this.$router.push('/podetail')
          }
        }
      },
      //输入补损数量
      LossAddNum(id){
          this.lossSku.map(item => {
            if (item.id == id) {
              console.log(item.id)
              if (isNaN(item.addNum) || Number(item.addNum) < 0) {
                item.addNum = ''
              }
              return this.lossSku
            }
          })
      },
      //取消补损
      quitLoss() {
        const that = this
        that.$vux.confirm.show({
          title: '提示',
          content: '是否取消补损？',
          onCancel() {
            console.log('取消')
          },
          onConfirm() {
            that.$router.push('/podetail')
          }
        })
      },
      //确认补损
      okLoss() {
        const that=this
        let flagAlert = true;
        if(that.lossChecked.length==0){
          that.$vux.alert.show({
            title: '提示',
            content: '请选择要补差或补损的商品!',
          })
        }else {
          that.lossChecked.map(item=>{
            if (Number(item.addNum) == 0) {
              that.$vux.alert.show({
                title: '提示',
                content: '请输入补差或补损数量!',
              })
              flagAlert = false
            }
          })
          if(flagAlert){
            that.newLossSku=[]
            that.lossChecked.map(item=>{
              that.newLossSku.push({
                skuId:item.skuId,
                planQty:item.addNum,
                unitName:item.unitName,
                purchaseReason:item.addType.toUpperCase()
              })
            })
            that.$vux.confirm.show({
              title: '提示',
              content: '是否确认完成本批次采购？',
              onCancel() {
                that.$vux.confirm.hide()
              },
              onConfirm() {
                that.createLoss()
              }
            })
          }
        }

      },
      //创建补损
      createLoss(){
        const that=this
        api.fetch('/urfresh/pms/app/v1/createCompensateDamagePo', {
          userId: that.userInfo.id,
          userName: that.userInfo.realName,
          supplierId: that.poHeaderInfo.supplierId,
          whId: that.poHeaderInfo.whId,
          refOrderCode:that.poHeaderInfo.poCode,
          expireReceiveTime:that.receiveTime,
          skuDetailInfoList:that.newLossSku,
        }).then(res => {
          console.log(res)
          if (res.result) {
            const params = {
              poId: res.content.id,
              whId: that.poHeaderInfo.whId,
              poStatus: '00',
              poType:'COMPENSATE'
            }
            localStorage.setItem('poDetailParams', JSON.stringify(params));
            this.$router.push('/podetail')
          } else {
            that.$vux.alert.show({
              title: '提示',
              content: res.content,
            })
          }
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
</script>
<style lang="less" type="text/less">
  .loss-hd {
    padding: 0.05rem 0.2rem;
    background-color: #fff;
    .list {
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
    .list:nth-child(1) {
      span:last-child {
        float: right;
      }
    }
  }

  .loss-bd {
    margin-top: 0.1rem;
    padding: 0.1rem 0.2rem;
    background-color: #fff;
    margin-bottom: 0.2rem;
    .list {
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

    .bd-way {
     padding: 0.1rem 0 1rem 0;
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
    .list-name span {
      font-weight: 600;
      font-size: 0.13rem;
      line-height: 0.24rem;
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
    .list-fill {
      display: flex;
      flex-direction: row;
      align-items: center;
      .select {
        width: 0.6rem;
      }
      .input {
        width: 1.6rem;
        height: 0.28rem;
        line-height: 0.28rem;
        border: 1px solid #EBEBEB;
        border-radius: 5px;
        padding-left: 0.1rem;
      }
    }

    .list-check {
      flex: 1;
      height: 0.16rem;
      text-align: right;
      .check {
        display: inline-block !important;
        width: 0.16rem;
        height: 0.16rem;
        border-radius: 50%;
        border: 1px solid #c9c9c9;
        box-sizing: border-box;
      }
    }
    .checked {
      border: 0 !important;
      background: url("../../assets/images/success.png") no-repeat;
      background-size: 100% 100%;
    }
  }

  .vux-checker-item {
    display: block !important;
  }

  .loos-ft {
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

  .weui-cell_select .weui-cell__bd:after {
    -webkit-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    -moz-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    -ms-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    -o-transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0) !important;
    right: 10px !important;
    margin-top: -6px !important;
  }

  .weui-select {
    padding: 0 !important;
  }
</style>
