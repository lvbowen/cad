<template>
  <div class="monitoring-center full-height">
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon :rotate="props.isActive ? 90 : 0" type="caret-right"/>
      </template>
      <a-collapse-panel key="0" class="custom-style flex-column miniMargin" header="服务器配置">
        <a-tabs :activeKey="activeTab" @change="changeTab">
          <a-tab-pane key="0" tab="信令服务配置">
            <a-descriptions :column="5" bordered layout="vertical">
              <a-descriptions-item label="SIP ID">{{ basicData.Serial }}</a-descriptions-item>
              <a-descriptions-item label="SIP 域">{{ basicData.Realm }}</a-descriptions-item>
              <a-descriptions-item label="SIP Host">{{ basicData.Host }}</a-descriptions-item>
              <a-descriptions-item label="SIP 端口">{{ basicData.Port }}</a-descriptions-item>
              <a-descriptions-item label="设备统一接入密码">{{ basicData.DevicePassword }}</a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
          <!--          <a-tab-pane key="2" tab="流媒体服务配置" :column="5">-->
          <!--            <a-descriptions layout="vertical" bordered>-->
          <!--              <a-descriptions-item label="SMS 服务">{{ basicData.Serial }}</a-descriptions-item>-->
          <!--              <a-descriptions-item label="本地|内网 IP">{{ basicData.Realm }}</a-descriptions-item>-->
          <!--              <a-descriptions-item label="外网 IP(可选)">{{ basicData.Host }}</a-descriptions-item>-->
          <!--              <a-descriptions-item label="RTMP 端口">{{ basicData.Port }}</a-descriptions-item>-->
          <!--              <a-descriptions-item label="存储清理阀值(MB)">{{ basicData.DevicePassword }}</a-descriptions-item>-->
          <!--            </a-descriptions>-->
          <!--          </a-tab-pane>-->
        </a-tabs>
      </a-collapse-panel>
      <a-collapse-panel key="1" class="custom-style flex-column miniMargin" header="设备项目对照表">
        <div class="flex btns flex-center-align">
          <a-button size="small" type="primary" @click="toForm('add')"> 新增</a-button>
        </div>
        <a-table
          v-if="listData.length !== 0"
          :columns="listColumns"
          :data-source="listData"
          :pagination="{ pageSize: 5 }"
          bordered
          rowKey="id"
          size="small"
        >
          <template slot="operation" slot-scope="text, record, index">
            <div class="editable-row-operations">
              <a @click="toForm('edit', record.id)">编辑</a>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel key="2" class="custom-style flex-column miniMargin" header="监控配置">
        <div class="flex btns flex-center-align">
          <a-button
            :disabled="!curSelectedTreeNode ||(curSelectedTreeNode && !['pro', 'subGroup'].includes(curSelectedTreeNode.type))"
            size="small"
            type="primary"
            @click="visible = true"
          >
            新增分组
          </a-button>
          <a-button
            :disabled="!curSelectedTreeNode ||(curSelectedTreeNode && !['pro', 'subGroup'].includes(curSelectedTreeNode.type))"
            size="small"
            type="primary"
            @click="isBindModal = true;getNoneBindVideoQingVideo();"
          >
            绑定设备
          </a-button>
          <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteProGroup">
            <a-button
              :disabled="!curSelectedTreeNode ||(curSelectedTreeNode &&['group', 'pro', 'company'].includes(curSelectedTreeNode.type)) ||tableData.length !== 0"
              size="small"
            >
              删除
            </a-button>
          </a-popconfirm>
          <a-popover>
            <div slot="content" class="tips">
              <span>视频类别树说明：</span
              ><br/>视频类别树（不含摄像头分组）无法进行删除和编辑，仅支持对项<br/>目名称栏进行添加分类操作，添加的分组支持删除和新增分类操作。<br/>
            </div>
            <a-icon theme="filled" type="question-circle"/>
          </a-popover>
        </div>
        <div class="flex inner">
          <a-card class="left full-height">
            <div class="_title">视频类别树</div>
            <a-tree
              :key="treeKey"
              :defaultExpandAll="true"
              :replaceFields="replaceFields"
              :showIcon="true"
              :treeData="treeData"
              @select="selectTreeNode"
            >
              <a-icon slot="proIcon" type="project"/>
              <a-icon slot="deviceIcon" type="cluster"/>
            </a-tree>
          </a-card>
          <a-card class="right full-height">
            <div class="_title">
              <a-tabs :activeKey="activeTable" @change="changeTable">
                <a-tab-pane key="1" tab="视频设备设置">
                  <a-table
                    :columns="tableColumns"
                    :data-source="tableData"
                    :pagination="{ pageSize: 5 }"
                    :scroll="{ x: 1400 }"
                    bordered
                    rowKey="id"
                    size="small"
                  >
                    <!-- 名称可更改-->
                    <template slot="channelName" slot-scope="text, record, index">
                      <a-tooltip>
                        <template slot="title">
                          {{ record.channelName }}
                        </template>
                        <a-input
                          :defaultValue="record.channelName"
                          size="small"
                          @change="stateChange"
                          @pressEnter="modifyDevicePropertyQingVideo(0, record)"
                        />
                      </a-tooltip>
                    </template>
                    <!-- 音频、云端、分享、按需直播状态封盖-->
                    <template
                      v-for="(v, i) in slotData"
                      :slot="Object.keys(v)[0]"
                      slot-scope="text, record, index"
                    >
                      <a-switch
                        :key="i"
                        :defaultChecked="record[Object.keys(v)[0]] === 1"
                        :disabled="Object.keys(v)[0]==='cloudRecord'"
                        checkedChildren="开"
                        unCheckedChildren="关"
                        @change="switchChange($event, v[Object.keys(v)[0]], record)"
                      />
                    </template>
                    <!-- 设备在线状态处理-->
                    <template slot="deviceOnline" slot-scope="text, record, index">
                      <a-switch
                        :defaultChecked="record.deviceOnline === 1"
                        checkedChildren="在线"
                        disabled
                        unCheckedChildren="离线"
                      />
                    </template>
                    <!-- 经纬度更改-->
                    <template slot="position" slot-scope="text, record, index">
                      <span @click="openEditModal(record)">{{
                        record.longitude + "," + record.latitude + "," + record.altitude
                      }}</span>
                    </template>
                    <!-- 云台类型处理-->
                    <template slot="customType" slot-scope="text, record, index">
                      <a-select
                        :defaultValue="record.customType"
                        size="small"
                        style="width: 90px"
                        @change="changeCustomType($event, record)"
                      >
                        <a-select-option :value="0">未知</a-select-option>
                        <a-select-option :value="1">球机</a-select-option>
                        <a-select-option :value="2">半球机</a-select-option>
                        <a-select-option :value="3">固定枪机</a-select-option>
                        <a-select-option :value="4">遥控枪机</a-select-option>
                      </a-select>
                    </template>
                    <!-- 快照处理-->
                    <template slot="snapUrl" slot-scope="text, record, index">
                      <a-popover title="快照">
                        <template slot="content">
                          <img :src="record.snapUrl" alt="" style="width: 100%; height: 100%"/>
                        </template>
                        <a-icon theme="twoTone" type="camera"/>
                      </a-popover>
                      <!--                <img :src="record.snapUrl" alt="" style="width: 20px;height: 20px">-->
                    </template>
                    <!-- 操作栏（上移下移解绑）-->
                    <template slot="operation" slot-scope="text, record, index">
                      <div class="editable-row-operations">
                        <a @click="sortDeviceQingVideo(record, true)">上移</a>
                        <a @click="sortDeviceQingVideo(record, false)">下移</a>
                        <a-popconfirm title="确认解绑吗？" @confirm="unBindDevice(record)">
                          <a>解绑</a>
                        </a-popconfirm>
                      </div>
                    </template>
                  </a-table>
                </a-tab-pane>
                <a-tab-pane key="2" tab="上传图片" forceRender>
                  <el-upload
                    v-if="isShowUpload"
                    :limit="1"
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
                    <img width="100%" :src="dialogImageUrl" alt=""/>
                  </el-dialog>
                </a-tab-pane>
                <a-tab-pane key="3" tab="权限配置" forceRender>
                  <a-button
                    size="small"
                    type="primary"
                    @click="newAdd"
                    v-if="perTableData.length==0"> 新增
                  </a-button>
                  <a-table
                    :columns="perTableColumns"
                    :data-source="perTableData"
                    rowKey="id"
                    :pagination="false"
                    v-else>
                    <template slot="operation" slot-scope="text, record, index">
                      <div class="editable-row-operations">
                        <a @click="theEditor(record)">编辑</a>
                      </div>
                    </template>
                  </a-table>
                </a-tab-pane>
              </a-tabs>
            </div>
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
    <a-modal
      :visible="isBindModal"
      title="绑定设备"
      width="900px"
      @cancel="
        isBindModal = false;
        unBindDeviceData = [];
        selectedRowinfo = [];
        selectedRowKeys = [];
      "
      @ok="bindDevice"
    >
      <div class="flex nowrap flex-center-align">
        <a-table
          v-if="unBindDeviceData.length !== 0"
          :columns="unBindDeviceColumns"
          :data-source="unBindDeviceData"
          rowKey="id"
          :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
          :scroll="{ x: 840, y: 600 }"
          size="small"
        >
          <template slot="deviceOnline" slot-scope="text, record, index">
            <a-switch
              :defaultChecked="record.deviceOnline === 1"
              checkedChildren="在线"
              disabled
              unCheckedChildren="离线"
            />
          </template>
          <template slot="audioEnable" slot-scope="text, record, index">
            <a-switch
              :defaultChecked="record.audioEnable === 1"
              checkedChildren="开启"
              disabled
              unCheckedChildren="关闭"
            />
          </template>
          <template slot="cloudRecord" slot-scope="text, record, index">
            <a-switch
              :defaultChecked="record.cloudRecord === 1"
              checkedChildren="开启"
              disabled
              unCheckedChildren="关闭"
            />
          </template>
        </a-table>
      </div>
    </a-modal>
    <a-modal
      :visible="isEdit"
      title="设备地理位置"
      width="500px"
      @cancel="isEdit = false"
      @ok="editPosition"
    >
      <div class="flex-column">
        <div class="edit-position">
          经度:
          <a-input-number
            :value="positionData.longitude"
            @change="changePosition($event, 'longitude')"
          />
        </div>
        <div class="edit-position">
          纬度:
          <a-input-number
            :value="positionData.latitude"
            @change="changePosition($event, 'latitude')"
          />
        </div>
        <div class="edit-position">
          高程:
          <a-input-number
            :value="positionData.altitude"
            @change="changePosition($event, 'altitude')"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
