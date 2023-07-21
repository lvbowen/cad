<template>
    <div>
        <PageSlot curPageName="设计任务单名称">
            <div class="d-submitted">
                <!-- 待接收 -->
                <div v-if="toBeReceived" class="to-be-received" @click="onReceivedData">
                    <span>接收任务</span>
                </div>
                <!-- 设计中已驳回 -->
                <div v-if="isReject || inDesign" class="d-reject">
                    <div>新增成果</div>
                    <BaseDropDown title="导入成果" width="70px">
                        <div>
                            <p>电脑本地文件</p>
                            <p @click="handleExist">临时工作区文件</p>
                        </div>
                    </BaseDropDown>
                    <div class="d-reject-submit">
                        <span>提交</span>
                    </div>
                </div>
                <!-- 审核中 -->
                <div v-if="inReview" class="d-review">
                    <div class="d-review-r">驳回</div>
                    <div class="d-review-a">同意</div>
                </div>
                <!-- 校核 -->
                <div v-if="inCheck" class="d-reject-submit">
                    <span>
                        提交
                    </span>
                </div>
                <div class="title">任务设计成果</div>
                <div v-if="resultData.length > 0">
                    <div v-for="item in resultData" :key="item.id" class="d-submitted-item">
                        <p class="name">
                            <span>icon</span>
                            <span>{{ item.fileName }}</span>
                        </p>
                        <div class="information">
                            <span>大小: {{ item.filesize }}</span>
                            <span>更新于: {{ item.updateTime }}</span>
                        </div>
                        <div v-if="isPass || isReject || inReview || inCheck" class="bottom">
                            <div class="bottom-pass-or-reject">
                                <div class="bottom-pass-or-reject-l">
                                    <div class="btn" @click="handleDropDown(item, 'read')">读取</div>
                                    <div v-if="isReject" class="reject-cloud-save" @click="handleDropDown(item, 'cloud')">
                                        云保存
                                    </div>
                                    <div v-if="inReview || inCheck" class="review-text">批注</div>
                                </div>
                                <BaseDropDown v-if="!inReview || !inCheck">
                                    <div>
                                        <p @click="handleDropDown(item, 'rename')">重命名</p>
                                        <p @click="handleDropDown(item, 'outImg')">出图</p>
                                    </div>
                                </BaseDropDown>
                            </div>
                            <div class="see-text" @click="handleText(item)">查看批注
                                <span>
                                    <a-icon v-if="!isShowText" type="down" />
                                    <a-icon v-else type="up" />
                                </span>
                            </div>
                            <div v-if="isShowText">
                                <div v-for="text in item.designAnnotationList" :key="text.id" class="text-item"
                                    @click.stop="handleDetail(text)">
                                    <span style="background: red;" class="circle"></span>
                                    <span class="text-item-name ">{{ text.annotationName }}</span>
                                    <span class="text-item-time">{{ text.createdTime }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="inDesign" class="bottom">
                            <div class="bottom-pass-or-reject">
                                <div class="bottom-pass-or-reject-l">
                                    <div class="btn" @click="handleDropDown(item, 'read')">读取</div>
                                    <div class="reject-cloud-save" @click="handleDropDown(item, 'cloud')">云保存</div>
                                </div>
                                <BaseDropDown>
                                    <div>
                                        <p @click="handleDropDown(item, 'delete')">删除</p>
                                        <p @click="handleDropDown(item, 'rename')">重命名</p>
                                        <p @click="handleDropDown(item, 'sort')">排序</p>
                                        <p @click="handleDropDown(item, 'outImg')">出图</p>
                                        <p @click="handleDropDown(item, 'common')">标准图框</p>
                                    </div>
                                </BaseDropDown>
                            </div>
                        </div>
                        <div v-if="inSubmit" class="btn" @click="handleDropDown(item, 'read')">读取</div>
                    </div>
                </div>
                <div v-else class="no-data">暂无数据</div>
            </div>
        </PageSlot>
        <BaseModal key="1" width="500px" title="新增成果" :visible="editResult" @handleCancel="onCancel">
            <a-form ref="formRef" :model="resultFormState" :label-col="labelCol" :wrapper-col="wrapperCol"
                @finish="onFinishResult">
                <a-form-item label="成果名称">
                    <a-input v-model="resultFormState.fileName"></a-input>
                </a-form-item>
                <a-form-item label="标准图框">
                    <a-input v-model="resultFormState.type"></a-input>
                </a-form-item>
                <a-form-item label="本地储存路径">
                    <a-input v-model="resultFormState.path"></a-input>
                </a-form-item>
                <a-form-item :wrapper-col="offsetCol">
                    <div class="modal-right-btn">
                        <BaseButton @onClick="onCancel" style="margin-right: 10px;">取消</BaseButton>
                        <BaseButton isPrimary html-type="submit">确认</BaseButton>
                    </div>
                </a-form-item>
            </a-form>
        </BaseModal>
        <BaseModal key="2" width="500px" title="读取选择" :visible="readVisible" @handleCancel="onCancel">
            <a-form ref="formRef" :model="readFormState" :label-col="labelCol" :wrapper-col="wrapperCol"
                @finish="onFinishRead">
                <a-form-item label="读取类型">
                    <a-select v-model="readFormState.fileType"></a-select>
                </a-form-item>
                <a-form-item label="文件名称">
                    <a-input v-model="readFormState.fileName"></a-input>
                </a-form-item>
                <a-form-item :wrapper-col="offsetCol">
                    <div class="modal-right-btn">
                        <BaseButton @onClick="onCancel" style="margin-right: 10px;">取消</BaseButton>
                        <BaseButton isPrimary html-type="submit">确认</BaseButton>
                    </div>
                </a-form-item>
            </a-form>
        </BaseModal>
        <BaseModal key="3" width="500px" title="出图" :visible="outImgVisible" @handleCancel="onCancel">
            <div>
                <p>请选择您需要出图的储存区</p>
                <a-radio-group style="margin: 15px 0;" v-model="outImgValue" name="radioGroup" @change="changeOutImg">
                    <a-radio value="1">临时出图区</a-radio>
                    <a-radio value="2">正式出图区</a-radio>
                </a-radio-group>
                <div class="modal-right-btn">
                    <BaseButton @onClick="onCancel" style="margin-right: 10px;">取消</BaseButton>
                    <BaseButton isPrimary @onClick="confirmOutImg">确认</BaseButton>
                </div>
            </div>
        </BaseModal>
        <BaseModal key="4" width="500px" title="临时工作区" :visible="extraVisible" @handleCancel="onCancel">
            <div>
                临时工作区
                <div class="modal-right-btn">
                    <BaseButton @onClick="onCancel" style="margin-right: 10px;">取消</BaseButton>
                    <BaseButton isPrimary @onClick="confirmOutImg">确认</BaseButton>
                </div>
            </div>
        </BaseModal>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import Dropdown from "ant-design-vue/lib/dropdown";
import "ant-design-vue/lib/dropdown/style/index.css";
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Form from 'ant-design-vue/lib/form';
import 'ant-design-vue/lib/form/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import "ant-design-vue/lib/modal/style/index.css";
import Radio from "ant-design-vue/lib/radio";
import "ant-design-vue/lib/radio/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import PageSlot from '../../../../components/PageSlot.vue'
import BaseDropDown from '../../../../components/BaseDropDown.vue'
import BaseModal from '../../../../components/BaseModal.vue'
import BaseButton from '../../../../components/BaseButton.vue'

import {
    receiveTask,
    taskResult,
    deleteResult,
    renameResult,
    outImgResult,
    cloudSaveResult
} from '../../../../../../../service/CoordinateDesign/External'

const projectStore = namespace("projectStore");

/**
 * 状态：
 * 设计==》
 * 已提交(读取) 
 * 已通过(读取) 
 * 已驳回(读取，云保存) 
 * 设计中(读取，云保存) 
 * 审核中(读取，批注) 
 * 校核(读取，批注)
 * 待接收？
 * 
 * 头部：
 * 已提交(无) 
 * 已通过(无) 
 * 已驳回(新增成果，导入成果，提交) 
 * 设计中(新增成果，导入成果，提交) 
 * 审核中(驳回，同意) 
 * 校核(提交)
 * 待接收？
 * 
 * 查看批注 /ProjectItem/Design/Detail
 */

@Component({
    name: "DSubmitted",
    components: {
        PageSlot,
        BaseDropDown,
        BaseModal,
        BaseButton,
        ARadioGroup: Radio.Group,
        ARadio: Radio,
        ADropdown: Dropdown,
        AIcon: Icon,
        ASelect: Select,
        AInput: Input,
        AForm: Form,
        AFormItem: Form.Item,
    }
})

export default class DSubmitted extends Vue {

    @projectStore.State("isPass") isPass: any; // 已通过
    @projectStore.State("isReject") isReject: any // 已驳回
    @projectStore.State("inReview") inReview: any // 审核中
    @projectStore.State("inCheck") inCheck: any // 校核中
    @projectStore.State("inDesign") inDesign: any; // 设计中
    @projectStore.State("inSubmit") inSubmit: any // 已提交
    @projectStore.State("toBeReceived") toBeReceived: any // 待接收

    // 表单布局
    labelCol = {
        span: 5
    }
    wrapperCol = {
        span: 19
    }

    offsetCol = { offset: 5, span: 19 }

    isShowText: boolean = false // 是否打开批注
    resultData: any = []
    loading: boolean = false
    editResult: boolean = false // 成果新增或编辑
    outImgVisible: boolean = false // 出图
    outImgValue: string = '1'
    readVisible: boolean = false // 读取
    curRecord: any = {} // 当前选中项
    // 读取弹框数据
    readFormState: any = {
        fileType: '',
        fileName: ''
    }
    // 成果设置或新增
    resultFormState: any = {
        fileName: '',
        type: '',
        path: ''
    }
    extraVisible: boolean = false // 临时工作区

    // 取消
    onCancel() {
        this.editResult = false
        this.outImgVisible = false
        this.readVisible = false
        this.extraVisible = false
    }

    // 临时工作文件夹
    handleExist(){
        this.extraVisible = true
    }

    // 成果弹框保存事件
    onFinishResult() {
        console.log(this.resultFormState)
    }

    // 读取选择确认
    onFinishRead() {
        console.log(this.readFormState)
    }

    // 出图确认
    confirmOutImg() {
        this.loading = true;
        outImgResult({
            appCode: 'XTSJ',
            file: this.curRecord.fileType,
            typeCode: this.outImgValue,
            designField: this.curRecord.id,
        }).then(res => {
            if (res.errcode !== 0) {
                return this.$message.error(res.errmsg as string);
            }
            return this.$message.success(res.errmsg as string)
        }).finally(() => {
            this.loading = false;
        });
    }

    // 出图类型改变
    changeOutImg(e: any) {
        this.outImgValue = e.target.value
    }

    // 点击接收任务
    onReceivedData(value?: string) {
        this.loading = true;
        receiveTask({
            appCode: 'XTSJ',
            projectId: this.$store.state.projectStore.curProjectId,
            searchName: value || ''
        }).then(res => {
            if (res.errcode !== 0) {
                return this.$message.error(res.errmsg as string);
            }
            return this.$message.success(res.errmsg as string)
        }).finally(() => {
            this.loading = false;
        });
    }

    // 任务成果
    initTaskResult(value?: string) {
        this.loading = true;
        taskResult({
            appCode: 'XTSJ',
            taskId: this.$store.state.projectStore.taskId
        }).then(res => {
            if (res.errcode !== 0) {
                return this.$message.error(res.errmsg as string);
            }
            if (!res.data || res.data.length === 0) {
                return this.$message.warn('未查询到数据');
            }
            console.log(res.data)
            this.resultData = res.data;
        }).finally(() => {
            this.loading = false;
        });
    }

    // 云存储
    cloudSave(item: any) {
        this.loading = true;
        cloudSaveResult({
            appCode: 'XTSJ',
            file: item.fileType,
            designField: item.id,
        }).then(res => {
            if (res.errcode !== 0) {
                return this.$message.error(res.errmsg as string);
            }
            return this.$message.success(res.errmsg as string)
        }).finally(() => {
            this.loading = false;
        });
    }

    // 删除 重命名 排序 出图 标准图框 提交 读取 云保存
    handleDropDown(item: any, type: string) {
        this.curRecord = item;
        // 删除
        if (type === 'delete') {
            Modal.confirm({
                title: '您是否需要删除该成果文件，请确认。',
                okText: "确定",
                cancelText: "取消",
                centered: true,
                ok() { this.handleDelete(item) }
            });
        }
        // 重命名
        if (type === 'rename') {
            this.editResult = true
        }
        if (type === 'sort') {
            console.log('排序')
        }
        if (type === 'outImg') {
            this.outImgVisible = true
        }
        if (type === 'common') {
            console.log('标准图框')
        }
        if (type === 'read') {
            this.readVisible = true
        }
        // 云存储
        if (type === 'cloud') {
            this.cloudSave(item)
        }
        if (type === 'submit') {
            Modal.confirm({
                title: '您是否需要提交本设计任务单，请确认。',
                okText: "确定",
                cancelText: "取消",
                centered: true,
                ok() { this.handleSubmit() }
            });
        }
    }

    // 提交
    handleSubmit() { }

    // 删除
    handleDelete(item: any) {
        this.loading = true;
        deleteResult({
            appCode: 'XTSJ',
            designFileId: item.id,
        }).then(res => {
            if (res.errcode !== 0) {
                return this.$message.error(res.errmsg as string);
            }
            return this.$message.success(res.errmsg as string)
        }).finally(() => {
            this.loading = false;
        });
    }

    // 查看批注
    handleText(item: any) {
        if (item.designAnnotationList && item.designAnnotationList.length > 0) {
            this.isShowText = !this.isShowText
        } else {
            console.log('无数据,再处理')
        }
    }

    // 查看批注
    handleDetail(text: any) {
        this.$router.push(`/ProjectItem/Design/Detail`)
    }

    mounted() {
        this.initTaskResult()
    }
}
</script>

<style scoped lang="less">
a {
    margin: 0;
    padding: 0;
}

.d-submitted {
    .title {
        font-weight: bold;
        height: 32px;
        line-height: 32px;
        text-indent: 10px;
        background: #313841;
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

    .d-reject {
        padding: 0 10px;
        display: grid;
        grid-template-columns: 100px 1fr 70px;
        height: 40px;
        align-items: center;
    }

    .d-reject-submit {
        padding: 10px;

        span {
            border-radius: 4px;
            padding: 2px 8px;
            background: #1473E6;
        }
    }

    .d-submitted-item {
        border-bottom: 2px solid #313841;
        padding: 10px;

        .name {
            display: flex;
            height: 28px;
            align-items: center;
        }

        .name span:first-child {
            width: 40px;
        }

        .name span:last-child {
            flex: 1;
        }

        .information {
            display: flex;
            justify-content: space-between;
            height: 28px;
            align-items: center;
        }

        .btn {
            color: yellow;
        }

        .btn:hover {
            cursor: pointer;
            opacity: 0.8;
        }
    }

    .d-review {
        display: flex;
        color: inherit;
        padding: 10px;

        .d-review-r {
            border: 1px solid #fff;
            border-radius: 4px;
            padding: 2px 8px;
        }

        .d-review-a {
            border-radius: 4px;
            padding: 2px 8px;
            background: #1473E6;
            margin-left: 10px;
        }
    }

    .bottom-pass-or-reject {
        display: flex;
        justify-content: space-between;
        height: 36px;
        align-items: center;
    }

    .bottom-pass-or-reject-l {
        display: flex;
    }

    .reject-cloud-save {
        color: #397F3C;
        margin-left: 30px;
    }

    .review-text {
        color: #FF7687;
        margin-left: 30px;
    }

    .bottom-dropdown-item p:hover {
        background: #536780;
    }

    .see-text {
        text-align: center;
        border-top: 1px dashed #ddd;
        height: 44px;
        line-height: 44px;
    }

    .see-text:hover {
        cursor: pointer;
        opacity: 0.8;
    }

    .circle {
        width: 8px;
        height: 8px;
        border-radius: 4px;
    }

    .text-item {
        display: grid;
        grid-template-columns: 6px 1fr 100px;
        grid-column-gap: 10px;
        height: 36px;
        align-items: center;
    }

    .text-item-name {
        border-bottom: 1px solid #fff;
        max-width: 80%;
    }

    .text-item-name:hover {
        opacity: 0.8;
        cursor: pointer;
    }

    .text-item-time {
        text-align: right;
    }
}

.no-data {
    text-align: center;
    padding: 20px 0;
}
</style>