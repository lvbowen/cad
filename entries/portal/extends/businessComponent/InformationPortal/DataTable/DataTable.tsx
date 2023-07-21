import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import Class from './DataTable.module.less';
import * as tsx from 'vue-tsx-support';
import {DataTable as TableData, tabData, TableColumn, TableConfig} from '../../../type';

import {Table} from '@h3/antd-vue';


@Component({
  name: 'DataTable',
  components: {
    ATable: Table
  }
})
export default class DataTable<T> extends Vue {

  _tsx!: tsx.DeclareProps<Pick<DataTable<T>, 'className' | 'tableColumn' | 'dataSources' | 'active' | 'getTableDataFn'|'noTableHead'>>

  @Prop() className?: string;
  @Prop() tableColumn?: Array<TableColumn<T>>;
  @Prop() dataSources?: TableData<T>;
  @Prop() active?: number;
  @Prop() noTableHead?:boolean;
  @Prop() getTableDataFn?: () => Promise<T>


  private activeKey: number | string = 0;

  private mainTableConfig: TableConfig<T> = {
    dataSource: [],
    total: 0,
    pageSize: 10,
    current: 1
  }

  @Watch('dataSources',{immediate:true})
  dataSourcesListener(value: TableData<T>) {
    if (value && value.tabs.size > 0) this.activeKey = value.tabs.entries().next().value[0];
  }

  @Watch('active')
  activeListener(value: number) {
    if (!isNaN(value)) this.activeKey = value;
  }

  @Watch('mainTableConfig.current')
  pageCurrentListener(num: number) {
    this.getTableData('', num, 10);
  }

  @Watch('activeKey')
  activeKeyListener(key: number | string) {
    const {mainTableConfig} = this, {current, pageSize} = mainTableConfig;
    this.getTableData(key, current, pageSize);
  }

  private getTableData(param: unknown, pageIndex: number, pageSize: number) {
    //TODO:请求对应的接口
    const {$props} = this, {getTableDataFn} = $props;
    getTableDataFn?.(param, pageIndex, pageSize).then(res => {
      if (res.code !== 0) return this.$message.error(res.errmsg);
      this.mainTableConfig.dataSource = res.data.data;
      this.mainTableConfig.total = res.data.total;
    });
  }

  private tabClickEvent(key: number | string) {
    const {activeKey} = this;
    if (activeKey !== key) this.activeKey = key;
  }

  private renderTabs(data: Map<number | string, tabData<T>>): Array<JSX.Element> {
    if (!data.size) return [<div/>];
    const vNode: Array<JSX.Element> = [], {activeKey, tabClickEvent} = this;
    data.forEach((item) => {
      vNode.push(
        <div onClick={() => tabClickEvent(item.key)} data-active={item.key === activeKey}
             class={Class.navTab}>
          <span>{item.name}</span>
        </div>
      )
    });
    return vNode;
  }

  mounted() {
    this.getTableData('', 1, 10);
  }

  render() {
    const {$props, renderTabs, mainTableConfig} = this, {
      className,
      tableColumn,
      dataSources,
      noTableHead
    } = $props, {
      title,
      tabs
    } = dataSources, {dataSource} = mainTableConfig;
    return (
      <article class={`${Class.main} ${className ?? ''}`}>
        <nav>
          <span>{title}</span>
          <div class={Class.tabs}>{renderTabs(tabs)}</div>
        </nav>
        <section class={noTableHead?Class.noTableHead:null}>
          <a-table pagination={false} bordered={false} columns={tableColumn} dataSource={dataSource} size={'small'}/>
        </section>
      </article>
    );
  }
}
