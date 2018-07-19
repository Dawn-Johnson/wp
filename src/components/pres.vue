<template>
  <div >
    <div class="btn-group" data-toggle="buttons">
    <label class="btn btn-primary " v-for="x in types" :class="{active:pres==x}" @click="changetype(x)">
        <input type="radio"autocomplete="off"  > {{x.value}}
        
    </label>
</div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
let types = [
        {name: "1s", value: "原始数据"},
        {name: "30s", value: "30s"},
        {name: "1m", value: "1分钟"},
        {name: "5m", value: "5分钟"},
        {name: "10m", value: "10分钟"},
        {name: "1h", value: "1小时"},
        {name: "1d", value: "1天"},
    ]
export default {
  data () {
    return {
      types,
    }
  },
   methods:{
        changetype(x){
            this.pres=x
            console.log(x.name)
            
        },
    },
    computed:{
        pres:{
            get(){
                return _.find(types,{name:this.$store.state.pres})
            },
            set(v){
                this.$store.dispatch("updatePres",v.name)
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
