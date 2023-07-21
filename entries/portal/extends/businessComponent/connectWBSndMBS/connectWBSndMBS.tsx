import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import Class from './connectWBSndMBS.module.less';
import * as tsx from 'vue-tsx-support';

import Table from 'element-ui/lib/table';
import TableColumn from 'element-ui/lib/table-column';
import {TableColumn as TableColumnType, TableConfig,PageTableRes,WBSconnectMBS, WBSreport} from "../../type";
import {
  getWBSndMBS,
  updateWBSndMBS,
} from "../../service/api";
import moment from "moment";
import omit from "omit.js";
import {HttpResponse} from "@cloudpivot/api/src/response";
import Utils from "../../utils";

import {Pagination} from '@h3/antd-vue';
import {TableColumn as elTableColumn} from "element-ui/types/table-column";

interface CommonTableColumn<T> extends Omit<TableColumnType<T>, 'type'>, elTableColumn {
}


@Component({
  name: 'connectWBSndMBS',
  components: {
    ETable: Table,
    ETableColumn: TableColumn,
    APagination: Pagination
  }
})
export default class ConnectWBSndMBS extends Vue {

  _tsx!: tsx.DeclareProps<Pick<ConnectWBSndMBS, 'className' | 'id' | 'rowOnSelected'>>

  @InjectReactive('project') projectCode?:string;

  @Prop() className?: string;
  @Prop() id!: string;
  @Prop() rowOnSelected!: Function;

  @Watch('id')
  idListener(value: string) {
    const {current, pageSize} = this.mainTablePageConfig;
    this.receivedId = value;
    this.getTableData(value, pageSize, current);
  }

  @Watch('mainTablePageConfig.current')
  pageChangeListener() {
    const
      {current, pageSize} = this.mainTablePageConfig,
      {$props, getTableData} = this,
      {id} = $props;
    this.getTableData(id, pageSize, current)
    this.tableBodyToBottom(false);
  }

  private tableStore: Array<WBSconnectMBS> | null = null;

  private receivedId:string | null = null;

  private selectedRow: WBSconnectMBS | null = null;

  private tableColumn: Array<TableColumnType<WBSconnectMBS>> = [
    {
      title: '所关联的MBS编码 ',
      dataIndex: 'relatedmbs',
      key: 'header_0',
      //width: 100,
    },
    {
      title: 'MBS名称',
      dataIndex: 'mbsname',
      key: 'header_1',
      //width: 100,
    },
    {
      title: '单位',
      dataIndex: 'planunit',
      key: 'header_2',
      //editCmpnt: 'input',
      //width: 80,
    },
    {
      title: '综合单价',
      dataIndex: 'planunitprice',
      key: 'header_3',
      //editCmpnt: 'input',
      //width: 80,
    },
    {
      title: '计划工期',
      dataIndex: 'planperiod',//reportperiod
      key: 'header_4',
      render: this.calcWorkDate
      //width: 80,
    },
    {
      title: '实际开始',
      dataIndex: 'reportstart',
      key: 'header_5',
      //editCmpnt: 'input',
      render: this.workStartDate
    },
    {
      title: '实际结束',
      dataIndex: 'reportend',
      key: 'header_6',
    },
    {
      title: '构件设计数量',
      dataIndex: 'mbsamount;',
      key: 'header_7',
      render:this.renderAmount
      // unit: '℃'
    },
    {
      title: '构件计划产值',
      dataIndex: 'mbsmoney;',
      key: 'header_99',
      render:this.renderMoney
    }
  ]

  private renderAmount(column, row, $index){
    return <div><span>{row.mbsamount}</span></div>
  }

  private renderMoney(column, row, $index){
    return <div><span>{row.mbsmoney}</span></div>
  }

  public mainTablePageConfig: TableConfig<WBSconnectMBS> = {
    dataSource: [],
    total: 0,
    current: 1,
    pageSize: 10
  }

  private selectedRowDebounce = Utils.debounce((row: WBSconnectMBS) => {
    if (!row.workStartDate) {
      row.workStartDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      row.edited = true;
      //TODO:调用save接口保存日期
      console.log(this.mainTablePageConfig.dataSource);
      const {dataSource, current, pageSize} = this.mainTablePageConfig, {receivedId:id} = this;
      const
        filter = dataSource.filter((item) => item.edited),
        dispose = filter.map((item) => {
          return {...item}
        }),
        params = dispose.map(item=>{
          if(item.edited){
            item.state='refesh';
            return item;
          }
        });
      const reqArr = params.map(item => omit<WBSconnectMBS, 'cid' | 'edited'>(item as WBSconnectMBS, ['cid', 'edited']));
      //TODO:实际开始 实际结束 未有字段
      //this.updateDataDebounce(reqArr);
      /*this.updateDataDebounce(params).then((res) => {
        if (res.errcode === 0) this.getTableData(id as string, pageSize, current).then(resolve => {
          this.selectedRow = row;
          this.$props.rowOnSelected?.(row);
        });
      });*/
    }
  }, 300);

