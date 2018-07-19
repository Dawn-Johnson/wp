<template>
    <div>
        <a href="#/">曲线查看</a>
        <div style="display: flex">
            <div class="block">
                <el-pagination
                    layout="prev, pager, next"
                    :page-size="pageSize"
                    @current-change="currentPagechange"
                    :total="filterdGroups.length">
                </el-pagination>
                <el-menu  theme="dark" @select="select" style="height: 900px;overflow: scroll">
                    <el-menu-item v-for="(g,index) in pagedGroups" :index="g._id" >{{g.title}} <el-tag type="success">{{g.children.length}}</el-tag> <el-tag type="success">{{validsnCount(g)}}</el-tag></el-menu-item>
                </el-menu>
            </div>

            
            <div class="scanlist">
               
                <block :stationData="item" @click="toplot(item)" v-for="(item,index) in curgroupsData"></block>
            </div>
        </div>
    </div>

</template>

<script>
    import block from './block'
    import * as api from '../api'

    var mqtt = require('mqtt')
    let mqttclient
    let DATA_TOPIC = "v1/sensor/#"
    function beginmqtt(parent) {
        mqttclient = mqtt.connect('mqtt://192.168.1.172:3000')
        mqttclient.on('connect', function () {

            mqttclient.subscribe(DATA_TOPIC)
        })

        mqttclient.on('message', function (topic, message) {
            // message is Buffer
          //  console.log([topic,message.toString()].join(":"))
            let sn = topic.split("/")[2]
            let obj = JSON.parse(message.toString())

            if (!obj) {
                return;
            }
            let f = _.find(parent.sensorvalues, x => x.owner == obj.owner)
            if (f) {
                f[obj.sn] = _.extend(f[obj.sn], obj)
                if (obj.sn == obj.owner) {
                    f = _.extend(f, obj)
                }
            } else {
                let v = {}
                v.owner = obj.owner
                v[obj.sn] = obj
                v = _.extend(v, obj)
                parent.sensorvalues.push(v)
            }

        })
    }
    function endmqtt() {
        if (mqttclient) {
            mqttclient.end()
        }
    }
    //import _ from 'lodash'
    import { mapActions, mapState, mapGetters } from 'vuex'
    export default {
        name: 'scanblock',
       // props:["searchsn"],
        components: {
            block
        },
        data() {
            return {
                sensorvalues: [],
                curgroup: { children: [] },
                pageSize:15,
                currentPage:1,
            }
        },
        mounted() {
           // beginmqtt(this)
           // this.curgroup = this.groups[this.activeGroupName.split(":")[1]]
           this.$store.dispatch("refreshGroups")
           this.updatedata()
           this.intvalid=setInterval(this.updatedata,3000)
           
        },
        beforeDestroy() {
         //   endmqtt()
         clearInterval(this.intvalid)
        },
        methods: {
            updatedata(){
                api.getLastData().then(sensorvalues=>this.sensorvalues=sensorvalues);
            },
            currentPagechange(page){
                this.currentPage=page
            },
            validsnCount(group){
                let reg=new RegExp(this.searchsn,'i')
                return _.filter(group.children,sn=>reg.test(sn)).length;   
            },
            select(e) {
                console.log(e)
                this.curgroup = _.find(this.groups,x=>x._id==e)
                console.log(this.curgroup)
                //this.pagedGroups[e.split(":")[1]]
                this.activeGroupName=e
            },
             toplot(item) {
                 this.$store.dispatch("updateCheckedSNSR",[item.owner])
                 this.$router.push("/")
                console.log(item)
            }
        },
        computed: {
           filterdGroups(){
              return _.filter(this.groups,x=>this.validsnCount(x)>0)
                
            },
            pagedGroups(){
                return _.chain(this.filterdGroups).clone().reverse().slice((this.currentPage-1)*this.pageSize,this.pageSize*this.currentPage).value()
            },
        activeGroupName:{
            get(){
                return this.$store.state.activeGroupName
            },
            set(v){
                this.$store.commit("updateActiveGroupName",v)
            }
        },
        searchsn(){
            return this.$store.state.searchsn;
        },
     ...mapState(["groups"]),
            curgroupsData() {
                let r = []
                for (let sn of this.curgroup.children) {
                    let s = _.find(this.sensorvalues, x =>{
                        //console.log(sn.split("|")[0])
                       return x.owner== sn.split("|")[0]
                    } )
                    if (s) {
                        s.name=sn
                        r.push(s)
                    } else {
                        r.push({ owner: sn, pm25: "-", pm10: "-" ,name:sn})
                    }
                }

                return r;
            }
        },

    }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .scanlist {
        display: flex;
        flex-wrap: wrap;
        height: 800px;
        align-items: flex-start;
        align-content: flex-start;
    }
</style>