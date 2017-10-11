<template>
  <div class="req-wrap">
    <div class="req-list" v-for="(item, index) in this.reqList">
      <div class="list-hd clearfix">
        <span class="hd-code fl">{{item.prCode}}{{(item.note == null) ? '' : `(` + item.note + `)`}}</span>
        <span class="hd-date fr " :class="(new Date().getTime()-item.gmtCreate<= 172800000)?'active-red':''">
          {{ item.gmtCreate | dateFM}}
        </span>
      </div>
      <div class="list-bd">
        <div class="bd bd1"><span
          v-for="(pItem,pIndex) in item.prDetails">{{pItem.skuName}}{{pIndex < item.prDetails.length - 1 ? ',' : ''}}</span>
        </div>
        <div class="bd bd2">
          总计：{{item.totalSkuCount}}个<br>
          已认领：{{item.hasClaimedSkuCount}}个
          待认领：{{item.notClaimedSkuCount}}个
          待采购：{{item.notPurchaseSkuCount}}个
        </div>
        <div class="bd bd3">
          <p v-for="(cItem,cIndex) in item.claimInfoList" :key="cIndex" @click="codeInfo({
              to:'claimdetail',
              claimId: cItem.userId,
              prId: item.id,
              whId: item.whId,
              prCode:item.prCode,
              note:item.note,
              gmtCreate:item.gmtCreate,
              prStatus:item.prStatus,
              whName:item.whName
              })">
            认领人：{{cItem.userName}}<br>
            已认领：{{cItem.hasClaimedSkuCount}}个
            已采购：{{cItem.hasPurchasedSkuCount}}个
            待采购：{{cItem.notPurchaseSkuCount}}个
            <em></em>
          </p>
        </div>
        <div class=" bd bd4 clearfix">
          <span class="fl"
                :class="(parseInt(item.prStatus)==10||parseInt(item.prStatus)==20)?'active-red':'active-green'">
            {{item.prStatus | prStatusToText}}
          </span>
          <span class="fr">{{item.whName}}</span>
        </div>
      </div>
      <div class="list-ft clearfix">
        <a @click="codeInfo({
           to:'reqclaim',
           claimId:userId,
           prCode:item.prCode,
           prId:item.id,
           whId:item.whId,
           note:item.note,
           gmtCreate:item.gmtCreate,
           prStatus:item.prStatus,
           whName:item.whName
           })">查看详情</a>
        <router-link :to="{name:'po',params:{
          prCode:item.prCode,
          prId:item.id,
          whId:item.whId}}">查看相关PO</router-link>


        <!--   <a @click="relatedPo({
           prCode:item.prCode,
           prId:item.id,
           whId:item.whId,
           })">查看相关PO</a>-->
      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapMutations} from 'vuex'
  import LoginForm from './PoList.vue'

  export default {
    name: 'req-list',
    props: ['reqList', 'userId'],
    data() {
      return {}
    },
    methods: {
      codeInfo(obj) {
        this.$store.commit('SET_CODE_INFO', obj)
        if (obj.to === 'claimdetail') {
          this.$router.push('/claimdetail')
        }
        if (obj.to === 'reqclaim') {
          this.$router.push('/reqclaim')
        }
      }
    }
  }
</script>

<style lang="less" type="text/less" scoped>
  .req-wrap {
    margin-top: 0.2rem;
  }

  .req-list {
    padding: 0 0.2rem;
    margin-bottom: 0.2rem;
    background-color: #fff;
  }

  .list-hd {
    position: relative;
    padding: 0.05rem 0;

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
      font-size: 0.12rem;

    }

    .bd1 {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .bd2 {
      border-bottom: 1px solid #ededed;
    }

    .bd3 {

      p {
        position: relative;
        display: block;
        width: 100%;
        margin-bottom: 0.05rem;

        em {
          display: block;
          position: absolute;
          top: 0.12rem;
          right: 0;
          width: 0.12rem;
          height: 0.12rem;
          background: url("./../assets/images/more.png") center no-repeat;
          background-size: cover;
        }

      }
      p:first-child {
        margin-top: 0.05rem;
      }

      p:last-child {
        padding-bottom: 0;
      }

    }
    .bd4 {
      margin-bottom: 0.05rem;
      border-bottom: 1px solid #ededed;
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
