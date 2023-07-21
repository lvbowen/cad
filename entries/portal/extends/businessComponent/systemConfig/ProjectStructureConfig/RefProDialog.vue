<template>
  <a-modal
    :visible="showModal"
    title="关联项目"
    @ok="onModalOk"
    :destroyOnClose="true"
    class="ref-pro-dialog"
    @cancel="onModalCancel">
    <div><span>请勾选需要关联的项目名称。</span><a href="#" @click="toForm()">新建项目</a></div>
    <a-table
      :data-source="refProList"
      :columns="refProListColumns"
      :rowSelection="rowSelection"
      :pagination="false"></a-table>
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component, Prop, InjectReactive} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import {RefProList} from "../type";
import { TableColumn} from "../../../type";
import {addRefProject,getRefProject} from "../../../service/api";
import Websocket from "../websocket_base";
import * as Type from "../../../type";

@Component({
  name: 'RefProDialog',
  components: {
    AModal: Modal,
    ATable: Table
  }
})
export default class RefProDialog extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @Prop() showModal!:string;
  @Prop() currentRowId!: string;
  selectedRefProIds: string[] = [];
  refProList: RefProList[] = [];
  refProListColumns:TableColumn<any>[] = [
    {
      title: '项目名称',
      dataIndex: 'xmmc',
      key: 'xmmc',
      width: '60%',
      ellipsis: true
    },
    {
      title: '项目简称',
      dataIndex: 'xmjc',
      key: 'xmjc',
      width: '40%'
    }
  ];
  rowSelection: any = {
    onChange: (selectedRowKeys,selectedRows)=> {
      this.record(selectedRows);
    }
  };
  socket: any = null;
  record(selectedRows) {
    this.selectedRefProIds = selectedRows.map((i)=> { return i.id});
  }
  onModalOk() {
    if(!this.selectedRefProIds.length) { return this.$message.warning('至少选择一个项目！')}
    addRefProject({
      appCode: this.projectCode,
      parentId: this.currentRowId??'',
      projectIds: this.selectedRefProIds
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      this.$message.success('关联成功！');
      //更新项目树
      this.$emit('upDateTreeTable')
    })
  }
  onModalCancel() {
    // this.showModal = false;
    this.$emit('closeRefProDialog')
  }
  mounted() {
    this.socket = new Websocket();
    this.socket.initWebsocket(this.projectCode??'','project',this.getRefProject)
  }
  getRefProject() {
    getRefProject({appCode:this.projectCode??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      this.refProList = res.data;
    })
  }
  toForm() {
    let routeData = this.$router.resolve({
      // 业务表单
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_gcjsxx_1`,
        sheetCode: `${this.projectCode}_gcjsxx_1`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
      },
    });
    this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
  }
  destroyed () {
    this.socket.close();
  }
}
</script>

<style scoped lang="less">
.ref-pro-dialog {
  /deep/ .ant-modal-body {
    max-height: 400px;
    overflow: auto;
  }
}
</style>
