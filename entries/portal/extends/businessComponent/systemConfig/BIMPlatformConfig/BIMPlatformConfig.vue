<template>
  <div class="bim-platform-config full-height">
    <div class="project">
      <span>配置项目：</span>
      <a-select @change="handleChange" :value="selectedProId">
        <a-select-option
          v-for="i in selectOption"
          :key="i.xmjc"
          :value="i.id">
          {{ i.xmmc }}
        </a-select-option>
      </a-select>
    </div>
    <a-collapse :activeKey="activeKey" :bordered="false" expandIconPosition="right">
      <template #expandIcon="props">
        <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0"/>
      </template>
      <a-collapse-panel key="1" header="编码配置" class="custom-style">
        <a-table :data-source="codeConfigData" :columns="codeColumns" :pagination="false">
          <template slot="operation" slot-scope="text, record, index">
            <div class="editable-row-operations">
              <span>
                <a @click="toPage(record)" class="base-color">设置</a>
              </span>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="模型配置" class="custom-style">
        <div class="inner">模型数据<a
          href="#"
          @click="toForm(modelConfigData.length?'edit':'add',{schemaCode:`${projectCode}_model_config`,id:modelConfigData.length?modelConfigData[0].id:''})"
          :disabled="!selectOption.length"
          class="base-color">设置</a></div>
        <a-table :data-source="modelConfigData" :columns="modelColumns" :pagination="false"></a-table>
      </a-collapse-panel>
      <a-collapse-panel key="3" header="报表配置" class="custom-style">
        <div class="inner">报表数据<a
          href="#"
          @click="toForm(reportConfigId.length?'edit':'add',{schemaCode:`${projectCode}_report_config`,id:reportConfigId.length?reportConfigId:''})"
          :disabled="!selectOption.length"
          class="base-color">设置</a></div>
        <a-table :data-source="reportData" :columns="reportColumns" :pagination="false"></a-table>
      </a-collapse-panel>
      <a-collapse-panel key="4" header="图层管理" class="custom-style">
        <div class="inner">图层数据<a href="#" @click="save" class="base-color">保存</a></div>
        <a-table
          rowKey="id"
          :data-source="newTableData"
          :columns="treeColumns"
          :pagination="false"
          :customRow="rowClick"
          bordered>
          <template
            slot="layerAlias"
            slot-scope="text, record">
            <div class="layerAlias">
              <Ainput
                type="text"
                :defaultValue="text"
                v-model="record.layerAlias"
                @change="onchangeValue(record)"></Ainput>
            </div>
          </template>
          <template
            slot="selectEnabled"
            slot-scope="text, record">
            <div class="selectEnabled" v-if="!record.children">
              <ASwitch :defaultChecked="Boolean(record.selectEnabled)" @change="selectEnabledChange($event, record)"></ASwitch>
            </div>
          </template>
          <template
            slot="isGeoTilesSave"
            slot-scope="text, record, index">
            <div class="isGeoTilesSave" v-if="!record.children" >
              <ASwitch :defaultChecked="Boolean(record.isGeoTilesSave)" @change="isGeoTilesSaveChange($event, record)"></ASwitch>
            </div>
          </template>
          <template
            slot="opacity"
            slot-scope="text, record, index">
            <div class="opacity" v-if="!record.children" >
              <ASlider
                :defaultValue="text"
                :step="0.1"
                v-model="record.opacity"
                @change="opacityChange(record)"
                :max="1"></ASlider>
            </div>
          </template>
          <template
            slot="visable"
            slot-scope="text, record, index">
            <div class="visable" v-if="!record.children">
              <ASwitch :defaultChecked="Boolean(record.visable)" @change="visableChange($event, record)"></ASwitch>
            </div>
          </template>
          <template
            slot="showMobile"
            slot-scope="text, record, index">
            <div class="showMobile" v-if="!record.children">
              <ASwitch :defaultChecked="Boolean(record.showMobile)" @change="showMobileChange($event, record)"></ASwitch>
            </div>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Mixins, Watch} from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Collapse from 'ant-design-vue/lib/collapse';
