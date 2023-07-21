import {Component, Prop, Ref, Watch} from 'vue-property-decorator';
import {GanttAbstract} from "./GanttAbstract";
import Class from './Gantt.module.less';
import {
    Gantt as GanttType,
    GanttTabsMenus,
    GanttEvent,
    GanttCalendars,
    GanttDataType,
    GanttTimeLine,
    GanttTimeLinePos,
    GanttTask,
    GanttColumn,
    GanttMiniUI,
    GanttViewItem,
    GanttTimeLines,
} from './Gantt';
import {GanttClass} from "../index";
import './themes/default/miniui.css';

import Conventional from "./Conventional";
import ForegroundTask from "./ForegroundTask";
import Advanced from "./Advanced";
import Comment from "./Comment";

import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';

import Tabs from 'ant-design-vue/lib/tabs';
import 'ant-design-vue/lib/tabs/style/index.css';

import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';

/*
declare global {
    interface Window {
        PlusProject: GanttClass.GanttType<any>;
        ProjectMenu: GanttClass.GanttType<any>;
    }
}
*/

declare global {
    interface Window {
        //@ts-ignore
        PlusProject: GanttClass.GanttType<any>;
        //@ts-ignore
        ProjectMenu: GanttClass.GanttType<any>;
        //@ts-ignore
        mini: GanttClass.GanttMiniUI<any>
    }
}

interface DataNdRefType {
    instance: GanttClass.GanttType<unknown>;
    data: GanttClass.GanttDataType<unknown>;
}

@Component({
    name: 'Gantt',
})
export default class Gantt<T> extends GanttAbstract<T> {

    public readonly fnFilter = 'ByGantt';

    public readonly evFilter = undefined;

    public drawitem: Function | null = null;

    public taskclick: Function | null = null;

    public cellcommitedit: Function | null = null;

    private editorVisible: boolean = false;

    private addMBSVisible: boolean = false;

    private tabsMenu: Array<GanttTabsMenus> = [
        // {
        //     key: '1',
        //     name: '常规',
        //     component: Conventional
        // },
        {
            key: '2',
            name: '前置任务',
            component: ForegroundTask
        },
        {
            key: '3',
            name: '高级',
            component: Advanced
        },
        {
            key: '4',
            name: '备注',
            component: Comment
        }
    ]

    private tabsActive: string = this.tabsMenu[0].key;

    private editorTask: GanttTask<T> | null = null;

    private preTask: Array<GanttTask<T>> = [];

    private footerShow: Array<any> | null = null;

    @Ref() GanttRef?: HTMLElement;

    @Prop() renderGanttItem?: Function;

    @Prop() ganttCellEditCB?: Function;

    @Prop() enableOrderProject?: boolean;

    @Prop() readOnly?: boolean;

    @Prop() ganttViewItemMargin?: number;

    @Prop() editable?: boolean;

    @Prop() addMBSFn?: Function;

    @Prop() removeFn?: Function;

    @Prop() readyFn?: Function;

    @Prop() downgradeCb?: Function;

    @Prop() upgradeCb?: Function;

    @Prop() ganttCellClick?: Function;

    @Prop() rowHeight?: number;

    @Prop() view?: boolean;

    @Prop() timeLines?: Array<GanttTimeLines>;

    @Prop() showCriticalPath?: boolean;

    get dataNdRef(): DataNdRefType | undefined {
        const {ganttInstance, ganttData} = this;
        if (ganttInstance && ganttData) {
            return {
                instance: ganttInstance as GanttType<unknown>,
                data: ganttData
            }
        } else {
            return undefined;
        }
    }

    @Watch('timeLines', {immediate: true})
    timeLinesListener(timelines: Array<GanttTimeLines>) {
        const {ganttInstance} = this;
        if (!ganttInstance) {
            return console.log('gantt has not been initialized!');
        } else {
            ganttInstance.setTimeLines(timelines);
        }
    }

    @Watch('tabsActive', {immediate: true})
    tabsActiveListener(tabsActive: string) {
        if (this.tabsActive === '2') {
            this.footerShow = null
        } else {
            this.footerShow = [
                <Button onClick={() => this.editorVisible = false} >
                    取消
                </Button>,
                <Button type="primary" onClick={() => this.editorVisible = false}>
                    确定
                </Button>]
        }
    }

    @Watch('allScriptReady', {immediate: true})
    allScriptReadyListener(state: boolean) {
        if (!state) return;
        console.log('Gantt Ready !');
    }

    @Watch('ganttInstance', {immediate: true})
    ganttInstanceListener(instance: GanttClass.GanttType<T>) {
        if (!instance) return;
        const
            {PlusProject, ProjectMenu} = window,
            {ganttColumns, readyFn, rowHeight} = this;
        instance.setColumns(super.generateGanttColumns(ganttColumns ?? []) ?? []);
        // this.ganttInstance?.setStyle('width:100%;height:400px');
        //this.ganttInstance?.setStyle('width:100%;height:auto');
        this.ganttInstance?.setStyle('width:100%;height:calc(100% - 24px)');
        const cssVar: string = window.getComputedStyle(document.body).getPropertyValue('--miniTableRowH')?.split('px')[0];
        this.ganttInstance?.setRowHeight(rowHeight ?? Number(cssVar));
        if (this.ganttInstance) {
            const btmW = window.getComputedStyle(document.body).getPropertyValue('--miniGanttViewBottomTimeScaleW')?.split('px')[0];
            this.ganttInstance.ganttView.bottomTimeScale.width = Number(btmW);
            this.ganttInstance.setTopTimeScale('year');
            this.ganttInstance.setBottomTimeScale('month');
            readyFn?.(this.ganttInstance);
        }
        this.GanttRef && this.ganttInstance?.render(this.GanttRef);
    }