/// <reference path="../../../../src/typings/shims-tsx.d.ts" />
import {Vue, Component, InjectReactive} from "vue-property-decorator";
import Collapse from "ant-design-vue/lib/collapse";
import "ant-design-vue/lib/collapse/style/index.css";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style/index.css";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import Popconfirm from "ant-design-vue/lib/popconfirm";
import "ant-design-vue/lib/popconfirm/style/index";
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import "ant-design-vue/lib/tree/style/index.css";
import Card from "ant-design-vue/lib/card";
import "ant-design-vue/lib/card/style/index.css";
import Popover from "ant-design-vue/lib/popover";
import "ant-design-vue/lib/popover/style/index.css";
import Tabs from "ant-design-vue/lib/tabs";
import "ant-design-vue/lib/tabs/style/index.css";
import Input from "ant-design-vue/lib/input";
import "ant-design-vue/lib/input/style/index.css";
import Descriptions from "ant-design-vue/lib/descriptions";
import "ant-design-vue/lib/descriptions/style/index.css";
import Switch from "ant-design-vue/lib/switch";
import "ant-design-vue/lib/switch/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import InputNumber from "ant-design-vue/lib/input-number";
import "ant-design-vue/lib/input-number/style/index.css";
import {MonitoringCenterTree} from "../type";
import * as Api from "../../../service/api";
import * as Type from "../../../type";
import {listApi} from "@cloudpivot/api";
import Dialog from "element-ui/lib/dialog";
import Upload from "element-ui/lib/upload";
import {DelBackGround, getAddBackGround, getbackGround} from "./index.js"

