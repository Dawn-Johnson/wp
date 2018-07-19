<template>
    <div>
        <snsSelect :sns="sns" mode="ms"></snsselect>
    </div>
</template>
<script>
import snsSelect from "./snsSelect"
import { mapActions,mapState,mapGetters } from 'vuex'
export default {
  data () {
    return {
      
    }
  },
  components:{
      snsSelect
  },
  computed:{
      ...mapState(["sns"])
  }
}

</script>