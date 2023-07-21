<template>
  <article class="mainContainer">
    <fence
      v-if="mainShow"
      :projectCode="projectCode"
      :projectName="projectName"
      @mainShow="getbimEquipList()"></fence>
    <!--    底部 信息栏 显示状态-->
    <div
      v-show="!mainShow"
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
        <div class="leftClass">
          <div class="titleContainer">
            <span>船舶管控清单</span>
            <a-button
              size="small"
              @click="()=>this.leftChoose='电子围栏设置'"
              :class="leftChoose==='电子围栏设置'?'bottom_hover_button':'bottom_button'">电子围栏设置
            </a-button>
            <a-button
              size="small"
              @click="()=>this.leftChoose='轨迹清除'"
              :class="leftChoose==='轨迹清除'?'bottom_hover_button':'bottom_button'">轨迹清除
            </a-button>
            <a-button
              size="small"
              @click="()=>this.leftChoose='轨迹回放'"
              :class="leftChoose==='轨迹回放'?'bottom_hover_button':'bottom_button'">轨迹回放
            </a-button>
          </div>
          <a-divider style="clear: both;margin: 5px"/>
          <div class="tableContainer">
            <a-table
              size="small"
              class="bottom_table"
              rowKey="id"
              :columns="boatColumns"
              :dataSource="boatTableData"
              :rowClassName="setRowClass"
              :customRow="rowClick"
              :scroll="{ y: '195px'}"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onTableSelect }"
            >
              <template slot="inOutState" slot-scope="text,record">
                <div :style="{color:(record.inOutState=='无状态'?'#FFFF00':record.inOutState=='进场'?'#228B22':'#FF0000')}">
                  {{ record.inOutState }}
                </div>
              </template>
              <template slot="alertState" slot-scope="text,record">
                <div :style="{color:(record.alertState=='提醒'?'#FFFF00':record.alertState=='正常'?'#228B22':'#FF0000')}">
                  {{ record.alertState }}
                </div>
              </template>
              <div
                slot="filterDropdown"
                slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
                style="padding: 8px"
              >
                <a-input
                  v-ant-ref="c => (searchInput = c)"
                  placeholder="搜索名称"
                  :value="selectedKeys[0]"
                  style="width: 188px; margin-bottom: 8px; display: block;"
                  @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                  @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
                />
                <a-button
                  type="primary"
                  icon="search"
                  size="small"
                  style="width: 90px; margin-right: 8px"
                  @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
                >
                  查找
                </a-button>
                <a-button size="small" style="width: 90px" @click="() => handleReset(clearFilters)">
                  重置
                </a-button>
              </div>
              <a-icon
                slot="filterIcon"
                slot-scope="filtered"
                type="search"
                :style="{ color: filtered ? '#108ee9' : undefined }"
              />
              <template slot="equipmentName" slot-scope="text, record, index, column">
                <span v-if="searchText && searchedColumn === column.dataIndex">
                  <template
                    v-for="(fragment, i) in text
                      .toString()
                      .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
                  >
                    <mark
                      v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                      :key="i"
                      class="highlight"
                    >{{ fragment }}</mark
                    >
                    <template v-else>{{ fragment }}</template>
                  </template>
                </span>
                <template v-else>
                  {{ text }}
                </template>
              </template>
            </a-table>
          </div>
        </div>
        <div class="rightClass">
          <div class="titleContainer">
            <span>船舶情况统计</span>
            <a-button
              size="small"
              @click="()=>this.rightChoose='预警状态'"
              :class="rightChoose==='预警状态'?'bottom_hover_button':'bottom_button'">预警状态
            </a-button>
            <a-button
              size="small"
              @click="()=>this.rightChoose='在场情况'"
              :class="rightChoose==='在场情况'?'bottom_hover_button':'bottom_button'">在场情况
            </a-button>
          </div>
          <div id="boatEchart"></div>
        </div>
      </main>
    </div>
    <a-modal
      title="轨迹回放"
      class="modalClass"
      :visible="isModalShow"
      @ok="drawTrace()"
      @cancel="()=>{this.isModalShow=false;this.leftChoose='';}"
      okText="确认"
    >
      <div style="margin-bottom: 20px">
        <span>起止时间ㅤㅤ</span>
        <a-range-picker
          showTime
          size="small"
          :key="pickerNum"
          @change="trailTime"
          :disabledDate="disabledDate"
          @calendarChange="calendarChange"
          style="width:320px">
          <template slot="renderExtraFooter">
          </template>
        </a-range-picker>
      </div>
      <div>
        <span>播放速度ㅤㅤ</span>
        <a-select size="small" style="width: 140px" v-model="velocity">
          <a-select-option value="快">快</a-select-option>
          <a-select-option value="中">中</a-select-option>
          <a-select-option value="慢">慢</a-select-option>
        </a-select>
      </div>
    </a-modal>
  </article>
