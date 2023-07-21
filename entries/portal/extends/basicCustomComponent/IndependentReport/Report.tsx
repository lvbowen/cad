/// <reference path="../../../../../node_modules/@h3/report/basics/typings/analysis.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/typings/report.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/typings/report-state.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/typings/report-modules.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/typings/h3-yun.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/typings/chart.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/components/list/list.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/components/card/card.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/components/pivot-table/pivot-table.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/instance/localforage/localforage.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/config/fetch/fetch.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/service/apis/api-tpings.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/service/dashboard/dashboard.api.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/basics/service/typings/reprot.api.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/lib/dashboard/element/tools.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/lib/dashboard/full-screen/full-screen.d.ts" />
/// <reference path="../../../../../node_modules/@h3/report/lib/data-source/typings/falls.d.ts" />

import {Component, Prop, Vue} from 'vue-property-decorator';
import ElementWrap from '@h3/report/lib/dashboard/element';
import * as Type from '../../type';

export interface ReportOptions {
  container: Vue;
  config: Type.ChartConfig;
  formatGlobal: unknown;
  index: number;
  uid: string;
  maxRow?: number;
  maxCol?: number;
  containerW: number;
  containerH: number;
  containerX: number;
  containerY: number;
  marginTop?: number;
}

/**
 * TSX语法使用报表
 */
@Component({
  name: 'Report',
  components: {
    elementWrap: ElementWrap
  }
})
export default class Report extends Vue {

  @Prop() options!: ReportOptions;

  get reportSize() {
    const {maxRow, maxCol, containerW, containerH, containerX, containerY, config} = this.options;
    const
      x = config.x ? (containerW / (maxRow ?? 1)) * (config.x ?? 1) : 0,
      y = config.y ? (containerH / (maxCol ?? 1)) * (config.y ?? 1) : 0;
    return {
      w: (containerW / (maxRow ?? 1)) * (config.w ?? 1),
      h: (containerH / (maxCol ?? 1)) * (config.h ?? 1),
      x: x ? x + containerX : 0,
      y: y ? y + containerY : 0
    }
  }

  mounted() {
    const {container, uid} = this.options;
    container.$store.commit('report/resizeChartView', {
      type: 'load',
      chart: uid
    });
  }

  render() {

    const {
      config,
      formatGlobal,
      uid,
      index,
      maxRow,
      maxCol,
      marginTop
    } = this.options, {reportSize} = this;

    console.log('config======>', config, 'reportSize======>', reportSize);

    return (
      <div class={`h3-report-container__item`} data-id={uid} style={{
        padding: '3px',
        zIndex: 999,
        width: `${reportSize.w}px`,
        height: `${reportSize.h}px`,
        position: 'absolute',
        left: `${reportSize.x ? `${reportSize.x}px` : 'auto'}`,
        top: `${reportSize.y ? `${reportSize.y}px` : 'auto'}`,
        marginTop:`${marginTop?marginTop:0}px`
      }}>
        <elementWrap
          ref={"elementWrap"}
          element={config}
          global={formatGlobal}
          refresh={false}
          status={"dashboard"}
          elementIndex={index}
        />
      </div>
    );
  }
}
