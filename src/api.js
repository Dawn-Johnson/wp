import Vuex from 'vuex'
import Vue from 'vue'
import * as util from './util'
var _ = require('lodash');
var vueResource = require("vue-resource");

let urlconfig = {
    "tsdb": "http://192.168.1.172:4242",
    "couchdb": "http://192.168.1.172:5980",
    "snpyurl": "http://192.168.1.172:5004",
    "requirAuth":false,
    "apiurl":"http://192.168.1.172/api/v1/wp",
    "dbtype":"influxdb"
}
Vue.use(vueResource);
//const tsdburl = "http://192.168.1.172:4242/api/query?"
//const url = "/db/opentsdb/api/query?"
function GetSNIptable() {
    return Vue.http.get(urlconfig.snpyurl + "/devipmap/v1/?mode=get").then(r => r.data)
}
function setUrlConfig(config) {
    urlconfig = config
}
function getUrlConfig() {
    return urlconfig 
}
function GetSnsOld() {
    if(urlconfig.dbtype=="influxdb"){
        return new Promise(r=>r([]))
    }
    let req = `${urlconfig.tsdb}/api/query?start=${moment().subtract(10, "minutes").unix()}&end=${moment().unix()}&m=avg:down_sampler:1m-avg:sensor.value{sn=*,type=*}`
    let sntags = {}
    return Vue.http.get(encodeURI(req)).then(r => _.map(r.data, x => { return x.tags.sn })).then(x => _.uniq(x)).then(x => _.filter(x, s => !_.startsWith(s, "MN"))).then((sns) => {
        // console.log(sns)
        return { sns }
    })
    /* return Vue.http.get(encodeURI(req)).then(r => _.map(r.data, x => x.tags)).then(r=>_.groupBy(r,r=>r.ower?r.ower:r.sn))
     .then(r=>{
         let sns=_.keys(r)
        return _.map(sns,sn=>{
             return {
                 sn:sn,
                 subsns:_.chain(r[sn]).map(ee=>ee.sn).uniq().value(),
                 types:_.chain(r[sn]).map(ee=>ee.type).uniq().value(),
             }
         })
     }).then(r=>console.log(r))*/
}
function getLastData(){
    return Vue.http.get(urlconfig.apiurl+"/getLatestData").then(r=>r.data)
}
function GetSns(){
    return getLastData().then(ds=>_.map(ds,d=>d.owner)).then(sns=>({sns}))
}
function isContains(str, substr) {
     return new RegExp(substr).test(str);
 }
