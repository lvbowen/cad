import API from '../apis/api';
import dataSourceTips from './error-tips';
import { DataSourceApis } from './api-type';


class DataSourceApi extends API {
  constructor() {
    super({ 
      errorTips: dataSourceTips
    });
  }
  /**
   * 获取数据源列表
   */
  [DataSourceApis.GETDATASOURCENODES](): Promise<H3.DataSourceAPI.DataSourceNode[] | boolean> {
    const request = this.fetch<H3.DataSourceAPI.DataSourceNode[]>({
      url: 'data-source/v1/advanced/getDataSourceNodes',
      method: 'post',
      data: {},
    });
    return request.promise;     
  }
  /**
   * 移动分组节点
   * @param groupObjectIds
   * @param nodeObjectIds
   * @param parentObjectId
   */
  [DataSourceApis.MOVEDATASOURCENODE]({groupObjectIds, nodeObjectIds, parentObjectId}): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: 'data-source/v1/advanced/moveDataSourceNode',
      method: 'post',
      data: {
        groupObjectIds,
        nodeObjectIds,
        parentObjectId
      }
    });
    return request.promise;
  }
  /**
   * 排序
   * @param sortModels
   */
  [DataSourceApis.UPDATEDATASOURCENODESORT](sortModels): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: 'data-source/v1/advanced/updateDataSourceNodeSort',
      method: 'post',
      data: {
        sortModels
      }
    });
    return request.promise;
  }
  /**
   * 删除分组节点
   * @param groupObjectIds
   * @param nodeObjectIds
   */
  [DataSourceApis.REMOVEDATASOURCENODE]({groupObjectIds, nodeObjectIds}): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: 'data-source/v1/advanced/removeDataSourceNode',
      method: 'post',
      data: {
        groupObjectIds,
        nodeObjectIds
      }
    });
    return request.promise;
  }
  /**
   * 更新高级数据源节点名称
   * @param name
   * @param objectId
   * @param type
   */
  [DataSourceApis.UPDATEDATASOURCENAME]({name, objectId, type}): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: 'data-source/v1/advanced/updateDataSourceNode',
      method: 'post',
      data: {
        name,
        objectId,
        type
      }
    });
    return request.promise;
  }
  /**
   * 添加高级数据源组节点
   * @param dataSourceGroup
   */
  [DataSourceApis.ADDDATASOURCEGROUP](dataSourceGroup: H3.DataSource.DataSourceGroup): Promise<boolean> {
    dataSourceGroup.corpId = this.config.corpId as string;
    const request = this.fetch<boolean>({
      url: 'data-source/v1/advanced/addDataSourceGroup',
      method: 'post',
      data: {
        dataSourceGroup
      }
    });
    return request.promise;
  }
  /**
   * 预览高级数据源数据
   * @param objectId
   */
  [DataSourceApis.PREVIEWADVANCEDDATA](objectId: string): Promise<H3.DataSourceAPI.Preview | boolean> {
    const request = this.fetch<H3.DataSourceAPI.Preview>({
      url: 'data-source/v1/advanced/previewAdvancedData',
      method: 'post',
      data: {
        objectId
      }
    });
    return request.promise;
  }
  /**
   * 高级数据源获取模型列表
   */
  [DataSourceApis.GETMODELLIST](): Promise<H3.DataSourceAPI.DataSourceNode[] | boolean> {
    const request = this.fetch<H3.DataSourceAPI.DataSourceNode[] | boolean>({
      url: 'data-source/v1/advanced/getModelList',
      method: 'post',
      data: {}
    });
    return request.promise;
  }
  /**
   * 高级数据源获取模型以及子模型的属性信息
   */
  [DataSourceApis.GETMODELINFO](schemaCode): Promise<H3.DataSourceAPI.Model | boolean> {
    const request = this.fetch<H3.DataSourceAPI.Model | boolean>({
      url: 'data-source/v1/advanced/getModelInfo',
      method: 'post',
      data: {
        schemaCode
      }
    });
    return request.promise;
  }
  /**
   * 获取高级数据源节点信息
   */

  [DataSourceApis.GETDATASOURCENODEINFO](objectId: string): Promise<any | boolean> {
    const request = this.fetch<any | boolean>({
      url: 'data-source/v1/advanced/getDataSourceNodeInfo',
      method: 'post',
      data: {
        objectId
      }
    });
    return request.promise;
  }

  /**
   * 高级数据源获取模型以及子模型的属性信息
   */
  [DataSourceApis.SAVEDATASOURCESETTING](setting: H3.FallsAPI.DataSource): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: 'data-source/v1/advanced/saveDataSourceSetting',
      method: 'post',
      data: {
        setting
      }
    });
    return request.promise;
  }
  /**
   * 高级数据源获取不同阶段的节点对应的模型属性
   */
  [DataSourceApis.GETSTAGEMODELINFO](setting: H3.FallsAPI.DataSource): Promise<H3.DataSourceAPI.Model | boolean> {
    const request = this.fetch<H3.DataSourceAPI.Model | boolean>({
      url: 'data-source/v1/advanced/getStageModelInfo',
      method: 'post',
      data:{
        setting
      }
    });
    return request.promise;
  }
  /**
   * 校验公式
   */
  [DataSourceApis.CHECKCOMPUTE](compute: H3.DataSourceAPI.Compute): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: 'data-source/v1/formula/validateAndAnalyse',
      method: 'post',
      data: {
        expression: compute.expression,
        fieldPrefix: compute.fieldPrefix,
        fields: compute.fields
      }
    });
    return request.promise;
  }
}

const dataSourceApi = new DataSourceApi();

export {
  dataSourceApi
};
export default {
  dataSourceApi
};
