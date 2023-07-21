import { Component, InjectReactive, Prop, Vue, Watch } from "vue-property-decorator";
import Class from './WBSCodeManage.module.less';
import * as tsx from 'vue-tsx-support';
import { getMBSBottom, getMBSChild, getSimplifiedTree } from "../../service/api";
import { TableColumn as TableColumnType, AggregationTable, WBSreport } from "../../type";

import ETable from 'element-ui/lib/table';
import Modal from "ant-design-vue/lib/modal";
import ADatePicker from "ant-design-vue/lib/date-picker";
import InputNumber from "ant-design-vue/lib/input-number";
import "ant-design-vue/lib/modal/style/index.css";
import TableColumn from "element-ui/lib/table-column";
import 'element-ui/lib/theme-chalk/index.css';
import type { TableColumn as elTableColumn } from 'element-ui/types/table-column';
import { Button, Input, Table } from '@h3/antd-vue';
import { MergeWBSStructure } from '../../construction';
import omit from 'omit.js';
import Utils from "../../utils";
import { GanttClass } from '@ctesi/component';
import * as Type from '../../type';
import * as Api from '../../service/api';

// import * as ATable from 'ant-design-vue/lib/table/Table';
// import 'ant-design-vue/lib/table/style/index.css';

interface reduceWork {
    [propsName: string]: boolean
}

interface CommonTableColumn<T> extends Omit<TableColumnType<T>, 'type'>, elTableColumn {
}

@Component({
    name: 'WBSCodeMange',
    components: {
        ETable: ETable,
        InputNumber: InputNumber,
        ADatePicker: ADatePicker,
        ETableColumn: TableColumn,
        AButton: Button,
        AInput: Input,
        ATable: Table
    }
})
export default class WBSCodeManage extends Vue {

    _tsx!: tsx.DeclareProps<Pick<WBSCodeManage, 'logId' | 'leftColumn' | 'rightColumn' | 'rightTableData' | 'closeModal' | 'ganttRef' | 'withWBS' | 'bsRemoveFn'>>

    @InjectReactive('project') projectCode?: string;
    @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

    @Prop() logId?: number | string;
    @Prop() leftColumn?: Array<TableColumnType<unknown>>;
    @Prop() rightColumn?: Array<TableColumnType<unknown>>;
    @Prop() rightTableData?: Array<unknown>;
    @Prop() closeModal?: Function;
    @Prop() withWBS?: any;
    @Prop() ganttRef?: any;
    @Prop() bsRemoveFn?: Function;

    private rightTableSelection: Array<string> = [];

    private saveLoading: boolean = false;

    private delLoading: boolean = false;

    private mainTablePageConfig: AggregationTable<GanttClass.GanttTask<Type.WBSNdMBS>, GanttClass.GanttTask<Type.WBSNdMBS>> = {
        leftDataSource: [],
        rightDataSource: []
    }

    private temporaryOperationData: AggregationTable<GanttClass.GanttTask<Type.WBSNdMBS>, GanttClass.GanttTask<Type.WBSNdMBS>> = {
        rightDataSource: [],
        rightTempData: []
    }

    private mouseDown: boolean = false;

    private cursorRef: number | null = null;

    private mouseDistance: number = 0;

    private dragging: boolean | null = null;

    private selectionRow: Array<GanttClass.GanttTask<Type.WBSNdMBS>> | null = null;

    private editTd: NodeList | null = null;

    private showBatchBtn: boolean = false;

    private batchAmount: number = 0;
    private batchMoney: number = 0;

    private expandedKeys: Array<string> = []

    private modalTableList: Array<any> = []
    private SelectedLists: Array<any> = []
    private dialogVisible2: boolean = false;
    private dialogStartTime: boolean = false;
    private dialogEndTime: boolean = false;
    private dialogNumber: boolean = false;
    private dialogOutputValue: boolean = false;
    private endTime: string = "";
    private StartTime: string = "";
    private Work: string = "0";
    private Weight: string = "0";

