
const state={
  userInfo:JSON.parse(localStorage.getItem('userInfo'))||{},//用户信息
  whList:[],//登录信息
  codeInfo:JSON.parse(localStorage.getItem('codeInfo')) || {},//需求单，仓库id等信息

}
export default state
