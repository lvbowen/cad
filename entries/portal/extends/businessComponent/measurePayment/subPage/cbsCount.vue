<!--
 * @Author: Zeng Yu
 * @Date: 2020-11-05 14:50:17
 * @LastEditTime: 2020-11-19 14:18:23
 * @LastEditors: Please set LastEditors
 * @Description: CBS中间计量编辑界面
 * @FilePath: \front_view\entries\portal\extends\measurePayment\subPage\cbsCount.vue
-->

<template>
  <div class="main">
    <!--  模型页面，可参照此页面基本结构 -->
    <a-icon type="close" @click="close" style="text-align: right;"></a-icon>
    <br/>
    <a-card title="CBS细项" style="width: 100%;height:20.87vw" size="small">
      <a-input-search
        slot="extra"
        placeholder="请输入关键字"
        style="width: 200px"
        size="small"
        enterButton
        @search="onSearch"/>
      <a-button
        @click="lotMeasureBtn"
        slot="extra"
        type="primary"
        style="margin-left:10px"
        size="small"
      >批量计量
      </a-button
      >
      <a-table
        :columns="tableLabelCBS"
        :data-source="tableDataCBS"
        :customRow="rowClick"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
        :rowClassName="setRowClassName"
        :scroll="{ x: 1662, y: 200 }"
        :rowSelection="{
          selectedRowKeys: selectedCBSKeys,
          onChange: onCBSChange
        }"
      >
      </a-table>
    </a-card>
    <br/>
    <a-card title="CBS计量记录" style="width: 100%;height:20.87vw" size="small">
      <a-button
        @click="addBtn"
        slot="extra"
        type="primary"
        style="margin-left:10px"
        size="small"
      >添加
      </a-button
      >
      <a-button
        @click="saveBtn"
        slot="extra"
        type="primary"
        style="margin-left:10px"
        size="small"
      >保存
      </a-button
      >
      <a-button
        v-show="!isShow"
        @click="chooseBtn"
        slot="extra"
        type="primary"
        style="margin-left:10px"
        size="small"
      >选择
      </a-button
      >
      <a-button
        type="danger"
        slot="extra"
        style="margin-left:10px"
        @click="
          () => {
            this.isShowConfirm = true;
            this.prompt = '确认删除所选项吗？(已选择' + this.selectedRowKeys.length + '项)';
          }
        "
        size="small"
      >删除
        <a-popconfirm
          :title="prompt"
          :visible="isShowConfirm"
          okText="确认"
          cancelText="取消"
          @confirm="confirm"
          @cancel="cancel"
        >
        </a-popconfirm>
      </a-button>
      <a-button
        v-show="!isShow"
        @click="removeBtn"
        slot="extra"
        style="margin-left:10px"
        size="small"
        type="danger"
      >移除
      </a-button
      >
      <a-table
        :columns="tableLabelSon"
        :data-source="tableDataSon"
        :scroll="{ x: 1800, y: 300 }"
        :rowSelection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange
        }"
      >
        <template v-for="item in columnSon" :slot="item" slot-scope="text, record">
          <div :key="item">
            <span v-if="record.currentState==='已提交汇总'">{{ record.sgAmount }}</span>
            <editable-cell v-else :text="text" @change="onCellChange(record.key, item, $event)"/>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import {Component, Vue, Prop, Watch} from "vue-property-decorator";
import axios from "axios";
import {
  Card,
  Button,
  Icon,
  Table,
  Input,
  Popconfirm,
} from "@h3/antd-vue";
import {
  cbsDetailGet,
  cbsMeasureGet,
  cbsMeasureInsert,
  cbsMeasureDel,
  selectCBSMeasure,
  banchRecord,
  removeCBSMeasure,
  getUpperCode,
} from "../data/url";
import {timeDefault} from "../data/util";
import {v4 as uuidv4} from "uuid";
import EditableCell from "../data/editTableCell.vue";

