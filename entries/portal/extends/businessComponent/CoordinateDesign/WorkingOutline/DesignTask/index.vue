<template>
  <div class="wrap">
    <a-collapse v-model="activeKey" expandIconPosition="right" :bordered="false">
      <a-collapse-panel key="1">
        <template #header>
          <div class="flex" style="width: 100%">
            <div class="header-title">设计任务单</div>
          </div>
        </template>
        <!--        <div class="flex" style="padding: 10px 0">-->
        <!--          <div>-->
        <!--            <a-button-->
        <!--              :disabled="!designTaskPermissions.create"-->
        <!--              @click="professionalDesignTaskAdd"-->
        <!--              type="primary"-->
        <!--              style="width: 60px">新增</a-button>-->
        <!--            <a-button style="width: 60px; margin: 0 10px">导入</a-button>-->
        <!--          </div>-->
        <!--          <div class="before-fgx">-->
        <!--            <a-button style="width: 60px">分派</a-button>-->
        <!--            <a-button-->
        <!--              style="width: 80px; margin: 0 10px"-->
        <!--            >批量下达</a-button-->
        <!--            >-->
        <!--            <a-button style="width: 80px">修改任务</a-button>-->
        <!--          </div>-->
        <!--        </div>-->
        <a-table
          style="margin-top: 10px"
          rowKey="id"
          size="small"
          :columns="ProfessionalTaskColumns"
          :dataSource="ProfessionalTaskList"
          :pagination="pagination"
          :rowClassName="rowClassName"
          :customRow="customRow"
          :expandedRowKeys="expandedRowKeys"
          @expand="expand"
          :expandIcon="customExpandIcon"
          :customHeaderRow="customHeaderRow"
          bordered>
          <template #taskName="text">
            <span :title="text" style="width:100%;text-overflow:ellipsis;overflow: hidden;white-space:nowrap">{{ text }}</span>
          </template>
          <template #state="text">
            <span style="color: #64b7ee" v-if="text=='生成中'||text=='待接收 '">{{ text }}</span>
            <span style="color: #49db52" v-else-if="text=='已归档'">{{ text }}</span>
            <span style="color: #cdcb2e" v-else>{{ text }}</span>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
    <a-modal
      :afterClose="afterClose"
      :okText="okText"
      :destroyOnClose="true"
      :confirmLoading="confirmLoading"
      v-model="visible"
      @ok="modalOK"
      centered
    >
      <a-form-model
        v-if="selectRecord&&selectRecord.actionIndex!==1"
        ref="modalForm"
        :model="modalForm"
        :rules="modalRules">
        <a-form-model-item required prop="comment">
          <a-textarea
            placeholder="意见/建议"
            v-model.trim="modalForm.comment"
            allowClear
            :autoSize="{ minRows: 4, maxRows: 6 }"
          />
        </a-form-model-item>
      </a-form-model>
      <template #title>
        <a-icon style="padding-right: 5px" type="question-circle" theme="twoTone"/>
        <span>{{ modalTitle }}</span>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, InjectReactive, Ref,Prop } from "vue-property-decorator";
import {Input,Button,Icon,Table,FormModel,Collapse,Checkbox,Modal,Tabs} from "@h3/antd-vue"
import {professionTaskList,ProfessionTask,professionOutlineList,submitProfessionTask,rejectProfessionTask,getProfessionTaskById,designTaskList,
  designTaskPermission,getDesignTaskList} from "../../../../service/CoordinateDesign/WorkingOutline/ProfessionalTask";
import moment from "moment";
import {Utils as CoreUtils, Utils} from '@ctesi/core';
type tableItem = {
  id: string;
  projectName: string;
  children?: tableItem[];
};
@Component({
  name: "professionalTask",
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATable: Table,
    ACheckbox: Checkbox,
    AButton: Button,
    AIcon: Icon,
    [Tabs.name]: Tabs,
    [Tabs.TabPane.name]: Tabs.TabPane,
    [Input.TextArea.name]: Input.TextArea,
    [Modal.name]: Modal,
    [FormModel.name]: FormModel,
    [FormModel.Item.name]: FormModel.Item,
  },
})
export default class ProfessionalTask extends Vue {
  @InjectReactive("project") appCode!: string;
  @Ref("modalForm") form!: FormModel;
  @Prop({required:true}) projectId!:string;
  activeKey: Array<string> = ["1", "2"];
  current: Array<string> = ["1", "2"];
  activeMen = 0;

  tableRowKey = 1;
  esignTaskTableRowKey=1;
  tabsActiveKey = "tab0";

