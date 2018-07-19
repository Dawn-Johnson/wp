<template>
  <div >
    <div >
      <a href="#/scanblock">矩阵查看</a>

      <el-popover ref="popover3" placement="top-start" title=" 命名规则说明" width="400" trigger="click">命名格式
        <pre>组名|redmine问题号</pre> 比如
        <pre> 测试组|4376</pre>
        

      </el-popover>

      <el-popover ref="popover4" placement="top-start" title=" url调用" width="400" trigger="click">url调用
        <pre>http://192.168.1.173/wp#/wp2?sns=1111-2222,3333-4444&title=222&t0=2018-1-1&t1=2018-1-10 </pre>
        <pre>
sns:sn列表,逗号隔开
title:组标题
t0:开始时间
t1:结束时间
        </pre>

      </el-popover>
      <el-popover ref="popover1" placement="top-start" title="sn 命名规则说明" width="400" trigger="click">sn 命名格式
        <pre>sn|描述(可选)|固定传感器类型(可选)|转换表达式(可选)</pre> 比如
        <pre>CN37-0100|科干所|pm10|100*x+10</pre> 表达式中 x 为参量 ，计算结果为映射值. 表达式示例
        <pre>CN37-0100|科干所|pm10|100*pm25+pm10</pre>

        <pre>
                       10*x+1
                       10*x+2*x*x-4
                       10*x/3
                       10
                       Math.log(x)
                       </pre> 传感器类型参见
        <a href="http://192.168.1.173/redmine/issues/4376">http://192.168.1.173/redmine/issues/4376</a>
      </el-popover>
      <el-popover ref="popover2" placement="top-start" title="sn 命名规则说明" width="400" trigger="click">
        命令式绘图说明
        <pre>绘图类型 参数1 参数2
                </pre> 绘图类型现在支持
        <pre>
      plot 命名sn1,命名sn2,命名sn3...
      scatter 命名sn1,命名sn2,命名sn3...  第一个为x轴
                </pre> 比如
        <pre>
      plot B800-A01D|描述|pm25|x
      plot B800-A01D||pm25|x,B800-A01A||pm10|x
      scatter B800-A01D||pm25|x,B800-A01A||pm10|x
      scatter B800-A01D||pm25|x,B800-A01D||pm10|x,B800-A01D||pm25|x
              </pre> 可多行同时执行 其余参见sn命名规则

      </el-popover>
      <div style="position:fixed;top:10px;right:0">
        <el-button v-popover:popover3>组命名规则</el-button>
        <el-button v-popover:popover1>sn 命名规则说明</el-button>
        <el-button v-popover:popover2>命令式绘图说明</el-button>
        <el-button v-popover:popover4>url调用</el-button>
        <el-button @click="saveCsv">导出</el-button>
        <el-switch on-text="命令绘图" off-text="传统绘图" v-model="showcmdplot" :width="100" off-color="#00ee00">
        </el-switch>
      </div>
      <div v-show="showcmdplot" class="panel panel-default" style="position:fixed;right:500px;top:10px;width:500px;z-index:10">
        <el-input type="textarea" :rows="2" placeholder="plot cmd" v-model="plotstr">
        </el-input>
        <el-button @click="runexectry">run</el-button>
      </div>
    </div>
    <div style="display:flex">
      <snsSelect :sns="sns" :groups=groups3 @change="changedsn" @navsnchange="navsnchange" ref="snselect" style="min-width:250px">
      </snsselect>
      <div style="flex:1">
        <div>
          <mydatepicker style="display:inline-block"></mydatepicker>
        </div>
        <div style="display:flex">
          <sensorTypeSelect v-model="sensortype">
          </sensortypeselect>           
          <div style="width:20px;"></div>
          <pres></pres>
        </div>
        <el-switch v-model="isAutoRefresh" on-text="自动刷新" off-text="关闭自动刷新" on-color="#13ce66" off-color="#ff4949" :width="130">
        </el-switch>
        <el-tag type="gray">10s 1次刷新最近10分钟的数据</el-tag>
        <el-tag v-show="!showExportPakcetBtn">缩放曲线间隔小于10分钟时可导出原始报文</el-tag>
        <el-button v-show="showExportPakcetBtn" @click="ExportPakcet">导出原始报文</el-button>
        <highstock ref="chart" :options="options" style="height:800px" v-show="bplotShow"></highstock>
        <highcharts ref="chart1" :options="options1" style="height:800px" v-show="bscatterShow"></highcharts>
      </div>
    </div>
    <right-menu :pop-items="popItems" :mouse="mousePosition" @ListItemClick="list_item_click">
    </right-menu>
  </div>
