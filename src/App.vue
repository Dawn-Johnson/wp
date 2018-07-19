<template>
  <div id="app">
   <h1>传感器数据查看</h1><el-button style="float:right" @click="logout">退出</el-button>
      <el-input placeholder="搜索sn" icon="close" v-model="searchsn" style="width: 150px;" :on-icon-click="handleIconClick" 
      	v-if='isSn'
      	v-show="$route.meta.requiresAuth">
      </el-input>
       <el-input placeholder="搜索组名" icon="close" v-model="searchsn" style="width: 150px;" :on-icon-click="handleIconClick" 
      	v-if='!isSn'
      	v-show="$route.meta.requiresAuth">
      </el-input>
      <el-switch 
      	 v-model="isSn" 
      	 on-text="SN" 
      	 off-text="组名" 
      	 on-color="#13ce66" 
      	 off-color="#ff4949"
      	 v-show="$route.meta.requiresAuth"
      	>
      </el-switch>
     <div style="display:inline-block;padding:2px;margin-left:100px;">
         <div style="display:inline-block" v-for="user in public_user_infos"> 
          <el-button size="small"  type="primary" @click="loginuser(user)" v-if="user.type==1&&user.name==userCtx.name" >{{user.title}}</el-button>
          <el-button size="small"   @click="loginuser(user)" v-if="user.type==1&&user.name!==userCtx.name" >{{user.title}}</el-button>
          <span v-if="user.type==2" style="margin-left:100px" >{{user.title}}:</span>
        </div>
        <el-button size="small" style="margin-left:50px;"   @click="loginlocaluser()">上次密码登录用户:{{localuser.name}}</el-button>
        </div>
     <div style="height:5px;"></div>
   <router-view ></router-view>
  </div>
</template>

<script>

import {groupdb,getPublicUserInfos} from './api'
import { mapState } from 'vuex';

export default {
  name: 'app',
  data(){
    return {
      public_user_infos:[],
      userCtx:{},
      localuser:{},
    }
  },
  components: {

  },
  created(){
    let self=this
      getPublicUserInfos().then(function(userinfos){
        self.public_user_infos=userinfos
      })
      self.refreshCurrentUser()
    _.delay(function(){
      self.$store.dispatch("refreshGroups")
    })
    _.delay(function(){
      self.$store.dispatch("Updatetag_list")
    })

    
  },
  watch:{
    '$route': 'refreshCurrentUser'
  },
  computed:{
    searchsn:{
      get(){
        return this.$store.state.searchsn
      },
      set(sn){
        this.$store.commit("updateSearchsn",sn.trim())
      }
    },     
    isSn:{
    	 get(){
        return this.$store.state.isSn
      },
      set(sn){
        this.$store.commit("updateSearchissn",sn)
      }
    },
    ...mapState(["tag_list"])
    
  },
  methods:{
    loginlocaluser(){
      let user={}
      user.name=localStorage.getItem("wp_username")
      user.password=localStorage.getItem("wp_password");
      this.loginuser(user,1)
    },
    button_type(user){
      return user.name==this.userCtx.name?"primary":"default"
    },
    refreshCurrentUser(){
      this.localuser.name = localStorage.getItem("wp_username")
      groupdb.db.getSession().then(x=>{
          this.userCtx=x.userCtx
          this.$store.commit("updateUserCtx",x.userCtx)
          window.userCtx=x.userCtx
          console.log(x)
      })
    },
    handleIconClick(){
      this.searchsn=""
    },
    loginuser(user,wpeditable=0){
        
        groupdb.db.login(user.name, user.password, (err, response) => {
               localStorage.setItem("wpeditable",wpeditable)
                if (err) {
                    if (err.name === 'unauthorized') {
                        // name or password incorrect
                    } else {
                        // cosmic rays, a meteor, etc.
                    }
                    alert("登录出错")
                    location.replace("/wp/")
                } else {
                    console.log("push")
                    groupdb.username=user.name
                    location.replace("/wp/")
                   //self.$router.replace("/wp/")
                }
      })
    },
    logout(){
      groupdb.db.logout().then(()=>{
        this.$router.replace("/login")
      })
    }
  }
}
</script>


<style>
#app {


}
</style>
