<template>
  <div class="wrap flex-column">
    <div class="left-title">
      <img alt="" src="../../../../src/assets/extends/icon/icon.png" @click="back"/>
      <div>设备保养分析</div>
    </div>
    <div class="wrap-top flex-space-between">
      <div class="top-item" v-for="(item,index) in completeList" :key="index">
        <ItemNum :title="item.name" :value="item.value" :valueColor="completeColor[index]"></ItemNum>
      </div>
    </div>
    <div class="wrap-chart flex-space-between">
      <div class="maintenance-time">
        <div class="wrap-title">保养数量统计</div>
        <LineChart
          :id="'lineChart'"
          :option="lineChartData"
          :dataZoom="[{'type':'inside'}]"
          :yAxis="{name:'次'}"
          style="width:100%;height:32vh"></LineChart>
      </div>
      <div class="maintenance-statistics">
        <div class="wrap-title">保养次数统计</div>
        <div class="progress-list">
          <div
            class="flex"
            style="margin-bottom:20px"
            v-for="(item,index) in progressList"
            :key="index">
            <div class="progress-name">{{ item.name }}</div>
            <div class="progress-item">
              <a-progress
                :percent="item.value"
                strokeLinecap="square"
                :strokeWidth="20"
                :format="percent => `${percent} 次`" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="wrap-table">
      <div class="wrap-title" style="margin-bottom:0.926vh">设备保养汇总明细</div>
      <div style="padding: 10px 24px 0 24px;">
        <a-table
          bordered
          rowKey="id"
          :columns="columns"
          :data-source="data"
          :rowClassName="setRowClass"
          size="small"
          :pagination="pagination"
          @change="handleTableChange"
          :scroll="{ y: 220 }">
          <template #maintainDesc="text,record">
            <a-tooltip placement="top">
              <div class="maintainDesc">{{ text }}</div>
              <template slot="title">
                <span>{{ text }}</span>
              </template>
            </a-tooltip>
          </template>
          <template #pics="text,record">
            <a @click="showPics(record)" v-if="record.pics.length > 0">查看照片列表</a>
            <span v-else>------</span>
          </template>
          <template #SparePartsOrder="text,record">
            <a @click="sparePartsDetail(text)" v-if="text.displayName">{{ text.displayName }}</a>
            <span v-else>------</span>
          </template>
          <template #MaintenanceOrder="text,record">
            <a @click="maintenanceDetail(text)" v-if="text.displayName">{{ text.displayName }}</a>
            <span v-else>------</span>
          </template>
          <template #操作="text,record">
            <a @click="showDetail(record)">查看</a>
          </template>
        </a-table>
      </div>
    </div>
    <PicModal @onCancel="onCancel" :visible="visible" :imgSrc="imgSrc"></PicModal>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive,Watch, Vue} from "vue-property-decorator";
import {ItemNum,MyCard,LineChart,PicModal} from "../Components";
import {getDeviceMaintainTasks,deviceMaintain,getFormUrl} from "../../../service/api"
import * as Type from "../../../type";
import {Table,Progress,Tooltip} from "@h3/antd-vue";