</template>

<script>
import Vue from 'vue'
import mydatepicker from "./datepicker"
import snsSelect from "./snsSelect"
import { mapActions, mapState, mapGetters } from 'vuex'
import VueHighcharts from 'vue-highcharts';
import Highcharts from 'highcharts/highstock';
import hcsv from "../exportcsv"
import sensorTypeSelect from './sensorTypeSelect'
let FileSaver = require("../FileSaver")
import pres from './pres'
import * as api from '../api'
import exporting from 'highcharts/modules/exporting';
function calcSum(inputstr) {
  return _.chain(inputstr).map(x => x.charCodeAt(0)).sum().value();
}
exporting(Highcharts)
hcsv(Highcharts)
Vue.use(VueHighcharts, { Highcharts });
//const colors= ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 
//    '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'] 
const colors = ['#FF0000', '#0000FF', '#00FF00', '#eeee00', '#deab8a', '#817936', '#008B8B', '#f47920', '#5f3c23', '#2e3a1f',

  '#426ab3', '#b2d235', '#181d4b', '#228fbd', '#2E8B57', '#7FFF00', '#ffd400', '#f0dc70',

  '#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#9F79EE', '#e4d354', '#00008B', '#8d4653', '#91e8e1',

  '#DC143C', '#00FF7F', '#32CD32', '#006400', '#CD5C5C', '#800000', '#808080', '#000000', '#53868B',

  '#FF3E96', '#FF34B3', '#CDCDC1', '#696969', '#836FFF', '#668B8B', '#f26522', '#473C8B', '#EE7942', '#f7acbc']
