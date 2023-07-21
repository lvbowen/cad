<template>
  <div class="overAllPlan">
    <div class="List-table" ref="List_table">
      <div style="margin-bottom: 16px">
        <!--        <span class="toprev" @click="toprev">-->
        <!--          <img src="../../../src/assets/extends/icon/icon.png" alt="" />-->
        <!--        </span>-->
        <a-button @click="handleAdd" style="margin-left: 10px"> 新增 </a-button>

        <a-button
          @click="deleteHandle"
          :disabled="!hasSelected"
          style="margin-left: 10px"
        >
          删除
        </a-button>

        <a-button
          :disabled="!hasSelected"
          @click="switchover"
          style="margin-left: 10px"
        >
          方案切换
        </a-button>
      </div>
      <a-table
        :rowSelection="{
          type: 'radio',
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange,
        }"
        :customRow="customRow"
        :columns="columns"
        :data-source="data"
        bordered
      >
        <template slot="contractnum" slot-scope="text, record">
          <div class="pactNumber-row">
            <a @click="showModal(record)" v-if="record.contractnum">{{
              record.contractnum
            }}</a>
            <a @click="showModal(record)" v-else> 请选择合同 </a>
          </div>
        </template>

        <template slot="schemeplanstart" slot-scope="text, record">
          <div v-if="record.editable">
            <a-date-picker
              :placeholder="record.schemeplanstart"
              @change="dataChange"
              format="YYYY-MM-DD"
            />
          </div>
          <template v-else>
            {{ text }}
          </template>
        </template>

        <template slot="schemeplanend" slot-scope="text, record">
          <div v-if="record.editable">
            <a-date-picker
              :placeholder="record.schemeplanend"
              @change="StopChange"
              format="YYYY-MM-DD"
            />
          </div>
          <template v-else>
            {{ text }}
          </template>
        </template>
        <template
          v-for="col in [
            'planschemename',
            'schememoney',
            'schemetargetmoney',
            'remarks',
            'operation',
          ]"
          :slot="col"
          slot-scope="text, record"
        >
          <div :key="col">
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="(e) => handleChange(e.target.value, record.key, col)"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template slot="operation" slot-scope="text, record">
          <div class="editable-row-operations">
            <span v-if="record.editable">
              <a
                v-if="!record.addKey"
                @click="() => save(record.key, record)"
              >保存</a
              >
              <a
                v-if="record.addKey"
                @click="() => addlist(record.key, record)"
              >保存</a
              >
              |
              <a-popconfirm
                title="确认取消编辑?"
                @confirm="() => cancel(record.key)"
              >
                <a class="quxi">取消</a>
              </a-popconfirm>
            </span>
            <span v-else class="operation-btn">
              <a
                :disabled="editingKey !== ''"
                @click="() => edit(record.key)"
              >修改</a
              >
              |
              <a
                :disabled="editingKey !== ''"
                @click="compileModal(record.key)"
              >编辑</a
              >
              |
              <a
                :disabled="editingKey !== ''"
                @click="() => examine(record.key)"
              >查看</a
              >
            </span>
          </div>
        </template>
      </a-table>
    </div>

    <!-- 合同弹窗 -->
    <div class="overAll-modal">
      <a-modal
        title="选取合同"
        :visible="visible"
        @ok="handleOk"
        @cancel="handleCancel"
        width="800px"
      >
        <a-table
          :rowSelection="{
            type: 'radio',
            selectedRowKeys: pactSelectedKeys,
            onChange: pactSelectChange,
          }"
          :customRow="pactCustomRow"
          :columns="pactColumns"
          :data-source="pactData"
          bordered
        ></a-table>
      </a-modal>
    </div>

    <div class="compile-modal" v-if="compileVisible">
      <a-modal
        class="compile-modals"
        id="compile-modals"
        v-model="compileVisible"
        width="100vw"
        title="进度计划明细"
        :mask="false"
        dialogClass="modalsClass"
        :footer="null"
        @cancel="modelConl"
      >
        <compileModal
          :examineLook="examineLook"
          :pactItem="pactItem"
        ></compileModal>
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  InjectReactive,
} from "vue-property-decorator";
import {
  Divider,
  Button,
  Modal,
  Table,
  Pagination,
  Checkbox,
  Icon,
  Spin,
  Tag,
  Tooltip,
  Input,
  Popconfirm,
  DatePicker,
} from "@h3/antd-vue";

