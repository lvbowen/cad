import {Component, Vue} from "vue-property-decorator";
import Class from './InformationPortal.module.less';
import CommonHeader from '../../../src/components/shared/header/header.vue';
import {EChartOption} from "echarts";
import Panel from "./Panel/Panel";
import DataTable from "./DataTable/DataTable";
import Charts from "./Charts/Charts";
import {PanelData, TableColumn} from "../../type";
import moment from "moment";
import Utils from "../../utils";
import {Icon} from "../../basicCustomComponent";


@Component({
  name: 'InformationPortal',
  components: {
    CommonHeader: CommonHeader,
    Panel,
    DataTable,
    Charts,
  }
})

export default class InformationPortal extends Vue {

  private panelData: Array<PanelData<unknown>> = [
    {
      name: '基础项目信息',
      icon: 'info2'
    },
    {
      name: '项目前期管理',
      icon: 'info2'
    },
    {
      name: '计划管理',
      icon: 'info3'
    },
    {
      name: '上报管理',
      icon: 'info4'
    },
    {
      name: '廉政监督管理',
      icon: 'info5'
    },
    {
      name: '费用管理',
      icon: 'info6'
    },
    {
      name: '合同管理',
      icon: 'info2'
    },
    {
      name: '其他设置',
      icon: 'info2'
    },
    {
      name: '其他讯息',
      icon: 'info2'
    },
  ];

  private renderDate(value: string, record, index: number): JSX.Element {
    return <span>{moment(value).format('MM月DD日')}</span>
  }

  private renderTime(value: string, record, index: number): JSX.Element {
    return <span>{moment(value).format('HH:mm:ss')}</span>
  }

  private renderLevel(value: string, record, index: number): JSX.Element {
    switch (value) {
      case '1':
        return <div class={Class.levelTips}>
          <Icon src={'serious'}/>
          <span>一级</span>
        </div>;
      case '2':
        return <div class={Class.levelTips}>
          <Icon src={'medium'}/>
          <span>二级</span>
        </div>;
      case '3':
        return <div class={Class.levelTips}>
          <Icon src={'normal'}/>
          <span>三级</span>
        </div>
      default:
        return <div/>;
    }
  }

  private renderReadingState(value: string, record, index: number): JSX.Element {
    switch (value) {
      case '1':
        return <div class={Class.readTips}><Icon src={'read'}/></div>;
      case '2':
        return <div class={Class.readTips}><Icon src={'unread'}/></div>;
      default:
        return <div/>;
    }
  }

  private myWorkColumn: Array<TableColumn<unknown>> = [
    {
      title: '收件日期',
      align: 'center',
      dataIndex: 'Date',
      key: Utils.uuid(),
      customRender: this.renderDate
    },
    {
      title: '收件时间',
      align: 'center',
      dataIndex: 'Time',
      key: Utils.uuid(),
      customRender: this.renderTime
    },
    {
      title: '发件人',
      align: 'center',
      dataIndex: 'Sender',
      key: Utils.uuid(),
    },
    {
      title: '主题',
      align: 'center',
      dataIndex: 'Theme',
      key: Utils.uuid(),
    },
    {
      title: '附件',
      align: 'center',
      dataIndex: 'extra',
      key: Utils.uuid(),
    }
  ];

  private infoServiceColumn: Array<TableColumn<unknown>> = [
    {
      title: '主题',
      align: 'center',
      dataIndex: 'Theme',
      key: Utils.uuid(),
    },
    {
      title: '发生日期',
      align: 'center',
      dataIndex: 'Date',
      key: Utils.uuid(),
      customRender: this.renderDate
    },
    {
      title: '风险等级',
      align: 'center',
      dataIndex: 'Level',
      key: Utils.uuid(),
      customRender: this.renderLevel
    },
    {
      title: '发生项目',
      align: 'center',
      dataIndex: 'project',
      key: Utils.uuid(),
    }
  ];

  private alertsColumn: Array<TableColumn<unknown>> = [
    {
      title: '',//是否已读
      dataIndex: 'read',
      width: '25px',
      key: Utils.uuid(),
      customRender: this.renderReadingState
    },
    {
      title: '',//消息标题
      dataIndex: 'title',
      key: Utils.uuid(),
    },
    {
      title: '',//时间
      align: 'right',
      dataIndex: 'Time',
      key: Utils.uuid(),
      customRender: this.renderTime
    }
  ]