@Component({
  name: "QingMonitor",
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
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    AInput: Input,
    AInputNumber: InputNumber,
    ADescriptions: Descriptions,
    ADescriptionsItem: Descriptions.Item,
    ASelect: Select,
    ASelectOption: Select.Option,
    ElUpload: Upload,
    ElDialog: Dialog,
  },
})
export default class MonitoringCenter extends Vue {
  @InjectReactive("project") projectCode!: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  activeKey: string[] = ["0", "1"];
  activeTab: string = "0";
  basicData: Type.QingShiBasicData | null = null;
  //tree
  treeData: MonitoringCenterTree[] = [];
  replaceFields: { [propsName: string]: string } = {
    children: "children",
    title: "name",
    key: "id",
  };
  curSelectedTreeNode: MonitoringCenterTree | null = null;
  treeKey: number = 1;
  //modal
  visible: boolean = false;
  addGroupName: string = "";
  isBindModal: boolean = false;
  unBindDeviceData: Type.QingShiDeviceData[] = [];
  unBindDeviceColumns: any[] = [
    {
      title: "通道号",
      dataIndex: "channel",
      key: "channel",
      align: "center",
    },
    {
      title: "通道国际编号",
      dataIndex: "channelId",
      align: "center",
      key: "channelId",
      width: 200,
    },
    {
      title: "名称",
      align: "center",
      dataIndex: "channelName",
      key: "channelName",
    },
    {
      title: "在线状态",
      align: "center",
      dataIndex: "deviceOnline",
      key: "deviceOnline",
      scopedSlots: {customRender: "deviceOnline"},
    },
    {
      title: "开启音频",
      align: "center",
      dataIndex: "audioEnable",
      key: "audioEnable",
      scopedSlots: {customRender: "audioEnable"},
    },
    {
      title: "云端录像",
      align: "center",
      dataIndex: "cloudRecord",
      key: "cloudRecord",
      scopedSlots: {customRender: "cloudRecord"},
    },
    {
      title: "厂家",
      align: "center",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
  ];
  selectedRowKeys: Array<string> = [];
  selectedRowinfo: Type.QingShiDeviceData[] = [];
  isEdit: boolean = false;
  positionData: {
    [propsName: string]: number | Type.QingShiDeviceData | null;
  } = {
    longitude: 0,
    latitude: 0,
    altitude: 0,
    record: null,
  };
  //listTable
  listData: any[] = [];
  listColumns: any[] = [
    {
      title: "项目简称",
      dataIndex: "xmjc_1",
      key: "xmjc_1",
      align: "center",
    },
    {
      title: "通道国际编号",
      dataIndex: "device_ids",
      align: "center",
      key: "device_ids",
      width: "50%",
      ellipsis: true,
    },
    {
      title: "操作",
      align: "center",
      dataIndex: "operation",
      fixed: "right",
      width: 400,
      scopedSlots: {customRender: "operation"},
    },
  ];
  //deviceTable
  tableData: Type.QingShiDeviceData[] = [];
  tableColumns: any[] = [
    {
      title: "通道号",
      dataIndex: "channel",
      key: "channel",
      align: "center",
    },
    {
      title: "通道国际编号",
      dataIndex: "channelId",
      align: "center",
      key: "channelId",
      width: 200,
    },
    {
      title: "名称",
      align: "center",
      dataIndex: "channelName",
      key: "channelName",
      width: "10%",
      scopedSlots: {customRender: "channelName"},
    },
    {
      title: "在线状态",
      align: "center",
      dataIndex: "deviceOnline",
      key: "deviceOnline",
      scopedSlots: {customRender: "deviceOnline"},
    },
    {
      title: "快照",
      align: "center",
      dataIndex: "snapUrl",
      key: "snapUrl",
      scopedSlots: {customRender: "snapUrl"},
    },
    {
      title: "开启音频",
      align: "center",
      dataIndex: "audioEnable",
      key: "audioEnable",
      scopedSlots: {customRender: "audioEnable"},
    },
    {
      title: "云端录像",
      align: "center",
      dataIndex: "cloudRecord",
      key: "cloudRecord",
      scopedSlots: {customRender: "cloudRecord"},
    },
    {
      title: "开启分享",
      align: "center",
      dataIndex: "shared",
      key: "shared",
      scopedSlots: {customRender: "shared"},
    },
    {
      title: "按需直播",
      align: "center",
      dataIndex: "ondemand",
      key: "ondemand",
      scopedSlots: {customRender: "ondemand"},
    },
    {
      title: "厂家",
      align: "center",
      dataIndex: "manufacturer",
      key: "manufacturer",
    },
    {
      title: "云台类型",
      align: "center",
      dataIndex: "customType",
      key: "customType",
      width: "120",
      scopedSlots: {customRender: "customType"},
    },
    {
      title: "经纬度",
      align: "center",
      dataIndex: "position",
      key: "position",
      scopedSlots: {customRender: "position"},
    },
    {
      title: "操作",
      align: "center",
      dataIndex: "operation",
      width: 150,
      fixed: "right",
      scopedSlots: {customRender: "operation"},
    },
  ];
  arr: Array<any> = []
  perTableData: Array<any> = []
  perTableColumns: Array<any> = [
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
      scopedSlots: {customRender: "operation"},
    },
  ];
  slotData: Array<any> = [{audioEnable: 1}, {ondemand: 2}, {cloudRecord: 3}, {shared: 4}];
  state: string | number | null = null;

