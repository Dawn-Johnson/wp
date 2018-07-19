<template>
    <div>
        <table class="table table-condensed table-bordered table-hover table-striped">
           
            <tr v-for="sn in sns" :class="{active:isChecked(sn)}" @click="toggle($event,sn)"v-if='isSn3' v-show="isSnValid(sn)" @mousedown="mousedown($event,sn)">
                <td style="width:30px;"> <span v-if="sntotags[sn.split('|')[0]]"  v-for="t in sntotags[sn.split('|')[0]]" :style="{backgroundColor:'#'+t.color}">{{t.title}}</span> </td>
                <td style="text-align:center">{{sn}} </td>
                <td v-if="!editmode"><el-tag>{{getSubno(sn)}}</el-tag></td>
                <td  v-if="!editmode"><el-tag>{{getIp(sn)}}</el-tag>
                </td>
                <td v-if="!editmode" style="text-align:right">
                    <div class="btn btn-default" @click.stop="navsn=sn">
                        <i :class="{active:navsn==sn}" class="glyphicon glyphicon-chevron-right"></i>
                    </div>
                </td>
                <!--<td><el-button icon="edit" @click.stop="editGroup(x)" size="small" v-if="editmode"></el-button></td>
                	  v-show="isSnValid(sn)"
                -->
            </tr>
            
            <tr v-for="sn in sns" :class="{active:isChecked(sn)}" @click="toggle($event,sn)"v-if='!isSn3' @mousedown="mousedown($event,sn)" >
                <td style="width:30px;"> <span v-if="sntotags[sn.split('|')[0]]"  v-for="t in sntotags[sn.split('|')[0]]" :style="{backgroundColor:'#'+t.color}">{{t.title}}</span> </td>
                <td style="text-align:center">{{sn}} </td>
                <td v-if="!editmode"><el-tag>{{getSubno(sn)}}</el-tag></td>
                <td  v-if="!editmode"><el-tag>{{getIp(sn)}}</el-tag>
                </td>
                <td v-if="!editmode" style="text-align:right">
                    <div class="btn btn-default" @click.stop="navsn=sn">
                        <i :class="{active:navsn==sn}" class="glyphicon glyphicon-chevron-right"></i>
                    </div>
                </td>
                <!--<td><el-button icon="edit" @click.stop="editGroup(x)" size="small" v-if="editmode"></el-button></td>
                	  v-show="isSnValid(sn)"
                -->
            </tr>
             
        </table>
        
    </div>
</template>
<script>

    import { mapActions, mapState, mapGetters } from 'vuex'
    export default {
        props: ["sns","searchsn",'isSn3'],
        data() {
            return {
                lastsn:null,

            }
        },
        computed: {

            navsn: {
                get() {
                    return this.$store.state.navsn
                },
                set(v) {
                    this.$store.commit("updateNavsn", v)
                }
            },
      ...mapState(["checkedSNS","snIptable","editmode","singleMode2","sntotags"]),
            singleMode: {
                get() {
                    return this.$store.state.singleMode
                }, set(value) {
                    this.$store.commit("updateSingleMode", value)
                }
            },
        },     
        methods: {
            mousedown($event,sn){
                console.log(sn)
                this.$store.commit("updateMousesn",sn)
            },
            isSnValid(sn){
                let reg=new RegExp(this.searchsn,'i')
                return reg.test(sn)
            },
            getSubno(sn){
                let s=this.snIptable[sn]
                if(s && s.subno){
                    return s.subno
                }
                else{
                    return "N"
                }
            },
             getIp(sn){
                let s=this.snIptable[sn]
                if(s && s.ip){
                 //   console.log(s)
                    return s.ip
                }
                else{
                    return "N"
                }
            },
            isChecked(sn) {
                return _.indexOf(this.checkedSNS, sn) > -1
            },
            toggle($event,sn) {
                let checkedSNS0 = _.clone(this.checkedSNS)
                this.navsn = sn
                console.log($event)
                if(this.singleMode2=="keypress"){
                    if ($event.ctrlKey) {
                        if (this.isChecked(sn)) {
                            checkedSNS0 = _.remove(checkedSNS0, tsn => tsn != sn)
                        } else {
                            checkedSNS0.push(sn)
                        }
                    } else if($event.shiftKey){
                        let begin=_.indexOf(this.sns,this.lastsn)
                        let end=_.indexOf(this.sns,sn)
                        if(begin>-1&&end>-1){
                            let min=Math.min(begin,end)
                            let max=Math.max(begin,end)
                            for(let i=min;i<=max;i++){
                                if(this.sns[i]!==this.lastsn){
                                    checkedSNS0.push(this.sns[i])
                                }
                                
                            }
                        }

                    }else {
                        checkedSNS0 = []
                        checkedSNS0.push(sn)
                    }
                }else{
                        this.singleMode=this.singleMode2=="single"
                        if (this.singleMode){
                            checkedSNS0 = []
                            checkedSNS0.push(sn)
                        } else{
                            if (this.isChecked(sn)) {
                                checkedSNS0 = _.remove(checkedSNS0, tsn => tsn != sn)
                            } else {
                                checkedSNS0.push(sn)
                            }
                        } 
                }
                
                
                this.$store.commit("updateCheckedSNS", checkedSNS0)
                this.lastsn=sn
            },
        },
        watch:{
        	isSn3(){
        		console.log(this.isSn3)
        	}
        }
    }

</script>
<style scoped>
    tr.active>td {
        background-color: lightseagreen!important;
    }
    
    i.active {
        color: lightseagreen!important;
    }
    
    td {
        cursor: pointer;
        border-bottom: solid 1px;
    }
</style>