import 'ant-design-vue/lib/collapse/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import Switch from 'ant-design-vue/lib/switch';
import 'ant-design-vue/lib/switch/style/index.css';
import Slider from 'ant-design-vue/lib/slider';
import 'ant-design-vue/lib/slider/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import {ProjectPro, CodeConfig, ReportConfig, ModelConfig} from "../type";
import * as Type from "../../../type";
import {
  getFormUrl,
  getBIMPlatformConfig,
  getSystemProjectConfig,
  getLayerManagement,
  saveModelLayerData
} from "../../../service/api";
import {isArray} from "xe-utils";
import Websocket from "../websocket_base";
import onActionClick from "@cloudpivot/list/src/components/pc/scripts/onActionClick";

@Component({
  name: 'BIMPlatformConfig',
  components: {
    ATable: Table,
    AButton: Button,
    ASelect: Select,
    ASelectOption: Select.Option,
    ACollapse: Collapse,
    ACollapsePanel: Collapse.Panel,
    AIcon: Icon,
    ASwitch:Switch,
    ASlider:Slider,
    Ainput:Input
  }
})
export default class BIMPlatformConfig extends Vue {
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @InjectReactive('project') projectCode!: string;
  projectName:string="";
  codeConfigData: CodeConfig[] = [];
  codeColumns: any[] = [
    {
      title: '项目名称',
      dataIndex: 'xmmc',
      // width: '30%',
      key: 'xmmc'
    },
    {
      title: '项目简称',
      dataIndex: 'xmjc',
      // width: '30%',
      key: 'xmjc'
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      // width: '30%',
      key: 'createTime'
    },
    {
      title: '编码配置',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
    }
  ];
  modelConfigData: ModelConfig[] = [];
  modelColumns: any[] = [
    {
      title: '项目简称',
      key: 'xmjc',
      dataIndex: 'xmjc',
      width: 110
    },
    {
      title: '模型名称',
      key: 'modelName',
      dataIndex: 'modelName',
      width: 110
    },
    {
      title: '应用编码',
      key: 'appCode',
      dataIndex: 'appCode',
      width: 110
    },
    {
      title: '经度',
      key: 'longtitude',
      dataIndex: 'longtitude',
      width: 70
    },
    {
      title: '纬度',
      key: 'latitude',
      dataIndex: 'latitude',
      width: 70
    },
    {
      title: '高程',
      key: 'altitude',
      dataIndex: 'altitude',
      width: 70
    },
    {
      title: '相机高度',
      key: 'height',
      dataIndex: 'height',
      width: 110
    },
    {
      title: '本地缓存',
      key: 'localCache',
      dataIndex: 'localCache',
      width: 110
    },
    {
      title: '场景服务地址',
      key: 'scenceUrl',
      dataIndex: 'scenceUrl'
    }
  ];
  reportData: ReportConfig[] = [];
  reportColumns: any[] = [
    {
      title: '所需页面',
      dataIndex: 'page',
      // width: '30%',
      key: 'page'
    },
    {
      title: '所属BIM菜单',
      dataIndex: 'bimTab',
      // width: '30%',
      key: 'bimTab'
    },
    {
      title: 'BIM菜单编码',
      dataIndex: 'bimTabCode',
      // width: '30%',
      key: 'bimTabCode'
    },
    {
      title: '报表类型',
      dataIndex: 'reportType',
      key: 'reportType'
    }
  ];
  reportConfigId: string = '';
  data: any[] = [];
  columns: any[] = [
    {
      title: '项目名称',
      dataIndex: 'xmmc',
      // width: '30%',
      key: 'xmmc'
    },
    {
      title: '项目简称',
      dataIndex: 'xmjc',
      // width: '30%',
      key: 'xmjc'
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      // width: '30%',
      key: 'createTime'
    },
    {
      title: '编码配置',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
    }
  ];
  tableData:Array<any>=[];
  treeColumns: any[] = [
    {
      title: '图层名称',
      dataIndex: 'layerAlias',
      key: 'layerAlias',
      scopedSlots: {customRender: 'layerAlias'},
    },
    {
      title: '可选择',
      dataIndex: 'selectEnabled',
      key: 'selectEnabled',
      width: '12%',
      scopedSlots: {customRender: 'selectEnabled'},
    },
    {
      title: '是否缓存',
      dataIndex: 'isGeoTilesSave',
      // width: '30%',
      key: 'isGeoTilesSave',
      scopedSlots: {customRender: 'isGeoTilesSave'},
    },
    {
      title: '透明度',
      dataIndex: 'opacity',
      // width: '30%',
      key: 'opacity',
      scopedSlots: {customRender: 'opacity'},
    },
    {
      title: 'PC端是否显示',
      dataIndex: 'visable',
      // width: '30%',
      key: 'visable',
      scopedSlots: {customRender: 'visable'},
    },
    {
      title: '移动端是否显示',
      dataIndex: 'showMobile',
      // width: '30%',
      key: 'showMobile',
      scopedSlots: {customRender: 'showMobile'},
    },
  ];

