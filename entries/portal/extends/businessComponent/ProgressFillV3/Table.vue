<template>
  <div>
    <el-table
      :data="gridData"
      height="600"
      border
      style="width: 100%">
      <el-table-column prop="mbs" label="编码" width="180"> </el-table-column>
      <el-table-column prop="mbsName" label="构件名称" width="180">
      </el-table-column>
      <el-table-column prop="ratio" label="构件完成比例"> </el-table-column>
      <el-table-column prop="reportDate" label="填报记录"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as Api from '../../service/api';
export default {
  data() {
    return {
      gridData: "",
    };
  },
  mounted() {
      Api.getRecordWithId({
      id: val.id,
      projectCode: this.projectCode
    }).then(res => {
      this.options = res.data.reverse()
      getReportMBSInfo(this.projectCode, this.projectConfig.projectName, this.options[0].id).then(ress => {
        this.gridData = ress.data
      })
    })
  },
};
</script>

<style>
</style>
