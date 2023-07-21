import Axios from "./axios";

import Mappings from "./api.mappings";

import * as Application from "./application";
import {HttpResponse} from "./response";
import {listParams} from "./index";

export class ListApi {
    /**
     * 导入文件上传地址
     */
    fileUploadUrl = `/api/runtime/query/upload_file`;

    /**
     * 点击新增按钮判断用户是否有权限创建业务表单
     * @param params
     */
    getJurisdiction(params: Application.ApiImplicitParam): any {
        return Axios.post(Mappings.form.add, params);
    }

    /**
     * 关闭弹框时触发清除临时文件
     * @param params
     */
    deleteTemporaryFile(params: Application.fileNameType): any {
        return Axios.post(Mappings.application.deleteTemporaryFile, params);
    }

    /**
     * 下载示例文件
     * @param params
     */
    exportTemplate(params: Application.ExportTemplateParams): any {
        return Axios.post(Mappings.application.queryExportTemplate, params, {
            responseType: "arraybuffer",
        });
    }

    /**
     * 导入失败错误信息下载
     * @param params
     */
    exportErrorResult(fileName: string): any {
        const params = {
            fileName,
        };
        return Axios.post(Mappings.application.queryDownloadResult, params, {
            responseType: "arraybuffer",
        });
    }

