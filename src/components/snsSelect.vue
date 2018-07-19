<template>
    <div style="position:relative;width:400px;" ref="main">
        <groupeditdialog ref="dlg" mode="add" :value="{}"></groupeditdialog>
          <el-radio-group v-show="mode!='ms'" v-model="singleMode2" size="small">
                <el-radio-button label="single">单选</el-radio-button>
                <el-radio-button label="mul">多选</el-radio-button>
                <el-radio-button label="keypress">键盘</el-radio-button>
            </el-radio-group>
      <!--  <el-switch v-show="mode!='ms'" v-model="singleMode" on-text="单选" off-text="多选" on-color="#13ce66" off-color="#ff4949">  </el-switch>-->
        <right-menu :pop-items="popItems" :mouse="mousePosition" @ListItemClick="list_item_click"  width="300px" height="400px"
                  boxShadow="2px 2px 2px #617C58" background="#8BB381" color="#eee" borderRadius="10px" >
             <textarea class="form-control" rows="5" slot="below"></textarea>
        </right-menu>
        <el-switch v-show="mode!='ms'" v-model="subdevMode" on-text="子设备" off-text="主设备" on-color="#13ce66" off-color="#ff4949" :width="70" >
        </el-switch>
        <el-switch v-show="beditshow" v-model="editmode" on-text="编辑" off-text="编辑" on-color="#13ce66" off-color="#ff4949" >
        </el-switch>
        <el-button  v-show="beditshow"  icon="plus" @click="addGroup">添加分组</el-button>
        <div  >
        <el-tabs style="height:900px;overflow-y: scroll" v-model="activeName" >
        <div  @mousedown="popMenu($event)">
            <el-tab-pane label="所有" name="first" >
                
                <el-collapse >
                    <div class="block">
                        <el-pagination
                            layout="prev, pager, next"
                            :page-size="pageSize"
                            @current-change="currentPagechange"
                            :total="filterdGroups.length">
                        </el-pagination>
                    </div>
                    <el-collapse-item v-for="(x,index) in pagedGroups"   >
                        <template slot="title" >
                           <!--   <el-tag type="success">{{x.children.length}}</el-tag>-->
                            <el-tag type="success">{{validsnCount(x)}}</el-tag> 
                            <span  :title="x.title" :class={tmpgroup:x.tmp} style="display:inline-block;width:120px;text-overflow:ellipsis;white-space: nowrap;" @click="synsntags(x)" > {{x.title}}</span>

                            <a target="_blank" :href="'http://192.168.1.173/redmine/issues/'+groupHref(x)">{{groupHref(x)}}</a>
                            <div style="float:right;display:inline-block">
                                <el-button icon="edit" @click.stop="editGroup(x)" size="small" v-if="editmode&&!x.tmp"></el-button>
                                <el-button icon="minus" size="small" @click.stop="delGroup(x)" v-if="editmode&&!x.tmp"></el-button>
                                <el-button icon="star-off" size="small" @click.stop="favor(x)" v-if="(!editmode)&&(!isFavor(x))"></el-button>
                                <el-button icon="star-on" size="small" @click.stop="favor(x)" v-if="(!editmode)&&(isFavor(x))"></el-button>
                            </div>
                        </template>
                        <groupitem :value="x" :searchsn="searchsn" :canedit="true" :isSn2='isSn1' ></groupitem>
                    </el-collapse-item>
                    <el-collapse-item v-if="validsnCount(lastsngroup)>0">
                        <template slot="title">
                            <span> {{lastsngroup.title}}</span>
                            <el-tag type="success">{{lastsngroup.children.length}}</el-tag>
                         
                        </template>
                        <groupitem :value="lastsngroup" :searchsn="searchsn"  :canedit="false" :isSn2='isSn1'></groupitem>


                    </el-collapse-item>
                </el-collapse>
            </el-tab-pane>
        </div>
        <div >
            <el-tab-pane label="收藏" name="second">
                <el-collapse>
                    <el-collapse-item v-for="(x,index) in groups" v-if="isFavor(x)&&validsnCount(x)>0">
                        <template slot="title">
                            <span :title="x.title" style="display:inline-block;width:100px;text-overflow:ellipsis;white-space: nowrap;"> {{x.title}}</span>
                            <el-tag type="success">{{x.children.length}}</el-tag>
                            <div style="float:right;display:inline-block">
                                <el-button icon="edit" @click.stop="editGroup(x)" size="small" v-if="editmode"></el-button>
                                <el-button icon="minus" size="small" @click.stop="delGroup(x)" v-if="editmode"></el-button>
                                <el-button icon="star-on" size="small" @click.stop="favor(x)" v-if="!editmode"></el-button>
                            </div>
                        </template>

                        <groupitem :value="x" :searchsn="searchsn0" :canedit="true" :editmode="editmode" ></groupitem>
                    </el-collapse-item>
                </el-collapse>
            </el-tab-pane>
        </div>
            <el-tab-pane label="事件" name="third">
               <sensorEvent></sensorEvent>
            </el-tab-pane>
            
        </el-tabs>
        </div>
    </div>