@Component({
  name: "index",
  components: {
    ItemNum,
    MyCard,
    LineChart,
    ATable:Table,
    AProgress:Progress,
    ATooltip:Tooltip,
    PicModal
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;

  onCancel(val){
    this.visible=val;
  }

  completeList:Array<any>=[
    {
      name: "总维修工单",
      time: null,
      value: 0,
    },
    {
      name: "维修中",
      time: null,
      value: 0,
    },
    {
      name: "已完成",
      time: null,
      value: 0,
    },
    {
      name: "本月维修",
      time: null,
      value: 0,
    }
  ]
  completeColor:Array<string>=['#29A1FC','#52DFB5','#FEA278','#F66982']

  lineChartData:{legend:string[],xAxis:string[],series:{data:number[],color?:string,labelShow?:boolean}[]}={
    legend:[],
    xAxis:[],
    series:[]
  };

  progressList:Array<any>=[];

  columns: Array<any> = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      width:80,
      customRender: (text, record, index) => `${(this.pagination.current-1)*this.pagination.pageSize + (index + 1)}`,
    },
    {
      title: '保养工单名称',
      dataIndex: 'planName',
      key: 'planName',
      align: 'center',
      width:150
    },
    {
      title: '工单编号',
      dataIndex: 'sequenceNo',
      key: 'sequenceNo',
      align: 'center',
      width:200,
    },
    {
      title: '保养人员',
      dataIndex: 'maintainer',
      key: 'maintainer',
      align: 'center',
      width:80,
    },
    {
      title: '保养设备',
      dataIndex: 'deviceName',
      key: 'deviceName',
      align: 'center',
      width:150,
    },
    {
      title: '保养内容',
      dataIndex: 'maintainDesc',
      key: 'maintainDesc',
      align: 'center',
      scopedSlots: { customRender: 'maintainDesc' },
    },
    {
      title: '保养照片',
      dataIndex: 'pics',
      key: 'pics',
      align: 'center',
      width:120,
      scopedSlots: { customRender: 'pics' },
    },
    {
      title: '保养日期',
      dataIndex: 'maintainDate',
      key: 'maintainDate',
      align: 'center',
      width:100,
      // sorter: (a, b) => a.maintainDate > b.maintainDate ? 1 : -1,
    },
    {
      title: '关联备品备件工单',
      dataIndex: 'spareParts',
      key: 'spareParts',
      align: 'center',
      width:130,
      scopedSlots: { customRender: 'SparePartsOrder' },
    },
    {
      title: '关联维修工单',
      dataIndex: 'repair',
      key: 'repair',
      align: 'center',
      width:120,
      scopedSlots: { customRender: 'MaintenanceOrder' },
    },
    {
      align: "center",
      title: "操作",
      key: "操作",
      width:80,
      scopedSlots: {customRender: "操作"}
    }
  ];
  data: Array<any> = [];
  pagination: {
    pageSize: number,
    total: number,
    current: number,
    showSizeChanger: boolean,
    pageSizeOptions: string[],
    showTotal: any
  }={
    pageSize: 20, //每页中显示20条数据
    total: 0,
    current: 1,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: total => `共有 ${total} 条数据` //分页中显示总的数据
  };
  visible:boolean=false;
  imgSrc:Array<any>=[];
  showPics(record){
    this.imgSrc=record.pics;
    this.visible=true;
  };

  maintenanceDetail(record){
    this.getFormUrl(record.id,record.schemaCode)
  }
  sparePartsDetail(record){
    this.getFormUrl(record.id,record.schemaCode)
  }
  showDetail(record) {
    this.getFormUrl(record.id,this.projectCode+'_device_maintainTask')
  };
  getFormUrl(bizObjectId,schemaCode){
    getFormUrl({bizObjectId:bizObjectId,schemaCode:schemaCode}).then(res=>{
      if(this.isDingTalk) {
        this.$router.push(`${res}`)
      }else {
        window.open(`${res}`)
      }
    })
  };
  handleTableChange(pagination){
    this.pagination.current=pagination.current;
    this.pagination.pageSize=pagination.pageSize;
    this.getDeviceMaintainTasks();
  };
  setRowClass(record, index){
    return Number(index) % 2 === 1 ? 'evenRowStyle' : '';
  };
  back() {
    this.$router.go(-1)
  };
  getDeviceMaintainTasks(){
    getDeviceMaintainTasks({//获取保养任务列表
      appCode:this.projectCode??'',
      projectName:this.projectConfig?.projectName as string,
      pageNum:this.pagination.current,
      pageSize:this.pagination.pageSize
    })
      .then((res) =>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        res.data.records.map(item=>{
          item['deviceName']=item['deviceName']??'';
          item['id']=item['id']??'';
          item['maintainDate']=item['maintainDate']??'';
          item['maintainDesc']=item['maintainDesc']??'';
          item['maintainer']=item['maintainer']??'';
          item['pics']=item['pics']??'';
          item['planName']=item['planName']??'';
          item['repair']=item['repair']??'';
          item['sequenceNo']=item['sequenceNo']??'';
          item['spareParts']=item['spareParts']??'';
        })
        this.data=res.data.records;
        this.pagination.total=res.data.total;
      })
  }
  init(){
    deviceMaintain({//设备保养统计
      appCode:this.projectCode??'',
      projectName:this.projectConfig?.projectName as string,
    })
      .then((res) =>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        this.completeList=res.data.indexs;
        this.progressList=res.data.types;
        res.data.axis.forEach((item,index)=>{
          this.lineChartData.xAxis.push(item.name)
          if(this.lineChartData.series[0]){
            this.lineChartData.series[0].data.push(item.value)
          }else {
            this.lineChartData.series[0]={data:[item.value],color:'#4276d6',labelShow:true}
          }
        })
      });
    this.getDeviceMaintainTasks();
  }
  mounted(){
    this.init();
  }
}
</script>
<style lang="less" scoped>
@import "../../../styles/public.module.less";
.wrap{
  width: 100%;
  .wrap-title{
    width: 100%;
    height:42px;
    padding:10px;
    font-size: 14px;
    background-color:#F8FBFF;
    font-family: Source Han Sans CN;
    font-weight: 700;
    color: #0A0A0A;
    border-bottom: 1px solid #E8E8E8;
  }
  .left-title {
    margin-bottom: @spacing-base;
    div {
      display: inline-block;
      font-size: 14px;
      font-family: Source Han Sans CN;
      font-weight: 700;
      color: #0A0A0A;
    }

    img {
      cursor: pointer;
    }
  }
  .wrap-top{
    width: 100%;
    margin-bottom: 10px;
    .top-item{
      width:23%;
      height:90px;
      background-color:#fff;
    }
  }
  .wrap-chart{
    width:100%;
    margin-bottom: 10px;
    .maintenance-time{
      width:69.4%;
      height:34.259vh;
      background-color:#fff;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }
    .maintenance-statistics{
      width:30%;
      height:34.259vh;
      background-color:#fff;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
      .progress-list{
        width: 100%;
        height: 28vh;
        padding:10px;
        overflow:auto;
        .progress-name{
          width:20%;
          font-size: 14px;
          font-family: Microsoft YaHei;
          font-weight: 300;
          color: #A3ABB4;
          line-height: 24px;
          text-align: right;
          margin-right:10px;
        }
        .progress-item{
          width: 80%;
          padding-right: 10px;
        }
      }
    }
  }
  .wrap-table{
    width: 100%;
    min-height:  39.63vh;
    background-color:#fff;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    .maintainDesc{
      width: 20vw;
      cursor:pointer;
      overflow:hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
<style lang="less" scoped>
/deep/.evenRowStyle{
  background-color:#f8f9fe;
}
/deep/.ant-table-small > .ant-table-content > .ant-table-scroll > .ant-table-header > table > .ant-table-thead > tr > th,
/deep/.ant-table-thead > tr > th{
  background-color:#edeff9;
  font-size: 12px;
  font-weight: bold;
}
/deep/.ant-pagination-options {
  height: 25px;
}
/deep/.ant-progress-inner{
  border-radius: 0;
}
/deep/.ant-progress-bg{
  background-color: #3D6DC5;
}
/deep/.ant-progress-status-success .ant-progress-bg {
  background-color: #3D6DC5;
}
/deep/.ant-progress-status-success .ant-progress-text {
  color: #666;
}
/deep/.ant-progress-inner{
  background-color:transparent;
}
</style>
