<template>
  <div class="login-config">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="登录设置" class="custom-style">
        <set-login :setLoginInfo="loginInfoData"/>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="安装包设置" class="custom-style">
        <set-package :setPackageData="packageData"/>
      </a-collapse-panel>
      <a-collapse-panel key="3" header="默认页设置" class="custom-style">
        <set-default-pages :setDefaultPagesData="defaultPagesData" :setDefaultPageRange="defaultPageRange"/>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
// import {Collapse, Icon,Table,Input,Button,Popconfirm} from "ant-design-vue";
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import {DefaultPages, PackageInfo,LoginInfoT} from "../type";
import {getLoginConfig} from "../../../service/api";
import * as Type from "../../../type";
import SetPackage from './PackageConfig.vue';
import SetDefaultPages from './DefaultPage.vue'
import SetLogin from './LoginInfo.vue';

@Component({
  name: 'LoginConfig',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ATable: Table,
    AInput: Input,
    AButton: Button,
    APopconfirm: Popconfirm,
    SetPackage,
    SetDefaultPages,
    SetLogin
  }
})
export default class LoginConfig extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  activeKey: string[] = ['1', '2','3'];
  packageData: PackageInfo[] = [];
  defaultPagesData: DefaultPages[] = [];
  defaultPageRange: string[] = [];
  loginInfoData: LoginInfoT|null = null;
  init() {
    this.packageData = [];
    getLoginConfig({appCode:this.projectCode??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      if(res.data) {
        const data = res.data;
        //默认页
        if(data.defaultPages) {
          (data || []).defaultPages.map((item) => {
            let options:any[] = [],values:string='';
            for (const f_key in item.pages) {
              options.push({
                label: f_key,
                value: f_key
              })
              if(item.pages[f_key]) {
                values = f_key
              }
            }
            item.plainOptions = options;
            item.defaultCheckedValue = values;
          })
          this.defaultPagesData = data.defaultPages
        }
        //安装包
        this.packageData.push({
          type: 'android',
          url: data.mobilePackage && data.mobilePackage.androidUrl?data.mobilePackage.androidUrl:'',
          qr: data.mobilePackage && data.mobilePackage.androidQR?data.mobilePackage.androidQR:''
        })
        this.packageData.push({
          type: 'ios',
          url: data.mobilePackage && data.mobilePackage.iosUrl?data.mobilePackage.iosUrl:'',
          qr: data.mobilePackage && data.mobilePackage.iosQR?data.mobilePackage.iosQR:''
        })
        //主题信息
        if(data.theme) {
          this.loginInfoData = data.theme;
        }
        //默认页-新增-默认pages选项
        this.defaultPageRange = res.data.defaultPageRange;
      }
    })
  }

  toForm(schemaCode: string) {
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: schemaCode,
        sheetCode: schemaCode,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }
  mounted() {
    this.init()
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';
.login-config {
  .editable-row-operations a {
    margin-right: 8px;
  }
  //.qr {
  //  width: 80px;
  //}
}
</style>