    private LeftTableColumn: Array<TableColumnType<WBSreport>> = [
        // {
        //   title: '序号',
        //   dataIndex: 'NonexistentData',
        //   key: 'header_1',
        //   type: 'index',
        //   width:55
        // },
        {
            title: '编码',
            // dataIndex: 'wbs',
            dataIndex: 'qbsCode',
            //   dataIndex: 'codeValue',
            key: 'id',
            // render: this.renderCode,
            width: 200
        },
        {
            title: '任务名称',
            // dataIndex: 'plandetailname',
            dataIndex: 'qbsName',
            //   dataIndex: 'taskName',
            key: 'qbs'
        }
    ]

    private RightTableColumn: Array<TableColumnType<WBSreport>> = [
        {
            title: '编码',
            // dataIndex: 'reportwbs',
            dataIndex: 'bs',
            key: 'id',
            align: 'center'
            //width: 100,
        },
        {
            title: '名称',
            // dataIndex: 'worknamewbs',
            dataIndex: 'Name',
            key: 'header_1',
            align: 'center'
            //width: 100,
        },
        {
            title: '计划开始时间',
            // dataIndex: 'plandetailstart',
            dataIndex: 'Start',
            key: 'header_99',
            align: 'center',
            width: 130,
        },
        {
            title: '计划结束时间',
            // dataIndex: 'plandetailstart',
            dataIndex: 'Finish',
            key: 'header_98',
            width: 130,
            align: 'center'
        },
        {
            title: '计划数量',
            // dataIndex: 'planamountwbs',
            dataIndex: 'Work',
            key: 'header_6',
            align: 'center'
        },
        {
            title: '计划产值',
            // dataIndex: 'planmoneywbs',
            dataIndex: 'Weight',
            align: 'center',
            key: 'header_7',
        },
        {
            title: '所关联的MBS按钮',
            align: 'center',
            key: '所关联的MBS按钮',
            scopedSlots: { customRender: "所关联的MBS按钮" }
        },
        /*{
          title: '子计划开始',
          // dataIndex: 'plandetailstart',
          dataIndex:'Start',
          key: 'header_99',
          width: 110,
        },
        {
          title: '子计划结束',
          // dataIndex: 'plandetailend',
          dataIndex:'End',
          key: 'header_98',
          width: 110,
        },
        {
          title: '子计划工期',
          // dataIndex: 'planedTimeLimit',
          dataIndex:'Duration',
          key: 'header_97',
          width: 110,
          render: this.renderWorkTL
        },
        {
          title: '单位',
          // dataIndex: 'metricwbs',
          dataIndex:'planDetailUnit',
          key: 'header_3',
          //width: 80,
        },
        {
          title: '单价',
          // dataIndex: 'unitpricewbs',
          dataIndex:'planDetailUnitPrice',
          key: 'header_5',
        },
        {
          title: '计划数量',
          // dataIndex: 'planamountwbs',
          dataIndex:'planDetailAmount',
          key: 'header_6',
        },
        {
          title: '计划产值',
          // dataIndex: 'planmoneywbs',
          dataIndex:'planDetailMoney',
          key: 'header_7',
        },
        {
          title: '填报数量',
          dataIndex: 'reportamountwbs',
          key: 'header_8',
          editCmpnt: 'input'
        },
        {
          title: '填报产值',
          dataIndex: 'reportmoneywbs',
          key: 'header_9',
          editCmpnt: 'input'
        }*/
    ]

    private action: 'add' | 'delete' | null = null;

    // @Watch('withWBS', { immediate: true })
    // withWBSListener(tasks) {
    //     if (tasks.children) {
    //         this.action = 'add';
    //         this.mainTablePageConfig.rightDataSource = tasks.children.concat([]);
    //         this.$nextTick().then(() => {
    //             this.action = null;
    //         })
    //     }
    // }
    mounted() {
        const { logId, rightTableData } = this.$props, { $refs } = this;
        getSimplifiedTree({ appCode: this.projectCode, projectName: this.projectConfig?.projectName ?? "" }).then(res => {
            if (res.errcode !== 0) this.$message.error(res.errmsg as string);
            this.mainTablePageConfig.leftDataSource = res.data;
            this.expandedKeys = []
            res.data?.forEach(element => {
                this.expandedKeys.push(element.id)
            });
        });
        if (rightTableData) {
            console.log('rightTableData', rightTableData);
            try {
                this.mainTablePageConfig.rightDataSource = JSON.parse(JSON.stringify(rightTableData));
            } catch (e) {
                console.error('parse RightDataSource Error ====>', e);
            }
        }
        if ($refs) {
            this.cursorRef = (this.$refs.cursor as HTMLElement).offsetLeft;
            this.$nextTick(() => {
                (this.$refs.tableContentLeft as HTMLElement).style.display = 'flex';
                (this.$refs.tableContentRight as HTMLElement).style.display = 'flex';
            })
        }
    }