</template>

<script lang="ts">
import * as Api from "../../../service/api";
import moment from 'moment';
import {Component, InjectReactive, Prop, Ref, Vue, Watch} from "vue-property-decorator";
import {Input, Table, Divider, Button, Icon, DatePicker, Modal, Select} from '@h3/antd-vue';
import bottomArray from '../../../../src/assets/extends/bim/frame_bottom_1.png';
import bottomArrayHide from '../../../../src/assets/extends/bim/frame_bottom_2.png';
import modalPic from '../../../../src/assets/extends/bim/frame_trajectory.png';
import Fence from './fence.vue'
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';

const {RangePicker} = DatePicker;
@Component({
  name: 'shipEquipment',
  components: {
    Fence,
    AIcon: Icon,
    AModal: Modal,
    ATable: Table,
    AInput: Input,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    AInputSearch: Input.Search,
    ARangePicker: RangePicker,
    ADivider: Divider
  }
})
export default class shipEquipment extends Vue {
  @Prop() projectCode!: string;
  @Prop() projectName!: string;

  @Ref()
  MainTable?: HTMLElement;

  mainShow: boolean = false;//电子围栏设置

  bottomArray: any = bottomArray;
  bottomArrayHide: any = bottomArrayHide;
  isBottomShow: boolean = true;

