
<template>
    <div>
        <el-date-picker v-model="historyTime" type="datetimerange" :picker-options="pickerOptions" placeholder="选择时间范围" align="right"
            format="yyyy-MM-dd HH:mm" style="width:350px">
        </el-date-picker>
        <div class="btn-group" data-toggle="buttons">
            <label class="btn  " v-for="x in types" :class="{'btn-primary':btn==x.name}" @click="setLastMinitues(x)">
                <input type="radio"autocomplete="off"  > {{x.value}}
                
            </label>
        </div>
    <!--    <el-button-group style="display:inline-block">
        <el-button :type='{primary:btn==10}'  @click="setLastMinitues(10)" >最近10分钟</el-button>
        <el-button  @click="setLastMinitues(60)" >最近一小时</el-button>
        <el-button  @click="setLastMinitues(4*60)" >最近四小时</el-button>
        <el-button  @click="setLastMinitues(12*60)" >最近十二小时</el-button>
        <el-button  @click="setLastMinitues(24*60)" >最近一天</el-button>
        <el-button  @click="setLastMinitues(2*24*60)" >最近两天</el-button>
        <el-button  @click="setLastMinitues(3*24*60)" >最近三天</el-button>
      </el-button-group>-->
    </div>
</template>

<script>

import {DatePicker} from 'element-ui'
let types = [
        {name: "10m", value: "最近10分钟",mins:10},
        {name: "1h", value: "最近1小时",mins:60},
        {name: "4h", value: "最近4小时",mins:4*60},
        {name: "12h", value: "最近12小时",mins:12*60},
        {name: "1d", value: "最近1天",mins:24*60},
        {name: "2d", value: "最近2天",mins:2*24*60},
        {name: "3d", value: "最近3天",mins:3*24*60},
    ]
let pickerOptions= {
          shortcuts: [
            {
            text: '最近10分钟',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 600 * 1000 * 1);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近1h',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 1);
              picker.$emit('pick', [start, end]);
            }
          },
          
          {
            text: '最近2h',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 2);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近4h',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 4);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近6h',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          }, 
            {
            text: '最近12h',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 12);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一天',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }]
        }

export default {
  
  data () {
    return {
      pickerOptions,
      btn:null,
      types

    }
  },
  methods:{
    setLastMinitues(x){
              const end = new Date();
              const start = new Date();
              
              let n=x.mins
              start.setTime(start.getTime() - 60000*n);
              this.historyTime=[start,end]
              this.btn=x.name
    },
  },
  computed:{
            historyTime:{
                get(){
                  //  console.log(this.$store.state.historyTime)
                    return _.map(this.$store.state.historyTime,(x)=>x.toDate())
                    
                },
                set(value){
                   // console.log(moment(value[0]))
                   this.btn=null
                    this.$store.dispatch("updateHistoryTime",_.map(value,x=>moment(x)))
                }
        }
  }
}

</script>