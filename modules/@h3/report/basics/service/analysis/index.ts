import API from "../apis/api";
import analysisTips from "./error-tips";
import { AnalysisApis } from "./api-type";

class AnalysisApi extends API {
  constructor() {
    super({
      errorTips: analysisTips
    });
  }
  /**
   *  获取报表信息
   *  @param dataSourceId
   *  @param ownerId
   *  @param shareStatus 0 表示个人  1 表示公共
   */
  [AnalysisApis.GETREPORTINFO](
    dataSourceId: String,
    ownerId: String,
    shareStatus?: 0 | 1
  ): Promise<boolean | H3.AnalysisAPI.reportInfo> {
    const request = this.fetch<boolean | H3.AnalysisAPI.reportInfo>({
      url: "statistic/v1/statistic/statisticPage",
      method: "post",
      data: {
        ownerId,
        dataSourceId,
        shareStatus
      }
    });
    return request.promise;
  }
  /**
   *  获取个人报表信息
   *  @param dataSourceId
   *  @param ownerId
   */
  [AnalysisApis.GETPERSONALINFO](
    dataSourceId: String,
    ownerId: String
  ): Promise<boolean | H3.AnalysisAPI.reportInfo> {
    const request = this.fetch<boolean | H3.AnalysisAPI.reportInfo>({
      url: "statistic/v1/statistic/ownerStatisticPage",
      method: "post",
      data: {
        ownerId,
        dataSourceId
      }
    });
    return request.promise;
  }

  /**
   *  获取公共报表信息
   *  @param dataSourceId
   *  @param ownerId
   */
  [AnalysisApis.GETPUBLICINFO](
    dataSourceId: String,
    ownerId: String
  ): Promise<boolean | H3.AnalysisAPI.reportInfo> {
    const request = this.fetch<boolean | H3.AnalysisAPI.reportInfo>({
      url: "statistic/v1/statistic/publicStatisticPage",
      method: "post",
      data: {
        dataSourceId,
        ownerId
      }
    });
    return request.promise;
  }
  /**
   *  删除单个图表信息
   *  @param objectId
   */
  [AnalysisApis.REMOVECHART](objectId: String): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: "statistic/v1/statistic/removeStatisticChart",
      method: "post",
      data: {
        objectId
      }
    });
    return request.promise;
  }
  /**
   *  批量删除图表信息
   *  @param objectIds
   */
  [AnalysisApis.REMOVECHARTS](objectIds: String[]): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: "statistic/v1/statistic/removeStatisticCharts",
      method: "post",
      data: {
        objectIds
      }
    });
    return request.promise;
  }
  /**
   *  保存报表信息
   *  @param report
   */
  [AnalysisApis.SAVECHARTS](report: H3.AnalysisAPI.reportInfo): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: "statistic/v1/statistic/saveStatisticPage",
      method: "post",
      data: {
        report
      }
    });
    return request.promise;
  }
  /**
   *  获取个人模块统计分析报表的图表数量
   */
  [AnalysisApis.GETCHARTSLENGTH](dataSourceId: String, ownerId: String): Promise<boolean | number> {
    const request = this.fetch<boolean | number>({
      url: "statistic/v1/statistic/countNotShareCharts",
      method: "post",
      data: {
        dataSourceId,
        ownerId
      }
    });
    return request.promise;
  }
  /**
   *  保存图表信息
   *  @param chart
   */
  [AnalysisApis.SAVECHART](chart: H3.AnalysisAPI.ChartInfo): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: "statistic/v1/statistic/saveStatisticChart",
      method: "post",
      data: {
        chart
      }
    });
    return request.promise;
  }
  /**
   * 获取指定dataSourceId的数据源
   */
  [AnalysisApis.GETDATASOURCE](dataSourceId: string): Promise<any | boolean> {
    const request = this.fetch<any | boolean>({
      url: "statistic/v1/reporting/datasourcemodel",
      method: "post",
      data: {
        dataSourceInfos: [
          {
            dataSourceId,
            useType: 1
          }
        ]
      }
    });
    return request.promise;
  }
  /**
   *  保存图表个人偏好信息
   *  @param chart
   */
  [AnalysisApis.SAVEOWNERCHART](chart: H3.AnalysisAPI.OwnerChart): Promise<boolean> {
    const request = this.fetch<boolean>({
      url: "statistic/v1/statistic/saveOwnerChart",
      method: "post",
      data: {
        ownerChartInfo: chart
      }
    });
    return request.promise;
  }
  /**
   *  图表数据加载
   *  @param chart
   *  @param corpId
   */
  [AnalysisApis.GETCHARTDATA](
    chart: H3.ReportAPI.Chart,
    corpId?: string
  ): Promise<H3.AnalysisAPI.ChartRealData | boolean> {
    const request = this.fetch<boolean | H3.AnalysisAPI.ChartRealData>({
      url: "statistic/v1/reporting/loadChartData",
      method: "post",
      data: {
        chart,
        dataSourceId: chart.dataSourceId,
        corpId
      }
    });
    return request.promise;
  }
  /**
   *  图表数据加载
   *  @param code
   */
  [AnalysisApis.GETMAPJSON](code): Promise<Object | boolean> {
    const request = this.fetch<boolean | Object>({
      url: `statistic/v1/statistic/mapJson?code=${code}`,
      method: "get",
      data: {
        // code
      },
      autoGet: false
    });
    return request.promise;
  }
}
const analysisApi = new AnalysisApi();
export { analysisApi };
export default {
  analysisApi
};
