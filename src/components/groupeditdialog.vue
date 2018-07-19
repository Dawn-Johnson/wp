<template>
    <el-dialog title="编辑" v-model="dialogVisible" size="tiny">
        <div class="alert alert-danger" v-show="$v.inputcontent.$invalid">格式出错</div>
        <el-form label-position="top">
            <el-form-item label="名称">
                <input type="text" v-model="value.title">
            </el-form-item>
    
            <el-form-item label="sn列表，每行一个">
                <textarea style="line-height:20px;" rows='10' cols='30' v-model="inputcontent"></textarea>
            </el-form-item>
            <el-form-item label="备注">
                <textarea style="line-height:20px;" rows='2' cols='30' v-model="value.comment"></textarea>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveGroup" v-show="!$v.inputcontent.$invalid" icon="">保存</el-button>
        </span>
       <!-- <el-form>
            <el-form-item label="默认批号">
                <input type="text" v-model="lotnum">
            </el-form-item>
            <el-button type="primary" @click="saveLotNum">没设置批号的设备，设置为默认批号</el-button>
        </el-form>-->
    </el-dialog>
</template>
<script>
import { minLength } from 'vuelidate/lib/validators'
import groupcontent from "./groupcontent"
import * as api from '../api'
export default {

    data() {
        return {
            dialogVisible: false,
            inputcontent: "",
            value: {},
            lotnum: "",
            mode: "edit"
        }
    },
    computed: {
        children() {
            return this.inputcontent.trim().split(/[\r\n]/)
        }
    },
    created() {

        this.trans()

    },
    watch: {
        value() {
            this.trans()
        }
    },
    methods: {
        trans() {
            if(this.mode == "edit"){
                let c = this.value.children
                if (!c) {
                    this.inputcontent = ""
                } else {
                    this.inputcontent = this.value.children.join("\n")
                }
            }
        },
        show() {

            this.dialogVisible = true
        },
        saveLotNum() {


        },

        saveGroup() {
            this.dialogVisible = false
            this.value.children = this.children
            let self = this
            if (this.mode == "edit") {
                api.groupdb.saveGroup(this.value).then(function () {
                    self.$store.dispatch("refreshGroups")
                })
            } else if (this.mode = "add") {
                api.groupdb.addGroup(this.value).then(function () {
                    self.$store.dispatch("refreshGroups")
                })
            }

        },

    },
    validations: {
        inputcontent: {

        }
    },
    components: {
        groupcontent
    }
}
</script>