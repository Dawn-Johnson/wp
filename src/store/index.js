import Vue from 'vue'
import Vuex from 'vuex'
import * as api from '../api'
import * as util from '../util/util'

Vue.use(Vuex)
export default new Vuex.Store({
    state: {
        historyData: [],
        checkedSNS: [""],
        checkedSNSR: [""],
        historyTime: [moment().subtract(1, "hours"), moment()],
        sns: [],
        pres: "30s",
        groups: [],
        navsn: "",
        singleMode: true,
        singleMode2:"single",
        sensortype: ['pm25'],
        activeGroupName: "group:0",
        searchsn: "",
        snIptable: {},
        subdevMode: false,
        selectMode:false,
        editmode:false,
        isSn:true,
        sntotags:{},
        tag_list:[],
        mousesn:null,
        userCtx:{},
        send_packet_buttons:[]
    },
    mutations: {
        update_send_packet_buttons(state,data){
            state.send_packet_buttons=data
        },
        updateUserCtx(state,userCtx){
            state.userCtx=userCtx
        },
        updateEditmode(state,s){
            state.editmode=s
        },
        updatesubdevMode(state, s) {
            state.subdevMode = s
        },
        updateSearchsn(state, searchsn) {
            state.searchsn = searchsn
        },
        updateSearchissn(state, sn){
        	state.isSn=sn
        },
        updateActiveGroupName(state, m) {
            state.activeGroupName = m
        },
        updateSingleMode(state, mode) {
            state.singleMode = mode
        },
        updateSingleMode2(state, mode) {
            state.singleMode2 = mode
        },
        updateHistoryData(state, { sn, type, datas, max, dev_ip, subno }) {
            let fi = _.findIndex(state.historyData, x => x.sn == sn && x.type == type)
            if (fi > -1) {
                state.historyData[fi] = { sn, type, datas, max, dev_ip, subno }
            } else {
                state.historyData.push({ sn, type, datas, max, dev_ip, subno })
            }

        },
        updateHistoryTime(state, [start, end]) {

            state.historyTime = [start, end]
        },
        clearHistoryData(state) {
            state.historyData = []
        },
        updatePres(state, value) {
            state.pres = value
        },
        updateGroups(state, value) {
            state.groups = value
        },
        updateSns(state, sns) {
            state.sns = sns
        },
        updateCheckedSNS(state, sns) {

            state.checkedSNS = sns
        },
        updateCheckedSNSR(state, sns) {

            state.checkedSNSR = sns
        },
        updateNavsn(state, navsn) {
            state.navsn = navsn
        },
        updatesensortype(state, sensortype) {
            state.sensortype = sensortype
        },
        UpdateSNIptable(state, snip) {
            state.snIptable = snip
        },
        UpdateSNtotags(state,sntags){
            for(let sn in sntags){
                Vue.set(state.sntotags,sn,sntags[sn])
            }
         
        },
        updatetag_list(state,tag_list){
            state.tag_list=tag_list
        },
        updateMousesn(state,sn){
            state.mousesn=sn
        }
    },
    getters: {
        historyDataOrdered(state) {
            console.log(state.historyData)
            return _.sortBy(state.historyData, 'sn')
        },
        groups2(state){
            let g=[]

            let tmpgroup=[];
            if(window.tmpparams.tmpsns[0].length>0){
                let{tmpsnstitle,tmpsns}=window.tmpparams
                tmpgroup=[{"title":tmpsnstitle,"type":"group","children":tmpsns,tmp:true}]
            }
           
            g=[...tmpgroup]
            return g
        },

    },
    actions: {
        Updatetag_list(context){
            return api.get_wp_tag_list().then(tag_list=>{
                context.commit("updatetag_list", tag_list)
            })
        },
        UpdateSNtotags(context,sns){
            return api.get_sn_tag(sns).then(sntotags=>{
                context.commit("UpdateSNtotags", sntotags)
            })
        },
        GetSNIptable(context) {
            return api.GetSNIptable().then(r => {
                context.commit("UpdateSNIptable", r)
            })
        },
        updatesensortype(context, sensortype) {
            context.commit("updatesensortype", sensortype)
            context.dispatch("updateHistoryData")

        },
        updateSns(context, sns) {
            context.dispatch("GetSNIptable")
            api.GetSns().then(({ sns }) => {
                console.log(sns)
                context.commit("updateSns", sns)
            })
            
        },
        updatePres(context, value) {
            context.commit("updatePres", value)
            context.commit("clearHistoryData")
            context.dispatch("updateHistoryData")
        },
        updateCheckedSNSR(context, sns) {
            context.commit("updateCheckedSNSR", sns)
            context.dispatch("updateHistoryData")
        },
        updateHistoryTime(context, [start, end]) {
            let [s, e] = context.state.historyTime
            context.commit("updateHistoryTime", [start, end])
            if (s.unix() == start.unix() && e.unix() == end.unix()) {
                return
            }
            if ((end - start) > 1000 * 3600 * 6) {
                context.commit("updatePres", "1h")
            }
            context.commit("clearHistoryData")
            context.dispatch("updateHistoryData")
        },
        refreshGroups(context) {
            api.groupdb.getGroups().then(d => {
                console.log(d)
                context.commit("updateGroups", d)
            }).catch(x=>{
                context.commit("updateGroups", [])
            })
        },
        delGroup(context, group) {
            api.groupdb.delGroup(group).then(() => {
                context.dispatch("refreshGroups")
            })
        },
        updateHistoryData1(context,sntypes){
            let combinedPromise=[]
            for (let sntype of sntypes) {
                let rsn=sntype.sn
                let sn=rsn
                let mapFn=sntype.mapFn
                let realtype=sntype.type
                let bf = _.find(context.state.historyData, { sn, type:realtype })
             //   console.log(mapFn)
                if(bf){
                    combinedPromise.push(new Promise((r)=>r(bf))) 
                }else{
                    console.log("here")
                    
                    //let sntype0=sntype
                    //api.GetData(rsn, realtype, context.state.historyTime[0], context.state.historyTime[1], context.state.pres).then(x=>console.log(sntype))
                    var tb = 'sensorudp_from_dev_decoded'
                    if (sn.substr(0, 2) == "CN"){
                      tb = 'sensor_data_gf'
                    }
                    let p=api.GetData(rsn, realtype, context.state.historyTime[0], context.state.historyTime[1], context.state.pres, tb).then(datas => {
                            for (let d of datas) {
                                d.sn = sn
                                if (context.state.pres == "1h") {
                                    for (let i in d.datas) {
                                       // d.datas[i][0] += 1000 * 3600
                                    }
                                }
                                
                                for (let i in d.datas) {
                                    d.datas[i][1] = mapFn(d.datas[i][1])
                                }
                                
                                d.max = mapFn(d.max)


                                context.commit("updateHistoryData", d)
                                return d
                            }
                        })
                        combinedPromise.push(p)
                    
                }
            }
            return Promise.all(combinedPromise)
        },

        updateHistoryData: _.debounce(function (context) {
            let tsns = _.union(context.state.checkedSNSR, [context.state.navsn])
            //console.log(tsns)
            for (let sn of tsns) {
                let types = context.state.sensortype
                for (let type of types) {
                    let snparams = sn.split("|")
                    let rsn = snparams[0]
                    let realtype = type
                    if (snparams.length > 2) {
                        realtype = snparams[2]
                    }
                    let mapStr = "x"
                    let sensormapfn
                    let sensors
                    let mapFn=x=>x
                    let uniq_sensors
                    if (snparams.length > 3) {
                        mapStr = snparams[3]
                        let regp=/[a-zA-Z][\w]*/ig
                        sensors=mapStr.match(regp)
                        uniq_sensors=_.uniq(sensors)
                        if(uniq_sensors.length==1 && uniq_sensors[0]=="x"){
                            mapFn = eval("x=>" + mapStr)
                        }else if (uniq_sensors.length>0){
                            let sensorpstr=uniq_sensors.join(",")
                            sensormapfn=eval(`(${sensorpstr})=> ${mapStr}`)
                        }
                    }
                     
                    let bf = _.find(context.state.historyData, { sn, type:realtype })
                    console.log("f")
                    if (!bf) {
                        if (sn.startsWith("KOR") ) {
                            let t1 = moment(context.state.historyTime[0]).unix()
                            let t2 = moment(context.state.historyTime[1]).unix()
                            if(sensormapfn){
                                let urls=_.map(uniq_sensors,s=>{
                                    if(s=="pm25_t45"){
                                        s="pm25"
                                    }else if(s=="pm10_t45"){
                                        s="pm10"
                                    }
                                    // var url = `http://192.168.1.172/api/v1/wp/getDataFromInfluxdb?start=${t1}&end=${t2}&sn=${rsn}&pres=1h&type=${s}&tb=sensor_data_gf`
                                   // return `http://api.novaecs.com/?fun=getHistotyData&key=aidhe38173yfh&devId=${rsn}&accuracy=5M&tp=${s}&from=${t1}&to=${t2}&&timefmt=ts`
                                   return `http://192.168.1.172/api/v1/wp/getDataFromInfluxdb?start=${t1}&end=${t2}&sn=${rsn}&pres=1h&type=${s}&tb=sensor_data_gf`
                                })
                                let rdataspromise=_.map(urls,function(url,index){
                                   return Vue.http.get(url).then(x => {
                                        let data = x.data                                      
                                        let ds1 = _.sortBy(data.devs.data, ['t'])
                                        let max = Math.max(..._.map(ds1, d => parseInt(d.v)))
        
                                        let datas = _.map(ds1, d => [parseInt(d.t) * 1000, parseInt(d.v)])
                                        let rs = {
                                            type: uniq_sensors[index],
                                            sn: sn,
                                            datas: datas,
                                            max
                                        }
                                        return rs
                                    })
                                })
                                Promise.all(rdataspromise).then(function(rdatas){
                                    let dst={}
                                    let ds0=rdatas[0];
                                    dst.sn=ds0.sn
                                    dst.max=ds0.max
                                    dst.type=realtype
                                    dst.datas=[]
                                    for(let i in ds0.datas){
                                        let vs=[]
                                        let t=ds0.datas[i][0]
                                        for(let r of rdatas){
                                            for(let rd0 of r.datas){
                                                if(rd0[0]==t){
                                                    vs.push(rd0[1])
                                                }
                                            }
                                            
                                        }
                                        dst.datas.push([ds0.datas[i][0],sensormapfn(...vs)])
                                    }
                                    console.log(dst)
                                    context.commit("updateHistoryData", dst)
                                })
                            }else{
                                let thetp=realtype
                                if(realtype=="pm25_t45"){
                                    thetp="pm25"
                                }else if(realtype=="pm10_t45"){
                                    thetp="pm10"
                                }
                                        let url = `http://192.168.1.172/api/v1/wp/getDataFromInfluxdb?start=${t1}&end=${t2}&sn=${rsn}&pres=1h&type=${thetp}&tb=sensor_data_gf`
                                        // let url = `http://api.novaecs.com/?fun=getHistotyData&key=aidhe38173yfh&devId=${rsn}&accuracy=5M&tp=${thetp}&from=${t1}&to=${t2}&&timefmt=ts`
                                        Vue.http.get(url).then(x => {
                                            let data = x.data
            
                                            let ds1 = _.sortBy(data.devs.data, ['t'])
                                            let max = Math.max(..._.map(ds1, d => parseInt(d.v)))
            
                                            let datas = _.map(ds1, d => [parseInt(d.t) * 1000, parseInt(d.v)])
                                            let rs = {
                                                type: realtype,
                                                sn: sn,
                                                datas: datas,
                                                max
                                            }
                                            for (let i in rs.datas) {
                                                rs.datas[i][1] = mapFn(rs.datas[i][1])
                                            }
                                            rs.max = mapFn(rs.max)
            
                                            context.commit("updateHistoryData", rs)
                                        })
                                    }

                        } else {
                          var pres = context.state.pres
                          var tb='sensorudp_from_dev_decoded'
                            if (sn.startsWith("CN")){
                              tb = 'sensor_data_gf'
                              pres = '1h'
                            }
                            if(sensormapfn){
                               
                                let rdataspromise=_.map(uniq_sensors,function(s){
                                   return api.GetData(rsn, s, context.state.historyTime[0], context.state.historyTime[1], pres, tb).then(datas=>{
                                       let d=datas[0]
                                       d.sn = sn
                                       if (context.state.pres == "1h") {
                                           for (let i in d.datas) {
                                               if(tb!=="sensor_data_gf"){
                                              //  d.datas[i][0] += 1000 * 3600
                                               }
                                               
                                           }
                                       }
                                       return d
                                   })
                                })
                                Promise.all(rdataspromise).then(function(rdatas){

                                    let dst={}
                                    let ds0=rdatas[0];
                                    dst.sn=ds0.sn
                                    dst.max=ds0.max
                                    dst.type=realtype
                                    dst.datas=[]
                                    for(let i in ds0.datas){
                                        let vs=[]
                                        let t=ds0.datas[i][0]
                                        for(let r of rdatas){
                                            for(let rd0 of r.datas){
                                                if(rd0[0]==t){
                                                    vs.push(rd0[1])
                                                }
                                            }
                                            
                                        }
                                        dst.datas.push([ds0.datas[i][0],sensormapfn(...vs)])
                                    }

                                    context.commit("updateHistoryData", dst)

                                })}else{
                                    api.GetData(rsn, realtype, context.state.historyTime[0], context.state.historyTime[1], pres, tb).then(datas => {
                                        for (let d of datas) {
                                            d.sn = sn
                                            if (context.state.pres == "1h") {
                                                for (let i in d.datas) {
                                                if(tb!=="sensor_data_gf"){
                                                    //d.datas[i][0] += 1000 * 3600
                                                    }
                                                }
                                            }
                                            for (let i in d.datas) {
                                                d.datas[i][1] = mapFn(d.datas[i][1])
                                                d.datas[i][1]=d.datas[i][1]//util.floatTo1Point()
                                            }
                                            d.max = mapFn(d.max)
        
        
                                            context.commit("updateHistoryData", d)
                                        }
                                    })
                                }


                        }

                    }
                }


            }
        }, 10),

    }
})