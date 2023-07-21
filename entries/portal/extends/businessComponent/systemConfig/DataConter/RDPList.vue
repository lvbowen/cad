<template>
  <a-modal
    :visible="showRdpModal"
    class="rdp-list custom-style"
    title="RDP设置"
    :destroyOnClose="true"
    @cancel="cancelRdpListModal"
    :width="1000"
    :footer="null">
    <a-button
      type="primary"
      class="add-rdp-btn"
      :disabled="rdpTableData.length===1"
      @click="addRdp"
    >新增RDP
    </a-button>
    <a-table
      bordered
      :key="rdpTableKey"
      :data-source="rdpTableData"
      :columns="rdpColumns"
      :scroll="{ x: 850,y:300}"
      :pagination="false">
      <template
        v-for="col in ['allRdp', 'rightRdp', 'upRdp', 'isRdp', 'routing']"
        :slot="col"
        slot-scope="text, record, index"
      >
        <span :key="col" class="flex-1">
          <!--          <div-->
          <!--            v-if="col === 'tabName' && record.editable"-->
          <!--            class="edit-span flex flex-center-align"-->
          <!--            @click="tabNameChange"-->
          <!--          >-->
          <!--            {{ text }}-->
          <!--          </div>-->
          <div v-if="col === 'isRdp'">
            <a-radio-group
              :options="plainOptions"
              :disabled="!record.editable"
              :defaultValue="record.defaultCheckedValue"
              @change="onChange"
            />
          </div>
          <div
            v-else-if="
              ['allRdp', 'rightRdp', 'upRdp'].includes(col) &&
                record.editable &&
                record.isRdp
            "
          >
            <a-select
              @change="
                (val) => {
                  reportHandleChange(val, col);
                }
              "
              :value="text.name"
            >
              <div slot="dropdownRender" slot-scope="menu">
                <v-nodes :vnodes="menu" />
                <a-divider style="margin: 4px 0" />
                <a-button
                  @click="opeReportModal"
                  type="primary"
                  class="full-width"
                >新增RDP报表</a-button
                >
              </div>
              <a-select-option v-for="i in selectOption" :key="i.name" :value="i.name">
                <a-tooltip :title="i.name">
                  {{ i.name }}
                </a-tooltip>
              </a-select-option>
            </a-select>
          </div>
          <div
            v-else-if="
              ['allRdp', 'rightRdp', 'upRdp'].includes(col) &&
                !record.editable &&
                record.isRdp
            "
          >
            {{ text.name }}
          </div>
          <div v-else-if="col === 'routing' && !record.editable && !record.isRdp">
            {{ text.name ? text.name : "" }}
          </div>
          <div v-else-if="col === 'routing' && record.editable && !record.isRdp">
            <a-select
              @change="
                (val) => {
                  routeHandleChange(val, col);
                }
              "
              :value="text && text.name ? text.name : ''"
            >
              <!--                      <div slot="dropdownRender" slot-scope="menu">-->
              <!--                        <v-nodes :vnodes="menu" />-->
              <!--                        <a-divider style="margin: 4px 0;" />-->
              <!--                        <a-button @click="opeReportModal" type="primary" class="full-width">新增路由</a-button>-->
              <!--                      </div>-->
              <a-select-option v-for="i in routesOption" :key="i.name" :value="i.name">
                <a-tooltip :title="i.name ? i.name : ''">
                  {{ i.name ? i.name : "" }}
                </a-tooltip>
              </a-select-option>
            </a-select>
          </div>
          <div
            v-else-if="
              (['allRdp', 'rightRdp', 'upRdp'].includes(col) && !record.isRdp) ||
                (['routing'].includes(col) && record.isRdp)
            "
          ></div>
          <template v-else>
            <span>{{ text }}</span>
          </template>
        </span>
      </template>
      <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record.id, record)" :class="editingKey===record.id?'success-color':''">保存</a>
            <a @click="() => cancel(record.id, record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(record.id, record)" :class="editingKey || editingKey.length===4?'':'base-color'">编辑</a>
            <a-popconfirm
              title="删除后不可恢复哦，确认删除吗？"
              @confirm="deleteConfig(record.id)"
            >
              <a :disabled="editingKey !== ''" :class="editingKey || editingKey.length===4?'':'warning-color'">删除</a>
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>
    <new-report
      :showUpdateModel="showUpdateModel"
      @closeReportDia="closeReportDia"
      @updateReportList="getReportList"
    />
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop,Watch} from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Radio from "ant-design-vue/lib/radio";
import "ant-design-vue/lib/radio/style/index.css";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import Divider from "ant-design-vue/lib/divider";
import "ant-design-vue/lib/divider/style/index.css";
import Popconfirm from "ant-design-vue/lib/popconfirm";
import "ant-design-vue/lib/popconfirm/style/index";
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Tooltip from "ant-design-vue/lib/tooltip";
import "ant-design-vue/lib/tooltip/style/index.css";
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import {Rdp, Routes} from "../type";
import NewReport from "./newReport.vue";
import {deleteRdp, updateRdp,getRdpList,getReportList,getRouteList} from "../../../service/api";
@Component({
  name: 'RdpList',
  components: {
    ATable: Table,
    ARadioGroup: Radio.Group,
    ASelect: Select,
    ASelectOption: Select.Option,
    ADivider: Divider,
    APopconfirm: Popconfirm,
    AModal: Modal,
    ATooltip: Tooltip,
    AButton: Button,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
    NewReport
  }
})
export default class RdpList extends Vue {
  @InjectReactive("project") projectCode!: string;
  @Prop() showRdpModal!:boolean;
  @Prop() currentMenuId!:string;
  @Prop() currentMenuName!:string;
  @Prop() projectGroupId!:string;
  @Watch('currentMenuId',{deep:true})
  currentMenuIdListener(val) {
    if(val) {
      this.getRdpList();
      this.getRouteList();
      this.getReportList();
    }
  }
  //rdp-table
  rdpTableData: Rdp[] = [];
  cacheRdpTableData: Rdp[] = [];
  rdpColumns: any[] = [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 80,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: "是否报表",
      dataIndex: "isRdp",
      key: "isRdp",
      align: "center",
      width: 200,
      scopedSlots: { customRender: "isRdp" },
    },
    {
      title: "关联菜单",
      dataIndex: "tabName",
      key: "tabName",
      width: 110
    },
    {
      title: "上报表",
      dataIndex: "upRdp",
      key: "upRdp",
      width: 190,
      scopedSlots: { customRender: "upRdp" },
    },
    {
      title: "右报表",
      dataIndex: "rightRdp",
      key: "rightRdp",
      width: 190,
      scopedSlots: { customRender: "rightRdp" },
    },
    {
      title: "全报表",
      dataIndex: "allRdp",
      key: "allRdp",
      width: 190,
      scopedSlots: { customRender: "allRdp" },
    },
    {
      title: "路由",
      dataIndex: "routing",
      key: "routing",
      width: 190,
      scopedSlots: { customRender: "routing" },
    },
    {
      title: "操作",
      dataIndex: "operation",
      width: 120,
      fixed: "right",
      scopedSlots: { customRender: "operation" },
    },
  ];
  rdpTableKey: number = 1;
  editingKey: string = "";
  plainOptions: {}[] = [
    { label: "rdp", value: true },
    { label: "路由", value: false },
  ];
  //routes
  routesOption: Routes[] = [];
  defaultCheckedValue: string = "";
  //add-report
  selectOption: { name: string; schemaCode: string }[] = [];
  selectedReport: string = "";
  showUpdateModel: boolean = false;
  rndNum(n) {
    let rnd = "";
    for (let i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

  cancelRdpListModal() {
    this.$emit('cancelRdpListModal')
  }
  //rdp
  getRdpList() {
    getRdpList({
      appCode: this.projectCode ?? "",
      id: this.projectGroupId ?? "",
      tabId: this.currentMenuId??''
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        const data = res.data;
        // const data = mockData.rdpTable.data;
        data.map((item) => {
          item.defaultCheckedValue = item.isRdp ?? true;
        });
        this.rdpTableData = data;
        this.cacheRdpTableData = JSON.parse(JSON.stringify(data));
        this.rdpTableKey++;
        this.editingKey = "";
      }
    });
  }

  addRdp() {
    const addRow: Rdp = {
      id: this.rndNum(4), //id
      tabId: this.currentMenuId??'', //
      tabName: this.currentMenuName??'',
      allRdp: {
        name: "",
        schemaCode: "",
      },
      rightRdp: {
        name: "",
        schemaCode: "",
      },
      upRdp: {
        name: "",
        schemaCode: "",
      },
      editable: true,
      defaultCheckedValue: true,
      isRdp: true,
      routing: null,
    };
    this.editingKey = addRow.id;
    this.rdpTableData.push(addRow);
    this.rdpTableKey++;
  }

  save(key, row) {
    if(!row.tabId) return this.$message.warning('关联菜单必选!')
    if (key.length === 4) {
      //add
      updateRdp({
        appCode: this.projectCode ?? "",
        projectGroupId: this.projectGroupId ?? "",
        tabId: row.tabId,
        allRdp: row.allRdp,
        rightRdp: row.rightRdp,
        upRdp: row.upRdp,
        isRdp: row.isRdp,
        routing: row.routing,
      }).then((res) => {
        if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
        this.$message.success("保存成功！");
        this.getRdpList(); //单个保存---待优化，任意多个保存
        // this.currentRow = null;
      });
    } else {
      //edit
      updateRdp({
        id: row.id,
        appCode: this.projectCode ?? "",
        projectGroupId: this.projectGroupId ?? "",
        tabId: row.tabId,
        allRdp: row.allRdp,
        rightRdp: row.rightRdp,
        upRdp: row.upRdp,
        isRdp: row.isRdp,
        routing: row.routing,
      })
        .then((res) => {
          if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
          this.$message.success("修改成功！");
          this.getRdpList();
          // this.currentRow = null;
        })
        .finally(() => {
          // this.isOperate = false;
        });
    }
  }

  edit(key, record) {
    // this.defaultCheckedValue = [];
    const newData = [...this.rdpTableData];
    const target = newData.filter((item) => key === item.id)[0];
    this.editingKey = key;
    if (target) {
      target.editable = true;
      this.rdpTableData = newData;
    }
  }

  cancel(key) {
    this.editingKey = "";
    this.defaultCheckedValue = "";
    //add
    if (key.length === 4) {
      this.rdpTableData = this.rdpTableData.filter((i) => {
        return i.id !== key;
      });
    }
    //edit
    const newData = [...this.rdpTableData];
    const target = newData.filter((item) => key === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheRdpTableData.filter((item) => key === item.id)[0]);
      delete target.editable;
      this.rdpTableData = newData;
      this.rdpTableKey++;
    }
  }

  deleteConfig(id: string) {
    deleteRdp({ appCode: this.projectCode ?? "", id: id }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.getRdpList();
    });
  }

  onChange(e) {
    e.target.value ? this.defaultCheckedValue === "rdp" : "route";
    const target: Rdp = this.rdpTableData.filter((item) => this.editingKey === item.id)[0];
    if (target) {
      target.isRdp = e.target.value;
    }
  }

  reportHandleChange(val, pos) {
    const target: Rdp = this.rdpTableData.filter((item) => this.editingKey === item.id)[0];
    if (target) {
      target[pos].name = val;
      let schemaCode = "";
      this.selectOption.map((i) => {
        if (i.name === val) {
          schemaCode = i.schemaCode;
        }
      });
      target[pos].schemaCode = schemaCode;
    }
  }

  routeHandleChange(val, pos) {
    const target: Rdp = this.rdpTableData.filter((item) => this.editingKey === item.id)[0];
    if (target) {
      const routeObj: { name: string; schemaCode: string } = {
        name: "",
        schemaCode: "",
      };
      target[pos] ? (target[pos].name = val) : (routeObj.name = val);
      let schemaCode = "";
      this.routesOption.map((i) => {
        if (i.name === val) {
          schemaCode = i.pcUrl;
        }
      });
      target[pos] ? (target[pos].schemaCode = schemaCode) : (routeObj.schemaCode = schemaCode);
      if (!target[pos]) {
        target[pos] = JSON.parse(JSON.stringify(routeObj));
      }
      console.log(target, "schemaCode");
    }
  }
  //add-rdp
  getReportList() {
    getReportList({ appCode: this.projectCode ?? "" }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.selectOption = res.data;
      }
    });
  }

  opeReportModal() {
    this.showUpdateModel = true;
  }

  closeReportDia() {
    this.showUpdateModel = false;
  }

  getRouteList() {
    getRouteList({ appCode: this.projectCode ?? "" }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        this.routesOption = res.data;
      }
    });
  }

  mounted() {
  //
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import "../system.module.less";
.rdp-list {
  .add-rdp-btn {
    margin-bottom: @spacing-base;
  }
  /deep/ .ant-modal-body {
    height: 500px;
    overflow: auto;
    .ant-select {
      width: 160px;
    }
  }
}
</style>