  private myWorkNavigator = {
    title: '我的工作',
    tabs: new Map([
      [1, {name: '代阅邮件', key: 1}],
      [2, {name: '待办任务', key: 2}],
      [3, {name: '办结任务', key: 3}],
      [4, {name: '内部消息', key: 4}],
    ])
  }

  private infoServiceNavigator = {
    title: '信息服务',
    tabs: new Map([
      [1, {name: '预警信息', key: 1}],
      [2, {name: '督办管理', key: 2}],
      [3, {name: '局内资料', key: 3}],
      [4, {name: '各种规范', key: 4}]
    ])
  }

  private alertsNavigator = {
    title: '消息通知',
    tabs: new Map([
      [1, {name: '系统通知', key: 1}],
      [2, {name: '督办管理', key: 2}],
      [3, {name: '局内资料', key: 3}],
      [4, {name: '各种规范', key: 4}]
    ])
  }

  private getMyWork(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      resolve(import('./mockData/myWorkMock.json'))
    })
  }

  private getInfoService(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      resolve(import('./mockData/infoServiceMock.json'))
    })
  }

  private getAlerts(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      resolve(import('./mockData/alerts.json'))
    })
  }

  private getWaterLevel():Promise<Array<[string, number]>>{
    return new Promise((resolve, reject) => {
      resolve(import('./mockData/waterLevel.json'))
    })
  }

  private chartsOpt:EChartOption =  Charts.getLineConfig({
    area: true,
    data: [],
    day: false,
    tooltipFormat: arg => `<div >${arg[0].value[1]}TH/s</div>`,
    detailConfig: {
      xLinexColor: '#E6E6E6',
      xLabelColor: '#999999',
      yLinexColor: '#E6E6E6',
      yLabelColor: '#999999',
      dataTitle: '',
      nameTextColor: '#666666',
      unit: '水位(ml)',
      //yAxisFormat: yAxisFormat
    }
  });

  mounted(){
    const { getWaterLevel } = this;
    getWaterLevel().then(res=>{
      this.chartsOpt = Charts.getLineConfig({
        area: true,
        //@ts-ignore
        data: res.default,
        day: false,
        borderColor:'#1E88E5',
        backgroundColor:'#1E88E5',
        extraCssText:'border-radius: 11px !important;padding:0 !important;',
        tooltipFormat: arg => `<div class="${Class.tootTip}"><div data-role="badge"></div><span>${arg[0].value[1]}</span></div>`,
        detailConfig: {
          xLinexColor: '#E6E6E6',
          xLabelColor: '#999999',
          yLinexColor: '#E6E6E6',
          yLabelColor: '#999999',
          dataTitle: '',
          nameTextColor: '#666666',
          unit: '水位(ml)',
          //yAxisFormat: yAxisFormat
        }
      })
    })
  }

  render() {
    const {
      panelData,
      myWorkColumn,
      infoServiceColumn,
      alertsColumn,
      myWorkNavigator,
      infoServiceNavigator,
      alertsNavigator,
      getMyWork,
      getInfoService,
      getAlerts,
      //test
      chartsOpt
    } = this;
    return (
      <article class={Class.main}>
        <common-header subtitle={'信息门户'}/>
        <section class={Class.content}>
          <Panel dataSources={panelData}/>
          <section class={Class.cardSection}>
            <DataTable className={Class.myWork} tableColumn={myWorkColumn}
                       dataSources={myWorkNavigator} getTableDataFn={getMyWork}/>
            <DataTable className={Class.infoService} tableColumn={infoServiceColumn}
                       dataSources={infoServiceNavigator} getTableDataFn={getInfoService}/>
          </section>
          <section class={Class.cardSection}>
            <Charts title={'统计分析'} class={Class.analysis} Config={chartsOpt}/>
            <DataTable noTableHead={true} className={Class.alerts} tableColumn={alertsColumn}
                       dataSources={alertsNavigator} getTableDataFn={getAlerts}/>
          </section>
        </section>
      </article>
    );
  }
}