  boatColumns: Array<any> = [  // 表头数据
    {
      align: "center",
      title: "编号",
      key: "equipmentCode",
      dataIndex: "equipmentCode",
    },
    {
      align: "center",
      title: "船舶名称",
      key: "equipmentName",
      dataIndex: "equipmentName",
      scopedSlots: {
        filterDropdown: 'filterDropdown',
        filterIcon: 'filterIcon',
        customRender: 'equipmentName',
      },
      onFilter: (value, record) =>
        record.equipmentName
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => {
            //@ts-ignore
            this.searchInput.focus();
          }, 0);
        }
      },
    },
    {
      align: "center",
      title: "自有/租赁",
      key: "ishire",
      dataIndex: "ishire",
    },
    {
      align: "center",
      title: "进出场状态",
      key: "inOutState",
      dataIndex: "inOutState",
      scopedSlots: {customRender: "inOutState"},
    },
    {
      align: "center",
      title: "进场时间",
      key: "inDate",
      dataIndex: "inDate",
    },
    {
      align: "center",
      title: "出场时间",
      key: "outDate",
      dataIndex: "outDate",
    },
    {
      align: "center",
      title: "所属围栏",
      key: "fenceName",
      dataIndex: "fenceName",
    },
    {
      align: "center",
      title: "预警状态",
      key: "alertState",
      dataIndex: "alertState",
      scopedSlots: {customRender: "alertState"},
    }];
  boatTableData: Array<any> = [];
  searchText: string = '';
  searchInput: string | null = null;
  searchedColumn: string = '';
  leftChoose: string = '';
  rightChoose: string = '';
  selectedRowKeys: Array<string> = [];//表格多选

  alertStateStatics: Array<any> = [];
  inOutStateStatics: Array<any> = [];
  alertColor: Array<string> = [];
  inOutColor: Array<string> = [];
  alertGroup: Array<any> = [
    {'name': '正常', 'color': '#228B22'},
    {'name': '提醒', 'color': '#FFFF00'},
    {'name': '预警', 'color': '#FF0000'}];
  inOutGroup: Array<any> = [
    {'name': '进场', 'color': '#228B22'},
    {'name': '无状态', 'color': '#FFFF00'},
    {'name': '退场', 'color': '#FF0000'}];


  isModalShow: boolean = false;
  selectPriceDate: string = '';
  offsetDays: number = 259200 * 1000 //最多选择范围31天ms;
  endTime: string = '';
  startTime: string = '';
  velocity: string = '快';//轨迹绘制速度
  pickerNum: number = 0;

  traceId: Array<any> = [];//轨迹id
  fenceId: Array<any> = [];//围栏id

  timer: any = null;

  @Watch("leftChoose")
  leftChooseListener(val: string) {
    if (val == '轨迹回放') {
      if (this.selectedRowKeys.length == 0) {
        //@ts-ignore
        this.$message.warn('请选择轨迹回放对象！')
        return this.leftChoose = '';
      }
      this.isModalShow = true;
      this.pickerNum += 1;
    } else if (val == '电子围栏设置') {
      this.leftChoose = '';
      this.rightChoose = '';
      this.mainShow = true;
      this.$emit('removeElectFence', this.fenceId);
      this.fenceId = [];
    } else if (val == '轨迹清除') {
      this.$emit('removeTrajectory', this.traceId);
      this.traceId = [];
    }
  }

  @Watch("rightChoose")
  rightChooseListener(val: string) {
    if (val == '在场情况') {
      let name: Array<string> = [];
      this.inOutStateStatics.forEach(function (e) {
        name.push(e.name)
      })
      this.drawPie(this.inOutColor, name, this.inOutStateStatics);
    } else if (val == '预警状态') {
      let name: Array<string> = [];
      this.alertStateStatics.forEach(function (e) {
        name.push(e.name)
      })
      this.drawPie(this.alertColor, name, this.alertStateStatics);
    }
  }


  mounted() {
    this.getbimEquipList();
    //定时刷新界面
    this.timer = setInterval(() => {
      //有轨迹或处于围栏查看界面  不刷新
      if (this.traceId.length === 0 && !this.mainShow) {
        this.updateBimEquipLocation();
        // this.getbimEquipList();
      }
    }, 60000);
  }

  /**
   *画饼图
   *Data  画图数据[{name:,value:}]
   */
  drawPie(color, name, data) {
    // @ts-ignore
    const myChart = echarts.init(document.getElementById('boatEchart'));
    myChart.clear()
    myChart.setOption({
      color: color,
      legend: {
        top: "bottom",
        icon: "rect",
        data: name,
        textStyle: {color: "#fff", fontSize: 12},
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '选项',
          type: 'pie',
          radius: '55%',
          center: ['50%', '42%'],
          data: data,
          label: {
            position: 'outer',
            distanceToLabelLine: 1,
            containLabel: true,
            bleedMargin: 1,
            overflow: 'breakAll'
          },
          labelLine: {
            length: 3
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
    myChart.on("click", this.eConsole);
    window.onresize = function () {
      myChart.resize();
    };
  }

  //绘制轨迹
  drawTrace() {
    this.traceId = [];
    Api.bimEquipLocus({
      appCode: this.projectCode,
      startTime: this.startTime,
      endTime: this.endTime,
      idList: this.selectedRowKeys
    }).then(res => {
      //@ts-ignore
      if (res.errcode !== 0) return this.$message.warn('绘制失败');
      //@ts-ignore
      if (res.data.length === 0) return this.$message.warn(res.errmsg);
      this.isModalShow = false;
      this.leftChoose = '';
      const _this = this;
      res.data.forEach(function (v) {
        _this.traceId.push({id: v.properties.id});
      })
      let traceData: any = {
        'speed': this.velocity == '快' ? 10 : this.velocity == '慢' ? 4 : 7,
        'data': res.data
      };
      this.$emit('trajectoryPlayback', traceData)
      console.log('轨迹绘制', this.traceId, traceData);
    })
  }

  //TODO:饼图点击事件
  eConsole(param) {

  }

  handleSearch(selectedKeys, confirm, dataIndex) {
    confirm();
    this.searchText = selectedKeys[0];
    this.searchedColumn = dataIndex;
  }

  handleReset(clearFilters) {
    clearFilters();
    this.searchText = '';
  }

  getbimEquipList() {
    const {alertGroup, inOutGroup, alertColor, inOutColor} = this;
    let _this = this;
    _this.mainShow = false;
    _this.inOutStateStatics = [];
    _this.alertStateStatics = [];
    _this.selectedRowKeys = [];
    Api.getbimEquipList({
      appCode: this.projectCode,
      projectName: this.projectName,
      type: 'boat'
    }).then((res) => {
      if (res.errcode !== 0) return
      if (!res.data) return
      this.boatTableData = res.data.dataList;
      const alertData = res.data.alertStateStatics;
      const inOutData = res.data.inOutStateStatics;
      alertGroup?.forEach(function (item, i) {
        _this.alertStateStatics.push({
          value: alertData[item.name] ?? 0,
          name: item.name,
        })
        _this.alertColor.push(item.color)
      });
      inOutGroup.forEach(function (item, i) {
        _this.inOutStateStatics.push({
          value: inOutData[item.name] ?? 0,
          name: item.name,
        })
        _this.inOutColor.push(item.color)
      });
      this.rightChoose = '在场情况'
      this.$emit('drawMonitorMarker', res.data.dataList);
      this.$emit('addElectFence', res.data.fenceList);
      res.data.fenceList.forEach(function (v) {
        _this.fenceId.push({id: v.id});
      })
    })
  }

  onTableSelect(selectedRowKeys, selectedRows) {
    this.selectedRowKeys = selectedRowKeys;
  }

  setRowClass(record, index) {
    return Number(index) % 2 === 1 ? "evenRowStyl" : "";
  }

  rowClick(record, index) {
    return {
      on: {
        click: () => {
          this.$emit('locationMonitorMarker', {id: record.id})
        }
      }
    };
  }

  trailTime(dates, dateStrings) {
    this.endTime = dateStrings[1];
    this.startTime = dateStrings[0];
  }

  updateBimEquipLocation() {
    let dataList: Array<any> = []
    this.boatTableData.forEach(function (v) {
      var tempt = {
        id: v.id,
        longitude: v.longitude + Math.ceil(Math.random() * 10) * Math.pow(-1, Math.ceil(Math.random() * 10)) / (100000),
        latitude: v.latitude + Math.ceil(Math.random() * 10) * Math.pow(-1, Math.ceil(Math.random() * 10)) / (100000),
        altitude: v.altitude,
      }
      dataList.push(tempt)
    })
    Api.updateBimEquipLocation({appCode: this.projectCode, dataList: dataList}).then(res => {
      if (res.errcode === 0) this.getbimEquipList()
    });
  }

  formatDate(value) {
    let date = new Date(value)
    let Y = date.getFullYear() + '-'
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    let D = date.getDate()
    return Y + '-' + M + '-' + D
  }

  disabledDate(current) {
    if (this.selectPriceDate) {
      let selectV = moment(this.selectPriceDate, 'YYYY-MM-DD').valueOf()
      return current > moment(this.formatDate(new Date(selectV + this.offsetDays).getTime()), 'YYYY-MM-DD') ||
        current > moment().endOf('day')
    } else {
      return current > moment().endOf('day')
    }
  }

  //选择开始时间/结束时间
  calendarChange(date) {
    this.selectPriceDate = date[0]
  }

  destroyed() {
    this.$emit('removeAllElectMonitor');
    clearInterval(this.timer);
    this.timer = null;
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
    width: 98%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0.9375vw;

    .leftClass {
      width: 75%;

      span:nth-child(1) {
        color: #FFFFFF;
        font-family: Source Han Sans CN;
        font-weight: bold;
        font-size: 16px;
      }

      :nth-child(n+2) {
        //margin-left: 10px;
      }

      &.titleContainer {
        margin: 10px;
      }

      &.tableContainer {
        width: 100%;
      }
    }

    .rightClass {
      width: 25%;

      :nth-child(n+1) {
        margin-left: 10px;
      }

      span:nth-child(1) {
        color: #FFFFFF;
        font-family: Source Han Sans CN;
        font-weight: bold;
        font-size: 16px;
      }

      &.titleContainer {
        margin: 10px;
      }

      & > #boatEchart {
        width: 100%;
        height: 80%;
      }
    }
  }

  & .detailContainer {
    width: 25%;
    .flex;
    flex: 1;
    flex-direction: column;
    margin-right: 8px;

    & .detailNav {
      .flex;
      width: 100%;

      & > button:first-of-type {
        margin-right: auto;
      }
    }

    & > #myChart {
      width: 100%;
      height: 90%;
    }

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

  .bottom_table {
    width: 99%;

    /deep/ .ant-table {
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

/deep/ .ant-checkbox-checked {
  .ant-checkbox-inner {
    background-color: #1890ff;
    border-color: #1890ff;
  }
}

/deep/ .clickRowStyl {
  background-color: #6ca2f6 !important;
}

/deep/ .evenRowStyl {
  background-color: rgba(53, 130, 243, 0.1) !important;
}
</style>