  activeKey: string[] = ['1', '2','3','4'];
  num: number = 0;
  selectOption: ProjectPro[] = [];
  selectedProId: string = '';
  selectedProName: string = '';
  bimCodeSocket: any = null;
  bimModelSocket: any = null;
  bimReportSocket: any = null;
  changeValue:string="";
  foundItemChange1:object={}
  change1:string = ''; // 源目标数据序号
  change2:string = ''; // 目标数据序号
  itemIndex:number=0
  newTableData:Array<any>=[]
  toForm(flag:string,params:{schemaCode:string,id?:string}) {
   switch (flag) {
     case 'add':
       let routeData = this.$router.resolve({
         // 业务表单
         name: "form-detail",
         query: {
           schemaCode: params.schemaCode,
           sheetCode: params.schemaCode,
           return: `${this.$route.fullPath}&iframeAction=add`,
           iframeAction: 'add',
           projectName: this.projectConfig?.projectName,
         },
       });
       this.isDingTalk?this.$router.push(routeData.route.fullPath):window.open(routeData.href, '_blank');
      break;
     case 'edit':
       getFormUrl({
         bizObjectId: params?.id?? '',
         schemaCode: params.schemaCode
       }).then((res)=> {
         // 如果报错, 会返回一个对象
         if ( typeof res === "object" && res.errcode !== 0 ) {
           return this.$message.error( res.errmsg as string, 3 );
         }
         // 否则返回一个字符串
         else if ( typeof res === "string" ) {
           let search = location.search;
           search = search
             ? `${search}&iframeAction=detail`
             : `?iframeAction=detail`;
           // const url = `${res}&return=${location.pathname + encodeURIComponent(search)}`;
           let url:string = '';
           if(this.isDingTalk) {
             const projectLength:number = window.config.project.length;
             const pathName =  location.pathname.substring(location.pathname.search(window.config.project) + projectLength,location.pathname.length);
             url = `${ res }&return=${ pathName + encodeURIComponent( search )}`;
           }else{
             url = `${ res }&return=${ location.pathname + encodeURIComponent( search )}`;
           }
           if(this.isDingTalk) {
             this.$router.push(url)
           }else{
           const formUrl = onActionClick.getFormRealUrl( this, url );
           window.open( formUrl );
         }
         }
       })
      break;
   }
  }
  getProjectList() {
    getSystemProjectConfig({ appCode: this.projectCode??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      if(res.data.single && isArray(res.data.single) && res.data.single.length){
        this.selectOption = res.data.single;
        this.handleChange(this.selectOption[0].id,{key:this.selectOption[0].xmjc})
      }
    })
  }
  handleChange(val,info) {
    this.selectedProId = val;
    this.getBimPlatformConfig(val);
    this.projectName=info.key
    this.getSystemProjectConfigList()
  }
  getBimPlatformConfig(projectId:string='') {
    getBIMPlatformConfig({appCode:this.projectCode,projectId:projectId}).then((res)=> {
      // this.projectName=res.data.codeConfig.xmjc
      this.codeConfigData = [];
      this.modelConfigData = [];
      this.reportData = [];
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      res.data.codeConfig?this.codeConfigData.splice(0,0,res.data.codeConfig):'';
      res.data.modelConfig?this.modelConfigData.splice(0,0,res.data.modelConfig):'';
      if(res.data.reportConfig) {
        this.reportData = res.data.reportConfig.groups
        this.reportConfigId = res.data.reportConfig.id;
      }
    })
  }
  toPage(record) {
    this.selectOption.map((item)=> {
     if(item.id === this.selectedProId){
       this.projectConfig?.updateProjectConfig(item.xmjc,2,`${item.id}-项目`)
     }
    })
    // const msg = Object.assign(record,{projectCode:this.projectCode,key:record.id,nameShort:record.xmjc,xmjc_1:record.xmjc,projectName:record.xmmc})
    this.$router.push({
      path: "CodeMbsManagement",
      // query: msg,
    });
  }

