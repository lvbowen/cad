import env from '@/config/env';
//云枢接口
const list = `${env.apiHost}/api/runtime/query/list`
const contractOrg = `${env.apiHost}/api/organization/department/childs`
//`${env.apiHost}/api/measurePayment/contractDetail/uploadExcel`
// 编码管理Tree
const queryTree = `${env.apiHost}/codeManage/queryTree`;
const codeMbs = `${env.apiHost}/api/code_mbs/`;
const getUpperCode=`${env.apiHost}/api/moduleConfig/getUpperCode`;//查看对应模块关联的上级模块编码
const topTree = codeMbs + `top_tree_list` ;//查询树根节点
const childTree = codeMbs + `child_tree_list` //查询树子节点
const getLeafs = codeMbs + `getLeafsByList` //根据MBS的节点id查询子节点
//计量支付
const url = `${env.apiHost}/api/measurePayment/`;
// const url =  'http://10.20.105.104:8080/api'+`/api/measurePayment/`;
//工程量清单方案（表格）
const schemeManage = url + "schemeManage/";
const schemeManageGet = schemeManage + "get"; //获取清单方案（首表）
const schemeManageInsert = schemeManage + "insert"; //保存清单方案（首表）
const schemeManageDel = schemeManage + "delete"; //删除清单方案（首表）
const schemeStartWorkflow = schemeManage + "startWorkflow"; //启动流程（表单）

//合同管理
const contractManage = url + "contractManage/";
const contractManageGet = contractManage + "get";
const contractManageInsert = contractManage + "insert";
const contractManageDel = contractManage + "delete";
const getSchemeType = contractManage + "getSchemeType"; //根据合同编号获取清单类型
const getPayType = contractManage + "getPayType"; //根据合同编号获取支付类型
const deleteSchemaType = contractManage + "deleteSchemaType"; //删除清单类型
const deletePayType = contractManage + "deletePayType"; //删除支付类型
const insertSchemaType = contractManage + "insertSchemaType"; //保存清单类型
const insertPayType = contractManage + "insertPayType"; //保存支付费用类型

//工程量清单明细
const contractDetail = url + "contractDetail/";
const contractDetailGet = contractDetail + "get";
const contractDetailGetAll = contractDetail + "getAll";
const contractDetailGetChilds = contractDetail + "getChilds";//树形数据异步
const getChildsWithState = contractDetail + "getChildsWithState";//树形数据异步
const contractDetailInsert = contractDetail + "insert";
const contractDetailDel = contractDetail + "delete";
const contractDetailUpdate = contractDetail + "updateData";
const contractDetailUpload = contractDetail + "uploadExcel"; //上传EXCEL

//CBS清单明细
const cbsDetail = url + "cbs/";
const saveCBSBench = cbsDetail + "saveCBSBench"; //通过编码树批量保存cbs
const cbsDetailGet = cbsDetail + "get";
const cbsDetailInsert = cbsDetail + "insert";
const cbsDetailDel = cbsDetail + "delete";
const cbsDetailUpload = cbsDetail + "uploadExcel";

//CBS计量记录
const cbsMeasure = url + "cbsMeasure/";
const cbsMeasureGet = cbsMeasure + "getByCBSId";
const cbsMeasureInsert = cbsMeasure + "insert";
const cbsMeasureDel = cbsMeasure + "delete";
const banchRecord = cbsMeasure + "banchRecord";//批量计量

