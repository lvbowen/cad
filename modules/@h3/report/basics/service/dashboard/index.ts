import API from '../apis/api';
import dashboardTips from './error-tips';
import {DashbordApis} from './api-type';


class DashboardApi extends API {
    constructor() {
        super({
            errorTips: dashboardTips,
        });
    }

    /**
     * 保存取图表数据
     */
    [DashbordApis.SAVEREPORT](report: H3.Report.Report): Promise<boolean> {
        const request = this.fetch<boolean>({
            url: 'dashboard/v1/report/reportpage',
            method: 'post',
            data: {
                report
            }
        });
        return request.promise;
    }

    /**
     * 获取图表配置信息
     */
    [DashbordApis.GETREPORT](corpId: string, objectId: string): Promise<H3.DashboardAPI.ReportData | boolean> {
        const request = this.fetch<H3.DashboardAPI.ReportData | boolean>({
            url: 'dashboard/v1/report/config',
            method: 'post',
            data: {
                corpId,
                objectId
            }
        });
        return request.promise;
    }

    /**
     * 获取数据源列表
     */
    [DashbordApis.GETDATASOURCELIST](): Promise<Array<H3.DashboardAPI.DataSourceNode> | boolean> {
        const request = this.fetch<Array<H3.DashboardAPI.DataSourceNode> | boolean>({
            url: 'dashboard/v1/report/v2/datasourcelist',
            method: 'post',
            data: {}
        });
        return request.promise;
    }

    /**
     * 获取指定dataSourceId的数据源
     */
    [DashbordApis.GETDATASOURCE](dataSourceInfos: Array<string>): Promise<Array<H3.DashboardAPI.SchemaModel> | boolean> {
        const request = this.fetch<Array<H3.DashboardAPI.SchemaModel> | boolean>({
            url: 'dashboard/v1/report/v2/datasource',
            method: 'post',
            data: {
                dataSourceInfos
            }
        });
        return request.promise;
    }

    /**
     * 获取图表数据
     */
    [DashbordApis.GETCHARTDATA](chart: H3.ReportAPI.Chart, corpId?: string): Promise<H3.DashboardAPI.ChartRealData | boolean> {
        const request = this.fetch<H3.DashboardAPI.ChartRealData | boolean>({
            url: 'dashboard/v1/report/v3/chartData',
            method: 'post',
            data: {
                chart,
                dataSourceId: chart.dataSourceId,
                corpId
            }
        });
        return request.promise;
    }

    /**
     * 导出数据 明细表
     */
    [DashbordApis.DATAEXPORT](chart: H3.ReportAPI.Chart, corpId?: string): Promise<any | Array<any> | boolean> {
        const request = this.fetch<any | Array<any> | boolean>({
            url: 'dashboard/v1/export/dataExport',
            method: 'post',
            data: {
                chart,
                dataSourceId: chart.dataSourceId,
                corpId
            },
            responseType: 'blob',
        });
        return request.promise;
    };
}

const dashboardApi = new DashboardApi();
export {
    dashboardApi
};
export default {
    dashboardApi
};
