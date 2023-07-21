<template>
  <div>
    <div class="container" v-if="personPageShow">
      <div class="leftContainer">
        <div class="gennerl_title">
          <h4>组织机构</h4>
        </div>
        <!-- <a-tree :key="this.treeData.length" :treeData="treeData" :defaultExpandAll="true" :replaceFields="replaceFields" :defaultSelectedKeys="defaultSelectedKeys" @select="clickTree"></a-tree> -->
        <a-table
          :rowClassName="setTreeTableClass"
          v-if="tableDataTree.length > 0"
          :defaultExpandAllRows="true"
          size="small"
          :customRow="handleClick"
          rowKey="id"
          :columns="columnsTree"
          :scroll="{ y: 760 }"
          :data-source="tableDataTree"
          :pagination="false" />
      </div>
      <div class="rightContainer">
        <div class="mainContainer">
          <div>
            <img src="./img/rygl_zrs.png" alt="">
            <a-statistic :value="allData.todayStatics['总进场人数']" :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}">
              <template #title>
                <span style="color:#fff">总人数(人)</span>
              </template>
            </a-statistic>
          </div>
          <div>
            <img src="./img/rygl_jrjc.png" alt="">
            <a-statistic :value="allData.todayStatics['今日进场人数']" :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}">
              <template #title>
                <span style="color:#fff">今日进场人数(人)</span>
              </template>
            </a-statistic>
          </div>
          <div>
            <img src="./img/rygl_zrt.png" alt="">
            <a-statistic :value="allData.todayStatics['今日退场人数']" :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}">
              <template #title>
                <span style="color:#fff">今日退场人数(人)</span>
              </template>
            </a-statistic>
          </div>
          <div>
            <img src="./img/rygl_dq.png" alt="">
            <a-statistic :value="allData.todayStatics['当前在场人数']" :valueStyle="{color: '#00fcf9',fontFamily: 'lianmengqiyilushuaizhengruiheiti',fontWeight:700}">
              <template #title>
                <span style="color:#fff">当前在场人数(人)</span>
              </template>
            </a-statistic>
          </div>
        </div>
        <!-- <div class="inContainer">
        <div class="gennerl_title">
          <h4>进场统计</h4>
        </div>
        <a-table
          size="small"
          rowKey="id"
          :columns="columns1"
          :scroll="{ y: 220 }"
          :data-source="tableData1"
          :pagination="false"
          :rowClassName="setRowClassName">
          <template #index="text,record,index">
            <span :class="tableIndexClass(index)"><em>{{ index+1 }}</em></span>
          </template>
        </a-table>
      </div> -->
        <div class="inOutContainer">
          <div class="gennerl_title">
            <h4>进退场汇总</h4>
          </div>
          <div class="contentContainer">
            <div class="inOutTable">
              <div class="search">
                <a-input-search
                  class="searchInput"
                  size="small"
                  placeholder="请输入关键字"
                  @search="getPersonByWordKey"></a-input-search>
              </div>
              <div class="dateSelect">
                <a-month-picker
                  class="monthInput"
                  placeholder="选择月份"
                  :value="momentDateStr(monthData)"
                  :allowClear="false"
                  @change="onDateChange"
                  size="small" />

              </div>
              <a-table
                size="small"
                rowKey="id"
                :rowClassName="setRowClassName"
                :columns="columns2"
                :scroll="{ y: 650 }"
                :data-source="allData.userAttendanceList"
                :customRow="rowClick"
                :pagination="false">
                <template #index="text,record,index">
                  <span :class="tableIndexClass(index)"><em>{{ index+1 }}</em></span>
                </template>
                <template #attendance="text,record">
                  <div style="margin-bottom:-12px;margin-left: -15px">
                    <span style="font-size:12px">{{ record.rate }}</span>
                    <img src="./img/pic.png" alt="">
                  </div>
                  <a-progress :percent="parseNumber(record.rate)" :showInfo="false" :strokeWidth="2" />
                </template>
              </a-table>
            </div>
            <div class="inOut">
              <p class="inOutTitle">考勤统计</p>
              <div class="inOutContents">
                <div class="inOutContent" v-for="(v,i) in attendanceData" :key="i">
                  <img src="./img/k1_xmxx_icon3.png" alt="" />
                  <span>{{ v.time }}</span>
                  <span class="inOutContentStatus">状态</span>
                  <span :style="{color:[v.inOrOut==='进入'?'rgba(2,56,236,0.5)':'green']}">
                    {{ v.inOrOut }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!personPageShow" class="empty">
      <img :src="ImgShow" alt="">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  Tree,
  Table,
  Input,
  DatePicker,
  Statistic,
  Progress,
} from "@h3/antd-vue";
import * as Api from "../../../service/api";
import moment from "moment";
import "moment/locale/zh-cn";
import ImgShow from "./img/noDataImg.png"

