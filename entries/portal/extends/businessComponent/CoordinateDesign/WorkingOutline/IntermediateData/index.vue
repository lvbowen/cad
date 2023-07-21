<template>
  <div class="warp">
    <a-collapse v-model="activeKey" expandIconPosition="right" :bordered="false">
      <a-collapse-panel key="1">
        <template #header>
          <div class="flex" style="width: 100%">
            <div class="header-title">中间资料</div>
          </div>
        </template>
        <a-table
          rowKey="id"
          size="small"
          :bordered="true"
          :pagination="false"
          :columns="columns"
          :dataSource="data"
          :customHeaderRow="customHeaderRow"
          :expandedRowKeys="expandedRowKeys"
          @expand="expand"
          :expandIcon="customExpandIcon"
          :customRow="rowClick"
          :scroll="{ y: 440,}">
          <template #professionTaskName="text">
            <span style="color: red">{{ text }}</span>
          </template>
          <template #propose="text">
            <a>{{ text }}</a>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Prop, Vue} from "vue-property-decorator";
import Collapse from "ant-design-vue/lib/collapse";
import "ant-design-vue/lib/collapse/style";
import Table from "ant-design-vue/lib/table";
import "ant-design-vue/lib/table/style";
import Icon from "ant-design-vue/lib/icon";
import "ant-design-vue/lib/icon/style";
import Button from "ant-design-vue/lib/button";
import "ant-design-vue/lib/button/style";
import {intermediateDataList} from "../../../../service/api";

type tableItem = {
  id: string;
  propose: string;
  children?: tableItem[];
};

@Component({
  name: "index",
  components: {
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    ATable: Table,
    AIcon: Icon,
    AButton: Button,
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  projectId:any='';

  activeKey: Array<string> = ["1",];
  columns: Array<any> = [
    { title: "提出专业",
      dataIndex: "professionName",
      width: "14%",
      scopedSlots: { customRender: "professionName" },},
    { title: "接受专业", dataIndex: "signSubject", align: "center",width:"14%"},
    {
      title: "设计任务名称",
      dataIndex: "professionTaskName",
      align: "center",
      width: 180,
      scopedSlots: { customRender: "professionTaskName" },
    },
    // { title: "成果编号", dataIndex: "achievementNumber", align: "center",width: 180},
    { title: "当前状态", dataIndex: "currentStatus", align: "center",width:100},
    { title: "当前评审人", dataIndex: "currentAuditorName", align: "center",width: 110},
    { title: "审核人", dataIndex: "auditorName", align: "center",width: 90},
    { title: "计划开始日期", dataIndex: "planStartTime", align: "center",width: 120},
    { title: "计划结束日期", dataIndex: "planEndTime", align: "center",width: 120},
    { title: "计划工期(天)", dataIndex: "planDuration", align: "center",width: 100},
  ];
  data: Array<any> = [];
  expandedRowKeys: string[] = [];
  tableRowKey = 1;

  rowClick(record:any){
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

  expand(expanded:true,record:{id:string}){
    if(expanded){
      this.expandedRowKeys.push(record.id);
    }else{
      this.expandedRowKeys=this.expandedRowKeys.filter(item=>item!==record.id);
    }
  }
  customHeaderRow(column){
    const cellStyle= "color: #333;background:#ffff;font-weight:400;text-align:center"
    return{
      style: cellStyle
    }
  };
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
  async intermediateDataList(){
    try {
      const {errcode,errmsg,data}=await intermediateDataList({appCode:this.projectCode??"",projectId: this.projectId})
      if(errcode!==0) return this.$message.error(errmsg as string)
      // const tableData: tableItem[] = [];
      // for (const key in data) {
      //   const proposeNames = key.split("@");
      //   tableData.push({
      //     id: this.tableRowKey++ + "",
      //     propose: proposeNames[0],
      //     children: [],
      //   });
      //   for (let i=0;i<tableData.length;i++){
      //     if(tableData[i].propose===key){
      //       tableData[i].children=data[key]
      //     }
      //   }
      // }
      this.data = data;
      this.expandedRowKeys = this.expandedAllRow(this.data);
    }catch (error){
      error;
    }
  }
  created() {
    this.projectId=this.$route.query.projectId;
    this.intermediateDataList();
  }
}
</script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
@import "../index/index.less";
.warp{
  background-color: #fff;
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
/deep/.ant-table-row-level-0{
  background-color: rgb(204,228,255);
}
/deep/.ant-table-placeholder{
  height: 618px;
}
</style>
