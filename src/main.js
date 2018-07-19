// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
var _ = require('lodash');

import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import VueRouter from 'vue-router'
import plot from "./components/plot"
import group from "./components/group"
import Vuelidate from 'vuelidate'
import scanblock from './components/scanblock'
import login from './components/login'
require("bootstrap/dist/css/bootstrap.css")
import * as api from './api'
import mouseMenu from 'vue-mouse-menu'
Vue.use(mouseMenu)
Vue.use(Vuelidate)
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.http.get('appconfig.json').then(x=>{
  api.setUrlConfig(x.data)
  api.groupdb.init()
  run()
})
api.get_send_packet_buttons().then(buttons=>{
  store.commit('update_send_packet_buttons', buttons)
})

function run(){
const router = new VueRouter({
  //mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: plot, meta: { requiresAuth: true,tmp:false } },
    { path: '/wp2', component: plot, meta: { requiresAuth: false,tmp:true } },
    { path: '/scanblock', component: scanblock, meta: { requiresAuth: true } },
    { path: '/login', component: login },
  ]
})
router.beforeEach((to, from, next) => {
  // ...

  let { groupdb } = api

  console.log(to)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    groupdb.db.getSession(function (err, response) {
      if (err) {
        // network error
      } else if (!response.userCtx.name) {
        next({ path: "/login" })
        //next()
      } else {
        // response.userCtx.name is the current user
        groupdb.username=response.userCtx.name
        next()
      }
    });
  } else {
    next()
  }

})

let params={sns:"",title:"",t0:null,t1:null}
if(location.hash){
  if(location.hash.split("?").length>1){
    location.hash.split("?")[1].split("&").map(x=>x.split("=")).map(x=>{params[x[0]]=x[1]})
    console.log(params)
  }

}
let tmpsns=params["sns"].split(",")
let tmpsnstitle=params.title
let tmptimerange=[params["t0"],params["t1"]]
window.tmpparams={tmpsns,tmpsnstitle,tmptimerange}
if(tmptimerange[0]){
  store.commit("updateHistoryTime",[moment(tmptimerange[0]),moment(tmptimerange[1])])
}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  store,
  router,
  created() {
    //api.GetData("B000-A00A",moment().subtract(1,"days"),moment()).then(x=>console.log(x))
    store.dispatch("updateHistoryData")
  },
  components: { App }
})

}