    /**
     * 导入数据
     * @param params
     */
    importData(params: Application.ImportParams): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.queryImportData, {params});
    }

    /**
     * 按姓名选人错误，二次确认导入数据
     * @param params
     */
    secondImportData(
        params: Application.SecondImportParams
    ): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.secondImportData, params);
    }

    sheetSecondImportData(params: Application.SheetSecondImportParams): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.sheetSecondImportData, params);
    }

    /**
     * 查询导入进度
     */
    getImportingProgress(): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.queryImportProgress);
    }

    // 注释和注释风格
    list(params: Application.IsMobileSchema): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appListApps, {params});
    }

    //
    listForTrust(params: Application.IsMobileSchema): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appListAppsForTrust, {
            params,
        });
    }

    // 获取目录
    getFolder(params: Application.FolderSchema): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appListFunctionsByCode, {
            params,
        });
    }

    // 获取子目录,即模型
    getModel(params: Application.folderIdSchema): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appListFunctionsById, {
            params,
        });
    }

    // 获取模型配置信息
    getListConfigData(
        params: Application.ListConfigSchame
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appQueryGet, {params});
    }

    getListConfigList(
        schemaCode: string,
        isPublish?: boolean,
        appCode?: string
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appQueryList, {
            params: {
                schemaCode,
                isPublish,
                currentAppCode: appCode,
            },
        });
    }

    // 获取已点亮视图列表
    getQueryHeaders(
        params: Application.QueryHeaderParams
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.queryHeaders, {params});
    }

    // 获取查询列表数据
    getQueryList(
        params: Application.QueryListParams
    ): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.queryList, params);
    }

    // 跳过列表查询
    listSkipQueryList(params: any): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.listSkipQueryList, params);
    }

    // 获取查询列表数据
    queryReverse(
        params: Application.QueryListParams
    ): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.queryListReverseSheet, params);
    }

    // 获取查询列表表单Url
    getFormUrl(params: Application.FormUrlParams): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.getFormUrl, {params});
    }

    // 删除列表
    deleteListData(
        params: Application.DeleteListParams
    ): Promise<HttpResponse<any>> {
        return Axios.delete(Mappings.application.deleteListData, {
            data: params,
        });
    }

    // 导出数据
    exportData(params: Application.ExportDataParams): any {
        return Axios.post(Mappings.application.queryExportData, params, {
            responseType: "arraybuffer",
        });
    }

    // 导出数据(后台异步导出文件)
    exportAsyncData(params: Application.ExportDataParams): any {
        return Axios.post(Mappings.application.queryAsyncExportData, params);
    }

    /**
     * 查询导出进度
     */
    getExportingProgress(
        params: Application.ExportId
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.queryExportProgress, {
            params,
        });
    }

    getExportFile(params: Application.ExportId): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.getExportData, params, {
            responseType: "arraybuffer",
        });
    }

    /* 获取应用目录、模型 */
    getAppItem(params: Application.AppCode): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appPackageTree, {
            params,
        });
    }

    /* 根据模型编码获取应用编码 */
    getAppCodeByModelCode(params: Application.AppCodeByModelCodeParam) {
        return Axios.get(Mappings.application.getAppCodeByModelCode, {
            params
        });
    }

    /**
     * 获取所有应用列表
     */
    getAllApps(params?: Application.appManagerModel): Promise<HttpResponse<any>> {
        return Axios.get("/api/app/apppackage/list_all", {
            params,
        });
    }

    appSearch(params: Application.AppPackageSearch) {
        return Axios.get(Mappings.application.appPackageSearch, {
            params,
        });
    }

    /**
     * 获取流程
     *  */
    getWorkflowList(
        params: Application.WorkflowSchemaCode
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.workflow.workflowList, {params});
    }

    /**
     * 获取流程-委托
     *  */
    getWorkflowListTrust(
        params: Application.WorkflowSchemaCode
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.workflow.workflowListTrust, {params});
    }

    /**
     * 获取单应用信息
     * @param appCode
     */
    getSingleAppInfo(appCode: string): Promise<HttpResponse<any>> {
        const params = {
            appCode,
        };
        return Axios.get(Mappings.application.appPackageGetSingleInfo, {
            params,
        });
    }

    /**
     * 单应用查询表单
     * @param appCode
     */
    searchBizModels(
        params: Application.SearchBizModelRequest
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appSearchBizModels, {
            params,
        });
    }

    /**
     * 最近使用的业务模型
     */
    listRecentBizModel(): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.appListRecentBizModels);
    }

    /**
     * 业务模型数据项列表
     */
    getDataItemList(
        params: Application.WorkflowSchemaCode
    ): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.importQueryField, {params});
    }

    /**
     * 检查删除数据是：流程数据还是业务数据，是否父流程数据
     */
    checkDeleteItems(
        params: Application.DeleteListParams
    ): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.checkDeleteItem, params);
    }

    /**
     * 批量生成二维码
     */
    genShortCodes(
        params: Application.GenShortCodesParams
    ): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.application.genShortCodes, params);
    }

    getReport(params: Application.GetReportParams): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.getReport, {
            params,
        });
    }

    //修改拥有者
    modifyOwner(params: any): Promise<HttpResponse<void>> {
        return Axios.post(Mappings.application.bizobjects, params);
    }

    //批量修改拥有者时获取无权限修改的数量
    getNoPresentationNumber(params: any): Promise<HttpResponse<void>> {
        return Axios.post(Mappings.application.objectIds, params);
    }

    getAppPackage(code: string): Promise<HttpResponse<any>> {
        const params = {
            code,
        };
        return Axios.get(Mappings.application.getAppPackage, {
            params,
        });
    }

    //获取自定义打印模板
    getLoadData(params: any): Promise<HttpResponse<any>> {
        return Axios.post(Mappings.form.batchLoad, params);
    }

    //获取是否有自定义打印模板
    getConfirmIsPrint(params: any): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.getBizFormPrint, {
            params,
        });
    }

    //获取表所有树形列
    getBySchemaCode(params: { mainSchemaCode: string }): Promise<HttpResponse<any>> {
        return Axios.get('/dataManage/tree/getBySchemaCode', {
            params,
        });
    }

    //获取top_tree_list
    top_tree_list(params: {
        projectCode: string,
        code: string,
        name: string,
        projectId: string,
        codeType: string,
        projectName: string
    }): Promise<HttpResponse<any>> {
        return Axios.get('/api/code_mbs/top_tree_list', {
            params,
        });
    }

    //获取queryChildTopTreeList
    queryChildTopTreeList(params: {
        id: string,
        projectCode: string,
        code: string,
        name: string,
        projectId?: string,
        projectName?: string,
        codeType?: string,
        multiProjectFlag?: boolean
    }): Promise<HttpResponse<any>> {
        return Axios.get('/api/code_mbs/child_tree_list', {
            params,
        });
    }

    //筛选树形数据结构
    getTreeData(params: any): Promise<HttpResponse<any>> {
        return Axios.post('/dataManage/tree/getTreeData', params);
    }

    //批量更新接口
    updateByIds(params: any): Promise<HttpResponse<any>> {
        return Axios.post('/dataManage/benchUpdate/updateByIds', params);
    }

    //获取表单下绑定的RDP报表
    getSchemaRdpReport(params: { appCode: string, schemaCode: string, projectName: string }): Promise<HttpResponse<any>> {
        return Axios.get('/api/report/getSchemaRdpReport', {
            params,
        });
    }

    //获取表单下绑定的RDP报表
    getRdpByFilter(params: { appCode: string, filterList: Array<any>, schemaCode: string }): Promise<HttpResponse<any>> {
        return Axios.post('/api/report/getRdpByFilter', params);
    }

    /**
     * 导入数据
     * @param params
     */
    selectFormTitle(params: any): Promise<HttpResponse<any>> {
        return Axios.get(Mappings.application.selectFormTitle, {params});
    }

    //获取字典列表树
    getListTree(params: {
        appCode: string,
        schemaCode: string,
        projectName: string
        currentId: string,
        multiProjectFlag: boolean
    }): Promise<HttpResponse<any>> {
        return Axios.get('/dataManage/treeComponet/getListTree', {
            params,
        });
    }

    getListTreeV2(params: {
        appCode: string,
        schemaCode: string,
        projectName: string
        currentId: string,
        multiProjectFlag: boolean
    }): Promise<HttpResponse<any>> {
        return Axios.get('/dataManage/treeComponet/getListTreeV2', {
            params,
        });
    }

    //根据树节点字典筛选列表
    getTableDataByDic(params: {
        page: number,
        size: number,
        appCode: string,
        codeValue: string,
        codeId: string,
        schemaCode: string,
        projectName: string,
        multiProjectFlag: boolean,
        filters: listParams.Filters[]
    }): Promise<HttpResponse<any>> {
        return Axios.post('/dataManage/treeComponet/getListDataV2', params);
    }

    //根据树关键字查询
    getListTreeByName(params: {
        appCode: string,
        projectName: string,
        codeName: string,
        schemaCode: string,
        multiProjectFlag: boolean
    }): Promise<HttpResponse<{
        editable: boolean;
        nodes: any[]
    }>> {
        return Axios.get('/dataManage/treeComponet/getFilterTree', {
            params,
        });
    }

    //修改表单数据的可见性
    dataManageLoad(params: {
        publishedAttributesJson: string,
    }): Promise<HttpResponse<any>> {
        return Axios.post('/dataManage/form/load',params );
    }

    //修改表单数据的可见性
    delStorge(params: {
        key: string,
    }): Promise<HttpResponse<any>> {
        return Axios.delete('/api/localStorge/delStorge', {params} );
    }

    //XTSJ XTSJ_xmcy新增权限控制
    getAuthOfChangeMember(params:{appCode:string,projectId:string}):Promise<HttpResponse<boolean>>{
        return Axios.get("/api/xtsjProject/projectMember/getAuthOfChangeMember",{params})
    }
}