Highcharts.setOptions({
  global: {
    useUTC: false
  },
  lang: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    thousandsSep: ''
  }
});
let scatterOptions = {
  chart: {
    type: 'scatter',
    zoomType: 'xy'
  },
  title: {
    text: ''
  },
  subtitle: {
    text: ''
  },
  xAxis: {
    title: {
      enabled: true,
      text: ''
    },
    min: 0,
    startOnTick: true,
    endOnTick: true,
    showLastLabel: true
  },
  yAxis: {
    title: {

    },
    min: 0
  },
  legend: {
    layout: 'vertical',
    align: 'left',
    verticalAlign: 'top',
    x: 100,
    y: 70,
    floating: true,
    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
    borderWidth: 1
  },
  plotOptions: {
    scatter: {
      marker: {
        radius: 5,
        states: {
          hover: {
            enabled: true,
            lineColor: 'rgb(100,100,100)'
          }
        }
      },
      states: {
        hover: {
          marker: {
            enabled: false
          }
        }
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br>',
        pointFormat: '{point.x} , {point.y} '
      }
    }
  },
  series: []
}
let thiscomponent = null
let options = {
  chart: {
    type: 'spline',
    zoomType: 'xy',

  },
  animation: false,
  navigator: {
    adaptToUpdatedData: false,
    series: {
      data: []
    },
    // maskInside:false,
    xAxis: {
      labels: {
        //format: '{value:%Y-%m-%d}',

        dateTimeLabelFormats: { year: '%Y-%b-%e %H:%M:%S', month: '%Y-%b-%e %H:%M:%S', day: '%Y-%b-%e %H:%M:%S', hour: '%Y-%b-%e %H:%M:%S', minute: '%Y-%b-%e %H:%M:%S', second: '%Y-%b-%e %H:%M:%S', millisecond: '' }
        //enabled: false                           
      }
    },
    yAxis: {
      min: -10,
      max: 1000,
      floor: 0,
      visible: true,
      maxPadding: 0.2,
    }
  },
  scrollbar: {
    liveRedraw: false
  },
  title: {
    text: ''
  },

  rangeSelector: {
    buttons: [{
      count: 1,
      type: 'minute',
      text: '1M'
    }, {
      count: 5,
      type: 'minute',
      text: '5M'
    }, {
      type: 'hour',
      count: 1,
      text: '1h'
    }, {
      type: 'day',
      count: 1,
      text: '1d'
    }, {
      type: 'all',
      text: 'All'
    }],
    inputEnabled: false, // it supports only days
    selected: 5 // all
  },
  xAxis: {
    ordinal: false,
    events: {
      // afterSetExtremes : afterSetExtremes
    },
    type: 'datetime',
    dateTimeLabelFormats: { year: '%b-%e %H:%M', month: '%b-%e %H:%M', day: '%b-%e %H:%M', second: '%H:%M', millisecond: '%H:%M' },
    minRange: 60 * 1000
  },
  tooltip: {
    dateTimeLabelFormats: { year: '%Y-%b-%e %H:%M:%S', month: '%Y-%b-%e %H:%M:%S', day: '%Y-%b-%e %H:%M:%S', hour: '%Y-%b-%e %H:%M:%S', minute: '%Y-%b-%e %H:%M:%S', second: '%Y-%b-%e %H:%M:%S', millisecond: '' }
  },
  yAxis: {
    floor: -10,
    visible: true,
    // min: 0,
    maxPadding: 0.4,
    minPadding: 0.05,
    events: {
      // afterSetExtremes : afterSetExtremes
    },
  },
  plotOptions: {
    series: {
      events: {
        click: function(event) {
          thiscomponent.popMenu(event);

          if (event.altKey) {
            thiscomponent.$refs.snselect.toggle(this.name.split(":")[0])
          } else {

            this.setVisible();
          }
        }
      }
    }
  },
  series: [],
  legend: {
    enabled: true
  },
          exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        Highcharts.getOptions().exporting.buttons.contextButton.menuItems[2],
                        Highcharts.getOptions().exporting.buttons.contextButton.menuItems[4],
                        Highcharts.getOptions().exporting.buttons.contextButton.menuItems[6],
                        Highcharts.getOptions().exporting.buttons.contextButton.menuItems[7]
                    ]
                }
            }
        }
}

