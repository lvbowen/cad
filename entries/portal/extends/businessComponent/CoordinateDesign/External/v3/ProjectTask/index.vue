<template>
    <PageSlot curPageName="我的任务">
        <div class="tab-box">
            <div v-for="(tab, i) in tabName" :key="tab" @click="handleTab(tab)"
                :class="['tab-item', tabActive === tab ? 'active-tab' : '']">
                <a-badge :count="countData[i]">
                    {{ tab }}
                </a-badge>
            </div>
        </div>
        <SearchTemp @searchChange="searchChange" :isDrag="isDrag" @changeDrag="changeDrag" @handleSave="handleSave"
            @handleCancel="handleCancel"></SearchTemp>
        <div class="task-box">
            <a-spin :spinning="loading" size="large" tip="努力加载中……">
                <a-collapse :bordered="false" v-model="activeKey" v-if="listData.length !== 0" @change="onChangeCollapse"
                    accordion>
                    <a-collapse-panel v-for="(panel, pIndex) in listData" :key="panel.id" :header="panel.engineeringName"
                        ref="taskDom" :draggable="isTaskDrag && listData.length > 1"
                        @dragstart.native="onDragStartTask($event, panel, pIndex)"
                        @dragenter.native="onDragEnterTask($event, pIndex)"
                        @dragover.native="onDragOverTask($event, pIndex)">
                        <transition-group>
                            <div v-for="(list, index) in panel.clientTaskList" :key="list.id"
                                :class="['task-list', activeListId === list.id ? 'task-list-active' : '']"
                                @click="handleTask(list, index, pIndex)" ref="itemDom"
                                :draggable="isItemDrag && panel.clientTaskList.length > 1"
                                @dragstart.stop="onDragStartItem(index, pIndex)"
                                @dragenter.stop="onDragEnterItem($event, index, pIndex)"
                                @dragover.stop="onDragOverItem($event, index, pIndex)">
                                <div class="task-list-top">
                                    <span class="cur-tip" :style="{ background: curColor }">{{ curTip }}</span>
                                    <span class="task-list-name">{{ list.taskName }}<img v-if="list.urgentFlag"
                                            class="warn-img" width="20px" :src="warnIcon"></span>
                                </div>
                                <div class="task-list-bottom">
                                    <span>上一处理人:</span>
                                    <span>{{ list.lastParticipantName }}</span>
                                    <span>停留时间:</span>
                                    <span>{{ formatTime(list.usedTime) }}</span>
                                </div>
                            </div>
                        </transition-group>
                    </a-collapse-panel>
                </a-collapse>
            </a-spin>
        </div>
    </PageSlot>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
// 引入组件
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Badge from 'ant-design-vue/lib/badge';
import 'ant-design-vue/lib/badge/style/index.css';
import SearchTemp from '../../components/SearchTemp.vue'
import PageSlot from '../../components/PageSlot.vue'
import { toBeAccepted, getTaskCount, updateSortTask, taskGetDesign } from '../../../../../service/CoordinateDesign/External'
import { ProjectTaskList, ProjectTaskType } from "../../../../../type"
import { formatTimeStr } from '../tool/index'
import warnIcon from '../images/1111.png'

import projectStore from '../store/projectStore';
import menuStore from '../store/menuStore';

@Component({
    name: "ProjectTask",
    components: {
        SearchTemp,
        PageSlot,
        ASpin: Spin,
        AIcon: Icon,
        ACollapse: Collapse,
        ACollapsePanel: Collapse.Panel,
        ABadge: Badge
    }
})
export default class ProjectTask extends Vue {
    tabName: string[] = ['待我接收', '待我设计', '待我校核', '待我审核'] // tab项
    tabActive: string = '待我接收' // tab项选中
    activeKey: string[] = []; // 面板选中
    loading: boolean = false // 是否加载
    curTip: string = '接 收' // 高亮tip
    curColor: string = '#33cc00' // 高亮tip颜色
    listData: ProjectTaskType[] = []; // 任务list数据
    activeListId: string = '' // 当前选中task 的id
    curCode: string = 'Activity14' // 请求activeCode
    isDrag: boolean = false // 是否开启拖动
    isItemDrag: boolean = false
    isTaskDrag: boolean = false // 是否开启任务排序
    warnIcon: string = warnIcon
    countData: number[] = [0, 0, 0, 0]
    dragIndex: number = -1
    pIndex: number = -1
    enterIndex: number = -1
    timer: any = null
    timer2: any = null
    cloneData: any = null

