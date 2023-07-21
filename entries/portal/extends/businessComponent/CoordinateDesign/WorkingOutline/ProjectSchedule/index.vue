<template>
  <div class="wrap-schedule flex-column full-height">
    <div class="flex-space-between">
      <div v-for="(item,index) in totalData" :key="index">
        <div class="num-item flex-space-between">
          <div class="item-left">
            <p>{{ item.num }}</p>
            <p>{{ item.title }}</p>
          </div>
          <img v-if="index===0" src="../../../../../src/assets/extends/coordinate/p4_icon1.png" alt="">
          <img v-else-if="index===1||index===3" src="../../../../../src/assets/extends/coordinate/p4_icon2.png" alt="">
          <img v-else-if="index===2" src="../../../../../src/assets/extends/coordinate/p4_icon3.png" alt="">
          <img v-else src="../../../../../src/assets/extends/coordinate/p4_icon5.png" alt="">
        </div>
      </div>
    </div>
    <div class="chart-wrap flex-space-between">
      <div class="flex-center-justify">
        <PieChart
          :chartData="pieChartData1"
          :radius="['50%','80%']"
          :legend="{show:false}"
          :label="{show:true,formatter:formatter,rich:rich}"
          :pieCharTitle="pieChartTitle1"
          roseType="radius"
          style="width: 100%;height: 100%"></PieChart>
      </div>
      <div class="flex-center-justify">
        <PieChart
          :chartData="pieChartData2"
          :radius="['50%','80%']"
          :legend="{show:false}"
          :label="{show:true,formatter:formatter,rich:rich}"
          :pieCharTitle="pieChartTitle2"
          roseType="radius"
          style="width: 100%;height: 100%"></PieChart>
      </div>
      <div class="flex-center-justify">
        <PieChart
          :chartData="pieOutputValueStatistics"
          :radius="['50%','80%']"
          :legend="{show:false}"
          :label="{show:true,formatter:formatter,rich:rich}"
          :pieCharTitle="outputValueTitle"
          roseType="radius"
          style="width: 100%;height: 100%"></PieChart>
        <!--        <PieChart-->
        <!--          :chartData="pieChartData3"-->
        <!--          :radius="['50%','80%']"-->
        <!--          :legend="{show:false}"-->
        <!--          :label="{show:true,formatter:formatter,rich:rich}"-->
        <!--          :pieCharTitle="pieChartTitle3"-->
        <!--          roseType="radius"-->
        <!--          style="width: 100%;height: 100%"></PieChart>-->
      </div>
    </div>
    <div class="table-height-auto">
      <a-table
        bordered
        size="small"
        rowKey="id"
        :columns="columns"
        :data-source="data"
        :customHeaderRow="customHeaderRow"
        :expandedRowKeys="expandedRowKeys"
        :pagination="false"
        @expand="expand"
        :scroll="{ x: 2180,y:10}">
        <!--   任务名称     -->
        <template #taskName="text,record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <span>{{ text }}</span>
          </a-tooltip>
        </template>
        <!--   当前状态     -->
        <template #currentStatus="text, record">
          <span v-if="text==='已归档'" style="color: #59c959;cursor: pointer;" @click="showApproval(record)">{{ text }}</span>
          <span v-else style="color:#ff5e10;cursor: pointer;" @click="showApproval(record)">{{ text }}</span>
        </template>
        <!--   当前评审人     -->
        <template #currentPerson="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
        <!--   设计     -->
        <template #designer="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
        <!--   校核     -->
        <template #checker="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
        <!--   审核     -->
        <template #auditor="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
        <!--   项目经理     -->
        <template #projectManager="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
        <!--   复审     -->
        <template #reviewer="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
        <!--   审定     -->
        <template #approver="text, record">
          <a-tooltip>
            <template slot="title">
              {{ text }}
            </template>
            <div class="text-overflow event-name">{{ text }}</div>
          </a-tooltip>
        </template>
      </a-table>
    </div>
    <a-modal
      title="审批记录"
      width="600px"
      :visible="visible"
      :footer="null"
      @cancel="handleCancel"
    >
      <Approval
        :key="approvalKey"
        v-if="workflowInstanceId!==null||''"
        class="a-pproval"
        :workflowInstanceId="workflowInstanceId"
      ></Approval>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Prop, Vue} from "vue-property-decorator";