  private updateDataDebounce = Utils.debounce((params: Array<WBSconnectMBS>) => {
    updateWBSndMBS(params,this.projectCode).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.errcode === 0) return res;
    })
  }, 300);

  private getTableData(value: string, pageSize: number, current: number): Promise<HttpResponse<WBSconnectMBS>> {
    return getWBSndMBS({id: value, pageSize: pageSize, pageNum: current,projectCode:this.projectCode}).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.errcode === 0) {
        const {data, totalSize} = res.data as PageTableRes<WBSconnectMBS>;
        this.mainTablePageConfig.dataSource = data;
        this.mainTablePageConfig.total = totalSize;
      }
    })
  }

  private selectedRowFn(row: WBSconnectMBS): void {
    //this.selectedRowDebounce(row);
  }

  private findExtra(key: string): TableColumn<WBSconnectMBS> | undefined {
    const {tableColumn} = this;
    const target = tableColumn.find((item) => item.dataIndex === key);
    return target;
  }

  private calcWorkDate(column: TableColumn<WBSconnectMBS>, row: WBSconnectMBS, $index): JSX.Element {
    const {wbsplanstart, wbsplanend} = row;
    return <span>{moment(wbsplanend).diff(moment(wbsplanstart), 'days')}</span>
  }

  private workStartDate(column: TableColumn<WBSconnectMBS>, row: WBSconnectMBS, $index): JSX.Element {
    return <span>{row.workStartDate}</span>
  }

  private columnRender({column, row, $index}): JSX.Element {
    const
      {findExtra} = this,
      dataIndex: string = column.property,
      extraProperty: TableColumn<WBSconnectMBS> = findExtra(dataIndex),
      Pointer: string = typeof extraProperty?.editCmpnt === "function" ? Class.pointer : '';
    if (extraProperty.render) return extraProperty.render(column, row, $index);
    return (
      <div class={Class.tdCell}>
        <span class={`${Class.tdSpan} ${Class.show} ${Pointer}`}>
          {row[dataIndex]}
          {extraProperty?.unit}
        </span>
      </div>
    )
  }

  private generateColumn(columns: Array<TableColumnType<WBSconnectMBS>>): Array<JSX.Element> {
    const vDom: Array<JSX.Element> = [];
    if (columns.length < 1) return vDom;
    columns.forEach((item) => {
      vDom.push(
        <e-table-column
          width={`${item.width}`}
          prop={item.dataIndex}
          label={item.title}
          className={Class.bodyCell}
          scopedSlots={{
            default: this.columnRender,
          }}
        />
      )
    });
    return vDom;
  }

  private addToBuildProgress(row: WBSconnectMBS, column: CommonTableColumn<WBSconnectMBS>, $index: number):void{
    if(row.finishstatembs==='已完成'){
      this.$message.warn('该构件已完工，无法继续填报！')
    }else{
      this.$props.rowOnSelected?.(row);
      //this.selectedRowDebounce(row);
    }
  }

  tableBodyToBottom(top?: boolean): void {
    this.$nextTick(() => {
      const targetBody: HTMLElement = ((this.$refs.table as Vue).$el as HTMLElement).childNodes[2] as HTMLElement;
      if (!top) {
        targetBody.scrollTop = 0;
      } else {
        targetBody.scrollTop = targetBody.scrollHeight;
      }
    });
  }

  showTotal(page: number): JSX.Element {
    return <span>总共{page}条数据</span>
  }

  mounted() {
    const {id} = this.$props, {$refs, mainTablePageConfig} = this, {pageSize, current} = mainTablePageConfig;
    if (id) this.getTableData(id, pageSize, current).catch(err => console.log('err', err));
    if ($refs) {
      this.$nextTick(() => {
        (this.$refs.tableContent as HTMLElement).style.display = 'flex';
      })
    }
  }

  render() {
    const
      {$props, tableColumn, mainTablePageConfig, generateColumn, selectedRowFn,addToBuildProgress} = this,
      {dataSource, current, total, pageSize} = mainTablePageConfig,
      {className} = $props;
    return (
      <article ref={'main'} class={`${Class.main} ${className && className}`}>
        <nav ref={'nav'}>WBS关联MBS</nav>
        <div ref={'tableContent'} class={Class.tableContent}>
          <e-table
            ref={'table'}
            data={dataSource}
            height="100"
            border={true}
            style="width: 100%"
            {...{
              on: {
                'row-click': selectedRowFn,
                'row-dblclick':addToBuildProgress
              }
            }}
          >
            {generateColumn(tableColumn)}
          </e-table>
          <a-pagination
            className={Class.pagination}
            current={current}
            total={total}
            showTotal={this.showTotal}
            onChange={page => this.mainTablePageConfig.current = page}
          />
        </div>
      </article>
    );
  }
}