    // 任务拖拽开始
    onDragStartTask(e, task: any, pIndex: number) {
        this.dragIndex = pIndex
        this.timer = null
        this.$refs.taskDom[pIndex].$el.style.cursor = 'move'
        this.$refs.taskDom[pIndex].$el.style.background = '#536780'
        this.$refs.taskDom[pIndex].$el.style.border = '1px dashed #ccc'
    }

    // 任务拖拽触发
    onDragEnterTask(e: any, index: number) {
        e.preventDefault()
        this.enterIndex = index
        if (this.timer !== null) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            if (this.dragIndex !== index) {
                // 原数据
                const source = this.listData[this.dragIndex]
                this.listData.splice(this.dragIndex, 1)
                this.listData.splice(index, 0, source)
                this.dragIndex = index
            }
        }, 200)
    }

    // 任务拖拽结束
    onDragOverTask(e: any, pIndex: number) {
        e.preventDefault()
        this.$refs.taskDom[pIndex].$el.style.cursor = ''
        this.$refs.taskDom[pIndex].$el.style.background = ''
        this.$refs.taskDom[pIndex].$el.style.border = ''
    }

    // 面板当前项
    onChangeCollapse(value: []) {
        this.activeKey = this.isTaskDrag ? [] : value
    }

    // 重置拖拽数据
    resetDrag() {
        this.isDrag = false
        this.isItemDrag = false
        this.isTaskDrag = false
        this.dragIndex = -1
        this.pIndex = -1
        this.enterIndex = -1
        this.timer = null
        this.timer2 = null
    }

    // 保存排序
    handleSave() {
        let newData: any;
        if (this.listData.length === 0) return;
        if (this.isItemDrag && this.pIndex === -1) return;
        this.loading = true
        if (this.isItemDrag) {
            // 项目
            newData = this.listData[this.pIndex].clientTaskList.map((item: ProjectTaskList) => {
                item.activityCode = this.curCode
                item.bizType = 1
                item.bizId = item.id
                const { activityCode, bizType, bizId } = item
                return { activityCode, bizType, bizId }
            })
        } else {
            // 任务
            newData = this.listData.map((item: any) => {
                item.activityCode = this.curCode
                item.bizType = 2
                item.bizId = item.id
                const { activityCode, bizType, bizId } = item
                return { activityCode, bizType, bizId }
            })
        }
        this.resetDrag()
        updateSortTask(newData).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
            return this.$message.success(res.errmsg as string)
        }).finally(() => {
            this.loading = false
        })
    }

    // 取消排序FF
    handleCancel() {
        if (this.listData.length > 0 && this.isDrag) {
            // 数据还原
            this.listData = []
            this.listData = this.cloneData
        }
        this.resetDrag()
    }

    // 拖拽开始项目
    onDragStartItem(index: number, pIndex: number) {
        this.pIndex = pIndex
        this.dragIndex = index
        this.timer2 = null
        this.$refs.itemDom[index].style.cursor = 'move'
        this.$refs.itemDom[index].style.background = '#536780'
        this.$refs.itemDom[index].style.border = '1px dashed #ccc'
    }

    // 项目触发
    onDragEnterItem(e: any, index: number, pIndex: number) {
        e.preventDefault()
        this.pIndex = pIndex
        this.enterIndex = index
        if (this.timer2 !== null) {
            clearTimeout(this.timer2)
        }
        this.timer2 = setTimeout(() => {
            console.log(this.dragIndex, index)
            if (this.dragIndex !== index) {
                const source = this.listData[this.pIndex].clientTaskList[this.dragIndex]
                this.listData[this.pIndex].clientTaskList.splice(this.dragIndex, 1)
                this.listData[this.pIndex].clientTaskList.splice(index, 0, source)
                this.dragIndex = index
                console.log(this.listData)
            }
        }, 200)
    }

    // 项目拖拽结束
    onDragOverItem(e: any, index: number, pIndex: number) {
        e.preventDefault()
        this.$refs.itemDom[index].style.cursor = ''
        this.$refs.itemDom[index].style.background = ''
        this.$refs.itemDom[index].style.border = ''
    }

    // 开启拖拽排序
    changeDrag(val: boolean) {
        this.isDrag = val
        this.isItemDrag = this.activeKey.length !== 0
        this.isTaskDrag = this.activeKey.length === 0
    }

    formatTime(time: number) {
        return formatTimeStr(time)
    }

    // 点击任务list
    handleTask(list: ProjectTaskList, index: number, pIndex: number) {
        if (this.tabActive !== '待我接收') return;
        this.activeListId = list.id
        if (this.tabActive === '待我接收') {
            this.$store.state.projectStore.toBeReceived = true
            this.$store.state.projectStore.taskId = list.id
            this.$store.state.menuStore.activeMenu = "项目"
            this.$store.state.menuStore.secondActiveMenu = "ProjectItem/Design"
            this.$router.push(`/ProjectItem/DesignReceived`)
        }
    }

    // 点击tab进行数据切换并请求
    handleTab(tab: string) {
        this.resetDrag()
        this.activeKey = []
        this.tabActive = tab
        this.activeListId = ''
    }


    // 搜索
    searchChange(value: string) {
        this.getCurrentTabData(value)
    }

    // 获取当前tab项数据
    getCurrentTabData(value: string) {
        this.loading = true
        // '待我接收', '待我设计', '待我校核', '待我审核'
        toBeAccepted({
            activityCode: this.curCode,
            appCode: 'XTSJ',
            searchName: value
        }).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
            if (!res.data || res.data.length === 0) {
                this.listData = []
                return this.$message.warn('未查询到数据')
            }
            // const { engineeringName, clientTaskList } = res.data[0]
            this.listData = res.data
            this.cloneData = JSON.parse(JSON.stringify(res.data))
        }).finally(() => {
            this.loading = false
        })
    }

    // 根据数据变化更新tip显示和颜色
    updateTip() {
        if (this.tabActive === '待我接收') {
            this.$set(this, 'curCode', 'Activity14')
            this.curTip = '接 收'
            this.curColor = '#33cc00'
            // this.curCode = 'Activity14'
        }
        if (this.tabActive === '待我设计') {
            this.$set(this, 'curCode', 'Activity3')
            this.curTip = '设 计'
            this.curColor = '#e4b701'
            // this.curCode = 'Activity3'
        }
        if (this.tabActive === '待我校核') {
            this.$set(this, 'curCode', 'Activity6')
            this.curTip = '校 核'
            this.curColor = '#FC511A'
            // this.curCode = 'Activity6'
        }
        if (this.tabActive === '待我审核') {
            this.$set(this, 'curCode', 'Activity7')
            this.curTip = '审 核'
            this.curColor = '#fe2727'
            // this.curCode = 'Activity7'
        }
        this.getCurrentTabData('')
    }

    // 获取数量
    getCount() {
        getTaskCount({
            appCode: 'XTSJ',
        }).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
            if (!res.data || res.data.length === 0) return this.$message.error('查询到数据')
            for (let i = 0; i < res.data.length; i++) {
                this.countData[i] = (res.data[i].count)
            }
        }).finally(() => {
            this.loading = false
        })
    }


    // init
    mounted() {
        this.$store.registerModule('projectStore', projectStore);
        this.$store.registerModule('menuStore', menuStore);
        this.getCount()
        this.getCurrentTabData('')
    }


    // 页面销毁
    destroyed() {
        clearInterval(this.timer)
        this.timer = null
    }

    @Watch('tabActive', { immediate: false })
    onTabActiveChanged(newValue: string, oldValue: string) {
        this.updateTip()
    }
}


