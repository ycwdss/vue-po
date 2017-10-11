<template>
  <div class="po-wrap">
    <div class="po-list" v-for="(item,index) in this.poList" >

      <div class="list-md" @click="LookPoDetail(item.id,item.whId,item.poStatus,item.poType)">
        <div class="list-hd clearfix">
          <div class="hd-code fl">{{item.poCode}}{{`(` + item.supplierName + `)`}}</div>
          <span class="hd-date fr " :class="(new Date().getTime()-item.gmtCreate<= 172800000)?'active-red':''">
          {{ item.gmtCreate | dateFM}}
        </span>
        </div>
        <div class="list-bd">
          <div class="bd"><span
            v-for="(sItem,sIndex) in item.poDetails">{{sItem.skuName}}{{sIndex < item.poDetails.length - 1 ? ',' : ''}}</span>
          </div>
          <div class="bd " v-if="item.prInfos!==null">需求单：
            <span
              v-for="(pItem,pIndex) in item.prInfos">{{pItem.prCode}}{{pItem.note}}{{pIndex < item.prInfos.length - 1 ? ',' : ''}}</span>
          </div>

          <div class="bd clearfix">
          <span class="fl" >
            <em :class="(item.poStatus=='00')?'active-red':'active-green'">{{item.poStatus | poStatusToText}}</em>{{item.poType=='COMPENSATE'?'（补损单）':''}}
          </span>
            <span class="fr">{{item.whName}}</span>
          </div>
        </div>
      </div>
      <div class="list-ft clearfix">
        <a :class="(item.poStatus=='00'||item.poType=='COMPENSATE')?'gray':''" @click="poLoss(item.id,item.whId,item.poStatus,item.poType)">新增补损单</a>
        <router-link v-if="item.poType!=='COMPENSATE'" :to="{name:'req',params:{ poCode: item.poCode,poId: item.id,whId: item.whId}}">查看相关需求单</router-link>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapActions} from 'vuex'

  export default {
    name: 'po-list',
    props: ['poList'],
    data() {
      return {
        arr: [1, 2, 3]
      }
    },
    computed: {},
    mounted() {
      localStorage.removeItem('poDetailParams');
    },
    methods: {
      LookPoDetail(poId, whId, poStatus,poType) {
        const params = {
          poId: poId,
          whId: whId,
          poStatus: poStatus,
          poType:poType
        }
        localStorage.setItem('poDetailParams', JSON.stringify(params));
        this.$router.push('/podetail')
      },
      poLoss(poId, whId, poStatus,poType){
        if(poStatus!=='00'&&poType!=='COMPENSATE'){
          const params = {
            poId: poId,
            whId: whId,
            poStatus: poStatus
          }
          localStorage.setItem('poDetailParams', JSON.stringify(params));
          this.$router.push('/podetail')
        }
      }
    }
  }
</script>
<style lang="less" scoped>
  .po-wrap {
    margin-top: 0.2rem;
  }

  .po-list {
    padding: 0 0.2rem;
    margin-bottom: 0.2rem;
    background-color: #fff;
  }

  .list-hd {
    position: relative;
    padding: 0.05rem 0;
    font-size: 0.14rem;

  }

  .hd-code {
    display: inline-block;
    max-width: 60%;
    font-size: 0.13rem;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .hd-date {
    display: inline-block;
    font-size: 0.13rem;
    text-align: right;
  }

  .list-bd {
    width: 100%;
    font-size: 0.13rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    .bd {
      padding-bottom: 0.05rem;
      line-height: 0.2rem;
      font-size: 0.13rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

  }

  .list-ft {
    padding: 0.1rem 0;

    a {
      display: block;
      width: 1rem;
      height: 0.28rem;
      line-height: 0.28rem;
      text-align: center;
      background-color: #ebebeb;
      float: right;
      font-size: 0.13rem;
      color: #333;
      margin: 0 0.05rem;
      -webkit-border-radius: 0.05rem;
      -moz-border-radius: 0.05rem;
      border-radius: 0.05rem;
    }

  }
</style>