@Component({
  name: "personViewNew",
  components: {
    [Tree.name]: Tree,
    [Statistic.name]: Statistic,
    [Table.name]: Table,
    [Progress.name]: Progress,
    AInputSearch: Input.Search,
    AMonthPicker: DatePicker.MonthPicker,
  },
})
export default class allProtect extends Vue {
  @Prop() projectName!: string;
  @Prop() appCode!: string;

  get tableIndexClass() {
    return (index: number) => {
      if (index == 0) {
        return ["tableIndex", "backgroundColor1st"];
      } else if (index === 1) {
        return ["tableIndex", "backgroundColor2nd"];
      } else if (index === 2) {
        return ["tableIndex", "backgroundColor3th"];
      } else {
        return ["tableIndex"];
      }
    };
  }
  parseNumber(value: string): number {
    return parseInt(value.replace("%", ""));
  }
  // treeData: Array<{ [propsName: string]: any }> = [];
  // replaceFields: { [propsName: string]: string } = {
  //   children: "childs",
  //   title: "name",
  //   key: "id",
  // };
  todayStatics: { [propsName: string]: number } = {
    总进场人数: 1611,
    今日进场人数: 1111,
    今日退场人数: 5555,
    今日在场人数: 2222,
  };
  // columns1: Array<{ [propsName: string]: any }> = [
  //   {
  //     title: "序号",
  //     align: "center",
  //     width: 100,
  //     scopedSlots: { customRender: "index" },
  //   },
  //   {
  //     align: "center",
  //     title: "单位名称",
  //     key: "teamName",
  //     dataIndex: "teamName",
  //     width: "30%",
  //     filters: [],
  //     onFilter: (value, record) => record.teamName.indexOf(value) === 0,
  //   },
  //   {
  //     align: "center",
  //     title: "总人数",
  //     key: "totalPerson",
  //     dataIndex: "totalPerson",
  //     scopedSlots: { customRender: "attachment" },
  //   },
  //   {
  //     align: "center",
  //     title: "当日进场人数",
  //     key: "todayInPerson",
  //     dataIndex: "todayInPerson",
  //   },
  //   {
  //     align: "center",
  //     title: "当前在场人数",
  //     key: "currentInPerson",
  //     dataIndex: "currentInPerson",
  //   },
  // ];
  columnsTree: Array<{ [propsName: string]: any }> = [
    {
      align: "left",
      title: "组织名称",
      key: "name",
      dataIndex: "name",
      width: "62%",
    },
    {
      align: "center",
      title: "总人数",
      key: "totalPerson",
      dataIndex: "totalPerson",
      scopedSlots: { customRender: "attachment" },
    },
    {
      align: "center",
      title: "当日进场人数",
      key: "todayPerson",
      dataIndex: "todayPerson",
    },
    {
      align: "center",
      title: "当前在场人数",
      key: "currentPerson",
      dataIndex: "currentPerson",
    },
  ];
  // tableData1: Array<{ [propsName: string]: string | number }> = [];

  columns2: Array<{ [propsName: string]: any }> = [
    {
      title: "序号",
      align: "center",
      width: 100,
      scopedSlots: { customRender: "index" },
    },
    {
      align: "center",
      title: "姓名",
      key: "username",
      dataIndex: "username",
    },
    {
      align: "center",
      title: "部门",
      key: "company",
      dataIndex: "company",
      width: "25%",
    },
    {
      align: "center",
      title: "本月天数",
      key: "monthDay",
      dataIndex: "monthDay",
    },
    {
      align: "center",
      title: "今日考勤",
      key: "todayAttandance",
      dataIndex: "todayAttandance",
    },
    {
      align: "center",
      title: "出勤次数",
      key: "monthAttandance",
      dataIndex: "monthAttandance",
    },
    {
      align: "center",
      title: "缺勤次数",
      key: "monthUnAttandance",
      dataIndex: "monthUnAttandance",
    },
    {
      align: "center",
      title: "出勤率",
      key: "rate",
      dataIndex: "rate",
      scopedSlots: { customRender: "attendance" },
    },
  ];
  // defaultSelectedKeys: Array<string> = [];
  allData: any = {
    todayStatics: {
      今日进场人数: 0,
      今日退场人数: 0,
      当前在场人数: 0,
      总进场人数: 0,
    },
    userAttendanceList: [],
  };
  wordKey: string = "";
  tableId: string = "";
  defaultPagesData: Array<{ [propsName: string]: string | number }> = [];
  attendanceData: Array<{ [propsName: string]: string | number }> = [];
  monthData: string = "2022-03";
  tableDataTree: any = [];
  personPageShow: boolean = true;
  ImgShow: string = ImgShow

