<template>
  <div class="EditPlan">
    <div class="title">
      <h3>
        <img @click="toprev" src="../../icon.png" alt="" />
        {{ titleName }}
      </h3>
      <el-button @click="tolink">保存</el-button>
    </div>
    <div class="content">
      <div v-if="!disabled" class="information">
        <h4>基础信息</h4>
        <div class="select">
          <p>计划类型：</p>
          <el-button :style="{background: type == 'year'?'#2761db':'',color:type == 'year'?'#fff':''}" @click="yearType">年度计划</el-button>
          <el-button :style="{background: type == 'month'?'#2761db':'',color:type == 'month'?'#fff':''}" @click="monthType">月度计划</el-button>
          <p>计划时间：</p>
          <div>
            <el-date-picker
              :valueFormat="valueFormat"
              @change="datePick"
              :disabled="disabled"
              v-model="value1"
              :type="type"
              placeholder="选择日期">
            </el-date-picker>
          </div>
        </div>
      </div>
      <h4>计划信息</h4>
      <div class="eltable">
        <div class="search">
          <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
          <el-button slot="append" icon="el-icon-search"></el-button>
        </div>
        <el-table :height="tableHeight" :data="tableData.filter((data) =>!search || data.materialName.toLowerCase().includes(search.toLowerCase()))" style="width: 100%">
          <el-table-column type="index"> </el-table-column>
          <el-table-column label="物资类别" prop="type"> </el-table-column>
          <el-table-column label="物资名称" prop="materialName"> </el-table-column>
          <el-table-column label="物资编号" prop="code"> </el-table-column>
          <el-table-column label="物资规格" prop="specification"> </el-table-column>
          <el-table-column label="物资单位" prop="unit"> </el-table-column>
          <el-table-column label="设计使用量">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" size="mini" placeholder="输入设计使用量" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import DatePicker from "element-ui/lib/date-picker";
import Input from "element-ui/lib/input";
import { getRegisters, updateOrSavePlanDetail } from "./server/index.js"
import env from "@/config/env";
export default {
  components: {
    ElDatePicker: DatePicker,
    ElInput: Input,
  },
  inject: ["projectConfig"],
  data() {
    return {
      valueFormat: 'yyyy',
      tableHeight: '',
      titleName: '',
      type: 'year',
      dateType: '年',
      search: '',
      value1: '',
      projectCode: '',
      projectName: '',
      activeName: 'first',
      disabled: false,
      tableData: [],
    };
  },
  methods: {
    tolink() {
      if (!this.disabled) {
        //新增
        if(!this.value1) return this.$message.error("请选择日期！")
        const cmd = {
          appCode: this.projectCode,
          date: this.value1,
          dateType: this.dateType,
          plans: this.tableData,
          projectName: this.projectName
        }
        updateOrSavePlanDetail(cmd).then(res => {
          if(res.data == "成功") return this.$router.push({ name: "MaterialPlan" })
          this.$message.error(res.errmsg)
        })
      } else {
        //修改
        const cmd = {
          appCode: this.projectCode,
          date: this.$route.query.date,
          dateType: this.$route.query.dateType,
          plans: this.tableData,
          projectName: this.projectName
        }
        updateOrSavePlanDetail(cmd).then(res => {
          if(res.data == "成功") return this.$router.push({ name: "MaterialPlan" })
          this.$message.error(res.errmsg)
        })
      }
    },
    toprev() {
      this.$router.push({ name: "MaterialPlan" })
    },
    yearType() {
      this.type = "year"
      this.valueFormat = "yyyy"
      this.value1 = ""
      this.dateType = "年"
    },
    monthType() {
      this.type = "month"
      this.valueFormat = "yyyy-MM"
      this.dateType = "月"
      this.value1 = ""
    },
    datePick() {
      this.getinit(this.dateType, this.value1)
    },
    getinit(dateType, date) {
      getRegisters(this.projectCode, this.projectName, dateType, date).then(res => {
        this.tableData = res.data
      })
    }
  },
  mounted() {
    this.projectName = this.projectConfig?.projectName ?? "";
    this.projectCode = `${env.project}`;
    this.titleName = this.$route.query.name
    if (this.$route.query.date) {
      this.disabled = true
      this.tableHeight = "720px"
      this.getinit(this.$route.query.dateType, this.$route.query.date)
    } else {
      this.tableHeight = "630px"
      this.disabled = false
      this.getinit('', '')
    }
  },
};
</script>
<style lang="less" scoped>
.EditPlan {
  height: 100%;
  .title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    img {
      cursor: pointer;
    }
  }
  h4 {
    background: #f0f7ff;
    padding: 9px;
    border: 1px solid #e4e4e4;
  }
  .information {
    .select {
      display: flex;
      padding: 10px;
      p {
        margin-right: 10px;
        line-height: 30px;
      }
    }
  }
  .eltable {
    padding: 20px;
    .search {
      display: flex;
      margin-bottom: 10px;
    }
  }
  .content {
    height: 95%;
    background: #fff;
  }
}
</style>

<style lang="less">
.EditPlan {
  .title {
    .el-button {
      padding: 5px 15px;
      margin-right: 10px;
      height: 30px;
      background: #2761db;
      color: #fff;
    }
  }
  .select {
    .el-button {
      padding: 0px 8px;
      height: 30px;
    }
    .el-button:nth-child(3) {
      margin-right: 30px;
    }
    .el-input {
      width: 100%;
    }
    .el-input__inner {
      height: 30px;
    }
    .el-input__icon {
      line-height: 30px;
    }
  }
  .eltable {
    .el-button {
      padding: 0px 10px;
    }
    .el-table thead {
      background: #f4f5fc !important;
    }
    .el-table th,
    .el-table tr {
      background: transparent;
    }
  }
  .search {
    .el-input {
      width: 17%;
    }
  }
  .el-picker-panel {
    position: absolute;
    z-index: 99;
  }
}
</style>
