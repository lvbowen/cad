import Report from "./Report";
import type {ReportOptions} from './Report';
import Utils from "../../utils";
import * as Api from "../../service/api";
import * as Type from "../../type";

import {reportState} from '@h3/report/basics/store/dashboard';
import {ReportMutation} from '@h3/report/basics/store/dashboard/types';
import * as reportRequest from "@h3/report/dist/options";

interface ReportControlOption {
  projectCode: string;
  reportCode: string;
  maxRow?: number;
  maxCol?: number;
  element?: Element;
  //template语法挂载报表需要传入此参数
  update?: Function;
  top?: number;
}

export default class IndependentReportControl {

  constructor(props) {
    const {$createElement, createElement} = props;
    this.container = props;
    if (!this.container.$store.hasModule('report')) this.container.$store.registerModule('report', reportState);
    this.renderEngine = $createElement ?? createElement;
    //@ts-ignore
    reportRequest.default.baseUrl = window.config.portalHost;
  }

  private configMap: Map<string, ReportOptions> = new Map();

  private marginTop: number | null | undefined = null;

  private container: any = null;

  private update: Function | null = null;

  private name: string = 'IndependentReportControl';

  private renderEngine: Function;

  private element: Element | null = null;

  private projectCode: string | null = null;

  private reportCode: string | null = null;

  private objectId: string | null = null;

  private maxRow: number = 32;

  // private maxCol: number = 49;
  //TODO:need calc media query
  private maxCol: number = 24;

  private chartGlobal: Type.ChartGlobal | null = null;

  private chartList: Type.ChartConfigResult["charts"] = [];

  private dataSourceList: Array<{ dataSourceId: string, useType: number }> = [];

  private charts: Array<Type.ReportSettledResult> = [];

  public initCharts() {
    const {container} = this;
    if (!container) return;
    const {$store} = container;
    if (!$store) throw new Error('$store is not exist');
    this.objectId = null;
    this.chartList = [];
    this.dataSourceList = [];
    this.charts = [];
    this.configMap.clear();
    $store.commit(`report/${ReportMutation.INITREPORT}`);
  }

  private setChartsOptionsWithStore() {
    const {container} = this;
    if (!container) return;
    const {$store} = container;
    if (!$store) throw new Error('$store is not exist');
    $store.commit(`report/${ReportMutation.SETREPORTOPTIONS}`, {
      axios: null,
      charts: {
        list: {
          dimension: 50
        }
      },
      classification: null,
      config: {
        appCode: this.projectCode as string,
        reportCode: this.reportCode as string,
        token: window.localStorage.getItem('token') as string
      },
      corpId: "a",
      reportId: this.objectId
    });
  }

  private setChartsDataWithStore(chartsId: string, chartsData: unknown) {
    const {container} = this;
    if (!container) throw new Error('You need to put Charts in the container!');
    const {$store} = container;
    if (!$store) throw new Error('$store is not exist');
    $store.commit(`report/${ReportMutation.SETCHARTSDATA}`, {
      key: chartsId,
      data: chartsData
    });
  }

  //template语法无法渲染componentInstanceArray
  private getChartsConfig(Ins: IndependentReportControl) {
    const {update, configMap, generateCharts, renderEngine} = Ins;
    if (!update) return;
    const reGenerateFn = generateCharts.bind(Ins, renderEngine);
    reGenerateFn();
    const configArray: Array<ReportOptions> = [];
    configMap.forEach(item => configArray.push(item));
    update(configArray);
  }

  private getReportConfigValueDebounce = Utils.debounce((Ins: IndependentReportControl) => {
    Api.getReportConfigValue({
      code: Ins.reportCode as string
    }).then(res => {
      /*if (res.errcode !== 0) return this.$message.error(res.errmsg as string);*/
      if (Ins.objectId !== res.data?.reportObjectId) {
        Ins.objectId = res.data?.reportObjectId ?? null;
        Ins.getReportConfigDebounce(this);
      }
    })
  }, 300);

  private getReportConfigDebounce = Utils.debounce((Ins: IndependentReportControl) => {
    const {chartList, getChartsConfig} = Ins;
    Api.getReportConfig({
      config: {
        appCode: Ins.projectCode as string,
        reportCode: Ins.reportCode as string,
        token: window.localStorage.getItem('token') as string
      },
      corpId: "a",
      objectId: Ins.objectId as string
    }).then(res => {
      // if (res.errcode !== 'success') return this.$message.error(res.errmsg as string);
      if (res.data?.global) Ins.chartGlobal = res.data?.global;
      res.data?.charts.forEach(item => {
        if (!chartList.find(chart => chart.uuid === item.uuid)) chartList.push(item);
      });

      Ins.getChartsConfig(Ins);
      //TODO:交由H3report自行获取数据
      //Ins.getChartDataWithChartListDebounce(Ins);
      //TODO:split sourceList
      const sourceList: Array<{ dataSourceId: string, useType: number }> = [];
      console.log('chartList===>', chartList);
      chartList.forEach(item => {
        const parsed = JSON.parse(item.content) as Type.ChartConfig;
        //console.log('parsed===>', parsed);
        sourceList.push({
          dataSourceId: parsed.dataSourceId,
          useType: parsed.useType
        })
      });
      // console.log('sourceList===>', sourceList);
      //TODO:setReportOptions
      Ins.setChartsOptionsWithStore();
      Ins.dataSourceList = sourceList;
      Ins.getDataSourceDebounce(Ins);
    })
  }, 300);

