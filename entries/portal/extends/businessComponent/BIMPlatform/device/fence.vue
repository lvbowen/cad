<template>
  <article class="mainContainer">
    <alert-setting
      v-if="isAlertShow"
      :projectCode="projectCode"
      :projectName="projectName"
      :alertData="alertData"
      @alertShow="getAllFence()"></alert-setting>
    <!--    底部 信息栏 显示状态-->
    <div
      v-else
      :role="isBottomShow?'showContainer':'hideContainer'"
      ref="MainTable"
      class="bottom_class"
    >
      <nav class="bottomOption">
        <img
          :src="bottomArray"
          @click="() => {this.isBottomShow = false}"
          class="bottom_array"
          v-show="isBottomShow"
        />
        <img
          :src="bottomArrayHide"
          @click="() => {this.isBottomShow = true}"
          class="bottom_array"
          v-show="!isBottomShow"
        />
      </nav>
      <main class="bottomMain">
        <div class="titleContainer">
          <a-icon type="left" @click="backToLast()"/>
          <span>电子围栏设置</span>
          <a-button
            size="small"
            @click="addFence()"
            :class="buttonChoose==='新增'?'bottom_hover_button':'bottom_button'">新增
          </a-button>
        </div>
        <a-divider style="margin: 5px"/>
        <div class="tableContainer">
          <a-table
            size="small"
            rowKey="id"
            class="bottom_table"
            :columns="fenceColumns"
            :dataSource="fenceTableData"
            :rowClassName="setRowClass"
            :customRow="rowClick"
            :scroll="{ y: '195px'}"
          >
            <template slot="operate" slot-scope="text,record">
              <div style="display:flex;flex-direction: row">
                <a-icon
                  type="close"
                  theme="outlined"
                  style="color: #FFFFFF"
                  @click.stop="deleteFence(record.id)"/>
                <p style="color: red;cursor: pointer" @click.stop="deleteFence(record.id)">删除</p>
                <a-icon type="edit" theme="outlined" @click.stop="editFence(record)"/>
                <p style="color: #FF8400;margin-right: 6px;cursor: pointer" @click.stop="editFence(record)">编辑</p>
                <a-icon type="highlight" theme="outlined" @click.stop="drawElectFence(record)"/>
                <p style="color: #0206f6;cursor: pointer" @click.stop="drawElectFence(record)">绘制</p>
              </div>
            </template>
            <template slot="fenceOpen" slot-scope="text,record">
              <span v-if="record.fenceOpen==1" style="color: #43F5E5">启用中</span>
              <span v-else style="color: #F12C32">未启用</span>
            </template>
            <template slot="alertExist" slot-scope="text,record">
              <a v-if="record.alertExist" style="color: #08ea2c" @click.stop="setAlert(record)">修改设置</a>
              <a v-else style="color: #fa0c0c" @click.stop="setAlert(record)">新增设置</a>
            </template>
          </a-table>
        </div>
      </main>
    </div>
    <a-modal
      :title="modalTitle"
      class="modalClass"
      :key="modalNum"
      :visible="isModalShow"
      @ok="saveFence()"
      @cancel="()=>{this.isModalShow=false;this.getAllFence()}"
      okText="确认"
    >
      <a-form-model :model="fenceData">
        <a-form-model-item label="编ㅤㅤ号">
          <a-input v-model="fenceData.fenceNum" style="width: 150px"></a-input>
        </a-form-model-item>
        <a-form-model-item label="围栏名称">
          <a-input v-model="fenceData.fenceName" style="width: 150px"></a-input>
        </a-form-model-item>
        <a-form-model-item label="关联人员">
          <a-tree-select
            v-model="fenceData.relatePersonId"
            style="min-width: 250px;max-width:350px"
            :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
            :treeData="treePersonData"
            :replaceFields="replaceData"
            placeholder="请选择关联人员"
            treeDefaultExpandAll
            allowClear
            treeCheckable
            multiple
          >
          </a-tree-select>
        </a-form-model-item>
        <a-form-model-item label="关联设备">
          <a-tree-select
            v-model="fenceData.relateEquipId"
            style="min-width: 250px;max-width:350px"
            :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }"
            :treeData="treeEquipData"
            :replaceFields="replaceData"
            placeholder="请选择关联设备"
            treeDefaultExpandAll
            allowClear
            treeCheckable
            multiple
          >
          </a-tree-select>
        </a-form-model-item>
        <a-form-model-item label="状ㅤㅤ态">
          <a-radio-group v-model="fenceData.fenceOpen">
            <a-radio :value="0">未启用</a-radio>
            <a-radio :value="1">启用中</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="围栏颜色">
          <a-select v-model="fenceData.fenceColor" style="width: 150px">
            <a-select-option v-for="(v,i) in fenceColorData" :value="v" :key="i">{{ v }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="贴ㅤㅤ地">
          <a-radio-group v-model="fenceData.stickToGround">
            <a-radio :value="0">否</a-radio>
            <a-radio :value="1">是</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item v-show="fenceData.stickToGround===0" label="高ㅤㅤ程">
          <a-input-number v-model="fenceData.altitude" style="width: 150px" :min="0"></a-input-number>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </article>
</template>

<script lang="ts">
import * as Api from "../../../service/api";
import {Component, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import AlertSetting from './alertSetting.vue'
import {Input, Table, Divider, Button, Icon, Modal, FormModel, Radio, TreeSelect, Select, InputNumber} from '@h3/antd-vue';
import bottomArray from '../../../../src/assets/extends/bim/frame_bottom_1.png'
import bottomArrayHide from '../../../../src/assets/extends/bim/frame_bottom_2.png'

@Component({
  name: 'fence',
  components: {
    AIcon: Icon,
    ATable: Table,
    AInput: Input,
    AInputNumber:InputNumber,
    AButton: Button,
    AModal: Modal,
    ADivider: Divider,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AFormModel: FormModel,
    AFormModelItem: FormModel.Item,
    ASelect: Select,
    ATreeSelect: TreeSelect,
    ASelectOption: Select.Option,
    AlertSetting
  }
})
export default class fence extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;
  @Prop() isSmart?: boolean;

  @Ref()
  MainTable?: HTMLElement;

  bottomArray: any = bottomArray;
  bottomArrayHide: any = bottomArrayHide;
  isBottomShow: boolean = true;

  fenceColumns: Array<any> = [  // 表头数据
    {
      align: "center",
      title: "编号",
      key: "fenceNum",
      dataIndex: "fenceNum",
      width: '5%'
    },
    {
      align: "center",
      title: "围栏名称",
      key: "fenceName",
      dataIndex: "fenceName",
      width: '8%'
    },
    {
      align: "center",
      title: "关联人员",
      key: "relatePerson",
      dataIndex: "relatePerson",
      scopedSlots: {customRender: "relatePerson"},
      ellipsis: true,
      width: '25%'
    },
    {
      align: "center",
      title: "关联设备",
      key: "relateEquip",
      dataIndex: "relateEquip",
      ellipsis: true,
      width: '25%'
    },
    {
      align: "center",
      title: "状态",
      key: "fenceOpen",
      dataIndex: "fenceOpen",
      scopedSlots: {customRender: "fenceOpen"}
    },
    {
      align: "center",
      title: "围栏颜色",
      key: "fenceColor",
      dataIndex: "fenceColor",
    },
    {
      align: "center",
      title: "预警设置",
      key: "alertExist",
      dataIndex: "alertExist",
      scopedSlots: {customRender: "alertExist"}
    },
    {
      align: "center",
      title: "操作",
      key: "operate",
      dataIndex: "operate",
      scopedSlots: {customRender: "operate"},
    }];
  fenceTableData: Array<any> = [];

  buttonChoose: string = '';
  isAlertShow: boolean = false;
  alertData: any = null;


  modalTitle: string = '';
  isModalShow: boolean = false;
  fenceData: any = {
    fenceNum: '',
    fenceName: '',
    relatePersonId: null,
    relateEquip: null,
    fenceColor: '',
    fenceOpen: 0,
    stickToGround:1,
    altitude:0
  };
  modalNum: number = 0;


  treePersonData: Array<any> = [];
  treeEquipData: Array<any> = [];
  replaceData: object = {children: 'childs', title: 'name', key: 'id', value: 'id'};
  fenceColorData: Array<string> = ['红色', '绿色', '黄色', '蓝色'];
  fenceId:Array<any>=[];

  mounted() {
    this.getAllFence();
    const {mapListener} = this;
    window.addEventListener('message', event => mapListener(event));
  }

  mapListener(event) {
    if(!event.data.fenceGeometry) return;
    if(!event.data.fenceGeometry.coordinates) return;
      const fenceGeometry = event.data.fenceGeometry.coordinates;
      const wallId = event.data.fenceGeometry.wallId;
      let coorList:string='';
      fenceGeometry?.forEach(function (v){
        coorList+=v.longitude+','+v.latitude+','+v.altitude+';'
      });
      this.updateFenceCoor(coorList,wallId);
  }

  destroyed() {
    window.removeEventListener("message", event => this.mapListener(event));

    //@ts-ignore
    this.$message.destroy();
  }

  addFence() {
    this.buttonChoose = '新增';
    this.isModalShow = true;
    this.fenceData = {
      fenceNum: '',
      fenceName: '',
      relatePersonId: null,
      relateEquip: null,
      fenceColor: '',
      fenceOpen: 0
    };
    this.modalTitle = '新增围栏';
    this.getPersonTeamList();
    this.getEquipmentGroup();
    this.modalNum += 1;
  }

  //返回上级界面
  backToLast() {
    this.removeElectFence(this.fenceId)
    if(this.isSmart) return this.$emit('closeFence')
    this.$emit('mainShow');
  }

  deleteFence(id: string) {
    Api.deleteFence({
      appCode: this.projectCode,
      fenceId: id
    }).then(res => {
      if (res.errcode === 0) {
        this.getAllFence();
        this.removeElectFence([{id:id}]);
        //@ts-ignore
        this.$message.success('删除成功！')
      } else {
        //@ts-ignore
        this.$message.warn('删除失败！')
      }
    })
  }

  //编辑某条围栏信息
  editFence(record) {
    console.log('record====>', record)
    this.isModalShow = true;
    this.modalTitle = '编辑围栏'
    this.fenceData = record;
    this.modalNum += 1;
    this.getPersonTeamList();
    this.getEquipmentGroup();
  }

  getAllFence() {
    this.isAlertShow = false;
    this.fenceTableData = [];
    this.fenceId=[];
    Api.getAllFence({
      appCode: this.projectCode,
      projectName: this.projectName
    }).then(res => {
      if (res.errcode !== 0) return;
      this.fenceTableData = res.data;
      this.addElectFence(res.data);
      var _this = this;
      res.data.forEach(function (v){
        _this.fenceId.push({id:v.id});
      })
    })
  }

  //获取设备树信息
  getEquipmentGroup() {
    this.treeEquipData = [];
    Api.getEquipmentGroup({
      projectCode: this.projectCode,
      projectName: this.projectName
    }).then(res => {
      //@ts-ignore
      if (res.errcode !== 0) return this.$message.warn('获取设备树信息失败')
      this.treeEquipData = res.data
    })
  }

  //获取班组信息
  getPersonTeamList() {
    this.treePersonData = [];
    Api.getPersonTeamList({
      projectCode: this.projectCode,
      projectName: this.projectName
    }).then(res => {
      //@ts-ignore
      if (res.errcode !== 0) return this.$message.warn('获取班组数据失败')
      this.treePersonData = res.data
    })
  }

  saveFence() {
    //@ts-ignore
    if(this.fenceData.stickToGround===0&&this.fenceData.altitude==null) return this.$message.warn('请填写高程！')
    this.buttonChoose = '';
    Api.saveOrUpdateBaseInfo({
      appCode: this.projectCode,
      projectName: this.projectName,
      fenceManage: this.fenceData
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('保存失败')
      this.isModalShow = false;
      this.getAllFence();
    })
  }

  setAlert(record) {
    this.isAlertShow = true;
    this.alertData = record;
  }

  setRowClass(record, index) {
    return Number(index) % 2 === 1 ? "evenRowStyl" : "";
  }

  /**
   * 绘制电子围栏(取点)
   */
  drawElectFence(data) {
    let _resultobj = {
      methodName: "drawElectFence",
    };
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(_resultobj, "*");
    this.alertData = data;
  }

  updateFenceCoor(coorList,wallId){
    this.fenceId.push({id:wallId})
    this.removeElectFence(this.fenceId);
    console.log('updateFenceCoor',this.fenceId);
    Api.updateFenceCoor({
      appCode: this.projectCode,
      coorList: coorList,
      fenceId: this.alertData.id
    }).then(res => {
      if (res.errcode !== 0) return this.$message.warn('保存失败')
      this.getAllFence();
    })
  }

  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.locationElectFence({id:record.id})
        }
      }
    };
  }

  /**
   * 显示电子围栏
   */
  addElectFence(data) {
    let _resultobj = {
      methodName: "addElectFence",
      data:data
    };
    //@ts-ignore
    let frame1 = document.getElementById( "iframe" ).contentWindow;
    frame1.postMessage( _resultobj, "*" );
  }

  /**
   *  删除电子围栏
   */
  removeElectFence(data) {
    let _resultobj = {
      methodName: "removeElectFence",
      data:data
    };
    //@ts-ignore
    let frame1 = document.getElementById( "iframe" ).contentWindow;
    frame1.postMessage( _resultobj, "*" );
  }

  /**
   *  电子围栏定位
   */
  locationElectFence(data) {
    let _resultobj = {
      methodName: "locationElectFence",
      data:data
    };
    //@ts-ignore
    let frame1 = document.getElementById( "iframe" ).contentWindow;
    frame1.postMessage( _resultobj, "*" );
  }
}

