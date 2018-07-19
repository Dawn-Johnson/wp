<template>

    <div class="pan" style="cursor: pointer;" @click="$emit('click')">
     
        <div class="title">{{stationData.name}}</div>
        <div class="bigV">
            <div class="caption" :class="'airlevel_bg'+getpmlevel('pm25',stationData.pm25)">PM<sub>2.5</sub></div>
            {{stationData.pm25||'--'}}<span class="unitlabel">&mu;g/m<sup>3</sup></span>
        </div>

        <div class="bigV" style="border-top:1px solid darkblue;">
            <div class="caption" :class="'airlevel_bg'+getpmlevel('pm10',stationData.pm10)">PM<sub>10</sub></div>
            {{stationData.pm10||'--'}}<span class="unitlabel">&mu;g/m<sup>3</sup></span>
        </div>
        <div style="color:#ddd;font-size:10px;text-align:center;">更新时间:{{formattime(stationData.time)}}</div>


    </div>

</template>
<style scoped>
    .unitlabel {
        font-size: 15px;
        position: absolute;
        right: 8px;
        top: 10px;
    }
    
    .title {
        text-align: center;
    }
    
    .bigV {
        text-align: center;
        font-size: 40px;
        background-color: blue;
        position: relative;
    }
    
    .caption {
        display: inline-block;
        font-size: 15px;
        line-height: 20px;
        float: left;
        border-radius: 10px;
        padding: 3px;
        position: absolute;
        left: 10px;
        top: 10px;
    }
    
    .pan {
        background-color: dodgerblue;
        border-radius: 15px;
        width: 200px;
        height: 155px;
        padding: 1px;
        margin: 5px;
        color: white;
    }
</style>
<script>
    import { getpmlevel } from '../util/util'
    export default {
        props: ['stationData'],
        methods: {
            handleSelect(key, keyPath) {
                console.log(key, keyPath);
            },
            formattime(time) {
             
                if(!time){
                    return "--"
                }
             
                let t = moment(time).subtract(8,"hours")
                return t.format("HH:mm:ss")
            },
            getpmlevel
        }
    }

</script>