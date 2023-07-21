import { ActionTree } from "vuex";
import { ReportDataSourceState } from ".";
import { dataSourceApi } from "../../service/data-source";
import { ReportAction, ReportMutation } from "./types";
import { guid } from "../../utils/uid";

const actions: ActionTree<ReportDataSourceState, ReportDataSourceState> = {
  /**
   * 获取高级数据源列表
   * @param state
   * @param dispatch
   * @param corpId
   */
  [ReportAction.GETMODELLIST]({ dispatch, state }) {
    return dataSourceApi.getModelList();
  },
  /**
   * 获取数据源
   * @param state
   * @param dispatch
   * @param schemaCode
   */
  async [ReportAction.GETMODELINFO]({ dispatch, state }, schemaCode: string) {
    const res = await dataSourceApi.getModelInfo(schemaCode);

    if (res) {
      const { main, subs } = res;
      if (main && main.fields && main.fields.length > 0) {
        main.fields = main.fields.filter(item => {
          return item.visible;
        });
      }
      if (subs && subs.length > 0) {
        for (let i = 0; i < subs.length; i++) {
          const sub = subs[i];
          if (sub && sub.fields && sub.fields.length > 0) {
            sub.fields = sub.fields.filter(item => {
              return item.visible;
            });
          }
        }
      }

      return {
        main,
        subs
      };
    } else {
      return null;
    }
  },
  /**
   * .获取不同阶段对应模型信息
   * @param state
   * @param dispatch
   * @param nodeId
   * @param source
   */
  [ReportAction.GETSTAGEMODELINFO]({ dispatch, state }, { nodeId, source }) {
    const setting: H3.FallsAPI.DataSource = Object.assign(
      {},
      {
        nodeId: nodeId,
        objectId: state.dataSourceId,
        groupObjectId: state.groupId
      },
      source
    );
    return dataSourceApi.getStageModelInfo(setting);
  },

  /**
   * 获取高级数据源节点信息
   * @param commit
   * @param state
   */
  async [ReportAction.GETDATASOURCENODEINFO]({ commit, state }) {
    if (state.dataSourceId) {
      await dataSourceApi.getDataSourceNodeInfo(state.dataSourceId).then(res => {
        if (res) {
          state.title = res.title;
          if (res.options) {
            state.options = res.options;
          }
          commit(ReportMutation.UPDATECANVAS, {
            originalNodes: [],
            originalEdges: [],
            nodes: res.nodes || [],
            edges: res.edges || []
          });
          commit(ReportMutation.UPDATESTAGE, {
            models: res.models || [],
            merges: res.merges || [],
            relations: res.relations || [],
            computes: res.computes || []
          });
        }
      });
    } else {
      state.dataSourceId = `${guid()}`;
      state.title = "未命名的数据源";
    }
  },
  /**
   * 保存高级数据源配置信息
   * @param state
   * @param dispatch
   * @param nodeId
   */
  async [ReportAction.SAVEDATASOURCESETTING]({ dispatch, state }, nodeId) {
    const source: H3.FallsAPI.DataSource = {
      nodeId: nodeId,
      title: state.title,
      objectId: state.dataSourceId,
      groupObjectId: state.groupId,
      edges: state.edges,
      nodes: state.nodes,
      models: state.models,
      merges: state.merges,
      relations: state.relations,
      computes: state.computes,
      options: state.options
    };
    return dataSourceApi.saveDataSourceSetting(source);
  },
  /**
   * 校验计算字段
   * @param state
   * @param dispatch
   * @param formula
   * @param fields
   */
  async [ReportAction.CHECKCOMPUTE]({ dispatch, state }, { formula, fields }) {
    const compute: H3.DataSourceAPI.Compute = {
      expression: formula,
      fieldPrefix: "@@",
      fields: fields
    };
    return dataSourceApi.checkCompute(compute);
  }
};
export default actions;