    @Watch('dataNdRef', {immediate: true})
    dataNdRefListener(param: DataNdRefType) {
        if (!param) return;
        super.setDataProject();
    }

    @Watch('renderGanttItem', {immediate: true})
    renderGanttItemListener(fn: Function) {
        this.drawitem = fn ?? this.drawGanttItem;
    }

    @Watch('ganttCellClick', {immediate: true})
    ganttCellClickListener(fn: Function) {
        if (fn) this.taskclick = fn;
    }

    @Watch('ganttCellEditCB', {immediate: true})
    ganttCellEditCBListener(fn: Function) {
        this.cellcommitedit = fn ?? this.cellEditCB;
    }

    @Watch('showCriticalPath', {immediate: true})
    showCriticalPathListener(flag: boolean) {
        const {ganttInstance} = this;
        if (!ganttInstance) return;
        console.log('this.ganttInstance?.setShowCriticalPath', this.ganttInstance)
        this.ganttInstance?.setShowCriticalPath(flag);
    }

    private cellEditCB(e) {
        console.log('e--->', e);
    }

    private drawGanttItem(e: GanttClass.GanttViewItem<T>): void {
        const item = e.item;
        const {left, top, width, height} = e.itemBox, {ganttViewItemMargin} = this;
        if (!item.Summary && !item.Milestone) {
            const percentWidth = width * (item.PercentComplete / 100);
            const lightHeight = height - (ganttViewItemMargin ?? 10 * 2);
            e.itemHtml = `<div id=${item.ID} class="${Class.ganttViewItem} ${item.Critical && 'mini-gantt-critical'}" style="left:${(left)}px;top:${top + (ganttViewItemMargin ?? 10)}px;height:${(lightHeight)}px;width:${(width)}px;">`;
            e.itemHtml += `<div style="width:${(percentWidth)}px;" class="percentcomplete ${Class.finishPercent}"></div></div>`;
        }
    }

    private renderTabs(tabsMenu: Array<GanttTabsMenus>, editorTask: GanttTask<T> | undefined) {
        if (!Array.isArray(tabsMenu)) return [];
        const {ganttInstance, preTask} = this;
        return tabsMenu.map(item => {
            const ItemComponent = item.component as typeof ForegroundTask;
            // console.log( 'editorTask====>', editorTask );
            return (
                <Tabs.TabPane key={item.key} tab={item.name}>
                    <ItemComponent
                        ganttIns={ganttInstance as GanttClass.GanttType<unknown>}
                        targetTask={editorTask}
                        existData={preTask}
                        option={{
                            add: this.addPreTask,
                            update: this.updatePreTask,
                            delete: this.deletePreTask,
                            get: this.getPreTask,
                        }}
                        closeModal={e => this.editorVisible = false}
                    />
                </Tabs.TabPane>
            )
        })
    }

    private getPreTask(id: string) {
        if (!id) return;
        const {preTaskFnCollection, editorTask} = this;
        preTaskFnCollection?.get?.(editorTask?.UID).then(res => {
            if (res.errcode !== 0) return;
            this.preTask = res.data;
        })
    }

    private addPreTask(addList: Array<any>) {
        if (!addList.length) return;
        const {preTaskFnCollection} = this;
        preTaskFnCollection?.add?.(addList).then(res => {
            if (res.errcode !== 0) return;
            console.log('afterSave===>', res);
        });
    }

    private updatePreTask(updateList: Array<any>) {
        if (!updateList.length) return;
        const {preTaskFnCollection} = this;
        preTaskFnCollection?.update?.(updateList).then(res => {
            if (res.errcode !== 0) return;
            console.log('afterUpdate===>', res);
        })
    }

    private deletePreTask(deleteList: Array<any>) {
        if (!deleteList.length) return;
        const {preTaskFnCollection} = this;
        preTaskFnCollection?.delete?.(deleteList).then(res => {
            if (res.errcode !== 0) return;
            console.log('afterDelete===>', res);
        })
    }

    public setFullGanttView() {
        this.ganttInstance?.setStyle(`width:100%;height:calc(100% - 24px)`);
    }

    cellByGantt(uid: number, ganttIns: Gantt<T>) {
        console.log('cellByGantt====>', uid, ganttIns);
    }

    getDate(time) {
        const d = new Date(time);
        const datetime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        return datetime
    }