import PieChart from "./components/pieChart.vue";
import {Table,Modal,Tooltip} from "@h3/antd-vue"
import {scheduleInfo} from "../../../../service/api"
import * as Type from "../../../../type";
import flow from "@cloudpivot/flow/pc";

type tableItem = {
  id: string;
  projectName: string;
  children?: tableItem[];
};
type PieType = {value:number,value1:number,name:string,color?:string;dw?:string}
type PieTitle = { text:string, subtext:string}
// @ts-ignore
@Component({
  name: "index",
  components: {
    PieChart,
    ATable:Table,
    AModal:Modal,
    Approval: flow.components.Approval,
    ATooltip:Tooltip
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode!:string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  @Prop({required:true}) projectId!:string;

  totalData:Array<any> = [
    {title:'生产任务单数量',num:'0'},
    {title:'工作大纲数量',num:'0'},
    {title:'专业任务单数量',num:'0'},
    {title:'专业提纲数量',num:'0'},
    {title:'设计任务单数量',num:'0'},
  ];
  pieColor:Array<string> = ['#4773ed','#7689f7','#00de84','#9df084','#f7de81']
  /*专业任务单状态*/
  pieChartData1:{value:number,value1:number,name:string,color?:string}[]=[];
  pieChartTitle1: { text:string, subtext:string} = { text:'专业任务', subtext:'单状态' }
  /*设计任务单状态*/
  pieChartData2:{value:number,value1:number,name:string,color?:string}[]=[];
  pieChartTitle2: { text:string, subtext:string} = { text:'设计任务', subtext:'单状态' }
  /*任务预期统计*/
  pieChartData3:{value:number,value1:number,name:string,color?:string}[]=[];
  pieChartTitle3: { text:string, subtext:string} = { text:'任务逾期', subtext:'统计' };
  pieOutputValueStatistics:PieType[]=[];
  outputValueTitle:PieTitle = { text:'产值统计', subtext: '' }

  columns:Array<any> = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: '0',
      fixed: 'left',
      width: 300,
      scopedSlots: { customRender: 'taskName' },
      customCell:()=>{
        return{
          style: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow:'ellipsis',
          }
        }
      }
    },
    {
      title: '任务编号',
      dataIndex: 'taskNumber',
      key: '1' ,
      // width: 140,
    },
    {

      title: '任务类型',
      dataIndex: 'type',
      key: '2',
      width: 180,
    },
    {

      title: '当前状态',
      dataIndex: 'currentStatus',
      key: '3',
      scopedSlots: { customRender: 'currentStatus' },
      width: 160,
    },
    {
      title: '当前负责人',
      dataIndex: 'currentPerson',
      key: '4',
      width: 120,
      scopedSlots: { customRender: 'currentPerson' },
    },
    {
      title: '计划开始日期',
      dataIndex: 'planStartTime',
      key: '5',
      width: 140,
    },
    {
      title: '计划结束日期',
      dataIndex: 'planEndTime',
      key: '6',
      width: 140,
    },
    {
      title: '计划工期',
      dataIndex: 'planDuration',
      key: '7',
      width: 80,
    },
    {
      title: '实际开始日期',
      dataIndex: 'realStartTime',
      key: '8',
      width: 140,
    },
    {
      title: '实际结束日期',
      dataIndex: 'realEndTime',
      key: '9',
      width: 140,
    },
    {
      title: '实际工期',
      dataIndex: 'realDuration',
      key: '10',
      width: 80,
    },
    {
      title: '设计',
      dataIndex: 'designer',
      key: '11',
      width: 80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      customCell:this.designerCustomCell,
      scopedSlots: { customRender: 'designer' },
    },
    {
      title: '校核',
      dataIndex: 'checker',
      key: '12',
      width: 80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      customCell:this.checkerCustomCell,
      scopedSlots: { customRender: 'checker' },
    },
    {
      title: '审核',
      dataIndex: 'auditor',
      key: '13',
      width: 80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      customCell:this.auditorCustomCell,
      scopedSlots: { customRender: 'auditor' },
    },
    {
      title: '项目经理',
      dataIndex: 'projectManager',
      key: '14',
      // width: 100,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      customCell:this.managerCustomCell,
      scopedSlots: { customRender: 'projectManager' },
    },
    {
      title: '复审',
      dataIndex: 'reviewer',
      key: '15',
      width: 80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      customCell:this.reviewerCustomCell,
      scopedSlots: { customRender: 'reviewer' },
    },
    {
      title: '审定',
      dataIndex: 'approver',
      key: '16',
      width: 80,
      customHeaderCell: () => ({
        style: {
          color: '#333',  //头部单元格样式调整
          backgroundColor:'#e1e1fc',
        },
      }),
      customCell:this.approverCustomCell,
      scopedSlots: { customRender: 'approver' },
    },
  ];
  data:Array<any> = [];
  expandedRowKeys: string[] = [];

  visible:boolean=false;
  workflowInstanceId:string='';
  approvalKey:number=0;
  rich:any = {
    b: {
      fontSize: 14,
      fontFamily: 'Microsoft YaHei',
    },
    c: {
      fontSize: 14,
      fontFamily: 'Microsoft YaHei',
    }
  }

  formatter(params){
    return '{name|' + params.name + '} ({value1|' + params.data.value1+ `${!params.data.dw?'个':params.data.dw}` + ')}'
  }

  showApproval(record){
    this.approvalKey++;
    this.workflowInstanceId=record.workflowInstanceId;
    this.visible=true;
  }

  handleCancel(){
    this.visible=false;
  }

  customHeaderRow(column){
    const cellStyle= "color: #575859;background:#ecf2fd;font-weight:400;text-align:center"
    return{
      style: cellStyle
    }
  };
  designerCustomCell(record){//设计
    return this.flagStyle(record.designerFlag);
  }
  checkerCustomCell(record){//校核
    return this.flagStyle(record.checkerFlag);
  }
  auditorCustomCell(record){//审核
    return this.flagStyle(record.auditorFlag);
  }
  managerCustomCell(record){//项目经理
    return this.flagStyle(record.projectManagerFlag);
  }
  reviewerCustomCell(record){//复审
    return this.flagStyle(record.reviewerFlag);
  }
  approverCustomCell(record){//审定
    return this.flagStyle(record.approverFlag);
  }
  flagStyle(flag){
    const styleZero ={ 'background-color': '#fff',}
    const styleOne ={ 'background-color': '#c9f8f8',}
    const styleTwo ={ 'background-color': '#98e9e9', }
    if(flag===0){
      return{ style:styleZero }
    }else if(flag===1){
      return{ style:styleOne }
    }else if(flag===2) {
      return{ style:styleTwo }
    }
  }

  async init(){
    try {
      const {errcode,errmsg,data}=await scheduleInfo({appCode:this.projectCode??"",projectId:this.projectId});
      if(errcode!==0) return this.$message.error(errmsg as string)
      this.totalData[0].num=data.projectInfoNum;//生产任务单数量
      this.totalData[1].num=data.workOutlineEntityNum;//工作大纲数量
      this.totalData[2].num=data.professionTaskNum;//专业任务单数量
      this.totalData[3].num=data.professionOutlineNum;//专业提纲数量
      this.totalData[4].num=data.designTaskNum;//设计任务单数量
      /*专业任务单状态*/
      for (const key in data.professionTaskType) {
        if (Object.prototype.hasOwnProperty.call(data.professionTaskType, key)) {
          this.pieChartData1.push({
            value:0,
            value1:data.professionTaskType[key],
            name:key,
          })
        }
      }
      this.pieChartData1.length>1&&this.pieChartData1.sort((a, b) => a.value1 - b.value1);
      this.changeColor(this.pieChartData1);
      if(this.pieChartData1.length===0){
        this.pieChartData1=[{value:0,value1:0,name:'',color:'#4773ed'}];
      }
      /*设计任务单状态*/
      for (const key in data.designTaskType) {
        if (Object.prototype.hasOwnProperty.call(data.designTaskType, key)) {
          this.pieChartData2.push({
            value:0,
            value1:data.designTaskType[key],
            name:key,
          })
        }
      }
      this.pieChartData2.length>1&&this.pieChartData2.sort((a, b) => a.value1 - b.value1);
      this.changeColor(this.pieChartData2);
      if(this.pieChartData2.length===0){
        this.pieChartData2=[{value:0,value1:0,name:'',color:'#4773ed'}];
      }
      /*任务预期统计*/
      for (const key in data.taskOverdueType) {
        if (Object.prototype.hasOwnProperty.call(data.taskOverdueType, key)) {
          this.pieChartData3.push({
            value:0,
            value1:data.taskOverdueType[key],
            name:key,
          })
        }
      }
      this.pieChartData3.length>1&&this.pieChartData3.sort((a, b) => a.value1 - b.value1);
      this.changeColor(this.pieChartData3);
      if(this.pieChartData3.length===0) {
        this.pieChartData3=[{value:0,value1:0,name:'',color:'#4773ed'}];
      }
      //产值情况
      for (const key in data.taskValueType) {
        if (Object.prototype.hasOwnProperty.call(data.taskValueType, key)) {
          this.pieOutputValueStatistics.push({
            value:0,
            value1:data.taskValueType[key],
            name:key,
            dw: '万'
          })
        }
      }
      this.pieOutputValueStatistics.length>1&&this.pieOutputValueStatistics.sort((a, b) => a.value1 - b.value1);
      this.changeColor(this.pieOutputValueStatistics);
      if(this.pieOutputValueStatistics.length===0) {
        this.pieOutputValueStatistics=[{value:0,value1:0,name:'',color:'#4773ed'}];
      }
      /*Table*/
      this.data=data.wbsList;
      this.expandedRowKeys = this.expandedAllRow(this.data);
    }
    catch (error) {
      this.$message.error(error)
    }
  }
  newArrFn (arr:any) {
    let newArr:any = []
    for(let i = 0;i<arr.length;i++){
      let  flag = true
      for(let j = 0;j<newArr.length;j++){
          if(arr[i].value1 === newArr[j].value1){
            flag = false
            newArr[j].value=arr[i].value
          }else {
            flag = true
          }
      };
      flag ? newArr.push(arr[i]) : newArr
    };
    return arr
  }
  changeColor(data){
    data.map((item,index)=>{
      item['value']=item['value1']>0?index+1:0
      item['color']=this.pieColor[index]
    })
    this.newArrFn(data)
  }
  expand(expanded:true,record:{id:string}){
    if(expanded){
      this.expandedRowKeys.push(record.id);
    }else{
      this.expandedRowKeys=this.expandedRowKeys.filter(item=>item!==record.id);
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

  async mounted() {
    await this.init();
  }
}
</script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
*{
  margin:0;
  padding: 0;
}
.wrap-schedule{
  padding: 1.852vh 1.5625vw;
  .num-item{
    width: 13vw;
    padding: 1.5vh 2vw;
    background: #F8FAFA;
    border-radius: 2px;
    margin-bottom: 3vh;
    .item-left{
      text-align: center;
      font-weight: 400;
      :nth-of-type(1){
        font-size: 24px;
        font-family: Arial;
        color: #000000;
      }

      :nth-of-type(2){
        font-size: 14px;
        font-family: Source Han Sans CN;
        color: #666666;
      }
    }
    img{
      width: 2.865vw;
      height: 6vh;
    }
  }
}
.chart-wrap{
  div{
    width: 30%;
    height: 20vh;
    margin-bottom: 3vh;
  }
}

</style>
<style scoped lang="less">
@import "../../../../styles/public.module.less";
@import "../../../../styles/table.modules.less";
/deep/.ant-table-thead{
  color: #575859 !important;
}
/deep/.ant-table-tbody{
  color: #8C8C8C;
  font-family: Source Han Sans CN;
}


//.ant-table table{
//  table-layout: fixed;
//}
.text-overflow {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.event-name{
  width:100%;
}
/*设置Table最小高*/
///deep/.ant-table-body{
//  min-height:41vh !important;
//}
/deep/.ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-body > table > .ant-table-tbody > tr > td{
  border-bottom: 1px solid #e8e8e8;
}
/deep/.ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-body-outer > .ant-table-body-inner > table > .ant-table-tbody > tr > td{
  border-bottom: 1px solid #e8e8e8;
}
///deep/.ant-table-small.ant-table-bordered .ant-table-placeholder{
//  min-height: 41vh;
//}
.table-height-auto {
  /deep/ .ant-table-fixed-left {
    .ant-table-header {
      min-height: 38px !important;
    }
  }
}

</style>
