<template>
  <div>
    <div class="btn-group" data-toggle="buttons">
      <!-- <label class="btn btn-primary " v-for="x in types" :class="{active:cutype==x}" @click="changetype(x)">
            <input type="radio"autocomplete="off"  > {{x.value}}
            
        </label>-->
      <el-radio-group v-model="sensortype[0]" v-show="radiomode">
        <el-radio-button v-for="tp in types" :label="tp.name">  {{tp.title}}
        	<i class='el-icon-edit'v-if='tp.icon'style='display: inline-block;margin-left: 6px;'></i>
        </el-radio-button>
      </el-radio-group>
      <el-checkbox-group v-model="sensortype" v-show="!radiomode" :min="1">
        <el-checkbox-button v-for="tp in types":label="tp.name">{{tp.title}}    	
        	<i class='el-icon-edit'v-if='tp.icon'style='display: inline-block;margin-left: 6px;'></i>
        </el-checkbox-button>
      </el-checkbox-group>  
	  <el-dialog
	  title="请输入算式"
	  v-model="dialogVisible"
	  size="tiny"
	  >
	  <el-input v-model="inputMes" placeholder="请输入新算式"></el-input>
	  <span slot="footer" class="dialog-footer">	    
	    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
	  </span>
	</el-dialog>
	 <el-dialog
	  title="请输入算式"
	  v-model="dialogVisible1"
	  size="tiny"
	  >
	  <el-input v-model="inputMes1" placeholder="请输入新算式"></el-input>
	  <span slot="footer" class="dialog-footer">	    
	    <el-button type="primary" @click="dialogVisible1 = false">确 定</el-button>
	  </span>
	</el-dialog>
		
    </div>
    <el-switch v-model="radiomode" on-text="单选" off-text="多选">    
    </el-switch> 
  </div>
</template>

<script>
import * as api from '../api'
/*let types = [
  { name: "pm25", value: "PM25" },
  { name: "pm10", value: "PM10" },
  { name: "pm100", value: "PM100" },
  { name: "wendu", value: "温度" },
  { name: "shidu", value: "湿度" },
  { name: "noise", value: "噪音" },
  { name: "wind_speed", value: "风速" },
  { name: "wind_direction", value: "风向" },
  { name: "co2", value: "co2" },
  { name: "inner_wendu", value: "内温" },
  { name: "inner_shidu", value: "内湿" },
  { name: "chuchen", value: "除尘" },
  { name: "chushi", value: "除湿" },
  { name: "so2", value: "So2" },
  { name: "o3", value: "O3" },
  { name: "no2", value: "NO2" },
  { name: "co", value: "CO" },
  { name: "pressure", value: "气压" },
  { name: "voltage", value: "电压" },
  { name: "current", value: "电流" },
  { name: "power", value: "功率" },
  { name: "lng", value: "经度" },
   { name: "lat", value: "纬度" },
  { name: "sat_num_visible", value: "gps可见卫星数" },
  { name: "sat_num_pos", value: "gps用于定位的卫星数" },
  { name: "gps_errpkt_num", value: "gps报文校验错误	" },
  { name: "sig_level", value: "信号强度	" },
]*/

export default {
  props: ["value"],
  data() {
    return {
      sensortype: ["pm25"],
      types:[],
      radiomode: true,
      init:'请编辑',
      dialogVisible:false,
      dialogVisible1:false,
      inputMes:'',
      inputMes1:'',
    }

  },
  created(){
    api.getSensorTypes().then(ds=>{
      this.types=ds

      window.sensortypes=ds
            //this.types.push(obj)
    //  this.types.push(obj1)
    })
  },
  methods:{
   changS(tp){
   	if(tp.icon==1){
   			this.dialogVisible=true
        this.inputMes=tp.title
   	}else{
   		  this.dialogVisible1=true
        this.inputMes1=tp.title
   	}
   
   } 
  },
  watch: {
  	inputMes(){
  		for(let item of this.types){
  			if(item.icon==1){
  				item.title=this.inputMes
  				item.name='calc:'+this.inputMes
  			}
  		}
  	},
  	inputMes1(){
  		for(let item of this.types){
  			if(item.icon==2){
  				item.title=this.inputMes1
  				item.name='calc:'+this.inputMes1
  			}
  		}
  	},
    sensortype() {  	
    	console.log(this.sensortype)
      let e=window.event
   //   let radiomode=!e.ctrlKey
      if (this.radiomode) {
        this.$emit("input", [_.last(this.sensortype)])
      } else {
        this.$emit("input", this.sensortype)
      }
    //  this.radiomode=!e.ctrlKey
    },
    radiomode() {
      if (this.radiomode) {
        this.$emit("input", [this.sensortype[0]])
      } else {
        this.$emit("input", this.sensortype)
      }
    }
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
