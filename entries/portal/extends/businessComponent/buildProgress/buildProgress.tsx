import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import Class from './buildProgress.module.less';
import * as tsx from 'vue-tsx-support';

import Table from "element-ui/lib/table";
import TableColumn from "element-ui/lib/table-column";

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.less';
import {
  batchDeleteMBSBuild,
  getMBSBuild,
  updateMBSBuild
} from "../../service/api";
import {MBSBuild,WBSconnectMBS,WBSreport} from '../../type';
import {TableColumn as TableColumnType, TableConfig} from "../../type";

import omit from "omit.js";
import {Button, Select,} from "@h3/antd-vue";
import Utils from "../../utils";


@Component({
  name: 'buildProgress',
  components: {
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ETable: Table,
    ETableColumn: TableColumn,
    AInput: Input,
  }
})
export default class BuildProgress extends Vue {

  _tsx!: tsx.DeclareProps<Pick<BuildProgress, 'className' | 'id' | 'fromConnectWBS' | 'fromSelectedDetailRow' | 'closeModal' | 'readonly'>>

  @InjectReactive('project') projectCode?:string;
  @Prop() className?: string;
  @Prop() id!: string;
  @Prop() fromConnectWBS?: WBSconnectMBS | null;
  @Prop() fromSelectedDetailRow?: WBSreport | null;
  @Prop() closeModal?: Function;
  @Prop() readonly?: boolean;

  @Watch('fromConnectWBS')
  fromConnectWBSListener(value: WBSconnectMBS) {
    const {dataSource} = this.mainTablePageConfig, {fromSelectedDetailRow, readonly} = this.$props;
    if (readonly) return;
    console.log(value, fromSelectedDetailRow);
    const mergeData = {...fromSelectedDetailRow, ...value};
    //硬编码 TODO:fixed hard-coding
    mergeData.mbs = value.relatedmbs;
    mergeData.reportdatembs = fromSelectedDetailRow.createdtime;
    mergeData.planamountmbs = fromSelectedDetailRow.planamountwbs;
    mergeData.planmoneywbs = fromSelectedDetailRow.planmoneywbs;
    mergeData.reportmoneymbs = fromSelectedDetailRow.reportmoneywbs;
    mergeData.reportamountmbs = fromSelectedDetailRow.reportamountwbs;
    mergeData.edited = true;
    mergeData.tempData = true;
    // mergeData.th04bReportwbsFk = fromSelectedDetailRow.th04aPlandetailFk; //wbs
    mergeData.th04bReportwbsFk = this.queryId?this.queryId:this.$props.id; //工作明细ID
    mergeData.th04aWbsmbsrelaFk = value.id; //mbs
    //mergeData.th04aWbsmbsrelaFk = this.queryId; //mbs
    mergeData.planmoneymbs = value.mbsmoney;
    mergeData.finishstatembs ='未完成';
    console.log('fromMBS',value.id);
    //end
    const tempData = dataSource.concat(mergeData);
    const obj: WBSconnectMBS | WBSreport | {} = {};
    const tableData = tempData.reduce((cur, next) => {
      if (!obj[next.id as string]) {
        obj[next.id as string] = true;
        cur.push(next);
      }
      return cur;
    }, [] as Array<unknown>)
    console.log('fromConnectWBS',tableData);
    this.mainTablePageConfig.dataSource = tableData as Array<MBSBuild | WBSconnectMBS>;
  }

  @Watch('id')
  idListener(value: string) {
    this.queryId = value;
    this.getTableData(value,this.projectCode).catch(err => console.log('err', err));
  }

  private tableColumn: Array<TableColumnType<MBSBuild>> = [
    {
      title: 'MBS',
      dataIndex: 'mbs',
      key: 'header_0',
      //width: 100,
    },
    {
      title: '构建名称',
      dataIndex: 'mbsname',
      key: 'header_1',
      //width: 100,
    },
    {
      title: '设计数量',
      dataIndex: 'planamountmbs',
      key: 'header_2',
      //editCmpnt: 'input',
      //width: 80,
    },
    {
      title: '计划产值',
      dataIndex: 'planmoneymbs',
      key: 'header_3',
      //editCmpnt: 'input',
      //width: 80,
    },
    {
      title: '填报日期',
      dataIndex: 'reportdatembs',
      key: 'header_4',
      //width: 80,
    },
    {
      title: '完成数量',
      dataIndex: 'reportamountmbs',
      key: 'header_5',
      editCmpnt: 'input',
    },
    {
      title: '完成产值',
      dataIndex: 'reportmoneymbs',
      key: 'header_6',
      editCmpnt: 'input',
    },
    {
      title: '构建完成状态',
      dataIndex: 'finishstatembs',
      key: 'header_7',
      render: this.renderSelect
    }
  ]

