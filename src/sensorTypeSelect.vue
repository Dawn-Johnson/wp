<template>
  <div >
    <div class="btn-group" data-toggle="buttons">
    <label class="btn btn-primary " v-for="x in types" :class="{active:cutype==x}" @click="changetype(x)">
        <input type="radio"autocomplete="off"  > {{x.value}}
    </label>
</div>
  </div>
</template>

<script>
let types = [
        {name: "pm25", value: "PM25"},
        {name: "pm10", value: "PM10"},
        {name: "pm10_pm25", value: "PM10+PM25"},
        {name: "pm100", value: "PM100"},
        {name: "wendu", value: "温度"},
        {name: "shidu", value: "湿度"},
        {name: "noise", value: "噪音"},
        {name: "wind_speed", value: "风速"},
        {name: "wind_direction", value: "风向"},
        {name: "co2", value: "co2"},
    ]
export default {
props:["value"],
  data () {
    return {
      types,
      cutype:_.find(types,{name:this.value})
    }
  },
   methods:{
        changetype(x){
            this.cutype=x
            this.$emit("input",x.name)
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