  dialogImageUrl: string = "";
  isShowUpload: boolean = false;
  dialogVisible: boolean = false;
  disabled: boolean = true;
  attachmentList: Array<any> = [];
  activeTable: string = "1"
  projectName: any = null
  Imgid: string = ""

  created() {
    this.init();
  }

  addGroup() {
    const params = {
      appCode: this.projectCode ?? "",
      name: this.addGroupName,
      parentId: this.curSelectedTreeNode?.id ?? "",
      parentType: this.curSelectedTreeNode?.type ?? "",
    };
    Api.addMonitorProGroup(params)
      .then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("新增成功！");
        this.init();
      }).finally(() => {
      this.visible = false;
      this.addGroupName = "";
    });
  }

  bindDevice() {
    Api.bindDeviceQingVideo({
      appCode: this.projectCode,
      groupId: this.curSelectedTreeNode?.id ?? "",
      projectName: this.curSelectedTreeNode?.projectName ?? "",
      dataToBind: this.selectedRowinfo,
    }).then((res) => {
      if (res.errcode === 0) {
        this.$message.success("绑定成功！");
        this.getByParentIdQingVideo(this.curSelectedTreeNode?.projectName ?? "", false);
        this.isBindModal = false;
        this.unBindDeviceData = [];
        this.selectedRowinfo = [];
        this.selectedRowKeys = [];
      }
    });
  }

  changeCustomType(e, record) {
    this.state = e;
    this.modifyDevicePropertyQingVideo(5, record);
  }

  changePosition(e, k) {
    this.positionData[k] = e;
  }

  changeTab(e) {
    this.activeTab = e;
  }

  changeTable(e) {
    this.activeTable = e;
  }

  deleteProGroup() {
    Api.deleteMonitorProGroup({
      appCode: this.projectCode ?? "",
      id: this.curSelectedTreeNode?.id ?? "",
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.init();
    });
  }

  async editPosition() {
    this.state =
      this.positionData.longitude +
      "," +
      this.positionData.latitude +
      "," +
      this.positionData.altitude;
    await this.modifyDevicePropertyQingVideo(6, this.positionData.record);
    this.isEdit = false;
  }

  handCancel() {
    this.visible = false;
    this.addGroupName = "";
  }

  importQueryField() {
    this.listData = [];
    listApi
      .getQueryList({
        customized: true,
        filters: [
          {
            propertyCode: "xmjc_1",
            propertyType: 0,
            propertyValue: this.projectConfig?.projectName ?? "",
          },
        ],
        mobile: false,
        page: 0,
        queryCode: `${this.projectCode ?? ""}_qing_project_relate`,
        schemaCode: `${this.projectCode ?? ""}_qing_project_relate`,
        size: 99999999,
      })
      .then((res) => {
        if (res.errcode === 0 && res.data && res.data.content) {
          for (let i = 0; i < res.data.content.length; i++) {
            this.listData.push(res.data.content[i].data);
          }
        }
      });
  }

  init() {
    this.importQueryField();
    Api.getMonitoringCenterTree({appCode: this.projectCode ?? ""}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.treeData = res.data;
        this.treeArrFilter(this.treeData, "children");
        this.treeKey++;
      }
    });
    Api.getBaseConfigQingVideo({}).then((base) => {
      if (base.errcode === 0 && base.data) {
        this.basicData = base.data;
      }
    });
  }

  getVideoAuth(projectCode, projectName) {
    this.perTableData = [];
    Api.getVideoAuth({appCode: projectCode, projectName: projectName,}).then((ress) => {
      if (ress.errcode === 0 && ress.data) {
        this.perTableData.push(ress.data)
      }
    })
  }

  getByParentIdQingVideo(projectName: string, refreshState?: boolean) {
    this.tableData = [];
    Api.getByParentIdQingVideo({
      appCode: this.projectCode ?? "",
      parentId: this.curSelectedTreeNode?.id ?? "",
      projectName: projectName,
      refreshState: refreshState ?? true,
      currentLevel: this.curSelectedTreeNode?.type ?? "",
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.tableData = res.data;
      }
    });
  }

  getNoneBindVideoQingVideo() {
    Api.getNoneBindVideoQingVideo({
      appCode: this.projectCode ?? "",
      projectName: this.curSelectedTreeNode?.projectName ?? "",
    }).then((res) => {
      if (res.errcode === 0 && res.data) {
        this.unBindDeviceData = res.data;
      }
    });
  }

  modifyDevicePropertyQingVideo(modifyCode, record) {
    if (this.state ===null) return;
    Api.modifyDevicePropertyQingVideo({
      appCode: this.projectCode ?? "",
      channelId: record.channelId,
      deviceId: record.deviceId,
      id: record.id,
      modifyCode: modifyCode,
      modifyValue: this.state ?? "",
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("修改成功！");
      this.getByParentIdQingVideo(record.projectName, false);
      this.state = null;
    });
  }

  onSelectChange(selectedRowKeys, info) {
    this.selectedRowKeys = selectedRowKeys;
    this.selectedRowinfo = info;
  }

  openEditModal(record) {
    this.positionData = {
      longitude: Number(record.longitude ?? 0),
      latitude: Number(record.latitude ?? 0),
      altitude: Number(record.altitude ?? 0),
      record: record,
    };
    this.isEdit = true;
  }

  selectTreeNode(selectedKeys, e) {
    this.tableData = [];
    this.projectName = e.node.dataRef.projectName
    if (e.node.dataRef.type == "pro") {
      this.isShowUpload = true
      getbackGround(this.projectCode, this.projectName).then(res => {
        if (res.data.url) {
          this.disabled = false
          this.Imgid = res.data.id
          this.attachmentList = [{url: res.data.url}]
        } else {
          this.attachmentList = []
          this.disabled = true
        }
      })
    } else {
      this.isShowUpload = false
      this.attachmentList = []
      this.disabled = true
    }
    selectedKeys.includes(e.node.dataRef.id)
      ? (this.curSelectedTreeNode = e.node.dataRef)
      : (this.curSelectedTreeNode = null);
    if (this.curSelectedTreeNode) {
      this.getByParentIdQingVideo(e.node.dataRef.projectName);
    }
    this.getVideoAuth(this.projectCode, this.projectName);
  }

  stateChange(e) {
    this.state = e.target.value;
  }

  sortDeviceQingVideo(record: Type.QingShiDeviceData, moveUp: boolean) {
    Api.sortDeviceQingVideo({
      appCode: this.projectCode ?? "",
      id: record.id,
      parentId: this.curSelectedTreeNode?.id ?? "",
      sortKey: record.sortKey,
      moveUp: moveUp,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("移动成功！");
      this.getByParentIdQingVideo(record.projectName, false);
    });
  }

  switchChange(checked, k, record) {
    this.state = checked ? 1 : 0;
    this.modifyDevicePropertyQingVideo(k, record);
  }

  treeArrFilter(arr: any[] = [], attChildren = "children") {
    arr.map((item) => {
      if (item.type === "pro") {
        this.$set(item, "slots", {icon: "proIcon"});
      } else if (item.type === "subGroup") {
        this.$set(item, "slots", {icon: "deviceIcon"});
      }
      if (item[attChildren]) {
        this.treeArrFilter(item[attChildren], attChildren);
      }
    });
  }

  newAdd() {
    const routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode ?? ""}_video_control`,
        sheetCode: `${this.projectCode ?? ""}_video_control`,
        queryCode: `${this.projectCode ?? ""}_video_control`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: "add",
        projectName: this.projectConfig?.projectName ?? "",
      },
    });
    window.open(routeData.href, "_blank");
  }

  theEditor(record: any) {
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

  toForm(flag, id?: string) {
    switch (flag) {
      case "add":
        const routeData = this.$router.resolve({
          // 业务表单
          name: "form-detail",
          query: {
            schemaCode: `${this.projectCode ?? ""}_qing_project_relate`,
            sheetCode: `${this.projectCode ?? ""}_qing_project_relate`,
            queryCode: `${this.projectCode ?? ""}_qing_project_relate`,
            return: `${this.$route.fullPath}&iframeAction=add`,
            iframeAction: "add",
            projectName: this.projectConfig?.projectName ?? "",
          },
        });
        window.open(routeData.href, "_blank");
        break;
      case "edit":
        const routeda = this.$router.resolve({
          // 业务表单
          name: "form-detail",
          query: {
            schemaCode: `${this.projectCode ?? ""}_qing_project_relate`,
            sheetCode: `${this.projectCode ?? ""}_qing_project_relate`,
            return: `${this.$route.fullPath}&iframeAction=detail`,
            iframeAction: "detail",
            objectId: id ?? "",
          },
        });
        window.open(routeda.href, "_blank");
        break;
    }
  }

  unBindDevice(record: any) {
    Api.unBindDeviceQingVideo({
      appCode: this.projectCode ?? "",
      id: record.id,
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("解绑成功！");
      this.getByParentIdQingVideo(record.projectName, false);
    });
  }

  // 上传功能
  Upload(val) {
    const newFile = new FormData();
    newFile.append("appCode", this.projectCode);
    newFile.append("projectName", this.projectName);
    newFile.append("file", val.file);
    getAddBackGround(newFile).then(res => {
      this.disabled = false
      this.$message.success("上传成功！")
    })
  }

  handleRemove() {
    this.attachmentList = [];
    DelBackGround(this.projectCode, this.Imgid).then(res => {
      this.$message.success("删除成功！")
      this.disabled = true
    })
  }

  handlePictureCardPreview(file) {
    this.dialogImageUrl = file.url
    this.dialogVisible = true
  }
}
</script>

<style lang="less" scoped>
@import "../../../styles/public.module.less";
@import "../system.module.less";

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

      /deep/ .ant-card-body {
        padding: 10px;
      }
    }

    .right {
      width: 65%;
      overflow: auto;

      /deep/ .ant-card-body {
        padding: 10px;
      }

      /deep/ .ant-btn {
        width: fit-content;
      }
    }
  }
}

.label {
  margin-right: @spacing-base;
}

.edit-position {
  margin: 10px;
}

/deep/ .ant-collapse {
  height: 100%;

  .ant-collapse-content {
    flex: 1;
  }

  .ant-collapse-content-box {
    height: calc(100% - 8px);
    padding: 0;
  }

  .miniMargin {
    margin-bottom: 10px;
  }
}
</style>
