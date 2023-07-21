<template>
  <div id="app">
    <transition name="slide-fade">
      <router-view v-if="hideFootbar || isSingleApp"/>
      <nav-viewer v-else/>
    </transition>
  </div>
</template>
<style lang="less">
@import './styles/index.less';

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  text-align: center;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  line-height: 1.15 !important;
}

</style>

<script lang="ts">
import {Component, ProvideReactive, Vue} from 'vue-property-decorator';
import NavViewer from '@/views/nav-viewer.vue';
import OAuthApi from '@/apis/oauth';
import env from '@/config/env';
//import Worker from '../extends/fiber/thread.worker';
import Worker from 'worker-loader!../extends/fiber/thread.worker';

import {getProjectConfig} from '../extends/service/api';
import {LayerStandardData,ProjectConfig, ThemeConfig} from "../extends/type";
import app from "@cloudpivot/common/src/constants/globalApplication"
import omit from "omit.js";
import {ProjectLevel} from "../extends/constant";

@Component({
  name: 'App',
  components: {
    NavViewer
  },
})
export default class App extends Vue {

  @ProvideReactive('project') projectCode: string = env.project;

  @ProvideReactive('logo') projectLogo: string = '';

  @ProvideReactive('title') projectTitle: string = '智慧管控系统';

  @ProvideReactive('corpId') projectCorp: string = '';

  @ProvideReactive('single') isSingleProject: boolean = false;

  @ProvideReactive('singleHost') hostAddr: string | null = null;

  @ProvideReactive('layerData') layerSources: Array<LayerStandardData> = [];

  @ProvideReactive('thread') thread1 = new Worker();

  @ProvideReactive('bimUrl') BIMURL: string = "https://standard.wisdombim.com.cn/bimview/bim-cesuim.html?type=phone";

  @ProvideReactive('projectConfig') projectConfig: ProjectConfig = {
    projectLevel: null,
    projectName: null,
    projectKey: null,
    multiProjectFlag: false,
    updateProjectConfig: (n: string, l: number, k: string) => {
      console.log(this.projectConfig);
      this.projectConfig.projectName = n;
      this.projectConfig.projectLevel = l;
      this.projectConfig.projectKey = k;
      window.sessionStorage.setItem('projectConfig', JSON.stringify(omit(this.projectConfig, ['updateProjectConfig'])));
    }
  };


  hideFootbar: boolean = true;

  get isSingleApp() {
    if (window.Environment.appCode) {
      return true;
    }
    return false;
  }

  beforeMount() {
    const vm = this as any;
    this.$router.afterEach((to, from) => {
      const hide = to.meta && to.meta.hideFootbar === true;
      vm.hideFootbar = hide;
    });
  }

  private async getSystemConfig() {
    const {projectCode} = this;
    getProjectConfig({path: projectCode}).then(res => {
      if (res.errcode !== 0) return;
      const result = res.data;
      if (!result?.id) return;
      this.projectLogo = result?.logo;
      this.projectTitle = result?.title;
      this.projectCorp = result?.corpId;
      // this.BIMURL = result?.bimUrl;
      if (!result.multiProjectFlag) {
        this.setSingleProject(result);
      } else {
        this.projectConfig.multiProjectFlag = true;
      }
    })
  }

  private loadProjectConfig() {
    const {projectConfig} = window.sessionStorage;
    if (projectConfig) {
      try {
        const config = JSON.parse(projectConfig) as ProjectConfig;
        this.projectConfig.updateProjectConfig(config.projectName, config.projectLevel, config.projectKey);
      } catch (e) {
        console.warn(e);
      }
    }
  }

  private setSingleProject(params: ThemeConfig) {
    this.projectConfig.updateProjectConfig(null, ProjectLevel['项目'], null);
  }

  async mounted() {
    this.loadProjectConfig();
    const config = await OAuthApi.getSystemConfig();
    const {thread1} = this;
    await this.getSystemConfig();

    //thread
    // const thread1 = new Worker();
    thread1.postMessage({
      action: 'getBimLayer',
      projectCode: this.projectCode,
      token: window.localStorage.getItem('token')
    });

    thread1.addEventListener('message', events => {
      switch (events.data?.status) {
        case 'finished':
          try {
            const layerDataArr = JSON.parse(events.data.message);
            this.layerSources = layerDataArr;
          } catch (e) {
            console.warn('获取图层数据失败', e);
          }
          break;
        case 'failed':
          break;
        default:
          break;
      }
    });

    if (config) {
      this.$store.commit('setConfig', config);
    }
    app.errorManager.getErrorCode();
  }
}
</script>