import compileModal from "./compileMinute/compileMinute.vue";

import { overAllPlanApi } from "./api/api.All";

// @@ 组件定义
@Component({
  name: "overAllPlan",
  components: {
    AButton: Button,
    ATable: Table,
    AModal: Modal,
    AIcon: Icon,
    ADivider: Divider,
    ATag: Tag,
    APagination: Pagination,
    ACheckbox: Checkbox,
    ATooltip: Tooltip,
    AInput: Input,
    APopconfirm: Popconfirm,
    ADatePicker: DatePicker,
    AMonthPicker: DatePicker.MonthPicker,
    compileModal,
  },
})
export default class overAllPlan extends Vue {
  @InjectReactive("project") projectCode?: string;

  // table列表的单选按钮
  selectedRowKeys: Array<number> = [];
  // 判断table列表是否在修改状态下
  editingKey: any = "";
  // 修改之后的存储
  dataEdit: any = {};
  // 加载状态
  loading: boolean = false;
  // 合同弹窗
  visible: boolean = false;
  // 合同单选按钮
  pactSelectedKeys: Array<number> = [0];
  // 触发合同弹窗的数据暂存
  packStorage: any = "";
  // 列表数据在修改之前的存储
  cacheData: Array<any> = [];
  // 点击编辑时候的弹窗
  compileVisible: boolean = false;
  // 传给编辑页面的数据
  pactItem: any = {};
  // 点击查看的判断
  examineLook: boolean = false;
  // table列表开始时间
  startData: string = "";
  // table列表结束时间
  StopData: string = "";
  // table列表表头数据格式
  columns: Array<any> = [
    {
      title: "合同编号",
      dataIndex: "contractnum",
      scopedSlots: { customRender: "contractnum" },
      ellipsis: true,
    },
    {
      title: "方案名称",
      dataIndex: "planschemename",
      scopedSlots: { customRender: "planschemename" },
      ellipsis: true,
    },
    {
      title: "合同所属组织",
      dataIndex: "schemeorgname",
      scopedSlots: { customRender: "schemeorgname" },
      width: "7.8125vw",
      ellipsis: true,
    },
    {
      title: "编制人",
      dataIndex: "ownername",
      scopedSlots: { customRender: "ownername" },
      ellipsis: true,
    },
    {
      title: "编制部门",
      dataIndex: "ownerdeptname",
      scopedSlots: { customRender: "ownerdeptname" },
      ellipsis: true,
    },
    {
      title: "开始时间",
      dataIndex: "schemeplanstart",
      scopedSlots: { customRender: "schemeplanstart" },
      ellipsis: true,
    },
    {
      title: "结束时间",
      dataIndex: "schemeplanend",
      scopedSlots: { customRender: "schemeplanend" },
      ellipsis: true,
    },
    {
      title: "总工期",
      dataIndex: "schemeperiod",
      scopedSlots: { customRender: "schemeperiod" },
      ellipsis: true,
    },
    {
      title: "总计划产值",
      dataIndex: "schememoney",
      scopedSlots: { customRender: "schememoney" },
      ellipsis: true,
    },
    {
      title: "目标产值",
      dataIndex: "schemetargetmoney",
      scopedSlots: { customRender: "schemetargetmoney" },
      ellipsis: true,
    },
    {
      title: "方案状态",
      dataIndex: "schemestate",
      scopedSlots: { customRender: "schemestate" },
      ellipsis: true,
    },
    // {
    //   title: '当前审核',
    //   dataIndex: 'nowCheck',
    //   scopedSlots: { customRender: 'nowCheck' }
    // },
    {
      title: "审核状态",
      dataIndex: "businessstate",
      scopedSlots: { customRender: "businessstate" },
      ellipsis: true,
    },
    {
      title: "备注",
      dataIndex: "remarks",
      scopedSlots: { customRender: "remarks" },
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "operation",
      scopedSlots: { customRender: "operation" },
      width: "7.8125vw",
    },
  ];
  // table列表表体数据
  data: Array<any> = [
    /*{
      key: 0,
      contractnum: '合同编号',
      planschemename: '方案名称',
      schemeorgname: '合同所属组织',
      schemeorgoid: '合同id',
      relschemeorgoid: '合同所属组织',
      ownername: '编制人',
      ownerdeptname: '编制部门',
      schemeplanstart: '开始时间',
      schemeplanend: '结束时间',
      schemeperiod: '总工期',
      schememoney: '总计划产值',
      schemetargetmoney: '目标产值',
      schemestate: '方案状态',
      nowCheck: '当前审核',
      businessstate: '审核状态',
      remarks: '备注',
      operation: '',
      schedulePlanId: ''
    }*/
  ];