function GetDataInfluxDB(sn,type,timebegin,timeend,pres="30s", tb="sensorudp_from_dev_decoded"){
	
/*
	let ps=[]
	let str
	if(isContains(type,'-')){
		str=type.split('-')
		str=_.map(str,x=>'calc:'+x)
		
	}else if(isContains(type,'+')){
		str=type.split('+')
		str=_.map(str,x=>'calc:'+x)
	}else{
		str=[type]
	}
	for(let i=0;i<str.length;i++){
		let req=`${urlconfig.apiurl}/getDataFromInfluxdb?start=${timebegin.unix()}&end=${timeend.unix()}&sn=${sn}&pres=${pres}&type=${str[i]}`
		ps.push(Vue.http.get(req))
		
	}
	Promise.all(ps).then(arr=>{
		if(isContains(type,'-')){
			
		}
		_.map(arr,)
	})*/
	let str=type.split(':')
	let str1
	if(str.length==1){
		 str1=type
	}else{
		str1='calc:'+encodeURIComponent(str[1])
	}

    let req=`${urlconfig.apiurl}/getDataFromInfluxdb?start=${timebegin.unix()}&end=${timeend.unix()}&sn=${sn}&pres=${pres}&type=${str1}&tb=${tb}`
    return Vue.http.get(req).then((res)=>{
        let dvalues=res.data[0].values;
        let ds=[]
        console.log(res.data)
        console.log(dvalues)
        let values = _.map(dvalues, y => y[1])
        let max = Math.max(...values)
        if (tb == 'sensor_data_gf'){
            let tdelay=8*3600
            if(/CN37/.test(sn)){
                if(type=="pm10" || type=="pm25"){
                    tdelay=8*3600
                }
                if(pres=="1h"){
                    tdelay=8*3600
                }
            }
            ds=dvalues.map(v=>[1000*(v[0]-tdelay),v[1]])
                return [{
                    sn,
                    type: type,
                    datas: ds,
                    max
                }]
                return ds
        }
        let tdelay=8*3600
        if(pres=="1h"){
            tdelay=7*3600
        }
         ds=dvalues.map(v=>[1000*(v[0]-tdelay),v[1]])
                return [{
                    sn,
                    type: type,
                    datas: ds,
                    max
                }]
                return ds
    })
    
    
    
    
    
    
    
    
}
function GetDataTsdb(sn, type, timebegin, timeend, pres = "30s", tb="sensorudp_from_dev_decoded") {

    let timespan = (timeend - timebegin) / (1000 * 3600.0)
    /* console.log(timespan)
     if(timespan<0.1){
         pres="1s"
     }
     if(timespan>0.5){
         pres="30s"
     }
      if(timespan>0.8){
         pres="40s"
      }
      if(timespan>1){
          pres=parseInt(timespan)*5+"m"
      }
     
 */
console.log(sn,type,timebegin,timeend,pres)
    //if(_.size(sn)<8)return 
    let avgtypes = [type]

    let subsns = sn.split(":")

    console.log(subsns)
    //console.log(subsns)
    let mergetype = "avg"
    if (_.indexOf(["chushi", "chuchen"], type) > -1) {
        mergetype = "sum"
    }
    let avgpromise = _.map(avgtypes, x => {
        let req = `${urlconfig.tsdb}/api/query?start=${timebegin.unix()}&end=${timeend.unix()}&m=${mergetype}:down_sampler:${pres}-${mergetype}:sensor.value{sn=${sn},type=${x}}`
        //if(sn.startsWith("MN"))
        if (_.size(subsns) == 2) {
            req = `${urlconfig.tsdb}/api/query?start=${timebegin.unix()}&end=${timeend.unix()}&m=${mergetype}:down_sampler:${pres}-${mergetype}:sensor.value{sn=${subsns[0]},type=${x},ower=${subsns[1]}}`
        }
        return Vue.http.get(encodeURI(req)).then(x => x.data).catch(r => [])
    })

    return Promise.all(_.flatten([avgpromise])).then(values => {
        //console.log("suc")
        //console.log(values)
        //console.log(_.flatten(values)) 
        // console.log(values)
        return _.flatten(values)
    })
        .then(x => {
            return _.map(x, e => {

                let ts = _.map(_.keys(e.dps), y => { return parseInt(y) * 1000 })
               // let values = _.map(_.values(e.dps), y => util.floatTo1Point(y))
               let values = _.map(_.values(e.dps), y => y)
                let max = Math.max(...values)
                // ts.push(timeend.unix()*1000)
                // values.push(NaN)
                let sn
                if (e.tags.ower && e.tags.sn.substr(0, 2) == "MN") {
                    sn = e.tags.sn + ":" + e.tags.ower
                } else {
                    sn = e.tags.sn
                }
                //console.log(ts)
                return {
                    sn,
                    dev_ip: e.tags.dev_ip,
                    subno: e.tags.subno,
                    type: e.tags.type,
                    max,
                    datas: _.zip(ts, values)
                }
            })
        })
}
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-authentication'));

//var db = new PouchDB(window.location.protocol+"//"+window.location.host+'/db/couchdb/group019');
/*db.signup("nova","123456",function (err, response) {
  if (err) {
    if (err.name === 'conflict') {
      // "batman" already exists, choose another username
      console.log("already esists")
    } else if (err.name === 'forbidden') {
      // invalid username
    } else {
      // HTTP error, cosmic rays, etc.
    }
  }
});*/
class class_groupdb {
    constructor() {
        this.username = null
        this.groups=[]
        this.events=[]
    }
    init() {
        var db = new PouchDB(`${urlconfig.couchdb}/group019`);
        this.db = db
    }