  @Watch('tableData',{ immediate: true })
  changeTableData(val:any) {
    console.log("watch",val);
    this.newTableData=val
  }
  getSystemProjectConfigList(){
    getLayerManagement({appCode: this.projectCode,projectName:this.projectName}).then((res)=>{
      if(res.errcode===0){
      this.tableData=res.data
      this.newTableData=this.tableData
      }
    })
  }
  selectEnabledChange(event,record){
    if(event==true){
      record.selectEnabled=1
    }else {
      record.selectEnabled=0
    }
    console.log(event,record.selectEnabled,this.tableData)
  }
  isGeoTilesSaveChange(event, record){
    if(event==true){
      record.isGeoTilesSave=1
    }else {
      record.isGeoTilesSave=0
    }
  }
  visableChange(event, record){
    if(event==true){
      record.visable=1
    }else {
      record.visable=0
    }
  }
  showMobileChange(event, record){
    if(event==true){
      record.showMobile=1
    }else {
      record.showMobile=0
    }
  }
  onchangeValue(record){
    record.layerAlias=record.layerAlias
  }
  opacityChange(record){
    console.log(record)
    record.opacity=record.opacity
  }
  save(){
    saveModelLayerData({appCode:this.projectCode,projectName:this.projectName,modelConfigLayerDataList:this.tableData}).then((res)=>{
      console.log("保存成功",res)
      this.getSystemProjectConfigList();
    })
  }
  rowClick(record, index) {
    return {
      on: {
        // 鼠标移入
        mouseenter: (event) => {
          // 兼容IE
          const ev = event || Event;
          ev.target.draggable = true;
        },
        // 开始拖拽
        dragstart:(event)=>{
          // 兼容IE
          const ev = event || Event;
          // 阻止冒泡
          ev.stopPropagation();
          // 得到源目标数据
          this.change1 = index;
          this.foundItemChange1=record
        },
        // 拖动元素经过的元素
        dragover: (event) => {
          // 兼容 IE
          const ev = event || Event;
          // 阻止默认行为
          ev.preventDefault();
        },
        // 鼠标松开
        drop: (event) => {
          // 兼容IE
          const ev = event || Event;
          // 阻止冒泡
          ev.stopPropagation();
          // 得到目标数据序号
          this.change2 = index;
          if(this.foundItemChange1['layerType']===record['layerType']){
            for (let i=0;i<this.tableData.length;i++){
              for (let j=0;j<this.tableData[i].children.length;j++){
                if(this.tableData[i].children[j].layerType===this.foundItemChange1['layerType']){
                  this.itemIndex=i
                }
              }
            }
            const changeItem=this.tableData[this.itemIndex].children[this.change1]
            const changeItem3=this.tableData[this.itemIndex].children[this.change1+1]
            const keyChange2=this.tableData[this.itemIndex].children[this.change2].sortNum
            this.tableData[this.itemIndex].children[this.change1].sortNum=keyChange2;
            if(this.change1>this.change2){
              this.tableData[this.itemIndex].children.forEach((item) => {
                if(item.sortNum>=changeItem.sortNum&&item.id!==changeItem.id){
                  item.sortNum++;
                }
              });
            }else{
              this.tableData[this.itemIndex].children.forEach((item) => {
                if(item.sortNum>=changeItem3.sortNum&&item.sortNum<=changeItem.sortNum&&item.id!==changeItem.id){
                  item.sortNum--;
                }
              });
            }
            this.save();
            this.getSystemProjectConfigList();
          }else {
            console.log("只能同级拖拽")
          }
        }
      }
    }
  }
  mounted() {
    this.bimCodeSocket = new Websocket();
    this.bimCodeSocket.initWebsocket(this.projectCode??'','bimCode',this.getProjectList);
    this.bimModelSocket = new Websocket();
    this.bimModelSocket.initWebsocket(this.projectCode??'','bimModel',this.getProjectList);
    this.bimReportSocket = new Websocket();
    this.bimReportSocket.initWebsocket(this.projectCode??'','bimReport',this.getProjectList)
  }
  destroyed () {
    this.bimCodeSocket.close();
    this.bimModelSocket.close();
    this.bimReportSocket.close();
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
@import '../system.module.less';

.bim-platform-config {
  .project {
    margin-bottom: @spacing-large;
    /deep/ .ant-select {
      width: 30%;
    }
  }
}
/deep/.ant-table-row-expand-icon{
  float: left;
  margin-top: 8px;
}
.layerAlias{
  float: left;
}
</style>
