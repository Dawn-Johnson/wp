<template>
    <div style="margin-left:auto;margin-right:auto;">
        <el-form ref="form" :model="form" label-width="80px" v-on:keyup.enter="login">
            <el-form-item label="用户名">
                <input v-model="form.username"></input>
            </el-form-item>
            <el-form-item label="密码">
                <input v-model="form.password" type="password"></input>
            </el-form-item>
            <el-form-item label-width="80px">
                <el-button type="primary"  @click="login">登录</el-button>
               <el-button @click="register">注册</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>

import { groupdb ,getUrlConfig} from '../api'
export default {
    data: function () {
        return {
            form: {
                username: "",
                password: ""
            }
        }
    },
    created(){
        if(!getUrlConfig().requirAuth){
           // this.form.username="nova"
           // this.form.password="123456"
            //this.login()
        }
    },
    methods: {
        login() {
            groupdb.db.login(this.form.username, this.form.password, (err, response) => {
                console.log(err, response)
                if (err) {
                    if (err.name === 'unauthorized') {
                        // name or password incorrect
                    } else {
                        // cosmic rays, a meteor, etc.
                    }
                    alert("登录出错")
                } else {
                    console.log("push")
                    groupdb.username=this.form.username
                    this.$router.push("/")
                    localStorage.setItem("wpeditable","1")
                    localStorage.setItem("wp_username",this.form.username)
                    localStorage.setItem("wp_password",this.form.password)
                }
            });
        },
        register() {
            groupdb.db.signup(this.form.username, this.form.password, {
            metadata : {
                
            }
            }, function (err, response) {
            // etc.
                    if(err){
                        alert(err);
                    }else{
                        alert("注册成功")
                    }
            });
        }
    }
}
</script>