  // 合同弹窗数据列表表头数据格式
  pactColumns: Array<any> = [
    {
      title: "合同编号",
      dataIndex: "contractnum",
      scopedSlots: { customRender: "contractnum" },
    },
    {
      title: "项目名称",
      dataIndex: "projectname",
      scopedSlots: { customRender: "projectname" },
    },
    {
      title: "合同名称",
      dataIndex: "contractname",
      scopedSlots: { customRender: "contractname" },
    },
    {
      title: "合同所属组织",
      dataIndex: "contractorgname",
      scopedSlots: { customRender: "contractorgname" },
    },
    {
      title: "合同金额",
      dataIndex: "contracttotalmoney",
      scopedSlots: { customRender: "contracttotalmoney" },
    },
    {
      title: "施工单位",
      dataIndex: "sgcompany",
      scopedSlots: { customRender: "sgcompany" },
    },
    {
      title: "施工代表",
      dataIndex: "sgdelegate",
      scopedSlots: { customRender: "sgdelegate" },
    },
    {
      title: "监理单位",
      dataIndex: "jlcompany",
      scopedSlots: { customRender: "jlcompany" },
    },
    {
      title: "监理代表",
      dataIndex: "jldelegate",
      scopedSlots: { customRender: "jldelegate" },
    },
    {
      title: "业主单位",
      dataIndex: "yzcompany",
      scopedSlots: { customRender: "yzcompany" },
    },
    {
      title: "业主代表",
      dataIndex: "yzdelegate",
      scopedSlots: { customRender: "yzdelegate" },
    },
  ];
  // 合同弹窗数据列表表体数据
  pactData: Array<any> = [
    {
      key: 0,
      contractnum: "合同编号",
      projectname: "项目名称",
      contractorgname: "合同名称",
      contractorgoid: "合同id",
      contractname: "合同名称",
      contracttotalmoney: "合同所属组织",
      sgcompany: "合同金额",
      sgdelegate: "施工单位",
      jlcompany: "施工代表",
      jldelegate: "监理单位",
      yzcompany: "监理代表",
      yzdelegate: "业主单位",
    },
  ];

  // table列表 点击行事件
  get customRow() {
    return (record) => {
      return {
        on: {
          // 事件
          click: (event) => {
            let i = this.data.findIndex((val) => val.key === record.key);
            this.onSelectChange(i);
          },
        },
      };
    };
  }

