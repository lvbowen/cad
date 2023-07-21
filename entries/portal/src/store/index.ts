import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import System from './modules/system/index';
import WorkflowCenter from './modules/workflow-center/index';
import projectStore from '../../extends/businessComponent/CoordinateDesign/External/v3/store/projectStore'
import menuStore from '../../extends/businessComponent/CoordinateDesign/External/v3/store/menuStore'

interface DefaultStore {
  appCode: string;
  projectCode: string;
  projectMenu: Array<unknown>;
  config: unknown;
  menuFlag: boolean;
}

const vuexLocal = new VuexPersistence({
  key: 'vuex',
  storage: localStorage,
  reducer: (state: any) => (
    {
      appCode: state.appCode
    })
});

Vue.use(Vuex);

export default new Vuex.Store({
  namespace: true,
  state: {
    // 单应用appCode,
    appCode: '',
    // 项目编码 对应 应用编码
    projectCode: '',
    // 项目菜单
    projectMenu: [],
    config: {},
    menuFlag: true,
  } as DefaultStore,
  mutations: {
    setAppCode(state: DefaultStore, appCode: string) {
      state.appCode = appCode;
    },
    setConfig(state: DefaultStore, config: string) {
      state.config = config;
    },
    setProjectCode(state: DefaultStore, projectCode: string) {
      state.projectCode = projectCode;
    },
    setProjectMenu(state: DefaultStore, projectMenu: Array<unknown>) {
      state.projectMenu = projectMenu;
    },
    setMenuFlag(state: DefaultStore, menuFlag: boolean) {
      state.menuFlag = menuFlag;
    }
  },
  modules: {
    WorkflowCenter,
    System,
    projectStore,
    menuStore
  },
  plugins: [vuexLocal.plugin]
} as any);
