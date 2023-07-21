<template>
  <div class="warp">
    <a-collapse v-model="activeKey" expandIconPosition="right" :bordered="false">
      <a-collapse-panel key="1">
        <template #header>
          <div class="flex" style="width: 100%">
            <div class="header-title">项目成员</div>
          </div>
        </template>
        <div style="margin-bottom: 15px">
          <staff-selector
            v-if="flag"
            :options="personOptions"
            :disabled="this.selectedRowKeys.length>0?false:true"
            @change="addClick"/>
<!--          <a-button style="width: 110px;margin: 0 10px" @click="applicationClick">任职资格申请</a-button>-->
        </div>
        <a-table
          bordered
          size="small"
          rowKey="id"
          :customHeaderRow="customHeaderRow"
          :rowClassName="setRowClassName"
          :columns="columns"
          :data-source="dataSource"
          :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, columnTitle:' ' }"
          :pagination="false">
          <template #projectManagerFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #chiefFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #designFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #checkFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #auditFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #reviewFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
          <template #approvalFlag="text, record"><span v-if="text===true" style="color:red">√</span></template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
    <application-list v-show="false" class="divide"/>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {Collapse, Table,Button} from "@h3/antd-vue";

import ApplicationList from "@cloudpivot/list/src/components/pc/application-list.vue";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

import {getAuthOfChangeMember,getProjectMemberList,changeMember} from "../../../../service/api"


@Component({
  name: "index",
  components: {
    ACollapse:Collapse,
    ACollapsePanel: Collapse.Panel,
    ATable:Table,
    ATableColumn:Table.Column,
    AButton:Button,
    ApplicationList,
    staffSelector
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  projectId:any='';

  flag:boolean=false;
  activeKey: Array<string> = ["1",];

  columns:Array<any> = [
    {
      title: '序号',
      dataIndex: 'key',
      align: 'center',
      // eslint-disable-next-line no-shadow
      customRender: (text, record, index) => `${index + 1}`,
      width:70,
    },
    {
      title: '所属部门',
      dataIndex: 'departName',
      align: 'center',
      width:150,
    },
    {
      title: '人员姓名',
      dataIndex: 'userName',
      align: 'center',
      width:120,
    },
    {
      title: '从事专业',
      dataIndex: 'major',
      align: 'center',
      width:100,
    },
    {
      title: '所属岗位',
      dataIndex: 'job',
      align: 'center',
      // width:120,
    },
    {
      title: '技术资格',
      dataIndex: 'qualification',
      align: 'center',
      width:100,
    },
    {
      title: '项目经理',
      dataIndex: 'projectManagerFlag',
      align: 'center',
      width:100,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"projectManagerFlag"}
    },
    {
      title: '专业负责人',
      dataIndex: 'chiefFlag',
      align: 'center',
      width:100,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"chiefFlag"}
    },
    {
      title: '设计',
      dataIndex: 'designFlag',
      align: 'center',
      width:80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"designFlag"}
    },
    {
      title: '校核',
      dataIndex: 'checkFlag',
      align: 'center',
      width:80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"checkFlag"}
    },
    {
      title: '审核',
      dataIndex: 'auditFlag',
      align: 'center',
      width:80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"auditFlag"}
    },
    {
      title: '复审',
      dataIndex: 'reviewFlag',
      align: 'center',
      width:80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"reviewFlag"}
    },
    {
      title: '审定',
      dataIndex: 'approvalFlag',
      align: 'center',
      width:80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      scopedSlots:{customRender:"approvalFlag"}
    },
  ];
  dataSource:Array<any>=[];
  selectedRowKeys:Array<any> = [];
  selectedRows:any = {};

  personOptions: any = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: false,//判断是否为单选
    showSelect: true,
    placeholder: '新增变更',
    title: '选择联系人',
    nonExistentAppCode: true
  };

  addClick(val){
    const item=val[0];
    console.log(item.id,'addClick',this.selectedRows.memberId)
    changeMember({
      appCode:this.projectCode??"",
      projectId:this.projectId,
      originMemberId:this.selectedRows.memberId,
      newMemberId:item.id
    })
      .then(res=>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        this.getProjectMemberList();
        if(res.errcode===0) return this.$message.success('变更成功')
      })
  }
  applicationClick(){
    console.log('applicationClick')
  }

  onSelectChange(selectedRowKeys,selectedRows) {
    this.selectedRowKeys=selectedRowKeys.length>0?[selectedRowKeys.reverse()[0]]:selectedRowKeys;
    this.selectedRows =selectedRows.length>0?selectedRows.reverse()[0]:{};
  }

  customHeaderRow(column){
    const cellStyle= "color: #333;background:#ecf2fd;font-weight:400;text-align:center"
    return{
      style: cellStyle
    }
  };
  setRowClassName(record, index){
    if(record.isChange===1) return 'evenRowStyle'
  }
  getProjectMemberList(){
    getProjectMemberList({appCode:this.projectCode??"",projectId:this.projectId}).then(res=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.dataSource=res.data;
    })
  }
  init(){
    this.projectId=this.$route.query.projectId;
    getAuthOfChangeMember({appCode:this.projectCode??"",projectId:this.projectId}).then(res=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.flag=res.data;
    })
    this.getProjectMemberList();
  }
  created() {
    this.init();
  }
}
</script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
@import "../index/index.less";

.warp{
  padding: 10px;
  .header-title {
    height: 24px;
    width: 100%;
    padding: 3px 0 0 22px ;
    background:url("../../../../../src/assets/extends/CoordinateDesign/ProductionTaskList/title.png") no-repeat;
    background-size: 100% 100%;
    color: #FFFFFF;
    font-weight: bold;
    font-size: 14px;
  }
}
/deep/.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header{
  background-color: #F3F3F3;
}

/deep/.ant-collapse-item{
  border: 1px solid #F3F3F3;
  margin-bottom: 10px;
}
/deep/.h3-organization{
  background: #2970ff;
  width: 4.167vw;
  border-radius: 5px;
  cursor: pointer;
}
/deep/.h3-organization__label{
  span{
    color:#fff
  }
}
/deep/h3-organization__label.show-select {
   border: none;
}
/deep/.h3-organization__label.show-select {
  border:none;
}
.h3-organization__label,
/deep/.disabled{
  cursor: not-allowed;
  span{
    color:rgba(0, 0, 0, 0.25)
  }
}
/deep/.evenRowStyle {
  background-color: rgba(53, 130, 243, 0.1) !important;
}
/deep/.ant-collapse-item {
  &:not(:last-child){
    margin-bottom: 10px;
  }
  .ant-collapse-header {
    padding: unset!important;;
  }

  .ant-collapse-content-box {
    margin-top: 3px;
    background-color: #fff;
    padding: 16px !important;
    border-radius: 0px 0px 4px 4px;
    border: 1px solid #E2EAFF;
    box-shadow: 0px 4px 8px 0px rgba(125,173,239,0.1);
    &:hover{
      border: 1px solid #7DADEF;
      box-shadow: 0px 4px 8px 0px rgba(125,173,239,0.3);
      border-radius: 0px 0px 4px 4px;
    }

    .ant-form-item:last-child {
      margin-bottom: unset;
    }

    .subItem:last-child {
      margin-bottom: unset;
    }
  }
}
/deep/ .ant-table-wrapper{
  min-height: 644px;
}
/deep/.ant-table-small.ant-table-bordered .ant-table-placeholder{
  min-height: 64vh;
}
</style>