export default {

  data() {
    return {
      options: _.cloneDeep(options),
      options1: _.cloneDeep(options),
      bplotShow: false,
      bscatterShow: false,
      sensortype: ["pm25"],
      xrange: [],
      valueMax: 0,
      isAutoRefresh: false,
      plotstr: "plot B800-A01D||pm25|x,B800-A01A||pm10|x",
      showcmdplot: false,
      popItems: [
        {
          class: 'fa fa-wrench',
          txt: '处理异常'
        },
      ],
      mousePosition: [],
    }
  },
  created() {
    this.$store.dispatch("updateSns")
    thiscomponent = this
  },

  components: {
    mydatepicker,
    snsSelect,
    sensorTypeSelect,
    pres,

  },
  computed: {
    ...mapState(["sns", "historyData", "checkedSNSR", "groups", "navsn", "historyTime", "pres", "selectMode"]),
    ...mapGetters(["historyDataOrdered","groups2"]),
    showExportPakcetBtn(){
      if(this.xrange.length==2){
        let min=this.xrange[0]
        let max=this.xrange[1]
        let brng= (max-min)<600*1000
        return brng
      }
      return false ;
    },
    groups3(){
      console.log("1111111111111111111111111111")
      console.log(this.$route.meta)
     if(this.$route.meta.tmp){
       
       return this.groups2
     }else{
       return this.groups
     }
    }

  },
  mounted() {
    console.log(this.$route)
    let self = this
    if (localStorage.getItem("plotstr")) {
      this.plotstr = localStorage.getItem("plotstr")
    }
    this.interval = setInterval(function() {
      if (self.isAutoRefresh) {
        self.$store.dispatch("updateHistoryTime", [moment().subtract(10, "minute"), moment()])

      }
    }, 10000)
    this.options.xAxis.events.afterSetExtremes = function(e) {
      this.xrange=[e.min, e.max]
    }.bind(this)
    this.$store.dispatch("refreshGroups")

  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  methods: {
    ExportPakcet(){
      var starttime=moment(this.xrange[0]).format("YYYY-MM-DD HH:mm:ss")
      var endtime=moment(this.xrange[1]).format("YYYY-MM-DD HH:mm:ss")
      var sns=_.map(this.checkedSNSR,x=>x.split("|")[0]).filter(x=>x.split(":").length==1)
      console.log(starttime,endtime,sns.join(","))
      var url=api.getUrlConfig().apiurl;
      var params={
        sn:sns.join(","),
        start_time:starttime,
        end_time:endtime
      }
      var paramsstr=_.map(params,(v,k)=>[k,v].join("=")).join("&")
      window.open(url+"/WPExportUdpCsv?"+paramsstr)
    },
    popMenu(e) {
      let self = this;
      console.log(e)
      e.preventDefault();
      if (e.button === 2) {
        let x = e.layerX;
        let y = e.layerY;
        self.mousePosition = [x, y];
      }
      else if (e.button === 0) {
        self.mousePosition = ['close'];
      }
    },
    list_item_click(it) {
      switch (it) {
        case 0:
          alert('第一项被点击');
          break;
        case 1:
          alert('第二项被点击');
          break;
      }
    },
    alignTime(d0, d1) {//d0:[[ts,v],[ts,v]] d1 [[ts,v],[ts,v]   return [[ts0,v0,v1]]
      let retdatas = []
      let kvd1 = {}
      d1.forEach(x => kvd1[x[0]] = x[1])
      for (let d of d0) {
        let ts = d[0]
        retdatas.push([d[1], kvd1[ts]])
      }
      return retdatas
    },
    plot(sntypes, plotoptions) {

      this.$store.dispatch("updateHistoryData1", sntypes).then(datas => {
        let series = datas.map((data, index) => ({ name: sntypes[index].displayname, data: data.datas }))
        plotoptions.series = this.options.series.concat(series)
        //  console.log(this.options.series)
      })
    },
    scatter(sntypes, plotoptions) {
      this.$store.dispatch("updateHistoryData1", sntypes).then(datas => {

        // this.options.chart.type="scatter"
        let [basex, ...y] = datas
        let series = y.map((data, index) => ({ name: sntypes[0].displayname + "--" + sntypes[1 + index].displayname, data: this.alignTime(basex.datas, y[index].datas), type: "scatter" }))

        //this.options=_.clone(scatterOptions)
        plotoptions.series = plotoptions.series.concat(series)
        // console.log(series)
        // console.log(this.options)
      })
    },
    calcstd(sntypes) {
      this.$store.dispatch("updateHistoryData1", sntypes).then(datas => {

      })
    },
    runexec() {
      let plotoptions = _.clone(options)
      this.options = plotoptions
      let options1 = _.cloneDeep(scatterOptions)
      this.options1 = options1
      this.bscatterShow = false;
      this.bplotShow = false;
      let fnmap = { plot: this.plot, scatter: this.scatter }
      console.log(fnmap)
      //let str = "B800-A01D||pm25|x,B800-A01A||pm10|x";
      let str = this.plotstr
      this.plotstr.split("\n").forEach(line => {
        line = line.trim()
        if (line.length == 0) {
          return
        }
        let spaceindex = line.indexOf(" ")
        let cmd = line.substr(0, spaceindex)
        let cmdstr = line.substr(spaceindex)
        console.log(cmdstr)
        let sntypes = cmdstr.split(",").map(x => {
          let bundle = { sn: "", type: "", mapFn: x => x, originalStr: x, displayname: x }
          let s = x.split("|").map(x => x.trim())
          console.log(s)
          console.log(s.length)
          bundle.sn = s[0]
          if (s.length > 2) {
            bundle.type = s[2]
          }
          if (s.length > 3) {
            bundle.mapFn = eval("x=>" + s[3])
          }
          return bundle
        })
        console.log(sntypes)
        if (cmd == "scatter") {
          this.bscatterShow = true
          fnmap[cmd](sntypes, options1)
        } else {
          this.bplotShow = true
          fnmap[cmd](sntypes, plotoptions)
        }
      })


      //console.log(sntypes)
      // this.scatter(sntypes)
    },
    runexectry() {
      try {
        this.runexec()
      } catch (e) {
        alert(e.message)
      }
    },

    saveCsv() {
      // step1 get uniq and sorted ts
      // step2 for every need exportdata , allign to ts
      let ts = []
      let filertedDatas = {}
      for (let h of this.historyDataOrdered) {
        if (_.indexOf(this.checkedSNSR, h.sn) == -1) {

          continue
        }
        if (this.sensortype.indexOf(h.type) == -1) {
          continue
        }
        ts = ts.concat(_.map(h.datas, x => x[0])) // for get uniq ts
        if (!filertedDatas[h.sn]) {
          filertedDatas[h.sn] = {}
        }
        // change 2 element arry [ts,value] to dict
        let datas = {}
        _.forEach(h.datas, x => { datas[x[0]] = x[1] })
        filertedDatas[h.sn][h.type] = datas

        //console.log(h)
      }
      console.log(filertedDatas)
      let tssorted = _.sortBy(ts)
      let tssorteduniq = _.sortedUniq(tssorted)

      let csvRowData = []

      for (let t of tssorteduniq) {
        let d = { datas: {} } //{ts,datas:{sn1:{pm25,pm10},sn2:{pm25,pm10}}}
        d["ts"] = parseInt(t)
        for (let sn of this.checkedSNSR) {
          d.datas[sn] = {}
          for (let tp of this.sensortype) {
            if (tp) {
              if (filertedDatas[sn] && filertedDatas[sn][tp]) {
                d.datas[sn][tp] = filertedDatas[sn][tp][t]
              } else {
                d.datas[sn][tp] = null
              }
            }

          }
        }
        csvRowData.push(d)
      }

      let headstrs = ["time"]

      let bodystrs = []
      for (let sn of this.checkedSNSR) {
        headstrs.push(sn)
        for (let tp of this.sensortype) {
          if (tp == 'pm25' || tp == 'pm10' || tp =='no_f'){
            tp = tp+'(ug/m3)'
          }
          if(tp == 'speed'){
            tp = tp + '(km/h)'
          }
          
          headstrs.push(tp)
        }
      }
      console.log(headstrs)

      for (let row of csvRowData) {
        let rowstrs = [moment(row.ts).format("YYYY-MM-DD HH:mm:ss")]
        let sns = _.keys(row.datas)
        sns.forEach(sn => {
          let rsn = sn
          if (rsn.substr(0, 2) == "MN") {
            let si = parseInt(rsn.substr(2, 1), 16) % 5
            rsn = rsn.split("|")[0].split(":")[1] + ":" + si
          }
          rowstrs.push(rsn)
          _.forEach(row.datas[sn], (v, tp) => {
            rowstrs.push(v)
          })
        })

        //console.log(rowstrs)
        bodystrs.push(rowstrs.join(","))
      }
      let csvFlat = headstrs.join(",") + "\n" + bodystrs.join("\n")
      console.log(csvFlat)
      var blob = new Blob([csvFlat], { type: "text/plain;charset=utf-8" });
      FileSaver.saveAs(blob, "wpdata.csv");

    },
    editGroup(g) {

    },
    changedsn(sns) {
      this.$store.dispatch("updateCheckedSNSR", sns)
      this.drawPlot()
    },
    drawPlot: _.debounce(function() {
      if (this.showcmdplot) return
      this.bplotShow = true
      // console.log(this.$refs.chart.chart)
      /*Vue.nextTick( ()=> {
        if(_.size(this.xrange)==2){
                _.delay(()=>{
                   this.$refs.chart.chart.xAxis[0].setExtremes(this.xrange[0],this.xrange[1],true,false)
                },0)
               
           }
        }
      )*/
      let sncolor = {};
      let types = this.sensortype
      var i = 0
      for (let h of this.historyData) {
        let navsn = this.navsn

        // console.log(h.type)
        //console.log(types)

        if (h.sn != navsn) {
          continue
        }
        if (_.indexOf(types, h.type) != -1) {
          this.options.navigator.series.data = h.datas
        }

      }

      if (_.size(this.xrange) > 0 && !this.isAutoRefresh) {
        this.options.xAxis.min = this.xrange[0]
        this.options.xAxis.max = this.xrange[1]

        console.log(_.size(this.xrange))
      }

      this.options.series = []
      let max = 0
  

      for (let h of this.historyDataOrdered) {
        //let color=
        //console.log(this.checkedSNS)



        if (_.indexOf(this.checkedSNSR, h.sn) == -1) {

          continue
        }

        let markers = ["circle", "square", "diamond", "triangle", "triangle-down"]
        if (_.indexOf(types, h.type) != -1) {
          max = Math.max(max, h.max)
          let lineWidth = 2
          let makersymbol = markers[0]
          let name = h.sn
          let markerradius = 3
          if (h.sn.substr(0, 2) == "MN") {
            let si = parseInt(h.sn.substr(2, 1), 16) % 5
            makersymbol = markers[si]
            lineWidth = 1
            markerradius = 2
            name = h.sn.split(":")[1] + ":" + (si)
          }



          let dashStyle = "Solid"
          if (h.type == "pm10" && this.sensortype.length > 1) {
            dashStyle = "ShortDash"
          }
          if (h.type == "wendu" || h.type == "inner_wendu") {
            this.options.yAxis.min = -5;
          } else {
            this.options.yAxis.min = 0;
          }
          let color = colors[i % colors.length]
          if(    this.checkedSNSR.length>1){
              if (sncolor[h.sn]) {
               // color = sncolor[h.sn]
              } else {
               // sncolor[h.sn] = color
              }
          }

          i = i + 1;

          let valueDecimals=2
          if(window.sensortypes){
            let v=_.find(window.sensortypes,{name:h.type})
            if(v){
              valueDecimals=v.float_num
            }
          }

          this.options.series.push({
            data: h.datas,
            color,
            lineWidth,
            name: name + ":" + h.type,
            marker: { radius: markerradius, symbol: makersymbol, enabled: true },
            animation: false,
            dashStyle,
            tooltip: {
              valueDecimals
            } 
          })
        }

      }
      this.valueMax = max
      if (0&&!this.isAutoRefresh) {
        if (this.sensortype.indexOf("pm25") > -1 || this.sensortype.indexOf("pm10") > -1) {
          if (max < 150) {
            this.options.yAxis.max = 50 + max * 1.3
          } else {
            this.options.yAxis.max = max * 1.3
          }
        } else {
          this.options.yAxis.max = max * 1.3
        }
      }



    }, 100),
    navsnchange() {
      this.drawPlot()
    },
    resety() {
      // console.log(this.$refs.chart)
      this.yrange = [-10, this.valueMax * 1.1 + 30]
      console.log(this.valueMax)
      this.$refs.chart.chart.yAxis[0].update({ min: this.yrange[0], max: this.yrange[1] })
    },
    savePlotStr: _.debounce(function() {
      localStorage.setItem("plotstr", this.plotstr)
    }, 500)
  },
  watch: {
    plotstr() {
      this.savePlotStr()
    },
    historyDataOrdered: function() {
      this.drawPlot()
    },
    sensortype() {
      this.drawPlot()
      this.$store.dispatch("updatesensortype", this.sensortype)
    },
    navsn() {
      this.$store.dispatch("updateHistoryData")
      this.drawPlot()

    },
    pres() {
      if (this.showcmdplot) {
        this.runexec()
      }
    },
    historyTime() {
      //console.log("timechange")
      this.xrange = []
      this.options.xAxis.min = null
      this.options.xAxis.max = null
      this.drawPlot()
      if (this.showcmdplot) {
        this.runexec()
      }
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>