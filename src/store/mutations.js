import * as types from './types'

const mutations={
  [types.SET_USER_INFO](state,payload){
    localStorage.setItem('userInfo', JSON.stringify(payload))
    state.userInfo = JSON.parse(localStorage.getItem('userInfo'))
  },
  [types.SET_WH_LIST](state, payload) {
    payload.forEach((value, index) => {
      state.whList.push({key: payload[index].id, value: payload[index].whName})
    })
  },
  [types.SET_CODE_INFO](state,payload){
    localStorage.setItem('codeInfo', JSON.stringify(payload))
    state.codeInfo = JSON.parse(localStorage.getItem('codeInfo'))
  },

}
export default mutations