const tableLabelCBS = [
  // 表头数据
  {
    align: "center",
    title: "CBS编码",
    key: "cbs",
    dataIndex: "cbs"
  },
  {
    align: "center",
    title: "MBS编码",
    key: "mbs",
    dataIndex: "mbs"
  },
  {
    align: "center",
    title: "清单项编码",
    key: "listCode",
    dataIndex: "listCode",
  },
  {
    align: "center",
    title: "名称",
    key: "cbsname",
    dataIndex: "cbsname"
  },
  {
    align: "center",
    title: "CBS单价",
    key: "cbsunitPrice",
    dataIndex: "cbsunitPrice"
  },
  {
    align: "center",
    title: "CBS数量",
    key: "cbsamount",
    dataIndex: "cbsamount"
  },
  {
    align: "center",
    title: "CBS合价",
    key: "cbstotalPrice",
    dataIndex: "cbstotalPrice"
  },
  {
    align: "center",
    title: "质量状态",
    key: "qualityState",
    dataIndex: "qualityState"
  },
  {
    align: "center",
    title: "进度状态",
    key: "scheduleState",
    dataIndex: "scheduleState"
  },
  {
    align: "center",
    title: "计量填报状态",
    key: "remarks",
    dataIndex: "remarks",
    scopedSlots: {customRender: "remarks"}
  }
];
const tableLabelSon = [
  {
    align: "center",
    title: "所属CBS",
    key: "cbs",
    dataIndex: "cbs"
  },
  {
    align: "center",
    title: "MBS编码",
    key: "mbs",
    dataIndex: "mbs"
  },
  {
    align: "center",
    title: "清单项编码",
    key: "listCode",
    dataIndex: "listCode",
  },
  {
    align: "center",
    title: "名称",
    key: "cbsname",
    dataIndex: "cbsname"
  },
  {
    align: "center",
    title: "CBS单价",
    key: "schemeCBSUnitPrice",
    dataIndex: "schemeCBSUnitPrice",
    scopedSlots: {customRender: "schemeCBSUnitPrice"}
  },
  {
    align: "center",
    title: "CBS数量",
    key: "schemeCBSAmount",
    dataIndex: "schemeCBSAmount",
    scopedSlots: {customRender: "schemeCBSAmount"}
  },
  {
    align: "center",
    title: "CBS合价",
    key: "schemeCBSMoney",
    dataIndex: "schemeCBSMoney"
  },
  {
    align: "center",
    title: "施工申报量",
    key: "sgAmount",
    dataIndex: "sgAmount",
    scopedSlots: {customRender: "sgAmount"}
  },
  {
    align: "center",
    title: "施工申报金额",
    key: "sgMoney",
    dataIndex: "sgMoney"
  },
  {
    align: "center",
    title: "监理审核量",
    key: "jlAmount",
    dataIndex: "jlAmount",
    scopedSlots: {customRender: "jlAmount"}
  },
  {
    align: "center",
    title: "监理审核金额",
    key: "jlMoney",
    dataIndex: "jlMoney"
  },
  {
    align: "center",
    title: "业主核定量",
    key: "yzAmount",
    dataIndex: "yzAmount",
    scopedSlots: {customRender: "yzAmount"}
  },
  {
    align: "center",
    title: "业主核定金额",
    key: "yzMoney",
    dataIndex: "yzMoney"
  },
  {
    align: "center",
    title: "状态",
    key: "currentState",
    dataIndex: "currentState",
    filters: [
      {
        text: "已提交汇总",
        value: "已提交汇总"
      },
      {
        text: "未提交汇总",
        value: "未提交汇总"
      }
    ],
    onFilter: (value, record) => record.currentState.indexOf(value) === 0
  },
  {
    align: "center",
    title: "计量期号",
    key: "tG04cCbscommoninfosFk",
    dataIndex: "tG04cCbscommoninfosFk"
  },
  {
    align: "center",
    title: "创建日期",
    key: "createdTime",
    dataIndex: "createdTime"
  },
  {
    align: "center",
    title: "备注",
    key: "remarks",
    dataIndex: "remarks",
    scopedSlots: {customRender: "remarks"}
  }
];

//js乘法
Vue.prototype.NumberMul = function (arg1, arg2) {
  var m = 0;
  var s1 = arg1.toString();
  var s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length;
  } catch (e) {
  }
  try {
    m += s2.split(".")[1].length;
  } catch (e) {
  }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}
