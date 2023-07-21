import {Component, InjectReactive, Prop, Vue, Watch} from "vue-property-decorator";
import Class from './contractModal.module.less';
import * as tsx from 'vue-tsx-support';

import {Modal} from '@h3/antd-vue';

import Table from 'element-ui/lib/table';
import TableColumn from 'element-ui/lib/table-column';

import {TableColumn as TableColumnType, TableConfig,ProgressLogRes} from "../../type";
import {getContractList} from "../../service/api";

@Component({
  name: 'contractModal',
  components: {
    AModal: Modal,
    ETable: Table,
    ETableColumn: TableColumn,
  }
})
export default class ContractModal extends Vue {

  _tsx!: tsx.DeclareProps<Pick<ContractModal, 'visible' | 'selectedContract' | 'wrapClassName' | 'closeModal'>>

  @InjectReactive('project') projectCode?:string;
  @Prop() visible?: boolean;
  @Prop() selectedContract?: Function;
  @Prop() wrapClassName?: string;
  @Prop() closeModal?: Function;

  private show: boolean = false;

  public mainTablePageConfig: TableConfig<ProgressLogRes> = {
    dataSource: [],
    total: 0,
    current: 1,
    pageSize: 10
  }

  private tableColumn: Array<TableColumnType<ProgressLogRes>> = [
    {
      title: '合同编号',
      dataIndex: 'contractnum',
      key: 'header_0',
      //width: 100,
    },
    {
      title: '项目名称',
      dataIndex: 'projectname',
      key: 'header_1',
      editCmpnt: 'input',
      //width: 100,
    },
    {
      title: '合同名称',
      dataIndex: 'contractname',
      key: 'header_2',
      editCmpnt: 'input',
      width: 150,
    },
    {
      title: '合同所属组织',
      dataIndex: 'contractorgname',
      key: 'header_3',
      editCmpnt: 'input',
      width: 110,
    },
    {
      title: '合同金额',
      dataIndex: 'contracttotalmoney',
      key: 'header_4',
      //width: 80,
    },
    {
      title: '施工单位',
      dataIndex: 'sgcompany',
      key: 'header_5',
      editCmpnt: 'input',
    },
    {
      title: '施工代表',
      dataIndex: 'sgdelegate',
      key: 'header_6',
      editCmpnt: 'input',
    },
    {
      title: '监理单位',
      dataIndex: 'jlcompany',
      key: 'header_7',
      editCmpnt: 'input',
      unit: '℃'
    },
    {
      title: '监理代表',
      dataIndex: 'jldelegate',
      key: 'header_8',
      editCmpnt: 'input',
    },
    {
      title: '业主单位',
      dataIndex: 'yzcompany',
      key: 'header_9',
      editCmpnt: 'input',
    },
    {
      title: '业主代表',
      dataIndex: 'yzdelegate',
      key: 'header_10',
      editCmpnt: 'input',
    }
  ]

  showTotal(page: number): JSX.Element {
    return <span>总共{page}条数据</span>
  }

  @Watch('visible')
  visibleListener(value: boolean) {
    this.show = value;
  }

  public showModal(): void {
    this.show = true;
  }

  public hideModal(): void {
    this.show = false;
  }

  private columnRender({column, row, $index}): JSX.Element {
    const dataIndex: string = column.property;
    return (
      <div class={Class.tdCell}>
        <span class={Class.tdSpan}>{row[dataIndex]}</span>
      </div>
    )
  }

  //@before(log)
  private generateColumn(columns: Array<TableColumnType<ProgressLogRes>>): Array<JSX.Element> {
    const vDom: Array<JSX.Element> = [];
    if (columns.length < 1) return vDom;
    vDom.push(
      <e-table-column
        ref={'firstCheck'}
        type="selection"
        width="55"
        labelClassName={Class.checkBox}
        className={Class.checkCell}
      />
    );

    columns.forEach((item) => {
      vDom.push(
        <e-table-column
          width={`${item.width}`}
          prop={item.dataIndex}
          caonima={item.unit}
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

  mounted(): void {
    getContractList({projectCode:this.projectCode}).then((res) => {
      if (res.errcode !== 0) return;
      this.mainTablePageConfig.dataSource = res.data.data;
      this.mainTablePageConfig.pageSize = res.data.data.length;
      this.mainTablePageConfig.total = res.data.data.length;
      this.mainTablePageConfig.current = 1;
    });
  }

  onTableSelectAll(selection: Array<ProgressLogRes>): void {
    this.$nextTick(()=>{
      //@ts-ignore
      this.$refs.table.clearSelection();
    })

  }

  onTableSelectionChange(selection: Array<ProgressLogRes>): void {
  }

  onTableSelect(selection, row):void{
    this.$nextTick(()=>{
      //@ts-ignore
      this.$refs.table.clearSelection();
      //@ts-ignore
      this.$refs.table.toggleRowSelection(row);
      // this.show=false;
      this.$props.closeModal?.();
      this.$props.selectedContract?.(row);
    })
  }


  render() {
    const
      {$props, show, generateColumn, tableColumn, mainTablePageConfig, onTableSelectionChange, onTableSelectAll,onTableSelect} = this,
      {wrapClassName, closeModal} = $props,
      {dataSource, current, total, pageSize} = mainTablePageConfig;
    return (
      <a-modal
        visible={show}
        destroyOnClose={true}
        maskClosable={false}
        footer={false}
        wrapClassName={wrapClassName}
        onCancel={(e)=>closeModal()}
      >
        <div ref={'tableContent'} class={Class.tableContent}>
          <e-table
            ref={'table'}
            data={dataSource}
            height="100"
            border={true}
            style="width: 100%"
            {...{
              on: {
                'selection-change': onTableSelectionChange,
                'select-all': onTableSelectAll,
                'select':onTableSelect
              }
            }}
          >
            {generateColumn(tableColumn)}
          </e-table>
        </div>
      </a-modal>
    );
  }

}