  visible = false;
  selectRecord: (ProfessionTask & { actionIndex?: number }) | null = null;
  selectId:string="";
  modalTitle = "";
  modalForm = { comment: "" };
  modalRules = {
    comment: [
      {
        required: true,
        message: "请输入意见/建议",
        trigger: ["change", "blur"],
      },
    ],
  };
  okText = "";
  confirmLoading = false;

  ProfessionalTaskColumns: {
    title: string;
    key?: string;
    dataIndex: string;
    align?: "left" | "right" | "center";
    scopedSlots?: { customRender: string };
    customRender?: (text: string, record, index: number) => string;
    width?: string | number;
    customHeaderCell?: (column) => object;
  }[] = [
    { title: "任务类型", dataIndex: "taskType", width: "10%" },
    { title: "任务名称", dataIndex: "taskName", width: "20%",scopedSlots: { customRender: "taskName"}},
    { title: "任务编号", dataIndex: "sequenceNo", align: "center",width: "12%" },
    // { title: "成果编号", dataIndex: "resultNo", align: "center",width: "14%" },
    { title: "当前状态", dataIndex: "state", align: "center" ,scopedSlots: { customRender: "state"}},
    { title: "当前评审人", dataIndex: "auditor", align: "center" },
    { title: "审核人", dataIndex: "checkor", align: "center" },
    { title: "计划开始日期", dataIndex: "startTime", align: "center",customRender:(text,record)=>this.parseDataFormat(text,record)},
    { title: "计划结束日期", dataIndex: "endTime", align: "center" ,customRender:(text,record)=>this.parseDataFormat(text,record)},
    { title: "计划工期(天)", dataIndex: "days", align: "center" },
  ];

  ProfessionalTaskList:any = [];

  pagination = {
    hideOnSinglePage: true,
    current: 1,
    pageSize: 5,
    total: 0,
    onChange:(page: number) => this.paginationChange(page)
  };

  data: Array<any> = [];
  expandedRowKeys: string[] = [];

  designTaskData: any[] = [];

  designTaskExpandedRowKeys: string[] = [];
  /* 专业设计提纲按钮权限 */
  designOutlinePermissions={
    create:false
  }
  /* 设计任务单按钮权限 */
  designTaskPermissions={
    create:false,
  }


  menuClick(val) {
    this.activeMen = val;
    this.tabsActiveKey = `tab${val}`;
  }

  created() {
    // this.getProfessionTaskList();
    this.getProfessionOutlineList();
    this.getDesignTaskList();
  }

  // async getProfessionTaskList() {
  //   const {appCode,projectId,pagination: { pageSize, current: pageNum },} = this;
  //   try {
  //     const { errcode, errmsg, data } = await professionTaskList({appCode,pageNum,pageSize,projectId});
  //     if (errcode) {
  //       this.$message.error(`获取专业任务列表失败,${errmsg}`);
  //       return;
  //     }
  //     this.ProfessionalTaskList =
  //       data?.records.map((record) => {
  //         return { ...record };
  //       }) ?? [];
  //     this.pagination.total = data?.total ?? 0;
  //   } catch (error) {
  //     this.$message.error(`获取专业任务列表异常,${error}`);
  //   }
  // }