  private getChartDataWithChartListDebounce = Utils.debounce((Ins: IndependentReportControl) => {
    const {chartList, projectCode, reportCode} = Ins;
    const chartPromise: Array<Promise<any>> = [];
    let uuidIndex = 0;
    chartList.forEach(item => {
      const parsed = JSON.parse(item.content) as Type.ChartConfig;
      //这里是配置
      //console.log('parsed====>', parsed);
      chartPromise.push(
        new Promise<any>((resolve, reject) => {
          Api.getChartData({
            chart: {
              authorization: parsed.authorization,
              dataSourceId: parsed.dataSourceId,
              dimension: parsed.data.dimension,
              filter: parsed.data.filter,
              limit: parsed.data.limit,
              metric: parsed.data.metric,
              sort: parsed.data.sort,
              title: parsed.title,
              type: parsed.type,
              useType: parsed.useType
            },
            config: {
              appCode: projectCode as string,
              reportCode: reportCode as string,
              token: window.localStorage.getItem('token') as string
            },
            corpId: "a",
            dataSourceId: parsed.dataSourceId
          }).then(res => {
            if (res.data) {
              //TODO:这里交由H3report获取数据
              //Ins.setChartsDataWithStore(chartList[uuidIndex].uuid,res.data.series);
              uuidIndex++;
              resolve(res.data);
            }
          })
        })
      );
    });
    Promise.allSettled(chartPromise).then((settledRes: Array<PromiseSettledResult<Type.ReportSettledResult>>) => {
      const result: Array<Type.ReportSettledResult> = [];
      settledRes.forEach((item) => {
        if (item.status !== "rejected") {
          result.push(item.value as Type.ReportSettledResult);
        }
      });
      this.charts = result;
    })
  }, 300);

  private getDataSourceDebounce = Utils.debounce((Ins: IndependentReportControl, dataSourcesList: Array<{
    dataSourceId: string;
    useType: number;
  }>) => {
    Api.getDataSource({
      config: {
        appCode: Ins.projectCode as string,
        reportCode: Ins.reportCode as string,
        token: window.localStorage.getItem('token') as string
      },
      corpId: "a",
      dataSourceInfos: dataSourcesList
    }).then(res => {
      //if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
    });
  }, 300);

  public setOptions(options: ReportControlOption): void {
    const {projectCode, reportCode, element} = options;
    if (!projectCode || !reportCode) throw new Error(`${!projectCode && 'projectCode'} ${!reportCode && 'reportCode'} missing !`);
    this.initCharts();
    this.marginTop = options.top;
    this.reportCode = reportCode;
    this.projectCode = projectCode;
    this.element = element as Element;
    this.update = options.update ?? null;
    this.getReportConfigValueDebounce(this);
  }

  public generateCharts(h): Array<JSX.Element> {
    const {chartList, chartGlobal, maxRow, maxCol, element, container, configMap,marginTop} = this;
    console.log('generateCharts===>', element);
    const
      containerRects = element ? element.getClientRects()[0] : null,
      containerW: number = containerRects?.width ?? 100,
      containerH: number = containerRects?.height ?? 100,
      containerX: number = containerRects?.x ?? 0,
      containerY: number = containerRects?.y ?? 0;
    const formatGlobal = chartGlobal && JSON.parse(chartGlobal as unknown as string) || {};
    console.log('generateCharts===>', chartList);
    return chartList.map((item, index) => {
      const config = JSON.parse(item.content);
      //console.log('containerRects==>', containerRects);
      const options: ReportOptions = {
        maxCol: maxCol,
        maxRow: maxRow,
        config: config,
        formatGlobal: formatGlobal,
        index: index,
        uid: item.uuid,
        container: container,
        containerW: containerW,
        containerH: containerH,
        containerX: containerX,
        containerY: containerY,
        marginTop: marginTop as number
      };
      configMap.set(item.uuid, options);
      //@ts-ignore
      return <Report options={options}/>;
    });
  }

  public render(): Array<JSX.Element> {
    const {renderEngine} = this;
    if (!renderEngine) throw new Error('You need to put Charts in the container!');
    if (renderEngine) {
      return this.generateCharts(renderEngine);
    } else {
      return [];
    }
  }
}