  // 合同列表 点击行事件
  get pactCustomRow() {
    return (record) => {
      return {
        on: {
          // 事件
          click: (event) => {
            let i = this.data.findIndex((val) => val.key === record.key);
            this.pactSelectChange(i);
          },
        },
      };
    };
  }

  // table列表 判断是否可以操作删除,方案切换等按钮
  get hasSelected() {
    return this.selectedRowKeys.length > 0;
  }

  // 监听table数组长度, 用于新增的下标
  @Watch("data")
  get_data(val, oldVal) {
    this.count = val.length - 1;
  }

  // table单选按钮触发事件
  onSelectChange(rowKeys) {
    let targetRow: number;
    if (Array.isArray(rowKeys)) {
      targetRow = rowKeys[0];
    } else {
      targetRow = rowKeys;
    }
    this.selectedRowKeys = [targetRow];
  }

  // 合同单选按钮触发事件
  pactSelectChange(val) {
    this.pactSelectedKeys = [val];
  }

  count: number = this.data.length - 1;

  // table列表新增数据的方法
  handleAdd() {
    const { count, data } = this;
    this.count += 1;
    const newData = {
      key: this.count,
      contractnum: "",
      schemeName: "",
      relschemeorgoid: "",
      ownername: "",
      ownerdeptname: "",
      schemeplanstart: "",
      schemeplanend: "",
      schemeperiod: "",
      schememoney: "",
      schemetargetmoney: "",
      schemestate: "",
      nowCheck: "",
      businessstate: "",
      remarks: "",
      operation: "",
      schedulePlanId: "",
      addKey: true,
    };
    // 新增后触发选择合同的弹窗
    this.showModal(newData);
    this.data = [...data, newData];
    this.selectedRowKeys = [newData.key];
  }

  // 页面加载时发送请求
  created() {
    this.createList();
  }

  // table列表进入修改状态时 input的回调
  handleChange(value, key, column) {
    if (
      column == "schemeperiod" ||
      column == "schememoney" ||
      column == "schemetargetmoney"
    ) {
      value = value.replace(/[^\d^\.]+/g, "");
    }

    const newData = [...this.data];
    const target = newData.filter((item) => key === item.key)[0];
    this.dataEdit = newData.filter((item) => key === item.key)[0];

    if (target) {
      target[column] = value;
      Object.assign(this.dataEdit, target);
      let val = JSON.parse(JSON.stringify(this.dataEdit));
      this.assignData(val);
    }
  }

  // table列表编辑页面
  edit(key) {
    const newData = [...this.data];
    const target = newData.filter((item) => key === item.key)[0];
    this.editingKey = key;
    //如果存在就显示input
    if (target) {
      target.editable = true;
      this.data = newData;
      this.cacheData = this.data.map((item) => ({ ...item }));
    }
    this.selectedRowKeys = [key];
  }

  // data内容同步
  assignData(val) {
    Object.assign(this.data, val);
  }

  // table列表 修改/新增 取消
  cancel(key) {
    const newData = [...this.data];
    const target = newData.filter((item) => key === item.key)[0];
    this.editingKey = "";

    if (target.addKey) {
      this.data.splice(key, 1);
    } else if (target) {
      Object.assign(
        target,
        this.cacheData.filter((item) => key === item.key)[0]
      );
      delete target.editable;
      this.data = newData;
    }
  }

  // 合同弹窗确认
  handleOk() {
    let i = this.pactSelectedKeys[0];
    this.data.forEach((item) => {
      if (this.packStorage.key == item.key) {
        item.schemeorgname = this.pactData[i].contractorgname; // 合同所属组织
        item.schemeorgoid = this.pactData[i].contractorgoid; // 所属组织id
        item.contractnum = this.pactData[i].contractnum; // 合同编号
        item.relcontractnum = this.pactData[i].id;
        item.schememoney = this.pactData[i].contracttotalmoney; // 合同金额
      }
    });
    this.edit(this.packStorage.key);
    this.visible = false;
  }

