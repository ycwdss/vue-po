<template>
  <div class="create-sku">
    <x-header :left-options="{backText: ''}" style="background-color:#ebebeb;">添加商品</x-header>
    <div class='cs-wrap'>
      <div class="sku-name">
        <input type="text" placeholder="请输入商品名称" v-model="skuName">
        <button @click="skuSearch">查询</button>
      </div>
      <ul class="sku-content"
          v-infinite-scroll="loadMore"
          infinite-scroll-disabled="busy"
          infinite-scroll-immediate-check="true"
          infinite-scroll-distance="10">
        <li class="sku-item" v-for="(item,index) in skuArr" :key="index">
          <input type="radio" :id="'item'+index" :value="item.id" v-model="picked">
          <label :for="'item'+index">
            {{item.skuName}}
          </label>
        </li>
      </ul>
      <load-more v-if="loadingMark" :tip="loadingMoreMsg" :show-loading="loadingMore"></load-more>
      <div v-if="csMark" class="cs-none">没有查到相应的供应商！</div>
    </div>
    <div class="cs-foot">
      <x-button mini type="primary" @click.native="csOk">添加</x-button>
    </div>
  </div>

</template>
<script>
  import * as api from '../../api/index'
  import {XHeader, XButton, LoadMore} from 'vux'
  import{mapGetters} from 'vuex'
  export default {
    name: 'sku',
    data () {
      return {
        skuName: '',
        skuArr: [],//商品集合
        skuAdd: [],//选中商品
        picked: '',
        supplier:{},
        csMark: false,//查无数据
        totalCount: 0,//总共有多少条数据
        currentPage: 1,//当前页
        pageSize: 10, //加载数据条数
        totalPages:'',//总页数
        loadingMark: false,//是否显示loading
        loadingMore: false, //是否显示loadingMore图标
        loadingMoreMsg: '正在加载...',//控制loadingMore文字
      }
    },
    components: {
      XHeader,
      XButton,
      LoadMore
    },
    computed: {
      ...mapGetters([
        'userInfo',
      ]),
    },
    mounted(){
      this.supplier = localStorage.getItem('supplier') ? JSON.parse(localStorage.getItem('supplier')) : {}
    },
    methods: {
      skuSearch(){
        if (this.skuName == '') {
          this.$vux.toast.show({
            text: '请输入商品名称！', width: '70%', type: 'text', position: 'middle'
          })
        } else {
          this.skuArr = [];
          this.currentPage = 1;
          this.loadingMark = true
          this.loadingMore = true
          this.loadingMoreMsg = '正在加载...'
          this.skuAjax(this.currentPage);
        }
      },
      skuAjax(currentPage){
        const that=this
        api.fetch('/urfresh/pms/app/v1/querySkuBySupplier', {
          userId: that.userInfo.id,
          supplierId: parseInt(that.supplier.key),
          skuName: that.skuName,
          currentPage: currentPage,
          pageSize: that.pageSize
        })
          .then(res => {
            console.log(res)
            if (res.result) {
              //查无数据
              if (res.content.totalCount !== 0) {
                that.csMark = false
                that.skuArr = that.skuArr.concat(res.content.skuInfoList)
                this.totalCount = res.content.totalCount;
                that.totalPages = Math.ceil(that.totalCount / that.pageSize); //总共页数
              } else {
                that.csMark = true
                that.loadingMark = false
              }
            }
          })
          .catch(err => {
            console.log(err)
          })
      },
      //获取更多数据
      loadMore() {
        const that=this
        that.busy = true;
        setTimeout(() => {
          that.currentPage++
          if (that.currentPage <= that.totalPages) {
            console.log('总计totalPages:' + that.totalPages);
            console.log('当前页数currentPage:' + that.currentPage);
            that.skuAjax(that.currentPage)
          } else {
            that.loadingMore = false
            that.loadingMoreMsg = '暂无更多数据'
          }
          that.busy = false;
        }, 2000);
      },
      //添加
      csOk(){
        if (this.picked == '') {
          this.$vux.toast.show({
            text: '请先选择商品！', width: '70%', type: 'text', position: 'middle'
          })
        } else {
          //添加商品信息
          this.skuArr.map((item) => {
            if (item.id == this.picked) {
              return this.skuAdd.push(
                {
                  addOld:0,
                  skuId: item.id,
                  skuName: item.skuName,
                  productCode: item.productCode,
                  defferentQty: 0,
                  unitName: item.unitName,
                  refund: null,
                  planQty: null,
                  purchaseTaxRealPrice: null,
                  billingMethod: 'TOTAL_PRICE',
                }
              )
            }
          })

          //添加到创建采购单
          const skuInfoAdd = [...JSON.parse(localStorage.getItem('skuInfo')), ...this.skuAdd]
          localStorage.setItem('skuInfo', JSON.stringify(skuInfoAdd));
          this.$router.go(-1)
        }
      }
    }
  }
</script>
<style lang="less" type="text/less" scoped>
  .cs-wrap {
    padding: 0.1rem 0.2rem;
    background-color: #fff;
    margin-bottom: 1rem;
    font-size: 0.14rem;
    p {
      font-size: 0.14rem;
      color: #666;
    }
  }

  .sku-name {
    height: 0.32rem;
    line-height: 0.32rem;
    margin: 0.05rem 0;
    display: -webkit-flex; /* Safari */
    display: flex;
    flex-direction: row;
    position: relative;
    input {
      flex: 1;
      font-size: 0.14rem;
      color: #333;
      border: 1px solid #ededed;
      border-right: 0;
      box-sizing: border-box;
      text-indent: 0.1rem;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    button {
      display: block;
      width: 0.8rem;
      font-size: 0.14rem;
      color: #fff;
      background-color: #1AAD19;
      border: 1px solid #1AAD19;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
.sku-content{
  margin-top: 0.2rem;
}
  .sku-item {
    position: relative;
    font-size: 0.13rem;
    color: #666;
    border-bottom: 1px solid #ededed;
    label {
      width: 100%;
      display: block;
      padding: 0.06rem 0;
    }
    input {
      position: absolute;
      top: 0.05rem;
      right: 0.05rem;
      opacity: 0;
    }
    input[type="radio"]:checked + label {
      color: #f90;
    }
    input[type="radio"]:checked + label:after {
      content: '';
      position: absolute;
      top: 0.08rem;
      right: 0.05rem;
      display: block;
      width: 0.14rem;
      height: 0.14rem;
      border-radius: 50%;
      background: url("../../assets/images/dui.png") no-repeat;
      background-size: 100% 100%;
    }
  }

  .cs-none {
    margin-top: 0.1rem;
  }

  .cs-foot {
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
