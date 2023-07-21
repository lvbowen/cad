<template>
  <div class="e-task-list">
    <div class="flex-end btns flex-center-align">
      <div class="task-title">新增生产任务单</div>
      <!--      <a-button @click="showDialog('确定要暂存生成任务单',saveData)">暂存</a-button>-->
      <a-button type="primary" @click="showDialog('确定要提交生成任务单',submitData)" :disabled="!isCreateProductPermission">提交</a-button>
    </div>
    <data-form
      class="e-task-form"
      ref="dataForm"
      projectId=""
      v-model="formData"></data-form>
  </div>
</template>

<script lang="ts">
import {Component} from 'vue-property-decorator';
import DataForm from "../WorkingOutline/ProductionTaskList/components/DataForm/index";
import ProjectList from "../ProjectList/index";
import Utils from '../../../utils';
import { EDMPProject } from "../../../type";
import {createProject} from "../../../service/CoordinateDesign/WorkingOutline/ProductionTaskList";
import {listApi} from "@cloudpivot/api";
import OAuthApi from "@/apis/oauth";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {loadSheetData, sheetConfig, SheetData} from "../../../service/CoordinateDesign/common";
import moment from "moment";
@Component({
  name: 'ETaskList',
  components: {
    DataForm,
    AButton: Button
  }
})
export default class ETaskList extends ProjectList {
  projectParams:EDMPProject = {
    accessToken: '',
    projectId: '',
    projectUNID: '',
    projectName: '',
    projectlocation: '',
    constructionPhase: '',
    serviceType: '',
    projectCategory: '',
    // countryOfProject: '',
    // provinceOfProject: '',
    // cityOfProject: '',
    // engineeringType: '',
    industryType: '',
    projectType:'',
    year:'',
  }
  projectId: string = '';
  createProject() {
    createProject({
      projectId: this.projectParams.projectId,
      projectUNID: this.projectParams.projectUNID,
      projectName: this.projectParams.projectName,
      projectlocation: this.projectParams.projectlocation,
      constructionPhase: this.projectParams.constructionPhase,
      serviceType: this.projectParams.serviceType,
      projectCategory: this.projectParams.projectCategory,
      // countryOfProject: this.projectParams.countryOfProject,
      // provinceOfProject: this.projectParams.provinceOfProject,
      // cityOfProject: this.projectParams.cityOfProject,
      // engineeringType: this.projectParams.engineeringType,
      industryType: this.projectParams.industryType,
      projectType: this.projectParams.projectType,
      year: this.projectParams.year
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.projectId = res.data;
      this.listSkipQueryList();
    })
  }
  listSkipQueryList() {
    listApi.listSkipQueryList({
      "queryCode": "XTSJ_project",
      "schemaCode": "XTSJ_project",
      "mobile": false,
      "page": 0,
      "size": 2,
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "id",
          "propertyType": 0,
          "propertyValue": this.projectId??''
        }
      ]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(Array.isArray(res.data.content) && res.data.content.length) {
        const data = res.data.content[0].data;
        this.formData.data.glid.engineering_name = data.engineering_name;
        this.formData.data.glid.id = res.data.content[0].id;
        this.formData.data.glid.schemaCode = res.data.content[0].schemaCode;
        this.formData.data.engineering_number = data.engineering_number;
        this.formData.data.engineering_name = data.engineering_name;
        this.formData.data.engineering_location = data.engineering_location;
        this.formData.data.year = data.year;
        this.formData.data.industryType = data.industryType;
        this.formData.data.projectType = data.projectType;
        this.formData.data.engineeringType = data.engineeringType;
        this.formData.data.constructionPhase = data.constructionPhase;
      }
    })
  }
  async getUserInfo() {
    const res = await OAuthApi.getUserInfo();
    if (res.errcode === 0) {
      const info: any = res.data;
      sessionStorage.setItem("user", JSON.stringify(info));
      if (info){
        this.userInfoId = info.id;
        this.getDataPermissions()
      }
    }
  }
  //TODO START 新增生产任务单权限
  userInfoId: string = '';
  isCreateProductPermission: boolean = false;
  //获取
  getDataPermissions() {
    listApi.listSkipQueryList({
      "queryCode": "XTSJ_role_permission",
      "schemaCode": "XTSJ_role_permission",
      "mobile": false,
      "page": 0,
      "size": 999,
      "filters": [
        {
          "op": "Eq",
          "propertyCode": "tableCode",
          "propertyType": 0,
          "propertyValue": 'XTSJ_xmlb'
        }
      ]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(Array.isArray(res.data.content) && res.data.content.length) {
        this.isCreateProductPermission = res.data.content.some((r)=> {
          return r.data.person.some((o)=> {
            return o.id === this.userInfoId
          })
        })
      }
    })
  }
  //TODO END
  created() {
    // console.log(Utils.GetRequest(),this.$route.name)
    const url:any = Utils.GetRequest();
    if(url.hasOwnProperty('accessToken')) {
      localStorage.setItem('token',url.accessToken);
      this.getUserInfo();
      for (const projectParamsKey in this.projectParams) {
        if(url[projectParamsKey]) {
          this.projectParams[projectParamsKey] = url[projectParamsKey]
        }
      }
      this.createProject();
    }
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
.e-task-list {
  padding: @spacing-large 0;
  .btns {
    margin-bottom: @spacing-medium;
    .task-title {
      font-size: 28px;
      color: rgba(0,0,0,.85);
      margin: 0 auto;
    }
    .ant-btn {
      margin-right: @spacing-base;
    }
  }
  .e-task-form {
    width: 75%;
    margin: 0 auto;
    overflow: auto;
  }
}
</style>
