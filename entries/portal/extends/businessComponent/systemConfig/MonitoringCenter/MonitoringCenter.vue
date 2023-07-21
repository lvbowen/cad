<template>
  <div class="monitoring-center full-height">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="摄像头配置" class="custom-style full-height flex-column">
        <div class="flex btns flex-center-align">
          <a-button
            type="primary"
            @click="visible=true"
            :disabled="!curSelectedTreeNode || (curSelectedTreeNode && !['pro','subGroup'].includes(curSelectedTreeNode.type))">
            新增分类
          </a-button>
          <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteProGroup">
            <a-button
              :disabled="!curSelectedTreeNode || (curSelectedTreeNode && curSelectedTreeNode.type!=='subGroup')"
            >
              删除
            </a-button>
          </a-popconfirm>
          <a-popover>
            <div class="tips" slot="content"><span>视频类别树说明：</span><br/>视频类别树（不含摄像头分组）无法进行删除和编辑，仅支持对项<br/>目名称栏进行添加分类操作，添加的分组支持删除和新增分类操作。<br/>
            </div>
            <a-icon type="question-circle" theme="filled"/>
          </a-popover>
        </div>

        <div class="flex inner">
          <a-card class="left full-height">
            <div class="_title">视频类别树</div>
            <a-tree
              :treeData="treeData"
              :replaceFields="replaceFields"
              :defaultExpandAll="true"
              :showIcon="true"
              @select="selectTreeNode"
              :key="treeKey">
              <a-icon slot="proIcon" type="project" />
              <a-icon slot="deviceIcon" type="cluster" />
            </a-tree>
          </a-card>
          <a-card class="right full-height">
            <a-tabs :activeKey="activeTable" @change="changeTable">
              <a-tab-pane key="1" tab="视频设备设置">
                <a-button
                  type="primary"
                  @click="toForm('add',{schemaCode:`${projectCode}_device`})"
                  v-show="curSelectedTreeNode && ['subGroup','pro'].includes(curSelectedTreeNode.type)">新增摄像头
                </a-button>
                <a-table
                  bordered
                  v-show="curSelectedTreeNode && ['subGroup','pro'].includes(curSelectedTreeNode.type)"
                  :data-source="tableData"
                  :columns="tableColumns"
                  :scroll="{ x: 1300 }"
                  :key="tableKey"
                  :pagination="false">
                  <template slot="url" slot-scope="text,record, index">
                    <a :href="text" target="_blank">{{ text }}</a>
                  </template>
                  <template slot="operation" slot-scope="text, record, index">
                    <div class="editable-row-operations">
                      <a
                        @click="() => toForm('edit',{schemaCode:`${projectCode}_device`,id: record.id})"
                        class="base-color">查看</a>
                      <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteConfig(record.id)">
                        <a class="warning-color">删除</a>
                      </a-popconfirm>
                    </div>
                  </template>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="2" tab="上传图片" forceRender>
                <el-upload
                  :limit="1"
                  v-if="showUploadImgs"
                  action=""
                  listType="picture-card"
                  :httpRequest="Upload"
                  :fileList="attachmentList"
                  :onRemove="handleRemove"
                  :onPreview="handlePictureCardPreview"
                >
                  <i v-if="disabled" class="el-icon-plus"></i>
                  <i v-if="!disabled" class="el-icon-close"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogVisible">
                  <img width="100%" :src="dialogImageUrl" alt="" />
                </el-dialog>
              </a-tab-pane>
              <a-tab-pane key="3" tab="权限配置" forceRender>
                <a-button
                  size="small"
                  type="primary"
                  @click="newAdd"
                  v-show="perTableData.length===0 && showUploadImgs"> 新增 </a-button>
                <a-table
                  :columns="perTableColumns"
                  :data-source="perTableData"
                  v-show="perTableData.length"
                  rowKey="id"
                  :pagination="false">
                  <template slot="operation" slot-scope="text, record, index">
                    <div class="editable-row-operations">
                      <a @click="theEditor(record)" class="base-color">编辑</a>
                    </div>
                  </template>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <a-modal
      :visible="visible"
      title="新增分类组"
      @cancel="handCancel"
      @ok="addGroup">
      <div class="flex nowrap flex-center-align">
        <div class="label">组名:</div>
        <a-input v-model="addGroupName" class="flex-1"></a-input>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive} from 'vue-property-decorator';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Tree from 'ant-design-vue/lib/tree';
import 'ant-design-vue/lib/tree/style/index.css';
import Card from 'ant-design-vue/lib/card';
import 'ant-design-vue/lib/card/style/index.css';
import Popover from 'ant-design-vue/lib/popover';
import 'ant-design-vue/lib/popover/style/index.css';
import {MonitoringCenterTree, CameraList} from "../type";
import {
  getFormUrl,
  getMonitoringCenterTree,
  addMonitorProGroup,
  getCameraList,
  deleteCamera,
  deleteMonitorProGroup
} from "../../../service/api";
import * as Type from "../../../type";
import onActionClick
  from "../../../../../../modules/@cloudpivot/list/src/components/pc/scripts/onActionClick";