    render() {
        const {
            mainTablePageConfig,
            LeftTableColumn,
            expandedKeys,
            RightTableColumn,
            generateColumn,
            regNumber,
            onTableSelectionChange,
            wbsDBClick,
            wbsCtxMenu,
            rowClassName,
            lazyLoad,
            mouseDown,
            setLeftTableWidth,
            showBatchBtn,
            rightTableSelection,
            saveLoading
        } = this,
            { leftDataSource, rightDataSource } = mainTablePageConfig;
        return (
            <article
                class={Class.main}
                onContextmenu={(e: MouseEvent) => {
                    e.preventDefault();
                }}
                onMousemove={(e: MouseEvent) => {
                    if (!mouseDown) return;
                    this.dragging = true;
                    const standards: number = this.cursorRef as number;
                    const distance = e.clientX - standards;
                    this.mouseDistance = distance;
                }}
                onMouseup={(e: MouseEvent) => {
                    if (!this.dragging) return;
                    this.mouseDown = false;
                    this.cursorRef = e.clientX;
                    setLeftTableWidth();
                    this.dragging = false;
                }}
            >

                <main ref={'tableContentLeft'} class={Class.tableContent}>
                    <e-table
                        ref={'tableLeft'}
                        data={leftDataSource}
                        height="750"
                        border={true}
                        style="width: 100%"
                        rowKey='id'
                        defaultExpandedRowKeys={expandedKeys}
                        lazy
                        load={lazyLoad}
                        treeProps={{ children: 'childs', hasChildren: 'childCount' }}
                        {...{
                            on: {
                                'row-dblclick': wbsDBClick,
                                'row-contextmenu': wbsCtxMenu,
                            }
                        }}
                    >
                        {generateColumn(LeftTableColumn, 'left')}
                    </e-table>
                </main>
                <div
                    ref={'cursor'}
                    class={Class.dragLine}
                    onMousedown={(e: MouseEvent) => {
                        this.mouseDown = true;
                        this.cursorRef = e.clientX;
                    }}
                    onMouseup={(e: MouseEvent) => {
                        this.mouseDown = false;
                        this.cursorRef = e.clientX;
                        setLeftTableWidth();
                        this.dragging = false;
                    }}
                />
                <main ref={'tableContentRight'} class={Class.tableContentRight}>
                    <nav class={Class.optPanel}>
                        <span>新增选择表</span>
                        <aside>
                            <a-button loading={saveLoading} onClick={this.save}>确认选择</a-button>
                            <a-button loading={this.delLoading} onClick={this.delete}>删除</a-button>
                            <a-button onClick={this.close}>关闭</a-button>
                            <a-button onClick={this.ModifyStartTime}>批量修改计划开始时间</a-button>
                            <a-button onClick={this.ModifyEndTime}>批量修改计划结束时间</a-button>
                            <a-button onClick={this.ModifyNumber}>修改计划数量</a-button>
                            <a-button onClick={this.ModifyOutputValue}>修改计划产值</a-button>
                            <div class={`${Class.batchOperation} ${showBatchBtn && Class.out || Class.in}`}>
                                <span>批量填报数量：</span>
                                <a-input onBlur={(e) => this.regNumber(e, 'batchAmount')}
                                    value={this.batchAmount}
                                    onChange={(e) => this.batchAmount = e.currentTarget.value} />
                                <span>批量填报产值：</span>
                                <a-input onBlur={(e) => this.regNumber(e, 'batchMoney')}
                                    value={this.batchMoney}
                                    onChange={(e) => this.batchMoney = e.currentTarget.value} />
                                {/*<a-button onClick={this.batchInput}>确定设置</a-button>*/}
                            </div>
                        </aside>
                    </nav>
                    <A-Table
                        rowKey={'ID'}
                        ref={'tableRight'}
                        rowSelection={{
                            // hideDefaultSelections: true,
                            // type: 'radio',
                            selectedRowKeys: rightTableSelection,
                            onChange: onTableSelectionChange
                        }}
                        columns={RightTableColumn}
                        dataSource={rightDataSource}
                    >
                        {/* <template slot="name" slot-scope={"text, record"}>
                            <editable-cell text={"text"} Change="onCellChange(record.key, 'name', $event)" />
                        </template> */}
                        {<template slot={"所关联的MBS按钮"} slot-scope={'text,scope'}>
                            <a onClick={(scope) => this.tableShow(scope)} href="javascript:;">查看</a>
                        </template>}
                    </A-Table>
                    {/* <e-table
            ref={'tableRight'}
            data={rightDataSource}
            height="750"
            border={true}
            style="width: 100%"
            rowKey='id'
            rowClassName={rowClassName}
            {...{
              on: {
                'selection-change': onTableSelectionChange,
              }
            }}
          >
            {generateColumn(RightTableColumn, 'right', true, true)}
          </e-table>*/ }
                </main>
                <Modal
                    title="所关联的MBS"
                    visible={this.dialogVisible2}
                    destroyOnClose={true}
                    maskClosable={false}
                    footer={false}
                    onCancel={(e) => {
                        this.dialogVisible2 = false;
                    }}
                >
                    <e-table
                        data={this.modalTableList}
                        height="600"
                        border={true}
                        style="width: 100%"
                    >
                        <el-table-column prop="codeValue" label="编码" />
                        <el-table-column prop="taskName" label="名称" />
                    </e-table>
                </Modal>
                <Modal
                    title="批量修改计划开始时间"
                    visible={this.dialogStartTime}
                    destroyOnClose={true}
                    maskClosable={false}
                    onOk={this.StartTimeOk}
                    onCancel={(e) => {
                        this.dialogStartTime = false;
                    }}
                >
                    <a-date-picker format={"YYYY-MM-DD"} onChange={this.changeStartTime} />
                </Modal>
                <Modal
                    title="批量修改计划结束时间"
                    visible={this.dialogEndTime}
                    destroyOnClose={true}
                    maskClosable={false}
                    onOk={this.EndTimeOk}
                    onCancel={(e) => {
                        this.dialogEndTime = false;
                    }}
                >
                    <a-date-picker format={"YYYY-MM-DD"} onChange={this.changeEndTime} />
                </Modal>
                <Modal
                    title="批量修改计划数量"
                    visible={this.dialogNumber}
                    destroyOnClose={true}
                    maskClosable={false}
                    onOk={this.NumberOk}
                    onCancel={(e) => {
                        this.dialogNumber = false;
                    }}
                >
                    <InputNumber onChange={this.NumberChange} />
                </Modal>
                <Modal
                    title="批量修改计划产值"
                    visible={this.dialogOutputValue}
                    destroyOnClose={true}
                    maskClosable={false}
                    onOk={this.OutputValueOk}
                    onCancel={(e) => {
                        this.dialogOutputValue = false;
                    }}
                >
                    <InputNumber onChange={this.OutputChange} />
                </Modal>
            </article >
        );
    }