  mounted() {
    // this.getPersonTeamTree();
    this.getCompanyAttendance();
  }

  // clickTree(e) {
  //   this.tableId = e[0] ?? "";
  //   this.monthData = moment().format("YYYY-MM-DD").substring(0, 7);
  //   this.getUserAttendance(e[0] ?? "", moment().format("YYYY-MM-DD"));
  // }

  handleClick(val) {
    return {
      on: {
        // 事件
        click: () => {
          this.tableId = val.id;
          this.monthData = moment().format("YYYY-MM-DD").substring(0, 7);
          this.getUserAttendance(this.tableId ?? "",moment().format("YYYY-MM-DD"));
        }, // 点击行
      },
    };
  }

  getCompanyAttendance() {
    // this.tableData1 = [];
    // Api.getCompanyAttendance({projectName: this.projectName, appCode: this.appCode}).then(res => {
    //   if (res.errcode !== 0) return;
    //   if (res.data) {
    //     this.tableData1 = res.data;
    //     for (let i = 0; i < this.tableData1.length; i++) {
    //       this.columns1[1].filters.push({
    //         text: this.tableData1[i].teamName,
    //         value: this.tableData1[i].teamName
    //       })
    //     }
    //   }
    // })
    Api.getTeamTreeWithAttandance({
      projectCode: this.appCode,
      projectName: this.projectName,
    }).then((res) => {
      if (!res.data) return this.personPageShow = false
      setTimeout(() => {
        this.tableDataTree = res.data;
        this.tableId = this.tableDataTree[0].id;
        this.monthData = moment().format("YYYY-MM-DD").substring(0, 7);
        this.getUserAttendance(this.tableId ?? "",moment().format("YYYY-MM-DD"));
      }, 0);
    });
  }

  //获取班组信息
  // getPersonTeamTree() {
  //   this.defaultSelectedKeys = [];
  //   Api.getPersonTeamTree({
  //     projectName: this.projectName,
  //     projectCode: this.appCode,
  //   }).then((res) => {
  //     if (res.errcode !== 0) return;
  //     if (res.data) {
  //       this.treeData = res.data;
  //       this.defaultSelectedKeys.push(this.treeData[0].id ?? "");
  //       this.clickTree(this.defaultSelectedKeys);
  //     }
  //   });
  // }

  getPersonByWordKey(value) {
    const finnalTableData: Array<{ [propsName: string]: string | number }> = [];
    if (value.trim() === "") {
      this.allData.userAttendanceList = [...this.defaultPagesData];
      return;
    }
    this.defaultPagesData.forEach((item) => {
      //@ts-ignore
      if ((item.company && item.company?.indexOf(value) > -1) || (item.username && item.username?.indexOf(value) > -1) || (item.todayAttandance && item.todayAttandance?.indexOf(value) > -1)) {
        finnalTableData.push(item)
        return true
      }
    });
    this.allData.userAttendanceList = [...finnalTableData];
  }

  getUserAttendance(id: string, date: string) {
    this.allData = {
      todayStatics: {
        今日进场人数: 0,
        今日退场人数: 0,
        当前在场人数: 0,
        总进场人数: 0,
      },
      userAttendanceList: [],
    };
    Api.getUserAttendance({
      appCode: this.appCode,
      projectName: this.projectName,
      teamNodeId: id,
      date: date,
    }).then((res) => {
      if (res.errcode === 0 && res.data) {
        this.allData = res.data;
        this.defaultPagesData = res.data.userAttendanceList;
        if (res.data.userAttendanceList.length == 0) return;
        this.attendanceData = res.data.userAttendanceList[0].attendances ?? [];
      }
    });
  }

  onDateChange(date, dateString) {
    this.monthData = dateString;
    this.getUserAttendance(this.tableId, dateString + "-01");
  }

  setRowClassName(record, index) {
    const rowColor = Number(index) % 2 === 1 ? "evenRowStyl" : "";
    return rowColor;
  }

  setTreeTableClass(val) {
    const rowColor = val.id == this.tableId ? "highTree" : "";
    return rowColor;
  }

  rowClick(record) {
    return {
      on: {
        click: () => {
          this.attendanceData = record.attendances;
        },
      },
    };
  }

  // 将时间字符串 转换 为 Moment
  momentDateStr(dateStr) {
    return moment(dateStr);
  }
}
</script>

<style lang="less" scoped>
@import "./personViewNew.less";
</style>
