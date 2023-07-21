<template>
  <div class="wrap flex-column">
    <div class="left-title">
      <img alt="" src="../../../../src/assets/extends/icon/icon.png" @click="back"/>
      <div>设备维修分析</div>
    </div>
    <div class="wrap-top flex-space-between">
      <div class="top-item" v-for="(item,index) in completeList" :key="index">
        <ItemNum :title="item.name" :value="item.value" :valueColor="completeColor[index]"></ItemNum>
      </div>
    </div>
    <div class="wrap-chart flex-space-between">
      <div class="failt-category">
        <div class="wrap-title">设备类别占比</div>
        <PieEchart
          :id="'PieEchart1'"
          :chartData="categoryChartData"
          :radius="[80,100]"
          :center="['50%','40%']"
          :legend="categoryChartLegend"
          :title="categoryChartTitle"
          style="width:100%;height:32vh"></PieEchart>
      </div>
      <div class="failt-why">
        <div class="wrap-title">工单来源占比</div>
        <PieEchart
          :id="'PieEchart2'"
          :chartData="whyChartData"
          :radius="[80,100]"
          :center="['50%','40%']"
          :legend="whyChartLegend"
          :title="whyChartTitle"
          style="width:100%;height:32vh"></PieEchart>
      </div>
    </div>
    <div class="wrap-table">
      <div class="wrap-title" style="margin-bottom:0.926vh">设备维修汇总明细</div>
      <div style="padding: 10px 24px 0 24px;">
        <a-table
          bordered
          rowkey="id"
          :columns="columns"
          :data-source="data"
          :rowClassName="setRowClass"
          size="small"
          :pagination="pagination"
          @change="handleTableChange"
          :scroll="{ y: 220 }">
          <template #scrapDesc="text,record">
            <a-tooltip placement="top">
              <div class="scrapDesc">{{ text }}</div>
              <template slot="title">
                <span>{{ text }}</span>
              </template>
            </a-tooltip>
          </template>
          <template #pics="text,record">
            <a @click="showPics(record)" v-if="record.pics.length > 0">查看照片列表</a>
            <span v-else>------</span>
          </template>
          <template #scrap="text,record">
            <a @click="scrapDetail(text)" v-if="text.displayName">{{ text.displayName }}</a>
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
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {ItemNum,MyCard,PieEchart,PicModal} from "../Components";
import {Table,Tooltip} from "@h3/antd-vue"
import {deviceRepair, getDeviceRepairTasks,getFormUrl} from "../../../service/api";
import * as Type from "../../../type";