    tableShow(val) {
        this.dialogVisible2 = true
        this.modalTableList = []
        Api.getMBSModelList({
            qbsId: val.path[2].__vue__.$vnode.data.props.rowKey
        }).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
            if (res.data) this.modalTableList = res.data;
        })
    }

    ModifyStartTime() {
        this.dialogStartTime = true
    }
    StartTimeOk() {
        for (let i = 0; i < this.SelectedLists.length; i++) {
            const e = this.SelectedLists[i];
            e.Start = this.StartTime
            e.planDetailStart = e.Start
        }
        console.log(this.mainTablePageConfig);
        
        this.dialogStartTime = false
    }

    ModifyEndTime() {
        this.dialogEndTime = true
    }

    EndTimeOk() {
        for (let i = 0; i < this.SelectedLists.length; i++) {
            const e = this.SelectedLists[i];
            e.Finish = this.endTime
            e.planDetailEnd = e.Finish
        }
        this.dialogEndTime = false
    }

    ModifyNumber() {
        this.dialogNumber = true
    }

    NumberOk() {
        for (let i = 0; i < this.SelectedLists.length; i++) {
            const e = this.SelectedLists[i];
            e.Work = this.Work
            e.planDetailAmount = e.Work
        }     
        this.dialogNumber = false
    }

    ModifyOutputValue() {
        this.dialogOutputValue = true
    }

    OutputValueOk() {
        for (let i = 0; i < this.SelectedLists.length; i++) {
            const e = this.SelectedLists[i];
            e.Weight = this.Weight
            e.planDetailMoney = e.Weight
        }
        this.dialogOutputValue = false
    }

    changeEndTime(val, vals) {
        this.endTime = vals
    }
    changeStartTime(val, vals) {
        this.StartTime = vals
    }
    NumberChange(val) {
        this.Work = val
    }
    OutputChange(val) {
        this.Weight = val
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

    //find extraProperty
    private findExtra<T>(key: string, tableColumn: Array<TableColumnType<T>>): TableColumnType<T> | undefined {
        if (!tableColumn) return;
        const target = tableColumn.find((item) => item.dataIndex === key);
        return target;
    }

    private columnRender<T>({
        column,
        row,
        $index,
        targetColumn
    }: { column: CommonTableColumn<T>, row: WBSreport, $index: number, targetColumn: Array<TableColumnType<T>> }): JSX.Element {
        if (!targetColumn) return (<div></div>);
        const
            { findExtra, removeOrActive, editTd } = this,
            dataIndex: string = column.property,
            extraProperty: TableColumnType<T> = findExtra<T>(dataIndex, targetColumn) as TableColumnType<T>,
            Pointer: string = typeof extraProperty?.editCmpnt === "function" ? Class.pointer : '';
        if (extraProperty.render) return extraProperty.render(column, row, $index);
        return (
            <div onDblclick={(e) => {
                console.log(e);

                if (editTd) removeOrActive(editTd, 'passive');
                if (extraProperty?.editCmpnt !== 'input') return;
                const targetTd: NodeList = (e.currentTarget as HTMLElement).childNodes;
                this.editTd = targetTd;
                removeOrActive(targetTd, 'active');
            }}>
                <span>{row[dataIndex]}{extraProperty?.unit}</span>
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

    private columnLeftRender({
        column,
        row,
        $index
    }: { column: CommonTableColumn<WBSreport>, row: WBSreport, $index: number }): JSX.Element {
        const { columnRender, LeftTableColumn } = this;
        return columnRender<WBSreport>({
            column: column,
            row: row,
            $index: $index,
            targetColumn: LeftTableColumn
        });
    }

    private columnRightRender({
        column,
        row,
        $index
    }: { column: CommonTableColumn<WBSreport>, row: WBSreport, $index: number }): JSX.Element {
        const { columnRender, RightTableColumn } = this;
        return columnRender<WBSreport>({
            column: column,
            row: row,
            $index: $index,
            targetColumn: RightTableColumn
        });
    }

    private generateColumn(columns: Array<TableColumnType<WBSreport>>, way: 'left' | 'right', index?: boolean, check?: boolean): Array<JSX.Element> {
        const vDom: Array<JSX.Element> = [], { columnLeftRender, columnRightRender } = this;
        let renderFunc: Function | null = null;
        switch (way) {
            case "left":
                renderFunc = columnLeftRender;
                break;
            case "right":
                renderFunc = columnRightRender;
                break;
            default:
                renderFunc = columnLeftRender;
                break;
        }
        if (columns.length < 1) return vDom;
        columns.forEach((item) => {
            vDom.push(
                <e-table-column
                    type={item.type}
                    // index={item.indexFunc}
                    width={`${item.width}`}
                    prop={item.dataIndex}
                    label={item.title}
                    className={Class.bodyCell}
                    scopedSlots={{
                        default: !item.render && renderFunc || item.render,
                    }}
                />
            )
        });
        if (index) {
            vDom.unshift(
                <e-table-column
                    type="index"
                    width="55"
                    label={'序号'}
                    index={i => i + 1}
                />
            )
        }
        if (check) {
            vDom.unshift(
                <e-table-column
                    type="selection"
                    width="55"
                    labelClassName={Class.checkBox}
                    className={Class.checkCell}
                />
            )
        }
        return vDom;
    }

    private onTableSelectionChange(selection: Array<string>, val): void {
        this.SelectedLists = val
        this.rightTableSelection = selection;
        //this.selectionRow = selection;
        if (!selection.length) this.showBatchBtn = false;
    }

    private wbsDBClick(row: GanttClass.GanttTask<Type.WBSNdMBSV3>, column?: CommonTableColumn<GanttClass.GanttTask<Type.WBSNdMBS>>, $index?: number, rightClick?: boolean) {
        console.log(row);
        
        if (row.childs?.length !== 0 && !rightClick) return this.$message.warn('请使用右键添加');
        const { rightDataSource: rightTemp } = this.temporaryOperationData, { rightDataSource: rightOrigin } = this.mainTablePageConfig;
        if (rightOrigin?.find(item => item.Name === row.qbsName)) return;
        /* new Task Add */
        const ganttInstance = this.ganttRef.ganttInstance as GanttClass.GanttType<any>;
        const addTask = ganttInstance.newTask();
        addTask.bs = row.qbsCode;
        addTask.ID = row.id;
        addTask.Name = row.qbsName;
        addTask.codeType = 'QBS';
        addTask.id = row.id;
        addTask.planDetailMoney = row.Weight;
        addTask.planDetailAmount = row.Work;
        addTask.ta01CodeFk = row.id;
        addTask.edited = true;
        addTask.tempData = true;
        console.log(addTask);
        if (rightOrigin?.find(item => item.Name === addTask.qbsName)) return;
        console.log(addTask);
        rightOrigin?.push(addTask);
        rightOrigin?.forEach(e => {
          // @ts-ignore
          e.Finish = sessionStorage.getItem("Finish")
          // @ts-ignore
          e.Start = sessionStorage.getItem("Start")
        });
        // rightOrigin?.forEach(e => {
        //     // @ts-ignore
        //     e.Finish = this.getDate(e.Finish ?? "")
        //     // @ts-ignore
        //     e.Start = this.getDate(e.Start ?? "")
        // });
        this.mainTablePageConfig.rightDataSource = rightOrigin?.concat([]);
    }
    findop(data, arr) {
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (item.childs.length == 0) {
                arr.push(item);
            } else {
                this.findop(item.childs, arr);
            }
        }
        return arr;
    }

    getDate(time) {
        const d = new Date(time);
        const datetime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        return datetime
    }

    private wbsCtxMenu(row: GanttClass.GanttTask<Type.WBSNdMBSV3>, column: CommonTableColumn<GanttClass.GanttTask<Type.WBSNdMBSV3>>, $index: number) {
        const innerArr = []
        // @ts-ignore
        if (row?.childs.length == 0) {
            // @ts-ignore
            innerArr.push(row)
        } else {
            // @ts-ignore
            this.findop(row?.childs, innerArr)
        }
        const { leftDataSource, rightDataSource } = this.mainTablePageConfig, { id } = row;
        const rightForce = [];
        // getMBSBottom( { currentId: (id as string), projectCode: this.projectCode } ).then( res => {
        //   if ( res.errcode !== 0 ) return this.$message.error( res.errmsg as string );
        // res.data?.forEach(item => this.wbsDBClick(item, undefined, undefined, true))
        console.log(innerArr);
        
        innerArr?.forEach(item => {
            // @ts-ignore
            if (rightDataSource?.find(dataItem => dataItem.Name === item.qbsName)) return;
            const ganttInstance = this.ganttRef.ganttInstance as GanttClass.GanttType<any>;
            const addTask = ganttInstance.newTask();
            // @ts-ignore
            addTask.bs = item.qbsCode as string;
            // @ts-ignore
            addTask.wbs = item.qbsCode as string;
            // @ts-ignore
            addTask.ID = item.id;
            // @ts-ignore
            addTask.Name = item.qbsName;
            addTask.codeType = 'QBS';
            // addTask.planDetailMoney = item.Weight;
            // addTask.planDetailAmount = item.Work;
            // @ts-ignore
            addTask.id = item.id as string;
            // @ts-ignore
            addTask.ta01CodeFk = item.id;
            addTask.warningProportion = 1;
            addTask.edited = true;
            addTask.tempData = true;
            // @ts-ignore
            rightForce.push(addTask);
        });
        rightForce.forEach(e => {
            // @ts-ignore
            e.Finish = this.getDate(e.Finish ?? "")
            // @ts-ignore
            e.Start = this.getDate(e.Start ?? "")
        });
        this.mainTablePageConfig.rightDataSource = rightForce.concat([]);
        console.log(this.mainTablePageConfig.rightDataSource);
        // } )
    }

    private rowClassName({ row, rowIndex }: { row: MergeWBSStructure, rowIndex: number }): string {
        if (row.tempData) return Class.tempRow;
        return '';
    }

    private collectSelectionRows() {
        const { rightTableSelection, mainTablePageConfig } = this;
        const wait2SetSelection = [];
        console.log(mainTablePageConfig);
        
        rightTableSelection.forEach(item => {
            const target = mainTablePageConfig.rightDataSource?.find(row => (row.ID as unknown as string) === item);
            if (target) {
                // @ts-ignore
                wait2SetSelection.push(target);
            }
        });
        this.selectionRow = wait2SetSelection;
        console.log('afterThis===>', this.selectionRow);
    }

    private save(): void {
        if (this.saveLoading) return;
        this.saveLoading = true;
        this.collectSelectionRows();
        const { rightDataSource } = this.mainTablePageConfig;
        const { ganttRef, withWBS, selectionRow } = this;
        //Todo: first remove all task
        const childTasks = ganttRef.ganttInstance.getAllChildTasks(withWBS);
        const childTasksBak = childTasks.concat([]);
        const rightDataSourceBak = rightDataSource?.concat([]);
        ganttRef.ganttInstance.removeTasks(childTasks);
        if (selectionRow?.length) {
            const afterDiffSection: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
            selectionRow.forEach(item => {
                if (!childTasksBak.find(diffTarget => diffTarget.UID === item.UID)) afterDiffSection.push(item);
            });
            const argsTasks = childTasksBak.concat(afterDiffSection);
            //argsTasks.forEach(item => ganttRef?.ganttInstance.addTask(item, 'add', withWBS));
            ganttRef?.ganttInstance.addTasks(argsTasks, 'add', withWBS);
        } else {
            ganttRef?.ganttInstance.addTasks(rightDataSource, 'add', withWBS);
            // rightDataSourceBak?.forEach(item => {
            //   ganttRef.ganttInstance?.addTask(item, 'add', withWBS);
            // });
        }
        this.$nextTick().then(() => this.saveLoading = false);
        this.$props.closeModal();
    }

    private delete(): void {
        if (this.delLoading) return;
        this.delLoading = true;
        this.collectSelectionRows();
        const { selectionRow, bsRemoveFn, collectSelectionRows } = this;
        if (!selectionRow?.length) {
            this.delLoading = false;
            this.$message.warn('没有选中任何数据');
        } else {
            const
                dispose = selectionRow.map((item) => {
                    return { ...item }
                }),
                //@ts-ignore
                params = dispose.map(item => omit<GanttClass.GanttTask<Type.WBSNdMBS>, 'cid' | 'edited'>(item, ['cid', 'edited']));
            console.log('删除数据', params);
            const existRemove: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
            const target: Array<GanttClass.GanttTask<Type.WBSNdMBS>> = [];
            dispose.forEach(item => !item.tempData && existRemove.push(item));
            const originCopy = this.mainTablePageConfig.rightDataSource?.concat([]);
            originCopy?.forEach(originItem => {
                if (selectionRow.find(deleteRow => deleteRow.Name === originItem.Name)) return;
                target.push(originItem);
            })
            this.mainTablePageConfig.rightDataSource = target;
            this.delLoading = false;
            bsRemoveFn?.(existRemove);
        }
    }

    private close(): void {
        this.$props.closeModal();
    }

    private lazyLoad(tree: GanttClass.GanttTask<Type.WBSNdMBS>, treeNode, resolve): void {
        const { id } = tree;
        getMBSChild({ id: (id as string), projectCode: this.projectCode }).then(res => {
            if (res.errcode !== 0) this.$message.error(res.errmsg as string);
            resolve(res.data);
        });
    }

    private setLeftTableWidth() {
        const { mouseDistance } = this;
        const leftWidth = (this.$refs.tableContentLeft as HTMLElement).getClientRects()[0].width;
        (this.$refs.tableContentLeft as HTMLElement).style.width = `${leftWidth + mouseDistance}px`;
    }

    private regNumber(e, key: string): void {
        const reg = Utils.isAmount(e.currentTarget.value);
        if (!reg) {
            this[key] = 0;
        } else {
            this[key] = reg;
        }
    }
}