export default {
  name: "cbsCount",
  components: {
    AIcon: Icon,
    ACard: Card,
    AButton: Button,
    ATable: Table,
    EditableCell,
    APopconfirm: Popconfirm,
    AInputSearch: Input.Search,
  },
  data() {
    return {
      columnSon: ["sgAmount", "jlAmount", "yzAmount", "remarks"],
      validate: '',
      selectedUpData: [],
      currentRow: "",
      detailId: this.id,
      editable: false,
      isCbsShow: false,
      isShow: true,
      isShowConfirm: false,
      labelCol: {span: 10},
      like: "",
      loading: false,
      measurePeriod: "",
      measurePeriodFk: "",
      pagination: {
        pageSize: 100, //每页中显示50条数据
        total: 0,
        current: 1,
        showSizeChanger: true,
        pageSizeOptions: ["20", "50", "100", "200", "400", "600"], //每页中显示的数据
        showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
      },
      param: {},
      projectCode: this.code,
      prompt: "",
      selectedCBSKeys: [],
      selectedRowKeys: [],
      symbol: 0,
      tableDataCBS: [],
      tableDataSon: [],
      tableLabelCBS,
      tableLabelSon,
      oldTable: []
    };
  },
  inject: ['projectConfig'],
  mounted() {
    if (Object.keys(this.param).length !== 0) {
      this.tableDataSon = [];
      this.currentRow = "";
      this.like = "";
      if (this.param.symbol == 0) {
        // 计量汇总编辑界面  CBS计量记录表  手动添加按钮 跳转
        this.isShow = false;
        this.oldTable = this.$route.query.oldDataCBS;
        this.measurePeriod = this.$route.query.measurePeriod;
        this.measurePeriodFk = this.$route.query.measurePeriodFk;
      }
      this.projectCode = this.param.code;
      this.detailId = this.param.id;
      this.getUpperCode();
      this.initCBSDetail(this.detailId, this.projectCode);
    }
  },
  props: {
    params: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {
        code: '',
        id: '',
        symbol: 1
      }
    },
  },
  watch: {
    params: {
      handler: function handler(newValue, oldValue) {
        //父组件param对象改变会触发此函数
        if (Object.keys(newValue).length !== 0) {
          this.param = newValue;
          this.currentRow = "";
          this.like = "";
          if (this.param.isShow == true) {
            if (this.param.symbol == 0) {
              // 计量汇总编辑界面  CBS计量记录表  手动添加按钮 跳转
              this.isShow = false;
              this.oldTable = this.param.oldDataCBS;
              this.measurePeriod = this.param.measurePeriod;
              this.measurePeriodFk = this.param.measurePeriodFk;
            }
            this.tableDataSon = [];
            this.projectCode = this.param.code;
            this.detailId = this.param.id;
            this.initCBSDetail(this.detailId, this.projectCode);
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    addBtn() {
      //@ts-ignore
      if (this.currentRow === '') return this.$message.warn("请选择CBS项");
      if (this.validate === 'quality') {
        if (this.currentRow.mbs === null || this.currentRow.mbs === '') return this.addData();
        if (this.currentRow.qualityState === '已归档') return this.addData();

      }
      if (this.validate === 'schedule') {
        if (this.currentRow.mbs === null || this.currentRow.mbs === '') return this.addData();
        if (this.currentRow.scheduleState === '已完工') return this.addData();
      }
      this.addData()
    },
    addData() {
      //@ts-ignore
      if (this.currentRow === '') return this.$message.warn("请选择CBS项");
      this.selectedRowKeys = [];
      let temptUuid = uuidv4();
      let uuid = temptUuid.split("-").join("");
      let sgAmountTempt = this.currentRow.cbsamount;
      let jlAmountTempt = this.currentRow.cbsamount;
      let yzAmountTempt = this.currentRow.cbsamount;
      for (let i = 0; i < this.tableDataSon.length; i++) {
        sgAmountTempt = sgAmountTempt - this.tableDataSon[i].sgAmount;
        jlAmountTempt = jlAmountTempt - this.tableDataSon[i].jlAmount;
        yzAmountTempt = yzAmountTempt - this.tableDataSon[i].yzAmount;
      }
      let sgMoneyTempt = sgAmountTempt * this.currentRow.cbsunitPrice;
      let jlMoneyTempt = jlAmountTempt * this.currentRow.cbsunitPrice;
      let yzMoneyTempt = yzAmountTempt * this.currentRow.cbsunitPrice;
      let newRow = {
        id: uuid,
        key: uuid,
        createdTime: timeDefault(),
        cbs: this.currentRow.cbs,
        mbs: this.currentRow.mbs,
        cbsname: this.currentRow.cbsname,
        schemeCBSUnitPrice: this.currentRow.cbsunitPrice,
        schemeCBSAmount: this.currentRow.cbsamount,
        schemeCBSMoney: this.currentRow.cbstotalPrice,
        jlAmount: jlAmountTempt,
        jlMoney: jlMoneyTempt,
        sgAmount: sgAmountTempt,
        sgMoney: sgMoneyTempt,
        yzAmount: yzAmountTempt,
        yzMoney: yzMoneyTempt,
        currentState:
          this.measurePeriod == "" || this.measurePeriod == undefined ? "未提交汇总" : "已提交汇总",
        tG04aCbsFk: this.currentRow.id,
        tG04aContractdetailFk: this.currentRow.tG04aContractdetailFk,
        tG04cCbscommoninfosFk:
          this.measurePeriod == "" || this.measurePeriod == undefined ? "" : this.measurePeriod,
        tG04cMeasureperiodFk:
          this.measurePeriodFk == "" || this.measurePeriodFk == undefined
            ? ""
            : this.measurePeriodFk
      };
      this.tableDataSon.unshift(newRow);
      this.selectedRowKeys.push(uuid);
      this.saveBtn();
    },
    cancel() {
      this.isShowConfirm = false;
      this.$message.error("取消删除");
    },

    chooseBtn() {
      if (this.selectedRowKeys.length == 0) {
        this.$message.warn("请选择行");
      } else {
        let temptInput = [];
        this.$message.warn("此操作会将'未提交汇总'的CBS记录选入计量汇总周期:" + this.measurePeriod);
        for (let i = 0; i < this.selectedRowKeys.length; i++) {
          let selectTempt = this.selectedRowKeys[i];
          for (let j = 0; j < this.tableDataSon.length; j++) {
            let cbsTempt = this.tableDataSon[j];
            if (selectTempt == cbsTempt.id) {
              if (this.tableDataSon[j].currentState == "已提交汇总") {
              } else {
                this.tableDataSon[j].currentState = "已提交汇总";
                this.tableDataSon[j].tG04cCbscommoninfosFk = this.param.measurePeriod;
                this.tableDataSon[j].tG04cMeasureperiodFk = this.param.measureId;
                this.tableDataSon[j].tG04aContractdetailFk = this.param.id;
                temptInput.push(this.tableDataSon[j]);
              }
            }
          }
        }
        axios
          .post(selectCBSMeasure, {
            projectCode: this.projectCode,
            objList: temptInput
          })
          .then(res => {
            if (res.errcode == 0) {
              this.$message.success("保存成功");
            } else {
              this.$message.error(res.errmsg);
            }
            this.selectedRowKeys = [];
          })
          .catch(err => {
            this.$message.error("保存失败");
          });
      }
    },

    close() {
      if (this.param.symbol == 0) {
        //跳转至 计量汇总编辑界面
        this.$parent.isCbsShow = false;
        this.$parent.initCBSDetail(this.detailId, this.projectCode);
      } else {
        // this.$router.push("/midMeasure");
        this.$parent.isCbsShow = false;
      }
    },

    confirm() {
      if (this.selectedRowKeys.length == 0) {
        this.$message.warn("请选择需要删除的项！");
      } else {
        this.isShowConfirm = false;
        this.delCountRow();
      }
      // message.success("Next step.");
    },

    delCountRow() {
      for (let key in this.selectedRowKeys) {
        this.tableDataSon = this.tableDataSon.filter(item => item.key != this.selectedRowKeys[key]);
      }
      axios
        .post(cbsMeasureDel, {
          projectCode: this.projectCode,
          ids: this.selectedRowKeys,
          cbsId: this.currentRow.id
        })
        .then(res => {
          if (res.errcode == 0) {
            this.$message.success("删除成功");
          } else {
            this.$message.error("删除失败");
          }
        });
      this.selectedRowKeys = [];
    },

    getUpperCode() {
      axios
        .get(getUpperCode, {
          params: {
            appCode: this.projectCode,
            projectName: this.projectConfig?.projectName,
            moduleCode: 'payment'
          }
        })
        .then(res => {
          this.validate = res.data;
        })
    },
    //点击分页中数字时触发的方法
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.initCBSDetail(this.detailId, this.projectCode);
    },

    // 上方表格
    initCBSDetail(id, code) {
      this.loading = true;
      axios
        .get(cbsDetailGet + "CbsWithState", {
          params: {
            projectCode: code,
            detailId: id,
            like: this.like,
            page: this.pagination.current,
            size: this.pagination.pageSize
          }
        })
        .then(res => {
          if (res.errcode !== 0) return this.$message(res.errmsg)
          let resData = res.data.records;
          for (let i = 0; i < resData.length; i++) {
            this.$set(resData[i], "key", resData[i].id);
          }
          this.pagination.total = res.data.total;
          this.tableDataCBS = resData;
          this.loading = false;
        })
    },

    // 下方表格
    initCBSSon(id, code) {
      this.selectedRowKeys = []
      axios
        .get(cbsMeasureGet, {
          params: {
            projectCode: code,
            cbsId: id
          }
        })
        .then(res => {
          let resData = res.data;
          for (let i = 0; i < resData.length; i++) {
            this.$set(resData[i], "key", resData[i].id);
          }
          this.tableDataSon = resData;
        })
    },

    //批量计量
    lotMeasureBtn() {
      let listKey = [];
      //@ts-ignore
      if (this.selectedCBSKeys.length == 0) return this.$message.warn("请选择行");
      if (this.validate == '') {
        listKey = this.selectedCBSKeys
      }
      if (this.validate == 'quality') {
        for (let i = 0; i < this.selectedUpData.length; i++) {
          if (this.selectedUpData[i].mbs === null || this.selectedUpData[i].mbs === '') {
            listKey.push(this.selectedUpData[i].key);
            continue;
          }
          if (this.selectedUpData[i].qualityState === '已归档') {
            listKey.push(this.selectedUpData[i].key);
          }
        }
      }
      if (this.validate == 'schedule') {
        for (let i = 0; i < this.selectedUpData.length; i++) {
          if (this.selectedUpData[i].mbs === null || this.selectedUpData[i].mbs === '') {
            listKey.push(this.selectedUpData[i].key);
            continue;
          }
          if (this.selectedUpData[i].scheduleState === '已完工') {
            listKey.push(this.selectedUpData[i].key)
          }
        }
      }
      if (listKey === []) return this.$message.warn('所选构件不满足计量条件，请检查进度或质检状态！');
      axios
        .post(banchRecord, {
          projectCode: this.projectCode,
          cbsIdList: listKey,
          detailId: this.detailId,
        })
        .then(res => {
          //@ts-ignore
          if (res.errcode == 0) return this.$message.success("添加成功");
          //@ts-ignore
          this.$message.error(res.errmsg);
        })
    },

    //单元格编辑
    onCellChange(key, dataIndex, value) {
      this.selectedRowKeys = []
      let dataSource = [...this.tableDataSon];
      const target = dataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        target["jlAmount"] = target["sgAmount"];
        target["yzAmount"] = target["sgAmount"];
        target["sgMoney"] = this.NumberMul(Number(target["sgAmount"]), Number(target["schemeCBSUnitPrice"]));
        // target["sgAmount"] * target["schemeCBSUnitPrice"];
        target["jlMoney"] = this.NumberMul(Number(target["jlAmount"]), Number(target["schemeCBSUnitPrice"]));
        // target["jlMoney"] = target["jlAmount"] * target["schemeCBSUnitPrice"];
        target["yzMoney"] = this.NumberMul(Number(target["yzAmount"]), Number(target["schemeCBSUnitPrice"]));
        // target["yzMoney"] = target["yzAmount"] * target["schemeCBSUnitPrice"];
        this.tableDataSon = dataSource;
        this.selectedRowKeys.push(key)
        this.saveBtn()
      }
    },

    //搜索
    onSearch(value) {
      this.like = value;
      this.initCBSDetail(this.detailId, this.projectCode);
    },

    //CBS计量记录的多选（下面的表）
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },

    //CBS细项的多选（上面的表）
    onCBSChange(selectedCBSKeys, e) {
      this.selectedCBSKeys = selectedCBSKeys;
      this.selectedUpData = e;
    },

    //移除按钮
    removeBtn() {
      if (this.selectedRowKeys.length == 0) {
        this.$message.warn("请选择行");
      } else {
        let temptInput = [];
        for (let i = 0; i < this.selectedRowKeys.length; i++) {
          let selectTempt = this.selectedRowKeys[i];
          for (let j = 0; j < this.tableDataSon.length; j++) {
            let cbsTempt = this.tableDataSon[j];
            if (selectTempt == cbsTempt.id) {
              this.tableDataSon[j].currentState = "未提交汇总";
              this.tableDataSon[j].tG04cMeasureperiodFk = "";
              this.tableDataSon[j].tG04cCbscommoninfosFk = "";
              temptInput.push(this.tableDataSon[j]);
              // this.$parent.tableDataCBS.push(this.tableDataSon[j]);
            }
          }
        }
        axios
          .post(removeCBSMeasure, {
            projectCode: this.projectCode,
            objList: temptInput
          })
          .then(res => {
            if (res.errcode == 0) {
              this.$message.success(res.errmsg);
            } else {
              this.$message.error(res.errmsg);
            }
            //清空选择
            this.selectedRowKeys = [];
          })
          .catch(err => {
            this.$message.error("移除失败");
          });
      }
    },

    rowClick(record, index) {
      return {
        on: {
          click: () => {
            this.currentRow = record;
            this.initCBSSon(this.currentRow.id, this.projectCode);
          }
        }
      };
    },

    saveBtn() {
      let temptDataSon = [];
      for (let i = 0; i < this.selectedRowKeys.length; i++) {
        for (let j = 0; j < this.tableDataSon.length; j++) {
          if (this.selectedRowKeys[i] == this.tableDataSon[j].key) {
            temptDataSon.push(this.tableDataSon[j]);
          }
        }
      }
      if (this.selectedRowKeys.length <= 0) return this.$message.warn("请选择需要保存的项！");
      let sgTotal = 0;
      let jlTotal = 0;
      let yzTotal = 0;
      for (let i = 0; i < temptDataSon.length; i++) {
        sgTotal += Number(temptDataSon[i].sgAmount);
        jlTotal += Number(temptDataSon[i].jlAmount);
        yzTotal += Number(temptDataSon[i].yzAmount);
      }
      if (
        sgTotal > temptDataSon[0].schemeCBSAmount ||
        jlTotal > temptDataSon[0].schemeCBSAmount ||
        yzTotal > temptDataSon[0].schemeCBSAmount
      ) return this.$message.warn("施工/监理/业主申报量不能超过CBS数量！");
      axios
        .post(cbsMeasureInsert, {
          projectCode: this.projectCode,
          objList: temptDataSon
        })
        .then(res => {
          this.$message.success(res.msg);
          this.selectedRowKeys = []
        })
    },

    setRowClassName(record) {
      let rowColor = 'redRow';
      if (record.remarks === '已填报完毕') {
        rowColor = 'greenRow'
      } else if (record.remarks === '已填报,但未填报完毕') {
        rowColor = 'blueRow'
      }
      return record === this.currentRow ? "clickRowStyl" : rowColor;
    },
  }
}
</script>

<style lang="less" scoped>

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/deep/ .ant-table {
  height: 13.57vw !important;
}

/deep/ .ant-table-placeholder {
  display: none;
}
</style>
<style>
@import "../data/measure.css";

</style>