//周期计量汇总
const measureTotal = url + "measure/";
// const cbsMeasureGet = measureTotal + "getByCBSId";
const measureTotalInsert = measureTotal + "insertMeasurePeriod";
const getMeasurePeriod = measureTotal + "getMeasurePeriod"; //根据id获取计量周期
const measureTotalDel = measureTotal + "deleteMeasurePeriod";
const measureTotalStartWorkflow = measureTotal + "startWorkflow"; //启动流程（表单）
const importMeasureDetail = measureTotal + "importMeasureDetail"; //导入合同清单
const deleteMeasureDetail = measureTotal + "deleteMeasureDetail"; //清空合同清单
const getByCBSAndPeriod = measureTotal + "getByCBSAndPeriod";
const getByCBSAndPeriodPage = measureTotal + "getByCBSAndPeriodPage";
const removeCBSMeasure = measureTotal + "removeCBSMeasure";
const selectAllCBSMeasure = measureTotal + "selectAllCBSMeasure"; //一键添加中间计量
const updateMeasureDetail = measureTotal + "updateMeasureDetail"; //数据同步
const getMeasureDetail = measureTotal + "getMeasureDetail";
const selectCBSMeasure = measureTotal + "selectCBSMeasure";
const getMeasureDetailChilds = measureTotal +"getMeasureDetailChilds"
const queryMeasure = measureTotal +"queryMeasure"//搜索

//支付汇总
const payManage = url + "payManage/";
const insertPayPeriod = payManage + "insertPayPeriod";
const deletePayPeriod = payManage + "deletePayPeriod";
const importPayDetail = payManage + "importPayDetail"; //获取费用项
const getPayDetail = payManage + "getPayDetail";
const getPayPeriod = payManage + "getPayPeriod"; //根据id获取支付周期方案
const payManageStartWorkflow = payManage + "startWorkflow"; //启动支付周期流程
const deletePayDetail = payManage + "deletePayDetail"; //清空费用项
const updatePayDetail = payManage + "updatePayDetail"; //支付汇总数据保存（数据同步）
const selectMeasurePeriod = payManage + "selectMeasurePeriod"; //获得当前计量期号的费用
const queryPay = payManage + "queryPay";//搜索

//投资总览
const measureView = url + "measureView/";
const getProjectName = measureView + "getProjectName";//获取项目名称
const getMeasureViewChilds = measureView + "getMeasureDetailChilds";
const getLatestCBS = measureView + "getLatestCBS";
const getCbsStatics = measureView + "getCbsStatics";
const getCBSByPeriod = measureView + "getCBSByPeriod";
const getAllPeriod = measureView + "getAllPeriod";
export {
  list,
  contractOrg,
  getUpperCode,
  queryTree,
  topTree,
  childTree,
  getLeafs,
  saveCBSBench,
  schemeManageGet,
  schemeManageInsert,
  schemeManageDel,
  schemeStartWorkflow,
  contractManageGet,
  contractManageInsert,
  contractManageDel,
  getSchemeType,
  getPayType,
  deleteSchemaType,
  deletePayType,
  insertPayType,
  insertSchemaType,
  contractDetailGet,
  contractDetailGetAll,
  contractDetailGetChilds,
  contractDetailInsert,
  contractDetailDel,
  contractDetailUpdate,
  contractDetailUpload,
  cbsDetailGet,
  cbsDetailInsert,
  cbsDetailDel,
  cbsDetailUpload,
  cbsMeasureGet,
  cbsMeasureInsert,
  cbsMeasureDel,
  banchRecord,
  measureTotalInsert,
  measureTotalDel,
  measureTotalStartWorkflow,
  deleteMeasureDetail,
  importMeasureDetail,
  getByCBSAndPeriod,
  getByCBSAndPeriodPage,
  removeCBSMeasure,
  selectAllCBSMeasure,
  getMeasureDetailChilds,
  queryMeasure,
  updateMeasureDetail,
  getMeasurePeriod,
  getMeasureDetail,
  selectCBSMeasure,
  deletePayPeriod,
  insertPayPeriod,
  importPayDetail,
  getPayDetail,
  getPayPeriod,
  payManageStartWorkflow,
  deletePayDetail,
  updatePayDetail,
  selectMeasurePeriod,
  queryPay,
  getProjectName,
  getMeasureViewChilds,
  getLatestCBS,
  getCbsStatics,
  getCBSByPeriod,
  getAllPeriod,
  getChildsWithState
}
