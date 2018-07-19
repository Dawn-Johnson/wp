<template>
    <div>
    
        <groupcontent :sns="children" :searchsn="searchsn" :isSn3='isSn2'></groupcontent>
   
       
    </div>

</template>
<script>
import {minLength} from 'vuelidate/lib/validators'
import groupcontent from "./groupcontent"
import groupeditdialog from './groupeditdialog'
import {mapState} from 'vuex'
import * as api from '../api'
 export default {
  props:["value","canedit","searchsn",'isSn2'],
  data () {
    return {
      mode:"show",
      dialogVisible:false,

    }
  },
  computed:{
   children(){
       return this.value.children
   },
 
  },
 
 
  methods:{
     

      
  },

  components:{
      groupcontent,

  }
}
</script>