import Dialog from "element-ui/lib/dialog";
import Upload from "element-ui/lib/upload";
import { DelBackGround,getAddBackGround,getbackGround } from "./index.js"
import * as Api from "../../../service/api";

@Component({
  name: 'MonitoringCenter',
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ATable: Table,
    AButton: Button,
    APopconfirm: Popconfirm,
    AModal: Modal,
    ATree: Tree,
    ACard: Card,
    APopover: Popover,
    ElUpload: Upload,
    ElDialog: Dialog,
  }
})
export default class MonitoringCenter extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  activeKey: string[] = ['1'];
  //tree
  treeData: MonitoringCenterTree[] = [];
  replaceFields: { [propsName: string]: string } = {
    children: 'children', title: 'name', key: 'id'
  };
  curSelectedTreeNode: MonitoringCenterTree | null = null;
  treeKey: number = 1;
  //modal
  visible: boolean = false;
  addGroupName: string = '';
  //table
  tableData: CameraList[] = [];
  tableColumns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '摄像头名称',
      dataIndex: 'name',
      key: 'name',
      width: 140
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true
    },
    {
      title: 'AppKey',
      dataIndex: 'appKey',
      key: 'appKey'
    },
    {
      title: '序列号',
      dataIndex: 'serialNo',
      key: 'serialNo'
    },
    {
      title: '通道号',
      dataIndex: 'channelNo',
      key: 'channelNo'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 150,
      fixed: 'right',
      scopedSlots: {customRender: 'operation'},
    }
  ];
  perTableData:Array<any>=[]
  perTableColumns:Array<any>=[
    {
      title: "项目简称",
      dataIndex: "projectName",
      key: "projectName",
      align: "center",
    },
    {
      title: "人员列表",
      dataIndex: "personList",
      align: "center",
      key: "personList",
      width: "50%",
      ellipsis: true,
    },
    {
      title: "操作",
      align: "center",
      dataIndex: "operation",
      scopedSlots: { customRender: "operation" },
    },
  ];
  tableKey: number = 1;

  dialogImageUrl: string = "";
  dialogVisible: boolean = false;
  isShowUpload: boolean = false;
  disabled: boolean = true;
  attachmentList: Array<any> = [];
  activeTable: string = "1"
  projectName: any = null
  Imgid: string = ""

  isExistUpPro: boolean = false;
  get showUploadImgs(){
    return (this.isExistUpPro && this.curSelectedTreeNode && this.curSelectedTreeNode.type==='upPro') || (!this.isExistUpPro&& this.curSelectedTreeNode && this.curSelectedTreeNode.type==='pro')
  }

  newAdd(){
    const routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode ?? ""}_video_control`,
        sheetCode: `${this.projectCode ?? ""}_video_control`,
        queryCode: `${this.projectCode ?? ""}_video_control`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: "add",
        projectName: this.curSelectedTreeNode?.projectName ?? "",
      },
    });
    window.open(routeData.href, "_blank");
  }
  theEditor(record:any){
    const routeda = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode ?? ""}_video_control`,
        sheetCode: `${this.projectCode ?? ""}_video_control`,
        return: `${this.$route.fullPath}&iframeAction=detail`,
        iframeAction: "detail",
        objectId: record.id ?? "",
      },
    });
    window.open(routeda.href, "_blank");
  }

  init() {
    getMonitoringCenterTree({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.treeData = res.data;
        this.treeArrFilter(this.treeData,'children')
        this.treeKey++;
      }
    })
  }
  getVideoAuth(projectCode,projectName){
    this.perTableData=[];
    Api.getVideoAuth({appCode: projectCode,projectName: projectName,}).then((ress)=>{
      if(ress.errcode!==0) return this.$message.error(ress.errmsg as string)
      if(!ress.data) return this.perTableData = []; //空值为null
      this.perTableData.push(ress.data)
    })
  }

  selectTreeNode(selectedKeys, e) {
    this.tableData = [];
    this.perTableData = [];
    this.projectName = e.node.dataRef.projectName
    setTimeout(()=> {
      if(this.showUploadImgs) {
        this.isShowUpload = true
        getbackGround(this.projectCode,this.projectName ).then(res=>{
          if(res.data.url) {
            console.log(res);
            this.disabled = false
            this.Imgid = res.data.id
            this.attachmentList = [{url: res.data.url}]
          }else {
            this.attachmentList = []
            this.disabled = true
          }
        })
        this.getVideoAuth(this.projectCode,this.projectName);
      }else {
        this.isShowUpload = false
        this.attachmentList = []
        this.disabled = true
      }
    },100)
    selectedKeys.includes(e.node.dataRef.id) ? this.curSelectedTreeNode = e.node.dataRef : this.curSelectedTreeNode = null;
    if (this.curSelectedTreeNode && ['subGroup','pro'].includes(this.curSelectedTreeNode.type)) {
      this.getCameraList();
    }
  }

  treeArrFilter(arr:any[] = [], attChildren = 'children') {
    arr.map((item) => {
      if(item.type==='pro') {
        this.$set(item, 'slots', { icon:'proIcon'})
      }else if(item.type==='group') {
        this.$set(item, 'slots', { icon:'deviceIcon'})
      }
      if(item.type === 'upPro') {
        this.isExistUpPro = true
      }
      if (item[attChildren]) {
        this.treeArrFilter(item[attChildren], attChildren);
      }
    });
  }

  handCancel() {
    this.visible = false;
    this.addGroupName = '';
  }

  addGroup() {
    const params = {
      appCode: this.projectCode ?? '',
      name: this.addGroupName,
      parentId: this.curSelectedTreeNode?.id ?? '',
      parentType: this.curSelectedTreeNode?.type ?? ''
    }
    addMonitorProGroup(params).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('新增成功！')
      this.init()
    }).finally(() => {
      this.visible = false;
      this.addGroupName = '';
    })
  }

  changeTable(e) {
    this.activeTable = e;
  }

  deleteProGroup() {
    deleteMonitorProGroup({
      appCode: this.projectCode ?? '',
      id: this.curSelectedTreeNode?.id ?? ''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.init();
    })
  }

  getCameraList() {
    getCameraList({
      appCode: this.projectCode ?? '',
      id: this.curSelectedTreeNode?.id ?? '',
      type: this.curSelectedTreeNode?.type??''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.tableData = res.data;
        this.tableKey++;
      }
    })
  }

  toForm(flag: string, params: { schemaCode: string, id?: string }) {
    switch (flag) {
      case 'add':
        let routeData = this.$router.resolve({
          // 业务表单
          name: "form-detail",
          query: {
            schemaCode: params.schemaCode,
            sheetCode: params.schemaCode,
            return: `${this.$route.fullPath}&iframeAction=add`,
            iframeAction: 'add',
            projectName: this.curSelectedTreeNode?.projectName??'',
            parentId: this.curSelectedTreeNode?.id??null,
            projectId: this.curSelectedTreeNode?.projectId??null
          },
        });
        this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
        break;
      case 'edit':
        getFormUrl({
          bizObjectId: params?.id ?? '',
          schemaCode: params.schemaCode
        }).then((res) => {
          // 如果报错, 会返回一个对象
          if (typeof res === "object" && res.errcode !== 0) {
            return this.$message.error(res.errmsg as string, 3);
          }
          // 否则返回一个字符串
          else if (typeof res === "string") {
            let search = location.search;
            search = search
              ? `${search}&iframeAction=detail`
              : `?iframeAction=detail`;
            // const url = `${res}&return=${location.pathname + encodeURIComponent(search)}`;
            let url:string = '';
            if(this.isDingTalk) {
              const projectLength:number = window.config.project.length;
              const pathName =  location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
              url = `${ res }&return=${ pathName + encodeURIComponent( search )}`;
            }else{
              url = `${ res }&return=${ location.pathname + encodeURIComponent( search )}`;
            }
            if(this.isDingTalk) {
              this.$router.push(url)
            }else{
            const formUrl = onActionClick.getFormRealUrl(this, url);
            window.open(formUrl);
          }
          }
        })
        break;
    }
  }

  deleteConfig(id: string) {
    deleteCamera({appCode: this.projectCode ?? '', id: id}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.getCameraList();
    })
  }

  mounted() {
    this.init();
  }
  // 上传功能
  Upload(val) {
    const newFile = new FormData();
    newFile.append("appCode", this.projectCode);
    newFile.append("projectName", this.projectName);
    newFile.append("file", val.file);
    getAddBackGround(newFile).then(res=>{
      this.disabled = false
      this.$message.success("上传成功！")
    })
  }

  handleRemove() {
    this.attachmentList = [];
    DelBackGround(this.projectCode,this.Imgid).then(res=>{
      this.$message.success("删除成功！")
      this.disabled = true
    })
  }

  handlePictureCardPreview(file){
    this.dialogImageUrl = file.url
    this.dialogVisible = true
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.monitoring-center {
  .btns {
    /deep/ .ant-btn {
      width: fit-content;
      margin-right: @spacing-base;
    }

    .tips {
    }
  }
  .inner {
    height: calc(100% - 48px);
    .left {
      width: calc(35% - @spacing-large);
      margin-right: @spacing-large;
      overflow: auto;
    }

    .right {
      width: 65%;
      overflow: auto;
      /deep/ .ant-btn {
        width: fit-content;
      }
    }
  }
}

.label {
  margin-right: @spacing-base;
}
/deep/ .ant-collapse {
  height: 100%;
  .ant-collapse-content {
    flex: 1;
  }
  .ant-collapse-content-box {
    height: calc(100% - 8px);
  }
}
</style>
