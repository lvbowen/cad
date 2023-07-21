import { MutationTree } from "vuex";
import { ReportDataSourceState } from ".";
import { ReportMutation } from "./types";
import { dataSourceApi } from "../../service/data-source";

const mutations: MutationTree<ReportDataSourceState> = {
  /**
   * 重置报表
   */
  [ReportMutation.UPDATECANVAS](state, payload) {
    state.originalNodes = payload.originalNodes;
    state.originalEdges = payload.originalEdges;
    state.nodes = payload.nodes;
    state.edges = payload.edges;
  },
  /**
   * 更新整体配置
   */
  [ReportMutation.UPDATESTAGE](state, payload) {
    state.models = payload.models;
    state.relations = payload.relations;
    state.merges = payload.merges;
    state.computes = payload.computes;
  },
  /**
   * 更新整体配置
   */
  [ReportMutation.UPDATEOPTIONS](state, height) {
    console.log("UPDATEOPTIONS", height);
    state.options.height = height;
  },
  /**
   * 更新/删除某个配置
   */
  [ReportMutation.UPDATESETTING](state, { stage, stageType, isDelete = false }) {
    if (stageType === "output") return;
    const tmpIndex = state[stageType].findIndex((item: H3.Falls.Stage | any) => {
      return item.id === stage.id;
    });
    if (tmpIndex > -1) {
      if (isDelete) {
        state[stageType].splice(tmpIndex, 1);
      } else {
        state[stageType].splice(tmpIndex, 1, stage);
      }
    } else {
      const initStage: any = {
        id: stage.id
      };
      if (stageType === "merges") {
        initStage.groups = [];
      }
      if (stageType === "relations") {
        initStage.join = "left"; // 默认左连接
        initStage.groups = [];
      }
      state[stageType].push(initStage);
    }
  },
  /**
   * 更新配置
   */
  [ReportMutation.SETDATASOURCEOPTIONS](state, { corpId, config, groupId, dataSourceId }) {
    if (corpId) {
      state.corpId = corpId;
    }
    if (config) {
      state.config = config;
    }
    if (groupId) {
      state.groupId = groupId;
    }
    if (dataSourceId) {
      state.dataSourceId = dataSourceId;
    }
    dataSourceApi.setConfig({ corpId, config });
  },
  /**
   * 设置标题
   * @param state
   * @param title
   */
  [ReportMutation.SETDATASOURCETITLE](state, title: string) {
    state.title = title;
  },
  /**
   * 保存corpId、config
   */
  [ReportMutation.STOREAXIOSDATA](state, { corpId, config }) {
    state.corpId = corpId;
    state.config = config;
  },
  /**
   * 初始化高级数据源
   */
  [ReportMutation.INITDATESOURCE](state) {
    Object.assign(state, new ReportDataSourceState());
  }
};

export default mutations;