</template>

<script>
import { Notification } from 'element-ui';
    function copyTextToClipboard(text) {
        var textArea = document.createElement("textarea")

        textArea.style.position = 'fixed'
        textArea.style.top = 0
        textArea.style.left = 0
        textArea.style.width = '2em'
        textArea.style.height = '2em'
        textArea.style.padding = 0
        textArea.style.border = 'none'
        textArea.style.outline = 'none'
        textArea.style.boxShadow = 'none'
        textArea.style.background = 'transparent'
        textArea.value = text

        document.body.appendChild(textArea)

        textArea.select()

        try {
        var msg = document.execCommand('copy') ? '成功' : '失败'
        console.log('复制内容 ' + msg)
       // alert("已复制")
        Notification.info({
            title: '成功',
            message: '已复制',
            type: 'success'
            });
        } catch (err) {
            console.log('不能使用这种方法复制内容')
        }

        document.body.removeChild(textArea)
    }
    import Vue from 'vue'
    import groupitem from './groupitem'
    import { mapActions, mapState, mapGetters } from 'vuex'
    import groupeditdialog from './groupeditdialog'
    import sensorEvent from './sensorEvent'
    import * as api from '../api'
    var PouchDB = require('pouchdb');
    export default {
        props: ["sns", "mode", "groups"],
        data() {
            return {
                activeName:"first",

                //    checkedSns:[],
                searchsn0:"",
                isSn1:true,
                navsn: "",
                dialogVisible: false,
                favors: [],
                pageSize:15,
                currentPage:1,
                beditshow:false,
                popItems_static: [
                    {
                    txt: '复制选中sn'
                    },
                    {
                    txt: '复制组id'
                    },
                    
                ],
                popItems:[],
                mousePosition:[],
                cumousesn:null,
                menumode:'group',//'group,sub'
            }
        },
        mounted() {  
      
            if (this.mode == "ms") {
                this.singleMode = false
                this.subdevMode = false
            }
            this.db = new PouchDB('favorgroups');
            this.reloadDB()
            this.searchsn0=this.$store.state.searchsn
            this.isSn1=this.$store.state.isSn
            let wpeditable=localStorage.getItem("wpeditable") 
            if(wpeditable==undefined || wpeditable=="1"){
                this.beditshow=true
            }
            console.log(this.isSn1)
        },
        computed: {
            
            filterdGroups(){
            	if(this.isSn1){
            		 return _.filter(this.groups,x=>this.validsnCount(x)>0)
            	}else{
            		 return _.filter(this.groups,x=>this.validsnCount(x)>0||this.validtitleCount(x))
            	}        
            },
            pagedGroups(){
                return _.chain(this.filterdGroups).clone().reverse().slice((this.currentPage-1)*this.pageSize,this.pageSize*this.currentPage).value()
            },
            lastsngroup() {
                return {
                    children: this.sns,
                    title: "最近在线设备"
                }
            },
            searchsn(){
                return this.$store.state.searchsn
            },
            isSn(){
                return this.$store.state.isSn	
            },
            
            checkedSnsR() {
                let nsn = ""
                let ck = []

                for (let sn of this.checkedSns) {
                    ck.push(sn)
                    if (this.subdevMode && sn.substr(0,2)!=="CN") {
                        let snd = sn.split("|")[0].substr(3)
                        let sn0 = "MN1" + snd + ":" + sn
                        let sn1 = "MN2" + snd + ":" + sn
                        let sn2 = "MN3" + snd + ":" + sn
                        let sn3 = "MN4" + snd + ":" + sn
                        ck.push(sn0)
                        ck.push(sn1)
                        ck.push(sn2)
                        ck.push(sn3)
                    }
                    nsn = sn
                }

                return ck;
            },
            subdevMode:{
                get() {
                    return this.$store.state.subdevMode
                }, set(value) {
                    this.$store.commit("updatesubdevMode", value)
                }
            },
            singleMode: {
                get() {
                    return this.$store.state.singleMode
                }, set(value) {
                    this.$store.commit("updateSingleMode", value)
                }
            },
            singleMode2: {
                get() {
                    return this.$store.state.singleMode2
                }, set(value) {
                    this.$store.commit("updateSingleMode2", value)
                }
            },
            checkedSns() {
                return this.$store.state.checkedSNS
            },
            editmode:{
                get(){
                    return this.$store.state.editmode
                },
                set(value){
                    this.$store.commit("updateEditmode",value)
                }
            },
            ...mapState(["tag_list","send_packet_buttons"])
    
        },
        watch: {
            checkedSnsR() {
                this.$emit("change", this.checkedSnsR)
            },
            searchsn:_.debounce(function(sn){
                this.searchsn0=sn
                console.log(sn)
                console.log(this.groups)
            },50),
            isSn:_.debounce(function(sn){
                this.isSn1=sn
                console.log(this.isSn1)
              
            },50)
        },
        methods: {
            list_item_click(it){
                console.log(it)
                switch (it){
                case 0:
                    
                    copyTextToClipboard(this.$store.state.checkedSNS.join("\n"))  
                    break;
                }
                let lenstaticpopitems=this.popItems_static.length
                if(it-lenstaticpopitems>=0){
                    if(this.menumode=="sub"){
                        let tag_list_item=this.tag_list[it-lenstaticpopitems]
                        console.log(this.cumousesn,tag_list_item)
                        api.set_wp_tag_sn(tag_list_item,this.$store.state.checkedSNS).then(datas=>{
                            this.$store.commit("UpdateSNtotags",datas)
                        })
                    }else if(this.menumode=="group"){
                        let pb=this.send_packet_buttons[it-lenstaticpopitems]
                        let sns=this.$store.state.checkedSNS
                        console.log(pb,JSON.stringify(sns))
                        Vue.http.get(`http://192.168.1.172:5030/wp_sn_tag_api/send_msg_to_sn?sn_list=${JSON.stringify(sns)}&id=${pb.id}`)
                    }

                }
                this.mousePosition = ['close'];
            },
            popMenu(e){
                let self = this;
                e.preventDefault();
                if(e.button ===2){
                    console.log(this.send_packet_buttons)
                    let names=[]
                    if(this.$store.state.mousesn){
                        names=_.map(this.tag_list,x=>({txt:'标签'+x.tag_group+"-"+x.name}))
                        this.cumousesn=this.$store.state.mousesn
                        this.menumode="sub"
                    }else{
                        names=_.map(this.send_packet_buttons,x=>({txt:'命令:'+x.title}))
                        this.menumode="group"
                    }
                    
                    this.popItems=_.concat(this.popItems_static,names);
                    let x = e.clientX;
                    let y = e.clientY;
                    let rect=this.$refs.main.getBoundingClientRect()
                    self.mousePosition = [x-rect.left, y-rect.top];
                    this.$store.commit("updateMousesn",null)
                    console.log(x.y)
                }
                else if(e.button ===0){
                    self.mousePosition = ['close'];
                }
            },
            synsntags(g){
                console.log(g)
                let sns=g.children.map(x=>x.split("|")[0])
                this.$store.dispatch("UpdateSNtotags",sns)
            },
            groupHref(group){
                
                let href
                if(group.title){
                    let ss=group.title.split("|")
                    if(ss.length>1){
                        href=ss[1]
                    }
                }

                return href
            },
            currentPagechange(page){
                this.currentPage=page
            },
            validsnCount(group){
                let reg=new RegExp(this.searchsn0,'i')             
                return _.filter(group.children,sn=>reg.test(sn)).length;   
             
            },
            validtitleCount(group){
            	let reg=new RegExp(this.searchsn0,'i')             
                return reg.test(group.title)
            },
            reloadDB() {
                this.db.get("favorgroups").then((doc) => {
                    this.favors = doc.favors
                    this.doc = doc
                })
            },
            isFavor(g) {
                return _.indexOf(this.favors, g._id) > -1
            },
            addGroup() {
                this.$refs.dlg.value = {}
                this.$refs.dlg.mode = "add"
                this.$refs.dlg.show()
            },
            delGroup(x) {
                this.$confirm('要删掉整个分组吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$store.dispatch("delGroup", x)
                }).catch(() => { })

            },
            editGroup(x) {
                this.$refs.dlg.value = x
                this.$refs.dlg.mode = "edit"
                this.$refs.dlg.show()
            },
            isChecked(sn) {

                return _.indexOf(this.checkedSns, sn) > -1
            },
            toggle(sn) {
            
        
                 let checkedSNS0 = _.clone(this.checkedSns)
                if (!this.singleMode) {
                    if (this.isChecked(sn)) {
                        checkedSNS0 = _.remove(checkedSNS0, tsn => tsn != sn)
                    } else {
                        checkedSNS0.push(sn)
                        this.setNav(sn)
                    }
                } else {
                   
                    if(checkedSNS0.length=1&&checkedSNS0[0]==sn){
                        checkedSNS0 = []
                    }else{
                        checkedSNS0 = []
                        checkedSNS0.push(sn)
                        this.setNav(sn)
                    }
                    

                }
                this.checkedSns=_.clone(checkedSNS0)
                this.$store.commit("updateCheckedSNS", checkedSNS0)
            },
            setNav(sn) {
                if (sn != this.navsn) {
                    this.$emit("navsnchange", sn)
                }
                this.navsn = sn
            },
            favor(item) {
                if (_.indexOf(this.favors, item._id) > -1) {
                    this.favors = _.filter(this.favors, x => x != item._id)
                } else {
                    this.favors.push(item._id)
                }
                let self = this
                if (this.doc) {
                    this.db.put({
                        _id: 'favorgroups',
                        favors: this.favors,
                        _rev: this.doc._rev
                    }).then(function (response) {
                        // handle response
                        self.reloadDB()
                    }).catch(function (err) {
                        self.reloadDB()()
                        alert(err);
                    });
                } else {
                    this.db.put({
                        _id: 'favorgroups',
                        favors: this.favors,
                    }).then(function (response) {
                        // handle response
                        self.reloadDB()
                    }).catch(function (err) {
                        self.reloadDB()()
                        alert(err);
                    });
                }

            }

        },
        components: {
            groupitem,
            groupeditdialog,
            sensorEvent
        }
    }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.tmpgroup{
    background-color: aqua
}
</style>