  private queryId: string | null = null;

  private editTd: NodeList | null = null;

  public mainTablePageConfig: TableConfig<MBSBuild | WBSconnectMBS> = {
    dataSource: [],
    total: 0,
    current: 1,
    pageSize: 10
  }

  private selectionRow: Array<MBSBuild> | null = null;

  private getTableData = Utils.debounce((value:string,projectCode:string)=>{
    const {$refs} = this;
    getMBSBuild({id: value,projectCode:projectCode}).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.errcode === 0) {
        console.log('=====================getTableData=====================',res.data);
        this.mainTablePageConfig.dataSource = res.data as Array<MBSBuild>;
        this.mainTablePageConfig.current = 1;
        this.mainTablePageConfig.pageSize = (res.data as Array<MBSBuild>).length;
        this.mainTablePageConfig.total = (res.data as Array<MBSBuild>).length;
        if ($refs) {
          this.$nextTick(() => {
            (this.$refs.tableContent as HTMLElement).style.display = 'flex';
          })
        }
      }
    })
  },300);
  // private getTableData(value: string): Promise<HttpResponse<MBSBuild>> {
  //   return getMBSBuild({id: value}).then(res => {
  //     if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
  //     if (res.errcode === 0) {
  //       console.log('=====================getTableData=====================',res.data);
  //       this.mainTablePageConfig.dataSource = res.data as Array<MBSBuild>;
  //       this.mainTablePageConfig.current = 1;
  //       this.mainTablePageConfig.pageSize = (res.data as Array<MBSBuild>).length;
  //       this.mainTablePageConfig.total = (res.data as Array<MBSBuild>).length;
  //     }
  //   })
  // }

  private selectedRowFn(row): void {
    this.selectionRow = [row];
  }

  private removeOrActive(nodes: NodeList, way: 'active' | 'passive'): void {
    if (!nodes) return;
    switch (way) {
      case "active":
        (nodes[0] as HTMLElement).style.display = 'none';
        (nodes[1] as HTMLElement).style.display = 'flex';
        (nodes[1] as HTMLElement).focus();
        break;
      case "passive":
        (nodes[0] as HTMLElement).style.display = 'flex';
        (nodes[1] as HTMLElement).style.display = 'none';
        break;
    }
  }

  private findExtra(key: string): TableColumn<MBSBuild> | undefined {
    const {tableColumn} = this;
    const target = tableColumn.find((item) => item.dataIndex === key);
    return target;
  }

  private columnRender({column, row, $index}): JSX.Element {
    const
      {findExtra, editTd, removeOrActive} = this, {readonly} = this.$props,
      dataIndex: string = column.property,
      extraProperty: TableColumn<MBSBuild> = findExtra(dataIndex),
      Pointer: string = typeof extraProperty?.editCmpnt === "function" ? Class.pointer : '';
    if (extraProperty.render) return extraProperty.render(column, row, $index);
    return (
      <div onDblclick={(e) => {
        if (readonly) return;
        if (editTd) removeOrActive(editTd, 'passive');
        if (extraProperty?.editCmpnt !== 'input') return;
        const targetTd: NodeList = (e.currentTarget as HTMLElement).childNodes;
        this.editTd = targetTd;
        removeOrActive(targetTd, 'active');
      }} class={Class.tdCell}>
        <span class={`${Class.tdSpan} ${Class.show} ${Pointer}`}>
          {row[dataIndex]}
          {extraProperty?.unit}
        </span>
        {
          extraProperty?.editCmpnt === 'input' &&
          <a-input
            class={`${Class.tdInput} ${Class.hide}`}
            value={row[dataIndex]}
            maxLength={25}
            onChange={(e) => {
              row[dataIndex] = e.currentTarget.value;
              row.edited = true;
              console.log('afterEdit', row);
            }}
            onBlur={(e) => {
              const reg = Utils.isAmount(e.currentTarget.value);
              if (!reg) {
                row[dataIndex] = 0;
              } else {
                row[dataIndex] = reg;
              }
              removeOrActive(editTd as NodeList, 'passive');
            }}
          />
        }
      </div>
    )
  }

  private generateColumn(columns: Array<TableColumnType<MBSBuild>>): Array<JSX.Element> {
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

  private renderSelect(column, row, $index) {
    const {readonly} = this.$props;
    let vDom: JSX.Element = (<div><span>{row.finishstatembs}</span></div>);

    if (!readonly) {
      console.log('row.finishstatembs',row.finishstatembs);
      vDom = (
        <a-select onChange={(value) => {
          row.finishstatembs = value;
          row.edited = true;
        }} defaultValue={row.finishstatembs}>
          <a-select-option value="未完成">未完成</a-select-option>
          <a-select-option value="已完成">已完成</a-select-option>
        </a-select>
      )
    }
    return vDom;
  }

  mounted(): void {
    const {id} = this.$props, {$refs, queryId} = this;
    if (id) this.getTableData(id,this.projectCode).catch(err => console.log('err', err));
    if ($refs) {
      this.$nextTick(() => {
        (this.$refs.tableContent as HTMLElement).style.display = 'flex';
      })
    }
  }

  saveChanges(): void {
    //console.log('save', this.temporaryOperationData);
    const edited = this.mainTablePageConfig.dataSource.map((item) => item.edited && item);
    //console.log('save', edited);
    const
      dispose = edited.filter(item => item),
      //params = dispose.map(item => omit<MBSBuild, 'cid' | 'edited'>(item as MBSBuild, ['cid', 'edited']));
      params = dispose.map((item) => {
        if (item && (item as MBSBuild).tempData) {
          item.state = 'add';
          return omit<MBSBuild | WBSconnectMBS, 'id'>(item as MBSBuild | WBSconnectMBS, ['id'])
        } else if (item && item.edited) {
          item.state = 'refesh';
          return item;
        }
      }) as Array<MBSBuild>;
    //TODO:保存所有修改行
    console.log('all', params);
    updateMBSBuild(params,this.projectCode).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.errcode === 0) {
        this.$message.success('保存成功!');
        this.$props.closeModal();
      }
    })

  }

  delContract() {
    /*const {selectionRow} = this;
    if (!selectionRow?.length) {
      this.$message.warn('没有选中任何数据');
    } else {
      const
        dispose = selectionRow.map((item) => {
          return {...item}
        }),
        params = dispose.map(item => omit<MBSBuild, 'cid' | 'edited'>(item as MBSBuild, ['cid', 'edited']));
    }*/
    const
      {dataSource} = this.mainTablePageConfig,
      dispose = dataSource.map((item) => {
        return {...item}
      });
    const diff = dispose.filter((item: MBSBuild) => !item.tempData);
    const targetArr:Array<MBSBuild> = [];
    //const params = dispose.map(item => omit<MBSBuild|WBSconnectMBS, 'cid' | 'edited'>(item, ['cid', 'edited']));
    const idsArr = diff.map(item => {
      if (item.id && item.finishstatembs !== '已完成') return item;
    });
    console.log(diff,idsArr);
    const ids = idsArr.map(item => {
      if (item) return item.id;
    }) as Array<string>;
    console.log(ids);
    if (ids.length === 0) return this.$message.warn('没有需要删除的数据');
    batchDeleteMBSBuild(ids,this.projectCode).then(res => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功!');
      this.$props.closeModal();
    });

  }


  render() {
    const
      {$props, tableColumn, mainTablePageConfig, generateColumn, selectedRowFn} = this,
      {dataSource, current, total, pageSize} = mainTablePageConfig,
      {className, readOnly} = $props;
    return (
      <article ref={'main'} class={`${Class.main} ${className && className}`}>
        <nav ref={'nav'}>{!readOnly && '填报工作明细' || '构建进度填报'}</nav>
        {
          !readOnly &&
          <aside ref={'optPanel'} class={Class.optPanel}>
            <a-button onClick={this.saveChanges}>保存</a-button>
            <a-button onClick={this.delContract}>删除</a-button>
          </aside>
        }
        <div ref={'tableContent'} class={Class.tableContent}>
          <e-table
            ref={'table'}
            data={dataSource}
            height="380"
            border={true}
            style="width: 100%"
            {...{
              on: {
                'row-click': selectedRowFn,
              }
            }}
          >
            {generateColumn(tableColumn)}
          </e-table>
        </div>
      </article>
    );
  }
}