</script>

<style scoped>
.tab-box {
    display: flex;
    height: 40px;
    align-items: center;
    color: white;
    justify-content: space-around;
    background: #424b56;
}

.active-tab {
    background: #212830;
    border: 1px solid #ccc;
    padding: 2px 6px;
    border-radius: 6px;
}

.tab-item:hover {
    background: #212830;
    cursor: pointer;
}

/* 展开收起 */
.task-box /deep/ .ant-collapse {
    background: transparent;
}

.task-box /deep/ .ant-collapse>.ant-collapse-item>.ant-collapse-header {
    color: white;
}

.task-box /deep/ .ant-collapse-item {
    border: 0;
}

/* list */

.task-list {
    padding: 10px;
    color: white;
    transition: transform .3s;
}

.task-list-active {
    background: #536780;
    border: 1px dashed #ccc;
}

.task-list-top {
    height: 30px;
    display: grid;
    grid-template-columns: 60px 1fr;
    grid-template-rows: 1fr;
    grid-column-gap: 10px;
    align-items: center;
}

.task-list-bottom {
    height: 30px;
    display: grid;
    grid-template-columns: 80px 60px 60px 1fr;
    grid-template-rows: 1fr;
    grid-column-gap: 5px;
    align-items: center;
}

.task-list-name {
    font-size: 16px;
}

.cur-tip {
    text-align: center;
    color: white;
}

.handle {
    cursor: grab;
}

.warn-img {
    display: inline-block;
    margin-left: 10px;
}
</style>

