<template>
    <PageSlot curPageName="设计任务">
        <SearchTemp @searchChange="searchChange" isDesign></SearchTemp>
        <div class="design-box">
            <a-spin v-if="designData.id" :spinning="loading" size="large" tip="努力加载中……">
                <a-collapse :activeKey="activeKey" :bordered="false">
                    <a-collapse-panel key="1">
                        <template v-slot:header>
                            <span class="icon"><a-icon type="folder" /></span>
                            <span>{{ designData.engineeringName }}</span>
                        </template>
                        <div v-if="designData.clientProfessionTaskList">
                            <template v-for="(panel, pIndex) in designData.clientProfessionTaskList">
                                <div v-if="panel.designTaskTypeListMap.DESIGN_FILE && panel.designTaskTypeListMap.DESIGN_FILE.length > 0"
                                    :key="`${panel.id}${pIndex}`">
                                    <a-collapse default-active-key="4">
                                        <a-collapse-panel>
                                            <template v-slot:header>
                                                <span class="icon"><a-icon type="folder" /></span>
                                                <span>{{ panel.professionTaskName }}</span>
                                            </template>
                                            <div v-for="last in panel.designTaskTypeListMap.DESIGN_FILE" :key="last.id">
                                                <div :class="['panel-item', activePanel === last.id && 'active-panel-item']"
                                                    @click="handlePanelItem(last)">
                                                    <span v-if="last.displayActivityName"
                                                        :style="{ background: bgColor(last.displayActivityName) }"
                                                        class="panel-item-tip">{{ last.displayActivityName }}</span>
                                                    <span>{{ last.taskName }}</span>
                                                </div>
                                            </div>
                                        </a-collapse-panel>
                                    </a-collapse>
                                </div>
                                <div v-else :key="panel.id">
                                    <div :class="['panel-item', activePanel === panel.id && 'active-panel-item']"
                                        @click="handlePanelItem(panel)">
                                        <span v-if="panel.displayActivityName"
                                            :style="{ background: bgColor(panel.displayActivityName) }"
                                            class="panel-item-tip">{{ panel.displayActivityName }}</span>
                                        <span>{{ panel.professionTaskName }}</span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </a-collapse-panel>
                </a-collapse>
            </a-spin>
            <div v-else class="no-data">暂无数据</div>
        </div>
    </PageSlot>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import SearchTemp from '../../../components/SearchTemp.vue'
import PageSlot from '../../../components/PageSlot.vue'
import DesignTree from '../../../components/DesignTree.vue'
import { getProjectDesign } from '../../../../../../service/CoordinateDesign/External'

const menuStore = namespace("menuStore");

// 1.更改文件夹的图标，引入图标
// import folderIcon from '../../images/icon_wjj.png'; 
//getProjectDesign
@Component({
    name: "DesignItem",
    components: {
        PageSlot,
        SearchTemp,
        DesignTree,
        ASpin: Spin,
        ACollapse: Collapse,
        ACollapsePanel: Collapse.Panel,
        AIcon: Icon
    }
})
export default class DesignItem extends Vue {
    @menuStore.State("activeMenu") activeMenu: any; // 一级菜单

    loading: boolean = false
    designData: any = {}
    activeKey: string = '1'
    activePanel: string = ''

    resetStoreData(curKey: string) {
        this.$store.state.projectStore.inReview = false
        this.$store.state.projectStore.inCheck = false
        this.$store.state.projectStore.inDesign = false
        this.$store.state.projectStore.inSubmit = false
        this.$store.state.projectStore.toBeReceived = false
        this.$store.state.projectStore[curKey] = true
    }

    //  点击下层每一项
    handlePanelItem(item: any) {
        this.activePanel = item.id
        if (!item.displayActivityName) return;
        // inReview: false, // 审核中
        // inCheck: false, // 校核中
        // inDesign: false, // 设计中
        // inSubmit: false, // 已提交
        // toBeReceived: false, // 待接收
        const { displayActivityName } = item
        if (displayActivityName === '设计') {
            this.resetStoreData('inDesign')
        }
        if (displayActivityName === '归档') {
            this.resetStoreData('inSubmit')
        }
        if (displayActivityName === '接收') {
            this.resetStoreData('toBeReceived')
        }
        if (displayActivityName === '审核') {
            this.resetStoreData('inReview')
        }
        if (displayActivityName === '校审' || displayActivityName === '校核') {
            this.resetStoreData('inCheck')
        }
        this.$store.state.projectStore.taskId = item.id
        this.$store.state.menuStore.secondActiveMenu = 'ProjectItem/Design'
        this.$router.replace(`/ProjectItem/DesignReceived`)
    }

    // 搜索
    searchChange(value: string) {
        this.initProject(value)
    }

    // 项目跳转进来
    initProject(value?: string) {
        this.loading = true;
        getProjectDesign({
            appCode: 'XTSJ',
            projectId: this.$store.state.projectStore.curProjectId,
            searchName: value || ''
        }).then(res => {
            if (res.errcode !== 0) {
                return this.$message.error(res.errmsg as string);
            }
            if (!res.data || res.data.length === 0) {
                return this.$message.warn('未查询到数据');
            }
            this.designData = res.data;
        }).finally(() => {
            this.loading = false;
        });
    }

    // 计算背景色
    bgColor(value: string) {
        if (value === '设计') {
            return '#E4B701'
        }
        if (value === '归档') {
            return '#3AB603'
        }
        if (value === '校审' || value === '审核' || value === '校核') {
            return '#FD5118'
        }
        if (value === '接收') {
            return '#D52ED5'
        }
    }

    // init
    mounted() {
        if (this.activeMenu === '项目') {
            this.initProject('')
        }
    }
}
</script>
<style scoped lang="less">
.design-box {
    background: #424B56;

    /deep/ .ant-collapse-borderless,
    /deep/ .ant-collapse {
        background-color: transparent;
    }

    /deep/ .ant-collapse {
        border-radius: 0;
        color: white;
        border: none;
    }

    /deep/ .ant-collapse>.ant-collapse-item>.ant-collapse-header,
    /deep/ .ant-collapse-content {
        color: inherit;
        background-color: transparent;
    }

    /deep/ .ant-collapse-borderless>.ant-collapse-item,
    /deep/ .ant-collapse>.ant-collapse-item {
        border-bottom: none;
    }

    /deep/ .ant-collapse-content {
        border-top: none;
    }

    /deep/.ant-collapse>.ant-collapse-item>.ant-collapse-header {
        padding: 8px 16px;
        padding-left: 40px;
        border-bottom: 1px solid #313841;

    }

    /deep/.ant-collapse-content>.ant-collapse-content-box {
        padding: 0;
    }

    .panel-item {
        height: 38px;
        display: flex;
        align-items: center;
        border-bottom: 2px solid #313841;
        padding-left: 60px;
    }

    .panel-item-tip {
        padding: 2px 10px;
        margin-right: 5px;
    }

    .active-panel-item {
        background: #536780;
    }
}

.to-be-received {
    padding: 10px;

    span {
        padding: 2px 4px;
        border-radius: 4px;
        border: 1px solid #fff;
    }
}

.to-be-received:hover {
    cursor: pointer;
}

.no-data {
    text-align: center;
    padding: 20px 0;
}

.task-result {
    background: #313841;
    height: 28px;
    line-height: 28px;
    text-indent: 15px;
}

.icon {
    padding-right: 5px;
}
</style>