@Component({
  name: "index",
  components: {
    ItemNum,
    MyCard,
    PieEchart,
    ATable:Table,
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
      name: "本月已保养",
      time: null,
      value: 0,
    },
    {
      name: "本月待保养",
      time: null,
      value: 0,
    },
    {
      name: "今日已保养",
      time: null,
      value: 0,
    },
    {
      name: "今日待保养",
      time: null,
      value: 0,
    }
  ]
  completeColor:Array<string>=['#29A1FC','#52DFB5','#FEA278','#F66982']

  colorList:Array<string>=['#577df2','#29a1fc','#66cdff','#36a353','#62bd7a','#f8cb7f','#f89588','#529c66'];
  categoryChartData:{value:number,name:string,color?:string}[]=[];
  categoryChartSum:number=0
  categoryChartLegend:any={
    // top: 'bottom',
    bottom:25,
    right: "center",
  }
  categoryChartTitle:{name?:string,itemStyle?:{show:true,position:"center",color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number,
      formatter?: Function | string,rich?:{[userStyle: string]:{
          color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number
        }}}}={
    itemStyle:{
      show:true,
      position:"center",
      formatter:()=>`{text|总数}\n{subText|${this.categoryChartSum}}`,
      rich:{
        "text":{
          fontSize:14,
          fontFamily:"Source Han Sans CN",
          color:"#666",
        },
        "subText":{
          fontSize:26,
          fontFamily:"Arial",
          color:"#000",
          fontWeight:700,
        }
      }
    }
  };
  whyChartData:{value:number,name:string,color?:string}[]=[];
  whyChartSum:number=0;
  whyChartLegend:any={
    // top: 'bottom',
    bottom:25,
    right: "center",
  }
  whyChartTitle:{name?:string,itemStyle?:{show:true,position:"center",color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number,
      formatter?: Function | string,rich?:{[userStyle: string]:{
          color?: string,fontStyle?: string,fontWeight?: string | number,fontFamily?: string,fontSize?: number
        }}}}={
    itemStyle:{
      show:true,
      position:"center",
      formatter:()=>`{text|总数}\n{subText|${this.whyChartSum}}`,
      rich:{
        "text":{
          fontSize:14,
          fontFamily:"Source Han Sans CN",
          color:"#666",
        },
        "subText":{
          fontSize:26,
          fontFamily:"Arial",
          color:"#000",
          fontWeight:700,
        }
      }
    }
  };

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
      title: '工单编号',
      dataIndex: 'sequenceNo',
      key: 'sequenceNo',
      align: 'center',
      width:200,
    },
    {
      title: '发起人',
      dataIndex: 'creater',
      key: 'creater',
      align: 'center',
      width:120,
    },
    {
      title: '发起日期',
      dataIndex: 'repairTime',
      key: 'repairTime',
      align: 'center',
      width:100,
      // sorter: (a, b) => a.MaintenanceTime > b.MaintenanceTime ? 1 : -1,
    },
    {
      title: '故障情况说明',
      dataIndex: 'scrapDesc',
      key: 'scrapDesc',
      align: 'center',
      scopedSlots: { customRender: 'scrapDesc' },
    },
    {
      title: '维修人',
      dataIndex: 'repairor',
      key: 'repairor',
      align: 'center',
      width:120,
    },
    {
      title: '维修照片',
      dataIndex: 'pics',
      key: 'pics',
      align: 'center',
      width:120,
      scopedSlots: { customRender: 'pics' },
    },
    {
      title: '维修结果说明',
      dataIndex: 'repairDesc',
      key: 'repairDesc',
      align: 'center',
      width:260,
    },
    {
      title: '关联报废工单',
      dataIndex: 'scrap',
      key: 'scrap',
      align: 'center',
      width:120,
      scopedSlots: { customRender: 'scrap' },
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
  pagination:any={
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
  }

  scrapDetail(record){
    this.getFormUrl(record.id,record.schemaCode)
  }

  showDetail(record) {
    this.getFormUrl(record.id,this.projectCode+'_device_repair')
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
    this.getDeviceRepairTasks();
  };
  back() {
    this.$router.go(-1)
  };
  setRowClass(record, index){
    return Number(index) % 2 === 1 ? 'evenRowStyle' : '';
  };
  getDeviceRepairTasks(){
    getDeviceRepairTasks({//获取维修任务列表
      appCode:this.projectCode??'',
      projectName:this.projectConfig?.projectName as string,
      pageNum:this.pagination.current,
      pageSize:this.pagination.pageSize
    })
      .then(res=>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        res.data.records.forEach(item=>{
          item['creater']=item['creater']??'';
          item['id']=item['id']??'';
          item['pics']=item['pics']??'';
          item['repairDesc']=item['repairDesc']??'------';
          item['repairTime']=item['repairTime']??'';
          item['repairor']=item['repairor']??'';
          item['scrap']=item['scrap']??'';
          item['scrapDesc']=item['scrapDesc']??'';
          item['sequenceNo']=item['sequenceNo']??'';
        })
        this.data=res.data.records;
        this.pagination.total=res.data.total;
      })
  }
  init(){
    deviceRepair({//设备保养统计
      appCode:this.projectCode??'',
      projectName:this.projectConfig?.projectName as string,
    })
      .then((res) =>{
        if(res.errcode!==0) return this.$message.error(res.errmsg as string);
        this.completeList=res.data.indexs;
        res.data.types.forEach((item,index) => {
          this.categoryChartData.push({value:item.value,name:item.name,color:this.colorList[index]});
          this.categoryChartSum+=item.value;
          this.categoryChartTitle.itemStyle!.formatter=()=>`{text|总数}\n{subText|${this.categoryChartSum}}`;
        })
        res.data.source.forEach((item,index)=>{
          this.whyChartData.push({value:item.value,name:item.name,color:this.colorList[index]})
          this.whyChartSum+=item.value;
          this.whyChartTitle.itemStyle!.formatter=()=>`{text|总数}\n{subText|${this.categoryChartSum}}`;
        })
      });
    this.getDeviceRepairTasks();
  };
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
    .failt-category{
      width:49.65%;
      height:34.259vh;
      background-color:#fff;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }
    .failt-why{
      width:49.65%;
      height:34.259vh;
      background-color:#fff;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }
  }
  .wrap-table{
    width: 100%;
    min-height:  39.63vh;
    background-color:#fff;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    .scrapDesc{
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

</style>
