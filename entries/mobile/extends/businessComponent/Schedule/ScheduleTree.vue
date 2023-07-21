<template>
  <div>
    <div class="app_title">
      <div>
        <img @click="toprev" :src="prev" alt="" />
        <span>进度编码树</span>
      </div>
    </div>
    <div class="search">
      <el-input
        @change= "search"
        placeholder="搜索"
        v-model="input"
        clearable></el-input>
      <img @click="searchClick" src="../../Img/icon_sx@2x.png" alt="" />
      <div class="shaixuan" v-show="searchShow">
        <p @click="select(item)" v-for="(item,index) in pList" :key="index">{{ item.name }}</p>
      </div>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      border
      rowKey="id"
      @row-click="handleClick"
      defaultExpandAll
    >
      <el-table-column prop="planDetailName" label="工程部位"></el-table-column>
      <el-table-column
        prop="reportState"
        align="center"
        label="状态"
        width="80"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.reportState == '0'" style="color: #00C567">
            已完成
          </span>
          <span v-else-if="scope.row.reportState == '1'" style="color: #EFB70D">
            进行中
          </span>
          <span v-else-if="scope.row.reportState == '-1'" style="color: #FF7175">
            未开始
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Input from "element-ui/lib/input";
import prev from "../../Img/fanhui.png";
import env from "@/config/env";
import { getTreeListWBS } from "../service/index.js";
export default {
  components: {
    ElInput: Input,
  },
  inject:['projectConfig'],
  data() {
    return {
      pList: [
        {
          name:"全部",
          value: ""
        },
        {
          name:"已完成",
          value: 0
        },
        {
          name:"进行中",
          value: 1
        },
        {
          name:"未开始",
          value: -1
        },
      ],
      tableData: [],
      prev: prev,
      searchShow: false,
      planDetailName: "",
      input: "",
      projectCode: "",
      projectName: "",
    };
  },
  methods: {
    search(val){
      this.planDetailName = val
      this.getinit();
    },
    select(val){
      this.reportState = val.value
      this.getinit();
      this.searchShow = !this.searchShow;
    },
    searchClick() {
      this.searchShow = !this.searchShow;
    },
    toprev() {
      this.$router.go(-1);
    },
    handleClick(row) {
      this.$router.push( {name:'ScheduleTask',query: {id: row.id}});
    },
    getinit() {
      getTreeListWBS(this.projectCode, this.projectName, this.reportState, this.planDetailName).then(
        (res) => {
          this.tableData = res.data;
        }
      );
    },
  },
  mounted() {
    this.projectCode = `${env.project}`;
    // this.projectName = sessionStorage.getItem("projectname");
    this.projectName = this.projectConfig?.projectName??"";
    this.getinit();

  },
};
</script>

<style lang="less">
.app_title {
  width: 100%;
  height: 45px;
  background: #0e79ed;
  display: flex;
  div:nth-child(1) {
    width: 80%;
    display: flex;
    span {
      width: 95%;
      font-size: 17px;
      padding-left: 15px;
      font-weight: 700;
    }
    img {
      padding-top: 12px;
      padding-left: 5px;
      width: 28px;
      height: 30px;
      margin-right: 40px;
    }
  }
  div:nth-child(2) {
    width: 20%;
    span {
      vertical-align: middle;
      width: 75%;
      font-size: 16px;
    }
    img {
      width: 18px;
      vertical-align: middle;
      margin-right: 3px;
      height: 18px;
    }
  }
  span {
    color: #fff;
    line-height: 45px;
  }
}
.search {
  position: relative;
  padding: 10px 0;
  .el-input {
    width: 83%;
    margin-right: 10px;
  }
  .el-input--suffix .el-input__inner {
    border-radius: 28px;
    height: 33px;
  }
  img {
    width: 38px;
    height: 38px;
  }
  .shaixuan {
    position: absolute;
    top: 48px;
    right: 20px;
    width: 97px;
    height: 182px;
    background: #ffffff;
    border: 1px solid #ebebeb;
    box-shadow: 0px 3px 7px 0px rgba(6, 72, 151, 0.1);
    z-index: 99;
    border-radius: 6px;
    p {
      height: 45px;
      font-size: 16px;
      font-family: Source Han Sans CN;
      font-weight: 400;
      color: #666666;
      margin-bottom: 0;
      line-height: 45px;
    }
  }
}
</style>

<style lang="less">
.el-table {
  th {
    text-align: center;
  }
}
</style>
