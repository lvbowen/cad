<template>
  <div class="center-files">
    <div class="collapseHeader">
      <div class="collapseHeaderTitle left">中心文件</div>
    </div>
    <div class="flex flex-end">
      <a-button
        v-if="editFlag"
        :loading="updateLoading"
        type="primary"
        size="small"
        @click="updateCenterFiles">{{
          files.length&&files[0].path ? "更新" : "新增"
        }}</a-button>
    </div>
    <div class="table-content-scroll flex-auto line-table-header">
      <a-table
        rowKey="id"
        :data-source="files"
        :columns="filesColumns"
        :loading="filesLoading"
        :scroll="{ y: 300 }"
        :pagination="false"
      >
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue, InjectReactive, Prop} from "vue-property-decorator";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style/index.css";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style/index.css";
import { TableColumn } from "../../../../type";
import { getCenterFiles,updateCenterFiles } from "../../../../service/CoordinateDesign/base";

@Component({
  name: "BimContentConfig",
  components: {
    ATable: Table,
    AButton: Button,
  },
})
export default class CenterFiles extends Vue {
  @InjectReactive('project') projectCode!:string
  @Prop({required:true}) projectId!:string;
  files: any[] = [];
  filesColumns: TableColumn<any>[] = [
    { title: "共享路径", dataIndex: "path" },
    { title: "修改时间 ", dataIndex: "time" },
    { title: "操作人", dataIndex: "operator" },
  ];
  filesLoading: boolean = false;
  updateLoading: boolean = false;
  editFlag: boolean = false;
  updateCenterFiles() {
    this.files = [];
    this.updateLoading = true;
    this.filesLoading = true;
    updateCenterFiles({
      appCode: this.projectCode??'',
      taskId: this.projectId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.editFlag = res.data.editFlag;
      this.files.push({
        path: res.data.path,
        time: res.data.time,
        operator: res.data.operator
      })
    }).finally(()=> {
      this.updateLoading = false;
      this.filesLoading = false;
    })
  }
  getCenterFiles() {
    this.files = [];
    this.filesLoading = true;
    getCenterFiles({
      appCode: this.projectCode??'',
      taskId: this.projectId
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.editFlag = res.data.editFlag;
      this.files.push({
        path: res.data.path,
        time: res.data.time,
        operator: res.data.operator
      })
    }).finally(()=> {
      this.filesLoading = false;
    })
  }

  mounted() {
    this.getCenterFiles();
  }
}
</script>

<style scoped lang="less">
@import "../../../../styles/public.module.less";
@import "../ProductionTaskList/components/DataForm/index.less";
.center-files {
  .ant-btn {
    margin: @spacing-base;
  }
}
</style>