    getGroups() {
        /* return db.allDocs({
             include_docs: true,
             attachments: true
         }).then(function (result) {
     
             console.log(result)
             return _.map(result.rows, x => x.doc)
         })*/
        let selector = { type: 'group' }
        if (this.username) {
            selector["user"] = this.username
        } else {
            return new Promise(r=>r([]))
        }
        return this.db.find({
            selector,
            limit: 1000
        }).then(function (result) {
            // handle result
            return result.docs
           // return result.docs
            //console.log(result)
        })//.then(docs=>console.log(docs))
       // .then(docs=>_.forEach(docs,doc=>this.saveGroup(doc)))
    }

    addGroup(group) {
        group.type = "group"
        group._id = moment() + ""
        if (this.username) {
            group["user"] = this.username
        }
        return this.db.put(group).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    }
    saveGroup(group) {
        group.type = "group"
       // group.user="nova"
        return this.db.post(group).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    }
    delGroup(group) {
        return this.db.remove(group)
    }
    getEvents() {
        let selector = { type: 'event' }
        if (this.username) {
            selector["user"] = this.username
        } else {
            return
        }
        return this.db.find({
            selector,
            limit: 1000
        }).then(function (result) {
            // handle result
            return result.docs
            //console.log(result)
        }).catch(function (err) {
            console.log(err);
        });
    }
    addEvent(group) {
        group.type = "event"
        group._id = moment() + ""
        if (this.username) {
            group["user"] = this.username
        }
        return this.db.put(group).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    }
    saveEvent(group) {
        group.type = "event"
        return this.db.post(group).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    }
    delEvent(group) {
        return this.db.remove(group)
    }
    getSNInfo(sn) {
        let selector = { type: 'SNInfo' }
        if (this.username) {
            selector["user"] = this.username,
                selector["sn"] = sn
        } else {
            return
        }
        return this.db.find({
            selector,
            limit: 1000
        }).then(function (result) {
            // handle result
            return result.docs
            //console.log(result)
        }).catch(function (err) {
            console.log(err);
        });
    }
    addSNInfo(group) {
        group.type = "SNInfo"
        group._id = moment() + ""
        if (this.username) {
            group["user"] = this.username
        }
        return this.db.put(group).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    }
    saveSNInfo(group) {
        group.type = "SNInfo"
        return this.db.post(group).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
    }
    delSNInfo(group) {
        return this.db.remove(group)
    }
}

function getSensorTypes(){
    return Vue.http.get(urlconfig.apiurl+"/get_wp_col_info").then(x=>x.data)
}
function getPublicUserInfos(){
    return Vue.http.get(urlconfig.apiurl+"/get_wp_public_user_info").then(x=>x.data)
}


let groupdb = new class_groupdb();


function GetData(sn,type,timebegin,timeend,pres="30s", tb="sensorudp_from_dev_decoded"){
    let f=GetDataTsdb
    if(urlconfig.dbtype=="influxdb"){
      f=GetDataInfluxDB
    }
   return f(sn,type,timebegin,timeend,pres, tb)
}

function get_sn_tag(sns){
    return Vue.http.get(urlconfig.apiurl+`/get_wp_tag_sn?snstr=${sns.join(",")}`).then(x=>x.data)
}
function get_wp_tag_list(){
    return Vue.http.get(urlconfig.apiurl+`/get_wp_tag_list`).then(x=>x.data)
}
function set_wp_tag_sn(tag_list_item,sns){
    let name=window.userCtx.name
    return Vue.http.get(urlconfig.apiurl+`/set_wp_tag_sn?&tag_group=${tag_list_item.tag_group}&tag=${tag_list_item.id}&snstr=${sns.join(",")}&name=${name}`).then(x=>x.data)
}
function get_send_packet_buttons(){
    return Vue.http.get(urlconfig.apiurl+`/get_send_packet_buttons`).then(x=>x.data)
}
export {getLastData, groupdb, GetSns, GetData, GetSNIptable, setUrlConfig ,getUrlConfig,getSensorTypes,getPublicUserInfos,get_sn_tag,get_wp_tag_list,set_wp_tag_sn,get_send_packet_buttons}