    ganttAddMBS() {
        const {ganttInstance, addMBSFn, readOnly} = this;
        //@ts-ignore
        if (!ganttInstance) return this.$message.warn('只有未审核状态才能修改树结构');
        const selectedTask = ganttInstance.getSelected();
        if (selectedTask.codeType == "QBS") return this.$message.warn('QBS类型无法修改树结构');
        if (selectedTask) {
            if (selectedTask && selectedTask['codeType'] === 'MBS') return;
            console.log('selectedTask', selectedTask['children']?.[0]);
            const startTime = this.getDate(selectedTask.Start)
            const FinishTime = this.getDate(selectedTask.Finish)
            sessionStorage.setItem("Start",startTime)
            sessionStorage.setItem("Finish",FinishTime)
            if (selectedTask && selectedTask['children']?.[0]?.['codeType'] === 'WBS') return;
            addMBSFn?.(selectedTask);
            /*this.addMBSVisible = false;
            this.editorTask = selectedTask;
            this.$nextTick().then(()=>{
                this.addMBSVisible = true;
            });*/
        }
    }

    ganttGoto() {
        const {ganttInstance} = this;
        if (!ganttInstance) return;
        const selectedTask = ganttInstance.getSelected();
        selectedTask ? ganttInstance.scrollIntoView(selectedTask) : null;
    }

    ganttAdd() {
        const {ganttInstance, readOnly} = this;
        console.log(ganttInstance);
        
        //@ts-ignore
        if (!ganttInstance) return this.$message.warn('只有未审核状态才能修改树结构');
        // if (!ganttInstance || readOnly) return this.$message.warn('只有未审核状态才能修改树结构');
        const selectedTask = ganttInstance.getSelected();
        if (selectedTask && selectedTask['codeType'] === 'MBS') return;
        const task = ganttInstance.newTask();
        task['codeType'] = 'WBS';
        task.FixedDate = 1;
        if (selectedTask) {
            ganttInstance.addTask(task, 'add', selectedTask);
        } else {
            ganttInstance.addTask(task);
        }

    }

    ganttDowngrade() {
        const {ganttInstance, downgradeCb, readOnly} = this;
        //@ts-ignore
        if (!ganttInstance || readOnly) return this.$message.warn('只有未审核状态才能修改树结构');
        const task = ganttInstance.getSelected();
        if (task && task.codeType !== 'MBS') {
            ganttInstance.downgradeTask(task);
            downgradeCb?.(task);
        }
    }

    ganttEdit(): void {
        const {ganttInstance, preTaskFnCollection} = this;
        if (!ganttInstance) return;
        const task = ganttInstance.getSelected();
        if (task) {
            this.editorVisible = false;
            this.editorTask = task;
            preTaskFnCollection?.get?.(task.UID).then(res => {
                console.log('getUID==>', res);
                if (res.errcode !== 0) return;
                this.preTask = res.data;
                this.editorVisible = true;
            })
            /*this.$nextTick().then(() => {
                this.editorVisible = true;
            })*/
        } else {
            this.$message.warn('未选中任何任务');
        }
    }

    ganttRemove() {
        const {ganttInstance, removeFn, readOnly} = this;
        //@ts-ignore
        if (!ganttInstance || readOnly) return this.$message.warn('只有未审核状态才能修改树结构');
        const task = ganttInstance.getSelected();
        if (task) {
            ganttInstance.removeTask(task);
            removeFn?.(task);
        }
    }

    ganttUpgrade() {
        const {ganttInstance, upgradeCb, readOnly} = this;
        //@ts-ignore
        if (!ganttInstance || readOnly) return this.$message.warn('只有未审核状态才能修改树结构');
        const task = ganttInstance.getSelected();
        if (task && task.codeType !== 'MBS') {
            ganttInstance.upgradeTask(task);
            upgradeCb?.(task);
        }
    }

    ganttZoomIn(): void {
        const {ganttInstance} = this;
        if (!ganttInstance) return;
        ganttInstance.zoomIn();
    }

    ganttZoomOut(): void {
        const {ganttInstance} = this;
        if (!ganttInstance) return;
        ganttInstance.zoomOut();
    }

    mounted() {
        super.init();
    }

    render() {
        const {editorVisible, tabsMenu, renderTabs, tabsActive, editorTask} = this;
        return (
            <article class={Class.container}>
                <div class={Class.main} ref={'GanttRef'}/>
                <Modal
                    visible={editorVisible}
                    width={860}
                    size={'small'}
                    centered
                    destroyOnClose
                    activeKey={tabsActive}
                    footer={this.footerShow}
                    onCancel={() => this.editorVisible = false}
                    // onOk={() => this.editorVisible = false}
                >
                    <Tabs
                        onChange={(e) => this.tabsActive = e}
                    >
                        {renderTabs(tabsMenu, editorTask as GanttTask<T>)}
                    </Tabs>
                </Modal>
            </article>
        )
    }

    renderTimeLines(): string {
        return "";
    }
}

export {
    GanttType,
    GanttTabsMenus,
    GanttEvent,
    GanttTask,
    GanttTimeLine,
    GanttTimeLines,
    GanttTimeLinePos,
    GanttDataType,
    GanttCalendars,
    GanttColumn,
    GanttMiniUI,
    GanttViewItem,
}