  async getProfessionOutlineList() {
    const { appCode,selectId:zyrwdId } = this;
    try {
      const { errcode, errmsg, data } = await professionOutlineList({appCode,zyrwdId});
      if (errcode) {
        return this.$message.error(`获取专业设计提纲列表失败,${errmsg}`);
      }
      let count = 0;
      const tableData: tableItem[] = [];
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const projectNames = key.split("@");
          tableData.push({
            id: this.tableRowKey++ + "",
            projectName: projectNames[0],
            children: [],
          });
          for (let index = 1; index < projectNames.length; index++) {
            const record: tableItem = {
              id: this.tableRowKey++ + "",
              projectName: projectNames[index],
              children: [],
            };
            if (index === projectNames.length - 1) {
              record.children = data[key].map((item) => {
                return { ...item, projectName: item.engineeringName };
              });
            }
            const children = this.findLastChildren(tableData[count]);
            children.push(record);
          }
        }
        count++;
      }
      this.data = tableData;
    } catch (error) {
      this.$message.error(`获取专业设计提纲列表异常,${error}`);
    }
  }

  findLastChildren(data: tableItem): tableItem[] {
    if (data.children && data.children.length <= 0) {
      return data.children;
    } else if (data.children) {
      return this.findLastChildren(data.children[0]);
    } else {
      return [];
    }
  }


  /* 获取设计任务单 */
  async getDesignTaskList(){
    const { appCode,selectId:zyrwdId } = this;
    console.log(this.selectId,'zyrwdId')
    try {
      const { errcode, errmsg, data } = await getDesignTaskList({appCode:this.appCode,projectId:this.projectId,self:true});
      if (errcode) {
        return this.$message.error(`获取设计任务单列表失败,${errmsg}`);
      }else {
        this.ProfessionalTaskList=data
        this.expandedRowKeys = this.expandedAllRow(this.ProfessionalTaskList);
        console.log(this.expandedRowKeys,'this.expandedRowKeys')
      }
    } catch (error) {
      this.$message.error(`获取设计任务单列表异常,${error}`);
    }
  }

  /* 获取设计任务单权限 */
  async getDesignTaskPermission(){
    this.designTaskPermissions.create=false;
    this.designOutlinePermissions.create=false;
    const { appCode,selectId:zyrwdId } = this;
    try {
      const { errcode, errmsg, data } = await designTaskPermission({appCode,zyrwdId});
      if (errcode) {
        return this.$message.error(`获取设计任务单权限失败,${errmsg}`);
      }
      this.designTaskPermissions.create=data??false;
      this.designOutlinePermissions.create=data??false;
    } catch (error) {
      this.$message.error(`获取设计任务单权限异常,${error}`);
    }
  }

  customExpandIcon(props: any) {
    let { expanded, onExpand, record, expandable } = props;
    const h = this.$createElement;
    if (expandable) {
      return h("span", {}, [
        h("a-icon", {
          staticStyle: {
            paddingRight: "10px",
            fontSize: "20px",
            verticalAlign: "middle",
          },
          attrs: {
            type: expanded ? "caret-down" : "caret-right",
          },
          on: {
            click: (event: Event) => {
              onExpand(record, event);
            },
          },
        }),
      ]);
    } else {
      return h("span", {
        staticStyle: {
          paddingRight: "10px",
        },
      });
    }
  }

  customHeaderRow(column){
    const cellStyle= "color: #333;background:#ffff;font-weight:400;text-align:center"
    return{
      style: cellStyle
    }
  };
  mounted() {
  }

  actionClick(record: ProfessionTask, index: number) {
    this.selectRecord = record;
    this.selectRecord.actionIndex = index;
    let actionString="";
    if(index === 0){
      actionString="提交";
    }else if(index === 1){
      actionString="接收";
    }else{
      actionString="驳回";
    }
    this.modalTitle = `确认${actionString}此任务`;
    this.okText = actionString;
    this.visible = true;
  }

  async modalOK() {
    const { appCode } = this;
    const { id,workflowInstanceId,xmlbId:projectId } = this.selectRecord as ProfessionTask;
    this.confirmLoading = true;
    try {
      let validde = true;
      let comment="接收任务";
      if(this.form){
        this.form.validate(valid=>{
          validde=valid;
        });
        comment = this.modalForm.comment;
      }
      if(!validde)return;
      if (this.selectRecord?.actionIndex === 0 || this.selectRecord?.actionIndex===1) {
        //提交 and 接收
        const { errcode, errmsg, data } = await submitProfessionTask({
          appCode,
          workflowInstanceId,
          id,
          comment,
          agree: "true",
          projectId
        });
        if (errcode) {
          this.$message.error(`异常,${errmsg}`);
          return;
        }
      } else {
        //驳回
        const { errcode, errmsg, data } = await rejectProfessionTask({
          appCode,
          workflowInstanceId,
          id,
          comment,
        });
        if (errcode) {
          this.$message.error(`${this.okText}异常,${errmsg}`);
          return;
        }
      }
      await this.getProfessionTaskById((this.selectRecord as ProfessionTask).id);
      this.visible = false;
    } catch (error) {
      this.$message.error(`${this.okText}异常,${error}`);
    } finally {
      this.confirmLoading = false;
    }
  }

  async getProfessionTaskById(id:string){
    const {appCode}=this;
    try {
      const {errcode,errmsg,data} = await getProfessionTaskById({appCode,id});
      if(errcode){
        this.$message.error(`更新专业任务失败,${errmsg}`);
        return;
      }
      const index= this.ProfessionalTaskList.findIndex(item=>item.id===id);
      index>-1&&(this.$set(this.ProfessionalTaskList,index,data));
    } catch (error) {
      this.$message.error(`更新专业任务失败,${error}`);
    }
  }

  afterClose() {
    this.modalForm.comment = "";
    this.selectRecord = null;
  }

  professionalDesignOutlineAdd(){
    this.$router.push({
      name:"ProfessionalDesignOutline",
      query:{
        projectId:this.projectId,
        id:this.selectId,
        isCreate:"true",
      }
    })
  }

  professionalDesignTaskAdd(){
    this.$router.push({
      name:"ProfessionalDesignTask",
      query:{
        projectId:this.projectId,
        id:this.selectId,//此处其实是传的专业任务单ID
        isCreate:"true",
      }
    })
  }

  customRow(record:{children?:[],id:string}){
    return{
      on:{
        click:()=>{
          if(record.children) return;
          this.$router.push({
            name:"ProfessionalDesignTask",
            params:{
              isBack:'true',
            },
            query:{
              projectId:this.projectId,
              id:record.id,
            }
          })
        }
      }
    }
  }

  expandedAllRow(data: tableItem[]): string[] {
    let keys: string[] = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      keys.push(element.id);
      if (element.children) {
        keys.push(...this.expandedAllRow(element.children));
      }
    }
    return keys;
  }

  expand(expanded:true,record:{id:string}){
    if(expanded){
      this.expandedRowKeys.push(record.id);
    }else{
      this.expandedRowKeys=this.expandedRowKeys.filter(item=>item!==record.id);
    }
  }

  rowClassName(record:ProfessionTask,index:number){
    if(record.id===this.selectId){
      return "ant-table-row-selected tableBackColor"
    }
    else{
      return ""
    }
  }
  /* 点击专业提纲行 */
  customRowDesignOutline(record:{children?:[],id:string}){
    return{
      on:{
        click:()=>{
          if(record.children) return;
          this.$router.push({
            name:"ProfessionalDesignOutline",
            query:{
              projectId:this.projectId,
              id:record.id,
            }
          })
        }
      }
    }
  }
  /* 设计任务单行 */
  customRowDesignTask(record:{children?:[],id:string}){
    return{
      on:{
        click:()=>{
          if(record.children) return;
          this.$router.push({
            name:"ProfessionalDesignTask",
            query:{
              projectId:this.projectId,
              id:record.id,
            }
          })
        }
      }
    }
  }

  /* 点击分页事件 */
  paginationChange(page: number){
    this.pagination.current = page;
    //获取分页数据
    // this.getProfessionTaskList();
    this.selectId="";
    this.designTaskPermissions.create=false;
    //清除数据
    this.data=[];
    this.designTaskData=[];
    //更新Tabs Table数据
    this.getProfessionOutlineList();
    this.getDesignTaskList();
  }

  parseDataFormat(text:string,record:{childred?:[]}){
    if(text){
      return moment(text).format("YYYY-MM-DD");
    }
    return "";
  }
}
</script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
@import "../index/index.less";
.wrap {
  background-color: #fff;
  padding: 10px;
  .header-title {
    height: 24px;
    width: 100%;
    padding: 3px 0 0 22px ;
    background:url("../../../../../src/assets/extends/CoordinateDesign/ProductionTaskList/title.png") no-repeat;
    background-size: 100% 100%;
    color: #FFFFFF;
    font-size: 14px;
  }
  .header-menu {
    .menu-item {
      font-weight: bold;
      font-size: 14px;
      padding: 0 20px;
      position: relative;
    }
    .activeMenColor {
      .bottom-border {
        width: 100%;
        padding: 0 20px;
        height: 3px;
        background-color: #2970ff;
        position: absolute;
        left: 0;
        bottom: -12px;
        transition: all 1.5s;
      }
    }
  }
  .before-fgx {
    position: relative;
    padding-left: 12px;
    &::before {
      content: "";
      display: block;
      width: 1px;
      height: 30px;
      background-color: #e7e7e7;
      position: absolute;
      left: 0;
      bottom: 0;
    }
  }
}
</style>
<style lang="less" scoped>
/deep/li[class~="ant-menu-item-selected"] {
  background-color: transparent !important;
}
/deep/.ant-table-small
> .ant-table-content
> .ant-table-body
> table
> .ant-table-thead
> tr
> th {
  // padding:11px 8px;
  // background-color: #ccffff;
  font-size: 13px;
}
/deep/.ant-table-small
> .ant-table-content
> .ant-table-body
> table
> .ant-table-tbody
> tr
> td {
  // background-color: #fff;
  // padding:11px 8px;
  font-size: 13px;
}
/deep/.customHeaderCell {
  background-color: #bfbfff !important;
}
.action {
  padding-left: 0px;
}
/deep/.ant-btn{
  padding-left: 0;
  padding: 0 5px;
}
/deep/.tableBackColor{
  background-color: #2970ff;
}

/deep/.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header{

}

/deep/.ant-collapse-item{
  border: 1px solid #F3F3F3;
  margin-bottom: 10px;
}
/deep/.ant-table-tbody > tr:hover.ant-table-row-selected > td,
/deep/.ant-table-tbody > tr.ant-table-row-selected td{
  background: #2970ff;;
  color: #fff;
}
.colorWhite{
  color: #fff;
}
.colorRed{
  color: red;
}
/deep/.ant-table-row-level-0{
  background-color: rgb(204,228,255);
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
/deep/.ant-table-placeholder{
  min-height: 570px;
}
</style>
