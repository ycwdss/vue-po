<template>
  <div class='popup' v-if="show">
    <div class="popup-content">
      <div class="popup-hd">
        <slot name="hd"></slot>
      </div>
      <div class="popup-bd">
        <slot name="bd"></slot>
      </div>
      <div class="popup-ft">
        <a @click="onSure">确定</a>
        <a @click="OnClose">取消</a>
      </div>
    </div>

  </div>
</template>
<script>
  import * as utils from './../utils/'
  export default {
    name: 'popup',
    props: {
      show: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {}
    },
    components: {},
    methods: {
      OnClose(){
        this.$emit('OnClose')
      },
      onSure(){
        this.$emit('OnSure')
      }
    }
  }
</script>
<style lang="less" type="text/less" scoped>
  .popup {
    &:before {
      content: '';
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 88;
      background-color: rgba(0, 0, 0, 0.7);
    }
  }

  .popup-content {
    position: fixed;
    top: 30%;
    left: 50%;
    margin-left: -40%;
    z-index: 99;
    width: 80%;
    max-height: 50%;
    overflow: auto;
    background: #fff;
    border: 2px solid #464068;
    -webkit-animation: popup 0.2s;
    -o-animation: popup 0.3s;
    animation: popup 0.2s;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    > div {
      font-size: 0.14rem;
    }
  }

  .popup-hd {
    padding: 0.1rem 0.2rem;
    text-align: center;
  }

  .popup-bd {
    padding: 0 0.2rem;
  }

  .popup-ft {
    position: relative;
    line-height: 0.36rem;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    &:after {
      content: " ";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      height: 1px;
      border-top: 1px solid #eee;
      color: #eee;
      -webkit-transform-origin: 0 0;
      transform-origin: 0 0;
      -webkit-transform: scaleY(.5);
      transform: scaleY(.5);
    }
    a {
      display: block;
      -webkit-box-flex: 1;
      -webkit-flex: 1;
      flex: 1;
      text-decoration: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      text-align: center;
      color: #333;
      font-size: 0.16rem;
    }
    a:first-child {
      color: #f90;
      border-right: 1px solid #eee;
    }
    a:active {
      background-color: #eee;
    }
  }

  @-webkit-keyframes popup {
    0% {
      opacity: 0;
      -webkit-transform: scale(0.5);
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

  @keyframes popup {
    0% {
      opacity: 0;
      -webkit-transform: scale(0.5);
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      -webkit-transform: scale(1);
      transform: scale(1);
    }
  }

</style>
