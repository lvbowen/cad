import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {
  LayerDataSources, LayerOriginData, LayerOriginDataSources,
  LayerSettled,
  LayerStandardData,
  QueryLayer,
  QueryObjectId
} from "../type";
import {HttpResponse} from "@cloudpivot/api/src/response";

const ctx: Worker = self as any;

let passToken: string | null = null;

//BIM模型使用
const getObjectId: (params: QueryObjectId) => Promise<AxiosResponse<HttpResponse<QueryObjectId>>> = (params) => {
  return axios.post(`/api/api/runtime/query/list`, params, {headers: {Authorization: `Bearer ${passToken}`}});
}
//子表数据
const getChildTableData: (params: QueryLayer) => Promise<AxiosResponse<HttpResponse<QueryLayer>>> = (params) => {
  return axios.get(`/api/api/runtime/form/load`, {
    params: params,
    headers: {Authorization: `Bearer ${passToken}`}
  });
}

const layerFormatData: Array<LayerStandardData> = [];

const layerSourcesAdapter: (originArr: Array<LayerOriginDataSources>) => Array<LayerDataSources> = (originArr) => {
  return originArr?.map(item => {
    return {
      Pkid: item.id,
      pid: item.parentId,
      layerType: item.layer_type,
      layerName: item.layer_name,
      dataSourceName: item.dataSource_name,
      indexOrder: item.sort_num
    }
  });
}

const layerDataAdapter: (id: string, originData: LayerOriginData, projectCode: string) => void = (id, originData, projectCode) => {
  layerFormatData.push({
    Pkid: id,
    D3Server: originData.d3_server,
    sceneServer: originData.sceneServer,
    JLCompany: originData.sj_company,
    SGCompany: originData.sg_company,
    dataServer: originData.data_server,
    dataSources: layerSourcesAdapter(originData[`${projectCode}_model_layer_data`]),
    indexOrder: originData.index_order,
    modelAlt: originData.model_alt,
    modelDesc: originData.model_desc,
    modelLat: originData.model_lat,
    modelLng: originData.model_lng,
    modelName: originData.model_name,
    ownerProject: originData.owner_project
  });
}


const getLayerArray: (projectCode: string) => unknown = projectCode => {
  layerFormatData.length = 0;
  return new Promise(async (resolve, reject) => {
    const objectRes = await getObjectId({
      filters: [{
        propertyCode: "owner_project",
        propertyType: 0,
        propertyValue: "",
        propertyValueName: ""
      }],
      mobile: true,
      page: 0, //0
      queryCode: `${projectCode}_model_config`,
      schemaCode: `${projectCode}_model_config`,
      size: 100 //0
    });
    if (objectRes.data.errcode !== 0) return ctx.postMessage({
      status: 'failed',
      message: 'getObjectId failed'
    });
    const layerPromise: Array<Promise<LayerSettled>> = [];
    const result = objectRes.data.data;
    if (!Array.isArray(result?.content)) return ctx.postMessage({
      status: 'failed',
      message: 'invalid content'
    });

    result?.content.forEach(item => {
      layerPromise.push(
        new Promise<LayerSettled>((resolve1, reject1) => {
          getChildTableData({
            sheetCode: `${projectCode}_model_config`,
            objectId: item.id as string,
            schemaCode: `${projectCode}_model_config`
          }).then((layerData) => {
            if (layerData.data.errcode === 0) {
              resolve1({
                id: item.id as string,
                //type cheat
                response: (layerData.data.data?.bizObject?.data as unknown) as LayerOriginData
              })
            } else {
              reject('error')
            }
          });
        }));
    });

    Promise.allSettled(layerPromise).then((res: Array<PromiseFulfilledResult<LayerSettled>>) => {
      res.forEach((item) => layerDataAdapter(item.value.id, item.value.response, projectCode));
      ctx.postMessage({
        status: 'finished',
        message: JSON.stringify(layerFormatData)
      });
    });
  });
}

const proccess: (action: string, projectCode: string) => void = (action, projectCode) => {
  switch (action) {
    case 'getBimLayer':
      getLayerArray(projectCode);
      break;
    default:
      break;
  }
}

ctx.postMessage({status: 'success'});

ctx.addEventListener('message', event => {
  if (!event.data) return ctx.postMessage({status: 'failed', message: '非法data!'});
  const {action, projectCode, token} = event.data;
  // console.log('token===>', token);
  passToken = token;
  proccess(action, projectCode);
});
