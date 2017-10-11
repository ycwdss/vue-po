<template>
  <div>
    <x-header :left-options="{backText: ''}" style="background-color:#ebebeb;">选择供应商</x-header>
    <div class="sup-item">
      <p class="sup-title">您常用的供应商：</p>
      <ul>
        <li v-for="(item, index) in supFiveArr" :key="index" class="item"
            @click="supInfo({key:item.key,value:item.value})">
          <input type="radio" :id="'five'+index" :value="item.key" class="sup-radio" v-model="picked">
          <label :for="'five'+index">
            {{item.value}}
          </label>
        </li>
      </ul>
      <div v-if="supFiveArr.length==0?true:false" class="sup-none">暂无常用供应商，输入查询供应商！</div>
    </div>
    <div class="sup-item sup-search">
      <p class="sup-title">供应商查询：</p>
      <div class="search">
        <input type="text" v-model="supplierName" placeholder="请输入供应商名称">
        <button @click="supSearch">查询</button>
      </div>
      <div v-if="supSearchMark" class="supSearch-none">没有查到相应的供应商！</div>
      <ul >
        <li v-for="(item, index) in supQuery" :key="index" class="item"
            @click="supInfo({key:item.key,value:item.value})">
          <input type="radio" :id="'query'+index" :value="item.key" class="sup-radio" v-model="picked">
          <label :for="'query'+index">
            {{item.value}}
          </label>
        </li>
      </ul>
    </div>
    <div class="sup-item date-select">
      <p class="sup-title">预计到货日期：</p>
      <group>
        <datetime class="data-time" :min-year=2000 :max-year=2030 format="YYYY-MM-DD HH:mm:00"
                  year-row="{value}年" month-row="{value}月" day-row="{value}日" hour-row="{value}点" minute-row="{value}分"
                  confirm-text="确认" cancel-text="取消" v-model="endTime"
        ></datetime>
      </group>

    </div>
    <div class="sup-date-foot">
      <x-button mini type="primary" @click.native="supDateOk">确认选择</x-button>
    </div>
  </div>
</template>
<script>
  import * as api from '../../api/index'
  import * as utils from '../../utils/index'
  import {mapGetters} from 'vuex'
  import {XHeader, dateFormat, Group, Datetime, XButton} from 'vux'

  export default {
    name: 'sup-date',
    data() {
      return {
        supFiveArr: [],
        supQuery: [],
        picked: '',
        supplier:{},//供应商
        supplierName: '',
        endTime: '',
        supSearchMark: false,//没有查到相应的供应商
      }
    },
    components: {
      XHeader,
      Datetime,
      XButton,
      Group
    },
    computed: {
      ...mapGetters([
        'userInfo',
      ]),
    },
    mounted() {
      //loading
      this.$vux.loading.show({
        text: '加载中...'
      })
      //5个常用供应商
      this.supFive();
    },
    created() {
      //默认每天18点
      this.endTime = dateFormat(new Date(), 'YYYY-MM-DD 18:00:00')
      console.log(this.endTime)
    },
    methods: {
      //选择的供应商
      supInfo(obj){
        this.supplier=obj
      },
      //5个常用供应商
      supFive() {
        api.fetch('/urfresh/pms/app/v1/queryUserLatestFiveSupplier', {
          userId: this.userInfo.id
        })
          .then(res => {
            //隐藏loading
            this.$vux.loading.hide()
            if (res.result && res.content !== null) {
              this.supFiveArr = res.content.map((item) => {
                return {key: item.id, value: item.supName}
              })
            } else {
              this.$vux.alert.show({
                title: '提示',
                content: res.content
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      },
      //查询供应商名称
      supSearch() {
        this.supQuery = [] //清空搜索的内容
        api.fetch('/urfresh/pms/app/v1/querySupplierByName', {
          userId: this.userInfo.id,
          supplierName: this.supplierName
        })
          .then(res => {
            if (res.result) {
              if (res.content.length !== 0) {
                this.supSearchMark = false
                this.supQuery = res.content.map((item) => {
                  return {key: item.id, value: item.supName}
                })
              } else {
                this.supSearchMark = true
              }
            } else {
              this.$vux.alert.show({
                title: '提示',
                content: res.content
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      },
      //确认选择
      supDateOk() {
        const dateCompare = this.endTime.replace(new RegExp("-", "gm"), "/");
        const endDate = new Date(dateCompare).getTime();
        const nowDate = new Date().getTime();
        if (endDate <= nowDate) {
          this.$vux.alert.show({
            title: '提示',
            content: '预计到货日期小于当前时间,请重新选择！'
          })
        }
        if (this.picked === '') {
          this.$vux.alert.show({
            title: '提示',
            content: '请选择供应商！'
          })
        }
        if ((endDate > nowDate) && this.picked !== '') {
          //保存信息
          localStorage.setItem('supplier',JSON.stringify(this.supplier))
          localStorage.setItem('endTime',JSON.stringify(endDate))
          this.$router.go(-1)
        }
      }
    }
  }
</script>
<style lang="less" type="text/less">

  .sup-item {
    padding: 0.1rem 0.2rem;
    background-color: #fff;
    margin-bottom: 0.1rem;
    font-size: 0.14rem;
    .item {
      position: relative;
      border-bottom: 1px solid #ededed;
      font-size: 0.13rem;
      color: #666;
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
        top: 0.05rem;
        right: 0.05rem;
        display: block;
        width: 0.14rem;
        height: 0.14rem;
        border-radius: 50%;
        background: url("../../assets/images/dui.png") no-repeat;
        background-size: 100% 100%;
      }
    }
    .date-time {
      padding: 0 !important;
      color: #666;
    }
  }

  .date-select {
    .weui-cell {
      padding: 0;
    }
    .weui-cells {
      margin: 0;
      &:before {
        border-top: 0;
      }
      &:after {
        border-bottom: 0;
      }
      .weui-cell__ft {
        text-align: left;
        font-size: 0.14rem;
      }
    }
  }
.data-time>div:first-child{
  display: none!important;
}
  .supSearch-none {
    margin-top: 0.1rem;
  }

  .date-select {
    margin-bottom: 1rem;
  }

  .sup-title {
    font-size: 0.14rem;
    color: #333;
  }
  .sup-search ,.date-select{
    .sup-title {
      padding-bottom: 0.05rem;
    }
  }
  .sup-search{
    ul{
      margin-top: 0.1rem;
    }

  }


  .sup-none {
    line-height: 0.4rem;
    font-size: 0.14rem;
  }

  .search {
    display: flex;
    flex-direction: row;
    height: 0.32rem;
    line-height: 0.32rem;
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



  .sup-date-foot {
    width: 100%;
    position: fixed;
    bottom: 0;
    height: 0.5rem;
    line-height: 0.5rem;
    text-align: center;
    background-color: #fff;
  }
</style>
