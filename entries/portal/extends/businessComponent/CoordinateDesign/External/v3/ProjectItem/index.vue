<template>
    <PageSlot curPageName="我的项目">
        <SearchTemp @searchChange="searchChange" :isProject="true" @handleShowTip="handleShowTip"></SearchTemp>
        <div class="project-box">
            <a-spin :spinning="loading" size="large" tip="努力加载中……">
                <div v-for="project in listData" :key="project.id"
                    :class="['project-item', project.id === curId && 'project-item-active']"
                    @click="handleProject(project)">
                    <div class="project-item-name">{{ project.engineeringName }}</div>
                    <div class="project-item-bottom">
                        <p>
                            项目经理:
                            <span>{{ project.projectManager }}</span>
                        </p>
                        <p>
                            所属年度:
                            <span>{{ project.year }}</span>
                        </p>
                        <p>
                            项目阶段:
                            <span style="color: #39A32A;">{{ project.engineeringStage }}</span>
                        </p>
                        <p>
                            所在省市:
                            <span>{{ project.engineeringLocation }}</span>
                        </p>
                    </div>
                </div>
            </a-spin>
        </div>
        <BaseModal width="500px" title="筛选" :visible="isVisible" @handleCancel="handleCancel">
            <div>
                <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }"
                    @finish="onFinish">
                    <a-form-item label="所属年度">
                        <a-date-picker format="YYYY" style="width: 100%;" picker="year"></a-date-picker>
                    </a-form-item>
                    <a-form-item label="项目阶段">
                        <a-select></a-select>
                    </a-form-item>
                    <a-form-item label="所在城市">
                        <a-select></a-select>
                    </a-form-item>
                    <a-form-item :wrapper-col="{ offset: 5, span: 19 }">
                        <BaseButton @onClick="onReset" style="margin-right: 10px;">重置</BaseButton>
                        <BaseButton isPrimary html-type="submit">确认</BaseButton>
                    </a-form-item>
                </a-form>
            </div>
        </BaseModal>
    </PageSlot>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// 引入组件
import Spin from 'ant-design-vue/lib/spin';
import 'ant-design-vue/lib/spin/style/index.css';
import Form from 'ant-design-vue/lib/form';
import 'ant-design-vue/lib/form/style/index.css';
import DatePicker from "ant-design-vue/lib/date-picker";
import "ant-design-vue/lib/date-picker/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import SearchTemp from '../../components/SearchTemp.vue'
import PageSlot from '../../components/PageSlot.vue'
import BaseModal from '../../components/BaseModal.vue'
import BaseButton from '../../components/BaseButton.vue'
import type { FormInstance } from 'ant-design-vue'

import projectStore from '../store/projectStore';

import { getProjectData, getProjectStage } from '../../../../../service/CoordinateDesign/External'
import { ProjectList } from "../../../../../type"

@Component({
    name: "ProjectItem",
    components: {
        SearchTemp,
        PageSlot,
        BaseModal,
        BaseButton,
        ASpin: Spin,
        AForm: Form,
        AFormItem: Form.Item,
        ADatePicker: DatePicker,
        ASelect: Select,
        AButton: Button
    }
})

export default class ProjectItem extends Vue {

    loading: boolean = false // 是否加载
    listData: ProjectList[] = [] // 数据
    isVisible: boolean = false // 是否显示筛选
    formState = {
        year: '',
        projectTip: '',
        city: ''
    }
    formRef: FormInstance = null
    curId: string = ''

    // 重置
    onReset() {
        console.log(this.formRef, this.$store.state.projectStore)
        // this.formRef.resetFields()
    }

    // 提交表单
    onFinish(value) {
        console.log(this.$store)
    }

    // 搜索
    searchChange(value: string) {
        this.getCurrentData(value)
    }

    // 点击筛选
    handleShowTip() {
        this.isVisible = true
    }

    // 关闭弹框
    handleCancel() {
        this.isVisible = false
    }

    // 当前选中的项目
    handleProject(project: ProjectList) {
        this.curId = project.id
        this.$store.state.projectStore.curProjectId = project.id
    }

    // 获取list数据
    getCurrentData(value: string) {
        this.loading = true
        getProjectData({
            activityCode: '',
            appCode: 'XTSJ',
            engineeringLocation: '',
            engineeringStage: '',
            searchName: value,
            year: ''
        }).then(res => {
            if (res.errcode !== 0) return this.$message.error(res.errmsg as string)
            if (!res.data || res.data.length === 0) return this.$message.error('查询到数据')
            this.listData = res.data
        }).finally(() => {
            this.loading = false
        })
    }

    mounted() {
        this.getCurrentData('')
        this.$store.registerModule('projectStore', projectStore);
    }

    destroyed() {
        // this.$store.unregisterModule('projectStore');
    }
}
</script>
<style lang="less">
.project-item {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 30px 1fr;
    height: 120px;
    align-items: center;
    color: white;
    border-bottom: 2px solid #212830;
    padding: 10px;
    box-sizing: border-box;

    .project-item-name {
        font-size: 17px;
    }

    .project-item-bottom {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;

        span {
            padding-left: 5px;
        }
    }
}

.project-item-active {
    border: 1px dashed #ccc;
}

.ant-form {
    color: white;
}

.ant-form-item,
.ant-form-item-label>label {
    color: inherit;
}
</style>