  // 合同弹窗取消
  handleCancel() {
    this.visible = false;
    if (this.packStorage.contractnum == "") {
      let i = this.data.findIndex((item) => {
        return this.packStorage.key == item.key;
      });
      this.data.splice(i, 1);
      this.packStorage = "";
    }
  }

  /***
   * api
   */

  // table列表页面加载发送请求API
  createList() {
    overAllPlanApi
      .scheduleList({
        projectCode: this.projectCode as string,
        pageNum: 0,
        pageSize: 100,
      })
      .then((res) => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.data = res.data.data;
          this.data.forEach((item, index) => {
            this.startData = item.schemeplanstart;
            this.StopData = item.schemeplanend;
            item.key = index;
            item.schedulePlanId = item.id;
            item.schemeperiod = this.dateSum;
          });
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 });
        }
      });
  }
  toprev() {
    this.$router.go(-1);
  }
  // table列表删除页面API
  deleteHandle(val) {
    let i = this.selectedRowKeys[0];
    overAllPlanApi
      .deleteList({
        schedulePlanId: this.data[i].schedulePlanId,
        projectCode: this.projectCode as string,
      })
      .then((res) => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.createList();
          this.$message.success({ content: "删除成功!", duration: 1 });
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 });
        }
      });
  }

  // 选择合同时的合同弹窗API
  showModal(val) {
    this.packStorage = val;
    overAllPlanApi
      .showModal({
        projectCode: this.projectCode as string,
        pageNum: 0,
        pageSize: 100,
      })
      .then((res) => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.pactData = res.data.data;
          this.pactData.forEach((item, index) => {
            item.key = index;
          });
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 });
        }
      });
    this.visible = true;
  }

  // table合同切换API
  switchover() {
    let i = this.selectedRowKeys[0];
    overAllPlanApi
      .switchover({
        schedulePlanId: this.data[i].schedulePlanId,
        projectCode: this.projectCode as string,
      })
      .then((res) => {
        //@ts-ignore
        if (res.errcode == 0) {
          this.$message.success({ content: "切换成功!", duration: 1 });
          //refresh page
          this.createList();
        } else {
          //@ts-ignore
          this.$message.error({ content: `${res.errmsg}!`, duration: 1 });
        }
      });
  }

  // table列表新增数据API
  addlist(key, record) {
    if (
      record.planschemename == "" ||
      record.schememoney == "" ||
      record.schemetargetmoney == "" ||
      record.schemeplanend == "" ||
      record.schemeplanstart == ""
    ) {
      this.$message.warning(
        "方案名称,开始时间,结束时间,总工期,总计划产值,目标产值等不能为空"
      );
      return;
    }
    this.data[key].projectCode = this.projectCode;

    overAllPlanApi.addlist(this.data[key]).then((res) => {
      //@ts-ignore
      if (res.errcode == 10009) {
        //@ts-ignore
        this.$message.error({ content: `新增失败,${res.errmsg}!`, duration: 1});
        this.createList();
      } else {
        this.$message.success({ content: `新增成功!`, duration: 1 });
        this.createList();
      }
    });
    this.editingKey = "";
  }

  // table列表保存API
  save(key, record) {
    if (
      record.planschemename == "" ||
      record.schememoney == "" ||
      record.schemetargetmoney == "" ||
      record.schemeplanend == "" ||
      record.schemeplanstart == ""
    ) {
      this.$message.warning(
        "方案名称,开始时间,结束时间,总工期,总计划产值,目标产值等不能为空"
      );
      this.cancel(key);
      return;
    }

    let i = this.selectedRowKeys[0];
    this.data[i].projectCode = this.projectCode;
    overAllPlanApi.save(this.data[i]).then((res) => {
      //@ts-ignore
      if (res.errcode == 0) {
        this.$message.success({ content: "保存成功!", duration: 1 });
        this.createList();
      } else {
        //@ts-ignore
        this.$message.error({ content: `${res.errmsg}!`, duration: 1 });
      }
    });
    this.editingKey = "";
  }

  // ------------------------------

  // table列表开始时间
  dataChange(val, dateString) {
    this.startData = dateString;
    const newData = [...this.data];
    let key = newData.filter((item) => this.selectedRowKeys[0] == item.key)[0];
    if (key) {
      key.schemeplanstart = dateString;
      Object.assign(newData, key);
      let theData = JSON.parse(JSON.stringify(newData));
      this.assignData(theData);
    }
  }
  // table列表结束时间
  StopChange(val, dateString) {
    this.StopData = dateString;

    const newData = [...this.data];
    let key = newData.filter((item) => this.selectedRowKeys[0] == item.key)[0];

    if (key) {
      key.schemeplanend = dateString;
      Object.assign(newData, key);
      let theData = JSON.parse(JSON.stringify(newData));
      this.assignData(theData);
    }
  }

  // table列表编辑详情弹窗显示
  compileModal(key) {
    this.compileVisible = true;
    const newData = [...this.data];
    let val = JSON.parse(
      JSON.stringify(newData.filter((item) => key == item.key)[0])
    );
    this.pactItem = val;
  }

  // 编辑详情页面关闭
  modelConl() {
    this.createList();
    this.pactItem = {};
  }

  // table列表查看按钮
  examine(key) {
    this.examineLook = true;
    this.compileModal(key);
  }

  // 计算开始时间结束时间总天数
  get dateSum() {
    let day1 = new Date(this.startData);
    let day2 = new Date(this.StopData);
    //@ts-ignore
    let one_day = 1000 * 60 * 60 * 24;
    //@ts-ignore
    let dateDay = Math.abs((day2 - day1) / one_day);
    //@ts-ignore
    return day2 - day1 > 0 ? dateDay : -dateDay;
  }
}
</script>

