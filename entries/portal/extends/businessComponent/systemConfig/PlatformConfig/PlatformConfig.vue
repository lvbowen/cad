<template>
  <div>
    <Collapse expandIconPosition="right" :bordered="false" activeKey="1">
      <template #expandIcon="props">
        <Icon type="caret-right" :rotate="props.isActive ? 90 : 0" />
      </template>
      <CollapsePanel key="1" header="个人工作台" class="custom-style">
        <Button type="primary" @click="add">新增</Button>
        <Table
          bordered
          align="center"
          :columns="columns"
          :dataSource="dataSource"
          :rowKey="(record)=>record.id"
          :pagination="false"
          :customRow="rowClick">
          <template slot="action" slot-scope="text, record">
            <Button type="link" @click.stop="edit(record)">编辑</Button>
            <Button type="link" @click.stop="deletePlan(record)">删除</Button>
          </template>
        </Table>
      </CollapsePanel>
    </Collapse>
    <Modal
      :visible="visible"
      :centered="true"
      :footer="null"
      @cancel="cancel"
      :width="1100"
      :destroyOnClose="true"
      :closable="false"
      :keyboard="false"
      :maskClosable="false">
      <iframe
        ref="iframe"
        :src="src"
        frameborder="0"
        style="height:600px;width:100%"></iframe>
    </Modal>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Vue,Mixins} from 'vue-property-decorator';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import * as Type from "../../../type";
import { getAllPlan , deletePlanById } from "../../../service/api";
import { PlatformConfigPlan } from "../../../type";
@Component({
    name:"PlatformConfig",
    components:{
        Collapse,
        CollapsePanel:Collapse.Panel,
        Icon,
        Button,
        Table,
        Modal
    }
})
export default class PlatformConfig extends Vue{
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode!: string;
  visible:boolean=false;
  src:string="";
  columns=[
    {
      title:"序号",
      align:"center",
      key:"index",
      width:100,
      customRender: (text, record, index)=>index+1,
    },
    {
      title:"方案名称",
      align:"center",
      dataIndex:"planName",
      key:"planName",
      width:""
    },
    {
      title:"勾选板块",
      align:"center",
      dataIndex:"moduleSelect",
      key:"moduleSelect",
      width:""
    },
    {
      title:"关联人员",
      align:"center",
      dataIndex:"relatePerson",
      key:"relatePerson",
      width:""
    },
    {
      title:"操作功能",
      align:"center",
      key:"action",
      width:100,
      scopedSlots: { customRender: 'action' },
    },
  ];
  dataSource:PlatformConfigPlan[]=[];

  async created(){
    window.addEventListener("message", this.receiveMessage, false);
    await this.queryallPlans();
  }
  beforeDestroy(){
    window.removeEventListener("message",this.receiveMessage);
  }
  async receiveMessage(event){
    const origin = event.origin || event.originalEvent.origin;
    if(origin!==top?.origin)return;
    let data=event.data;
    if(data==="close"){
      this.visible=false;
      await this.queryallPlans();
    }
  }

  async queryallPlans(){
    const res = await getAllPlan({appCode:this.projectCode});
    if(res.errcode!==0) return this.$message.error(res.errmsg as string)
    this.dataSource=res.data?res.data:[];
  }
  rowClick(record){
    return {
      on:{
        click:()=>{
          let routeData = this.$router.resolve({
            name: "form-detail",
            query: {
              schemaCode: `${this.projectCode}_work_table_config`,
              sheetCode: "",
              queryCode: `${this.projectCode}_work_table_config`,
              return: `${this.$route.fullPath}&iframeAction=add`,
              code:`${this.projectCode}_work_table_config`,
              iframeAction: 'detail',
              projectName: this.projectConfig?.projectName,
              parentId: "",
              objectId:record.id,
            },
          });
          this.visible=true;
          this.src = routeData.href;
        }
      }
    }
  }

  add(){
    let routeData = this.$router.resolve({
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_work_table_config`,
        sheetCode: "",
        queryCode: `${this.projectCode}_work_table_config`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        code:`${this.projectCode}_work_table_config`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        parentId: "",
      },
    });
    this.visible=true;
    this.src=routeData.href;
  }

  edit(record){
    let routeData = this.$router.resolve({
      name: "form-detail",
      query: {
        schemaCode: `${this.projectCode}_work_table_config`,
        sheetCode: "",
        queryCode: `${this.projectCode}_work_table_config`,
        return: `${this.$route.fullPath}&iframeAction=add`,
        code:`${this.projectCode}_work_table_config`,
        iframeAction: 'add',
        projectName: this.projectConfig?.projectName,
        parentId: "",
        objectId:record.id,
      },
    });
    this.visible=true;
    this.src=routeData.href;
  }
  deletePlan(record){
    this.$confirm({
      title:"确认删除吗？",
      onOk:async()=>{
        const res = await deletePlanById({appCode:this.projectCode,id:record.id})
        if(res.errcode===0){
          await this.queryallPlans();
        }else{
          this.$message.error(res.errmsg as string)
        }
      }
    });
  }
  cancel(){
    this.visible=false;
  }
}
</script>
<style lang="less" scoped>
@import '../../../styles/public.module.less';
@import '../system.module.less';
/deep/ .ant-table .ant-btn{
  padding: 0 1px;
}
/deep/.ant-modal-header{
  display: none;
}
</style>
