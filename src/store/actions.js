import * as types from './types';
import * as api from './../api/'

const actions = {
  //获取仓库列表
  getWhList({commit}, payload) {
    api.fetch('/urfresh/pms/app/v1/queryWhList', {
      userId: payload
    })
      .then(res => {
        if (res.result) {
          commit(types.SET_WH_LIST, res.content)
        }
      }).catch(error => {
      console.log(error)
    })
  }
}
export default actions
