<template>
  <div >
    <el-pagination
        layout="prev, pager, next"
        :page-size="pageSize"
        @current-change="currentPagechange"
        :total="eventlist.length">
    </el-pagination>
      <table class="table table-condensed table-bordered table-hover table-striped">
    <thead>
      <tr>
        <td style="width:200px;">名称</td>
        <td><el-button icon="plus" @click="addEvent"></el-button></td>
      </tr>
    </thead>
  <tbody>
  <tr v-for="(event,index) in pagedEvents" style="cursor:pointer">
    <td @click="eventAction(event)">{{event.name}}</td>
     
     <td>  <el-button icon="edit" @click.stop="editEvent(event)" size="small" ></el-button>
           <el-button icon="minus" size="small" @click.stop="delEvent(event)" ></el-button> 
     </td>
  </tr>
  </tbody>
</table>

    <el-dialog title="添加编辑事件" v-model="dialogFormVisible" size="tiny">
    <el-form :model="form">
        <el-form-item label="事件名称" >
        <el-input v-model="form.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="设备集合sns" >
            <el-input
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 7}"
            placeholder="请输入sns"
            v-model="form.sns">
            </el-input>
        </el-form-item>
         <el-form-item  label="显示子设备">
            <el-switch
                v-model="form.subdevMode"
                on-text=""
                off-text="">
            </el-switch>
        </el-form-item>
        <el-form-item  label="单选模式">
            <el-switch
                v-model="form.singleMode"
                on-text=""
                off-text="">
            </el-switch>
        </el-form-item>
        <el-form-item label="开始时间">
            <el-date-picker
            v-model="form.beginTime"
            type="datetime"
            placeholder="选择日期时间">
            </el-date-picker>
        </el-form-item>
        <el-form-item  label="结束时间">
            <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择日期时间">
            </el-date-picker>
        </el-form-item>
        </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="saveAdd">保存</el-button>
            </span>
    </el-dialog>
  </div>
</template>

<script>
import * as api from '../api'

export default {
  data () {
    return {
      eventlist:[{name:"eee"}],
      form:{},
      dialogFormVisible:false,
      editmode:"edit",
      pageSize:15,
      currentPage:1,
    }
  },
  mounted(){
      this.reloadEvents()
  },
  computed:{
        pagedEvents(){
            return _.chain(this.eventlist).clone().reverse().slice((this.currentPage-1)*this.pageSize,this.pageSize*this.currentPage).value()
        },
  },
  methods:{
      currentPagechange(page){
          this.currentPage=page
      },
      reloadEvents(){
         api.groupdb.getEvents().then(events=>this.eventlist=events) 
      },
      addEvent(){
          this.editmode="add"
          this.form.sns=this.$store.state.checkedSNS.join("\n")
          this.form.beginTime=this.$store.state.historyTime[0]
          this.form.endTime=this.$store.state.historyTime[1]
          this.form.singleMode=this.$store.state.singleMode
          this.form.subdevMode=this.$store.state.subdevMode
          this.form.pres=this.$store.state.pres
          this.dialogFormVisible=true
      },
      editEvent(event){
          this.editmode="edit"
          this.form=_.cloneDeep(event)
          this.dialogFormVisible=true
      },
      delEvent(event){
           this.$confirm('此操作将删除,是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=>{
          api.groupdb.delEvent(event).then(()=>this.reloadEvents())
        })
          
      },
      saveAdd(){
          let {form}=this
          if(this.editmode=="add"){
            api.groupdb.addEvent(form).then(()=>this.reloadEvents())
          }else{
              api.groupdb.saveEvent(this.form).then(()=>this.reloadEvents())
          }
          
          
          this.dialogFormVisible=false
      },
      eventAction(event){
         this.$store.commit("updateCheckedSNS",event.sns.split("\n"))
         
         this.$store.commit("updateSingleMode",event.singleMode)
         this.$store.commit("updatesubdevMode",event.subdevMode)
         if(event.pres){
            this.$store.dispatch("updatePres",event.pres)
         }
         
         this.$store.dispatch("updateHistoryTime",[moment(event.beginTime),moment(event.endTime)])
         
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
