///<reference path="../../declarations.d.ts" />
///<reference path="../../shims-tsx.ts" />
import { Component, InjectReactive, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import Class from './ForegroundTask.module.less';
import * as tsx from "vue-tsx-support";
import { Gantt, GanttTask } from "../Gantt";
import { Utils } from "@ctesi/core";

import TypeSelector from "../TypeSelector";
import NumberInput from "../NumberInput";

import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

import Message from 'ant-design-vue/lib/message';
import 'ant-design-vue/lib/message/style/index.css';

import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';

import Drawer from 'ant-design-vue/lib/drawer';
import 'ant-design-vue/lib/drawer/style/index.css';


@Component( {
    name: 'ForegroundTask'
} )
export default class ForegroundTask<T> extends Vue {

    _tsx!: tsx.DeclareProps<Pick<ForegroundTask<T>, 'ganttIns' | 'existData' | 'targetTask' | 'option' | 'closeModal'>>

    @InjectReactive( 'project' ) projectCode?: string;

    @Prop() ganttIns?: Gantt<T>;

    @Prop() targetTask?: GanttTask<T>;

    @Prop() existData?: Array<GanttTask<T>>;

    @Prop() closeModal?: Function;

    @Prop() option?: {
        add: Function,
        update: Function,
        delete: Function,
        get: Function
    }
    private foregroundTaskColumns: Array<unknown> = [
        {
            title: '标识',
            ellipsis: true,
            dataIndex: 'bs',
            width: 250,
        },
        {
            title: '任务名称',
            ellipsis: true,
            dataIndex: 'Name',
            width: 150
        },
        {
            title: '类型',
            ellipsis: true,
            dataIndex: 'type',
            width:250,
            customRender: ( text, record ) => this.renderTypeSelector( record, 'type' )
        },
        {
            title: '延隔时间',
            ellipsis: true,
            dataIndex: 'lagDays',
            width: 100,
            customRender: ( text, record ) => this.renderLagDays( record, 'lagDays' )
        }
    ]

    private receivedDataBak: Array<GanttTask<T>> = [];

    private treeData: Array<GanttTask<T>> = [];

    private tableData: Array<GanttTask<T>> = [];

    private treeCheckedKeys: Array<string> = [];

    private drawerVisible: boolean = false;

    @Watch( 'existData', { immediate: true } )
    existDataListener( val: Array<GanttTask<T>> ) {
        const { ganttIns } = this;
        if ( !val.length || !ganttIns ) return;
        const selected = ganttIns.getSelected();
        const receivedDataClone = JSON.parse( JSON.stringify( val ) );
        Utils.deepFind( receivedDataClone, item => {
            console.log( 'inExistData==>', item );
            item.Name = item.predecessorName;
            item.UID = item.wbsPredecessorId;
            item.bs = item.predecessorBS;
            if ( item.UID === selected.UID ) {
                this.disabledAllChildren( item );
                return true;
            }
            return false;
        }, 'children' );
        this.tableData = receivedDataClone;
        this.receivedDataBak = JSON.parse( JSON.stringify( receivedDataClone ) );
        // this.treeCheckedKeys = val.map(item => item.UID);
    }

    private selectedRowKeys: Array<string> = [];

    private initTree() {
        this.treeData = [];
    }

    render() {
        const {
            foregroundTaskColumns,
            addForegroundTask,
            deleteForegroundTask,
            treeData,
            drawerVisible,
            closeDrawer,
            treeCheckedKeys,
            onCheck,
            tableData,
            submitList,
            selectedRowKeys,
            onSelectChange
        } = this;
        return (
            <article class={ Class.main }>
                <nav>
                    <Button type={ 'primary' } onClick={ submitList }>提交</Button>
                    <Button onClick={ deleteForegroundTask }>删除</Button>
                    <Button onClick={ addForegroundTask }>添加</Button>
                </nav>
                <section class={ Class.container }>
                    <Table
                        hideDefaultSelections={ true }
                        rowSelection={ {
                            selectedRowKeys: selectedRowKeys,
                            onChange: onSelectChange
                        } }
                        rowKey={ 'UID' }
                        columns={ foregroundTaskColumns }
                        scroll={ { y: 440 } }
                        dataSource={ tableData }
                    />
                    <Drawer
                        visible={ drawerVisible }
                        destroyOnClose={ true }
                        getContainer={ false }
                        wrapStyle={ { position: 'absolute' } }
                        onClose={ closeDrawer }
                    >
                        <Tree
                            checkable={ true }
                            checkedKeys={ treeCheckedKeys }
                            treeData={ treeData }
                            onCheck={ onCheck }
                            replaceFields={ {
                                title: 'Name',
                                key: 'UID'
                            } }
                        />
                    </Drawer>

                </section>

            </article>
        );
    }

    private disabledAllChildren( items: any ) {
        Utils.deepFind( [ items ], item => {
            item.disabled = true;
            return false;
        }, 'children' );
    }

    private addForegroundTask() {
        const { ganttIns, initTree } = this;
        if ( !ganttIns ) return Message.warn( 'Gantt组件还未初始化完成' );
        const { Tasks } = ganttIns.getData(), selected = ganttIns.getSelected();
        if ( !Tasks.length ) return Message.warn( '请先添加其他数据' );
        const ganttDataClone = JSON.parse( JSON.stringify( Tasks ) );
        Utils.deepFind( ganttDataClone, item => {
            if ( item.UID === selected.UID ) {
                this.disabledAllChildren( item );
                return true;
            }
            return false;
        }, 'children' );
        initTree();
        this.treeData = ganttDataClone;
        this.treeCheckedKeys = this.tableData.map( item => item.UID );
        this.drawerVisible = true;
    }

    private closeDrawer() {
        this.drawerVisible = false;
        this.setTableData();
    }

    private deleteForegroundTask() {
        const { receivedDataBak, selectedRowKeys } = this;
        if ( !selectedRowKeys.length ) return;
        const needToDelete: Array<any> = [];
        selectedRowKeys.forEach( item => {
            if ( receivedDataBak.find( origin => origin.UID === item ) ) needToDelete.push( item );
        } );
        this.deleteItemAdapter( needToDelete );
    }

    private onCheck( v ) {
        this.treeCheckedKeys = v;
    }

    private setTableData() {
        this.tableData = [];
        const { ganttIns, initTree, treeCheckedKeys, receivedDataBak } = this;
        if ( !ganttIns ) return Message.warn( 'Gantt组件还未初始化完成' );
        const { Tasks } = ganttIns.getData(), selected = ganttIns.getSelected();
        if ( !Tasks.length ) return Message.warn( '请先添加其他数据' );
        if ( !treeCheckedKeys.length ) return;
        const ganttDataClone = JSON.parse( JSON.stringify( Tasks ) );
        const addToTableData: Array<GanttTask<T>> = [];
        Utils.deepFind( ganttDataClone, item => {
            if ( treeCheckedKeys.includes( item.UID ) ) addToTableData.push( item );
            return false;
        }, 'children' );
        Utils.deepFind( addToTableData, item => {
            const target = receivedDataBak.find( origin => origin.UID === item.UID );
            item.children = undefined;
            //@ts-ignore
            item.type = target?.type ?? 'FS';
            //@ts-ignore
            item.lagDays = target?.lagDays ?? 0;
            item.tempData = true;
            return false;
        }, 'children' );
        this.tableData = addToTableData;
    }

    private updateData( e, key: string, originData ) {
        const { tableData } = this;
        const target = tableData.find( item => item.UID === originData.UID );
        //@ts-ignore
        target[key] = e;
        //@ts-ignore
        target.edited = true;
        //if (!target.tempData) target.edited = true;

    }

    private renderTypeSelector( record, key: string ): JSX.Element {
        const { updateData } = this;
        return <TypeSelector textKey={ key } value={ record } valueChange={ updateData }/>
    }

    private renderLagDays( record, key: string ): JSX.Element {
        const { updateData } = this;
        return <NumberInput textKey={ key } value={ record } valueChange={ updateData }/>
    }

    private addedItemAdaptor( originList: Array<any> ) {
        const listClone = JSON.parse( JSON.stringify( originList ) );
        listClone.forEach( item => {
            item.predecessorBS = item.bs;
            item.predecessorId = item.UID;
            item.predecessorName = item.Name;
            item.projectCode = this.projectCode;
            item.th04aPlandetailFk = this.ganttIns?.getSelected()?.UID;
        } );
        this.option?.add?.( listClone );
    }

    private editedItemAdaptor( originList: Array<any> ) {
        const listClone = JSON.parse( JSON.stringify( originList ) );
        listClone.forEach( item => {
            item.predecessorBS = item.bs;
            item.predecessorId = item.UID;
            item.predecessorName = item.Name;
            item.projectCode = this.projectCode;
            item.th04aPlandetailFk = this.ganttIns?.getSelected()?.UID;
        } );
        this.option?.update?.( listClone );
    }

    private deleteItemAdapter( idList: Array<any> ) {
        const { option, ganttIns, closeModal } = this;
        const targetUID = ganttIns?.getSelected().UID ?? '';
        const formatIDList: Array<{ id: string, th04aPlandetailFk: string, projectCode: string }> = [];
        idList.forEach( item => {
            formatIDList.push( {
                id: item,
                th04aPlandetailFk: targetUID,
                projectCode: this.projectCode as string
            } );
        } );
        option?.delete?.( formatIDList );
        closeModal?.();
    }

    private submitList() {
        const { receivedDataBak, tableData, closeModal } = this;
        const editResults: Array<GanttTask<T>> = [];
        // const addedResults: Array<GanttTask<T>>= [];
        const addedResults: typeof editResults = []
        tableData.forEach( item => {
            const target = receivedDataBak.find( origin => origin.UID === item.UID );
            if ( target ) {
                item.tempData = false;
                if ( item.edited ) editResults.push( item );
            } else {
                addedResults.push( item );
            }
        } );
        this.addedItemAdaptor( addedResults );
        this.editedItemAdaptor( editResults );
        closeModal?.();
    }

    private onSelectChange( val ) {
        this.selectedRowKeys = val;
    }
}
