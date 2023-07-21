<template>
  <a-config-provider :locale="locale" v-if="routerAlive">
    <div id="app" :class="{'ie': isIe}">
      <router-view v-if="ChangeColor" :key="projectConfig.projectName" class="bpm-container"/>
    </div>
  </a-config-provider>
</template>

<script lang="ts">
import {Component, ProvideReactive, Vue, Provide, Watch} from "vue-property-decorator";

import {ConfigProvider} from "@h3/antd-vue";

import OAuthApi from "@/apis/oauth";

import env from "@/config/env";

import zhCN from "@h3/antd-vue/lib/locale-provider/zh_CN";
import enUS from "@h3/antd-vue/lib/locale-provider/en_US";

import {getProjectConfig} from "../extends/service/api";

import app from "@cloudpivot/common/src/constants/globalApplication"
import {ZhCNEx} from "../extends/locales/zh-CN-ex";
import {getLang} from '../extends/locales/index';
import {ProjectConfig, ThemeConfig} from "../extends/type";
import {ProjectLevel} from "../extends/constant";
import omit from 'omit.js';
import { getPreConfig } from "../extends/service/CoordinateDesign/base";

@Component({
  components: {
    AConfigProvider: ConfigProvider
  }
})

export default class App extends Vue {

  @ProvideReactive('project') projectCode = env.project;

  @ProvideReactive('projectConfig') projectConfig: ProjectConfig = {
    projectLevel: null,
    projectName: null,
    projectKey: null,
    multiProjectFlag: false,
    simpleQualityFlag: false,
    updateProjectConfig: (n: string, l: number, k: string) => {
      this.projectConfig.projectName = n;
      this.projectConfig.projectLevel = l;
      this.projectConfig.projectKey = k;
      window.sessionStorage.setItem('projectConfig', JSON.stringify(omit(this.projectConfig, ['updateProjectConfig'])));
    }
  };

  @ProvideReactive('single') isSingleProject: boolean = false;

  @ProvideReactive('singleHost') hostAddr: string | null = null;

  @ProvideReactive('title') projectTitle: string | null = null;

  @ProvideReactive('logo') projectLogo: string | null = null;

  @ProvideReactive('bimUrl') BIMURL: string = "https://standard.wisdombim.com.cn/bimview/bim-cesuim.html?type=pc";

  @ProvideReactive('locale') lang: unknown = getLang();

  routerAlive: boolean = true;

  ChangeColor: boolean = true;

  get locale() {
    switch (this.$i18n.locale) {
      case "zh":
      default:
        return zhCN;

      case "en":
        return enUS;
    }
  }

  get isIe() {
    if (window.Environment && window.Environment.isIe !== undefined) {
      return window.Environment.isIe;
    }
    return false;
  }

  @Provide()
  routerRefresh() {
    this.routerAlive = false;
    this.$nextTick(() => {
      this.routerAlive = true;
    });
  }

  @Provide()
  reload(){
    this.ChangeColor = false
    this.$nextTick(function() {
      this.ChangeColor = true
    });
  }
  async mounted() {
    this.loadProjectConfig();
    const config = await OAuthApi.getSystemConfig();
    await this.getProjectConfigAndTheme(this.projectCode);
    sessionStorage.setItem('appCode',this.projectCode)
    if (config) {
      config.apiHost = env.apiHost;
      this.$store.commit("setConfig", config);
    }
    const token = localStorage.getItem('token')
    const previewUrl = sessionStorage.getItem('previewUrl')
    if (token && !previewUrl) {
      this.getPreConfig()
    }
    app.errorManager.getErrorCode();
    if (env.project) this.$store.commit("setProjectCode", env.project);
  }

  private async getProjectConfigAndTheme(projectCode) {
    const {projectConfig} = this;
    getProjectConfig({path: projectCode}).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      const result = res.data;
      if (!result?.id) return;
      this.isSingleProject = result?.single;
      this.hostAddr = result?.host;
      // this.projectTitle = window.Environment.markName ? window.Environment.markName : result?.title;
      this.projectTitle = result?.title;
      this.projectLogo = result?.logo;
      this.BIMURL = result?.bimUrl;
      this.projectConfig.simpleQualityFlag = result?.simpleQualityFlag;
      window.localStorage.setItem('projectLogo', result?.logo);
      window.localStorage.setItem('projectTitle', result?.title);
      if (!result.multiProjectFlag) {
        this.setSingleProject(result);
      } else {
        this.projectConfig.multiProjectFlag = true;
      }
    });
  }

  private loadProjectConfig() {
    const {projectConfig} = window.sessionStorage;
    if (projectConfig) {
      try {
        const config = JSON.parse(projectConfig) as ProjectConfig;
        this.projectConfig.updateProjectConfig(config.projectName, config.projectLevel, config.projectKey);
      } catch (e) {
        console.warn(e);
        this.$message.error((this.lang as typeof ZhCNEx).Common.System.parseConfigFailed);
      }
    }
  }

  private setSingleProject(params: ThemeConfig) {
    this.projectConfig.updateProjectConfig(null, ProjectLevel['项目'], null);
  }

  getPreConfig() {
    getPreConfig().then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      sessionStorage.setItem('previewUrl',res.data.idocvServiceUrl)
    })
  }

  @Watch('projectCode')
  projectCodeListener(v, oldV) {
    console.log('projectCodeListener', v, oldV);
    if (v !== oldV) {
      this.$router.push({name: "login"})
    }
  }
}
</script>
<style>
@import './assets/font/font.css'; /*引入公共样式*/

</style>