<style lang="less" scoped>
.overAllPlan {
  width: 100%;
  height: 100%;
  padding: 10px;
  background-color: #fff;
}
/deep/.ant-table-thead {
  font-size: 12px;
}
/deep/.ant-table-row {
  font-size: 12px;
  td {
    padding: 8px !important;
  }
}

/deep/.ant-table-tbody > tr > td {
  padding: 8px !important;
  .ant-input {
    height: 28px;
    font-size: 12px;
  }
  .editable-row-operations {
    .quxi {
      color: #999;
      &:hover {
        color: #2970ff;
      }
    }
  }
  .operation-btn {
    color: #c4c4c4;
  }
}
/deep/.ant-calendar-picker {
  font-size: 12px !important;
  .ant-calendar-picker-input {
    font-size: 12px !important;
    height: 28px;
  }
}
.overAll-modal {
  .ant-modal {
    width: 100% !important;
  }
}

/deep/.compile-modal {
  width: 100% !important;
  height: 100% !important;
}
.toprev {
  position: absolute;
  top: 9.2%;
  left: 11.2%;
  z-index: 999;
  cursor: pointer;
  font-size: 19px;
}
</style>

<style lang="less" scoped>
/deep/.modalsClass {
  position: relative;
  z-index: 100;
  overflow: hidden;
  top: 0;
  overflow: auto;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #fff !important;
  padding: none !important;
  padding-bottom: 0 !important;
  .ant-modal-content {
    width: 100%;
    height: 100%;
    box-shadow: none !important;
    overflow: auto;
    .ant-modal-close {
      width: 30px;
      height: 30px;
      span {
        width: 100%;
        height: 100%;
        line-height: 38px;
      }
    }
    .ant-modal-header {
      padding: 8px 24px;
    }
    .ant-modal-body {
      padding: 0px;
      overflow: auto;
      margin: 0 auto;
    }
    .ant-modal-footer {
      position: absolute;
      bottom: 0;
    }
  }
}
</style>