</script>

<style lang="less" scoped>
@import '../BIMPlatform.module.less';

.bottom_class {
  .flex;
  transition: all .3s;
  flex-direction: column;
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 17.625vw;
  width: 99.8%;
  bottom: 0px;
  margin-left: 0.1%;

  & .bottomOption {
    .flex;
    width: 1.7187vw;
    height: 1.3028vw;
    margin-left: auto;
    margin-right: auto;

    & > .bottom_array {
      margin: auto;
      width: 100%;
    }
  }

  & .bottomMain {
    .flex;
    flex-direction: column;
    width: 98%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0.9375vw;

    i:nth-child(1) {
      font: 16px Source Han Sans CN;
      color: #32bfd2;
    }

    span:nth-child(2) {
      color: #FFFFFF;
      font-family: Source Han Sans CN;
      font-weight: bold;
      font-size: 16px;
    }

    :nth-child(3) {
      margin-left: 10px;
    }

    &.titleContainer {
      margin: 10px;
      width: 100%;
    }
  }

  .bottom_table {
    //margin-top: 1%;
    width: 99%;
    //clear: both;

    /deep/ .ant-table {
      //height: 230px;
      border: 0;
    }

    /deep/ .ant-table-tbody > tr:hover > td {
      background: #558fab !important
    }

    /deep/ .ant-table-tbody > tr.ant-table-row-selected td {
      background: transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-thead > tr > th {
      //表头背景色
      background-color: rgba(53, 130, 243, 0.2) !important;
      padding: 8px 8px !important;
      overflow-wrap: break-word;
      border-bottom: 1px solid transparent;
      color: rgba(248, 245, 245, 0.85);
      font-weight: 400;
      font-size: 13px;
    }

    /deep/ .ant-table-body {
      margin-top: 7px;
    }

    /deep/ .ant-table-tbody > tr > td {
      padding: 8px 8px !important;
      border-bottom: 1px solid transparent;
      color: #ffffff;
    }

    /deep/ .ant-table-fixed-header .ant-table-scroll .ant-table-header {
      margin-bottom: -20px !important;
      background-color: transparent;
    }

    /deep/ .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body {
      position: relative;
      background-color: transparent;
    }

    /deep/ .ant-table-placeholder {
      position: relative;
      z-index: 1;
      margin-top: -1px;
      padding: 4px 8px;
      color: #ffffff;
      font-size: 12px;
      text-align: center;
      background: transparent;
    }

    /deep/ ::-webkit-scrollbar {
      width: 4px;
      //height: 7px;
    }

    /deep/ ::-webkit-scrollbar-track {
      border-radius: 0;
      background: transparent;
    }

    //表格分页
    /deep/ .ant-pagination-item-active {
      font-weight: 500;
      background: transparent;
      color: white;
      border-color: #2970ff;
    }

    /deep/ .ant-pagination-item {
      color: #ffffff !important;
      background-color: transparent;
      border: 1px solid #d9d9d9;
    }

    /deep/ .ant-table-pagination.ant-pagination {
      float: right;
      margin: 1px !important;
    }

    //表格页码-数字
    /deep/ .ant-pagination-item a {
      color: #ffffff;
    }

    //表格页码-数字-点击
    /deep/ .ant-pagination-item-active a {
      color: #2970ff;
    }

    //表格页码向前向后跳转
    /deep/ .ant-pagination-item-link {
      color: #ffffff;
      background-color: transparent;
    }

    /deep/ .ant-pagination-item-ellipsis {
      color: #ffffff;
    }

    /deep/ .ant-table-row-expand-icon {
      background: transparent;
    }
  }
}

.bottom_class_hide {
  position: fixed;
  background: url("../../../../src/assets/extends/bim/frame_bottom_hide.png");
  background-size: 100% 100%;
  border-color: transparent;
  height: 42px;
  width: 99.8%;
  bottom: 0px;
  margin-left: 0.1%;
}

.mainContainer {
  .flex;
}

div[role=showContainer] {
  bottom: 0;
}

div[role=hideContainer] {
  bottom: -15.625vw;
}

/deep/ .ant-btn > span {
  margin-left: 0 !important;
}

.bottom_button {
  margin-right: 5px;
  float: right;
  z-index: 999;
  color: #fff !important;
  background: rgba(11, 27, 36, 0.8) !important;
  border: 1px solid #307AE4 !important;
  border-radius: 12px !important;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);

  /deep/ .ant-btn:hover, .ant-btn:focus {
    color: white;
  }
}

.bottom_hover_button {
  margin-right: 5px;
  float: right;
  z-index: 999;
  color: #17e5fd !important;
  background: rgba(11, 27, 36, 0.8) !important;
  border: 1px solid #307AE4 !important;
  border-radius: 12px !important;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
}

.ant-form-item {
  .flex;
  flex-direction: row;

  /deep/ .ant-form-item-label > label {
    color: #FFFFFF;
  }
}

.ant-radio-wrapper {
  color: #FFFFFF !important;
}
/deep/.clickRowStyl {
  background-color: #6ca2f6 !important;
}

/deep/.evenRowStyl {
  background-color: rgba(53, 130, 243, 0.1) !important;
}
</style>

