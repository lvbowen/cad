<template>
  <div class="content-wrap flex-auto flex">
    <div class="left-menu">
      <a-menu
        :default-selected-keys="defaultSelectedKeys"
        :default-open-keys="defaultSelectedKeys"
        mode="inline"
        theme="dark"
      >
        <template v-for="item in menuData">
          <a-menu-item v-if="item.iconFlag" :key="item.id" @click="clickMenuTitle(item)">
            <img src="../../../../../../src/assets/extends/coordinate/ModelAnnotation/认识专业拷贝3.png" alt="">
            <span>{{ item.title }}</span>
          </a-menu-item>
          <sub-menu v-else :key="item.id" :menuInfo="item" @clickMenuTitle="clickMenuTitle"/>
        </template>
      </a-menu>
    </div>
    <div class="right-table">
      <div class="table-content">
        <div class="table-title flex-space-between">
          <div class="title">资料列表</div>
          <div style="width:25vw">
            <a-input-search placeholder="请输入附件名称" enter-button @search="onSearch" />
          </div>
        </div>
        <div class="flex-auto">
          <a-table
            bordered
            size="small"
            rowKey="key"
            :customHeaderRow="customHeaderRow"
            :pagination="pagination"
            :columns="columns"
            :data-source="data"
            @change="handleTableChange">
            <template #name="text, record">
              <a @click="previewClick(record)">{{text}}</a>
            </template>
            <template #operation="text, record">
              <span @click="downloadClick(record)" style="color: #999999;cursor: pointer">
                <a-icon type="download" style="color: #42CD81"/>
                下载
              </span>
              <span @click="previewClick(record)" style="margin-left: 30px;color: #999999;cursor: pointer">
                <a-icon type="eye" theme="twoTone" two-tone-color="#FFC000"/>
                预览
              </span>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Prop, Vue} from "vue-property-decorator";
import {Icon,Menu,Input,Button,Checkbox,Table} from "@h3/antd-vue"
import {loadDigitalDeliveryTree,getDeliveryMaterial} from "../../../../../service/api"
import SubMenu from "./SubMenu.vue"
import Utils from "../../../../../utils"

@Component({
  name: "index",
  components: {
    AIcon:Icon,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    AInputSearch:Input.Search,
    AButton:Button,
    ACheckbox:Checkbox,
    ATable:Table,
    SubMenu,
  },
})
export default class index extends Vue {
  @Prop({required:true,type:Object}) idObj!:any;

  menuData:Array<any>= [];

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
      title: '附件名称',
      dataIndex: 'name',
      key: 'name',
      scopedSlots: { customRender: 'name' },
      align: 'center',
    },
    {
      title: '设计人',
      dataIndex: 'desinger',
      key: 'desinger',
      align: 'center',
    },
    {
      title: '上传日期',
      key: 'createdTime',
      dataIndex: 'createdTime',
      align: 'center',
    },
    {
      title: '所属设计任务单',
      key: 'professionTaskName',
      dataIndex: 'professionTaskName',
      align: 'center',
    },
    {
      title: '操作',
      key: 'operation',
      scopedSlots: { customRender: 'operation' },
      align: 'center',
    },
  ];
  data:Array<any> = [];
  pagination:any={
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "40", "50"], //每页中显示的数据
    showTotal: (total) => `共有 ${total} 条数据`, //分页中显示总的数据
  }

  defaultSelectedKeys:Array<any> = []

  zyrwdId:string='';
  taskType:string='';

  /* 点击分页事件 */
  handleTableChange(pagination){
    this.pagination.current = pagination.current;
  }
  /*SubMenu菜单点击事件*/
  clickMenuTitle(val){
    this.zyrwdId=val.zyrwdId;
    this.taskType=val.taskType;
    this.getDeliveryMaterial(val.zyrwdId,val.title,'')
  }
  /*搜索*/
  onSearch(value) {
    this.getDeliveryMaterial(this.zyrwdId,this.taskType,value)
  }
  /*下载*/
  downloadClick(record){
    window.open(record.download,)
  }
  /*预览*/
  previewClick(record){
    window.open(record.onlinePrewView,'_blank')
  }

  customHeaderRow(column){
    const cellStyle= "color:#333;background:#E7EFFC;fontWeight:bold"
    return{
      style: cellStyle
    }
  };

  async getDeliveryMaterial(zyrwdId,taskType,achievementName){
    const {errcode, errmsg, data}= await getDeliveryMaterial({appCode:this.idObj.appCode??'',zyrwdId:zyrwdId,taskType:taskType,achievementName:achievementName});
    if(errcode!==0) return this.$message.error(errmsg as string);
    this.data=data;
  }

  async init(){
    const {errcode, errmsg, data} =await loadDigitalDeliveryTree({appCode:this.idObj.appCode??'',projectId:this.idObj.projectId??''})
    if(errcode!==0) return this.$message.error(errmsg as string);
    let newData=data.map(item=>{
      return ({id:item.projectId,title:item.projectName,designTasks:[],iconFlag:false})
    })
    this.menuData=this.noRepeat(newData,data);

    Utils.deepFind(
      this.menuData,
      (item) => {
        if(item.zyrwdId&&!item.sjrwdId){
          item['id']=item['zyrwdId'];
          item['iconFlag']=true;
          delete item.zyrwdId;
        }
        if(item.sjrwdId){
          item['id']=item['sjrwdId'];
          item['iconFlag']=true;
          delete item.sjrwdId;
        }
        if(item.taskType){
          item['title']=item['taskType'];
          delete item.taskType;
        }
        if(item.professionName){
          item['title']=item['professionName'];
          delete item.professionName;
        }
        return false;
      },
      "designTasks"
    );
    this.defaultSelectedKeys.push(this.menuData[0].id);
  }
  noRepeat(arr,data){
    let newArr:any = [];
    for (let i = 0; i < arr.length; i++) {
      let repArr:any = [];//接收重复数据后面的数据
      //内层循环找出有重复数据的数据
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].projectId === arr[j].projectId) {
          repArr.push(arr[j]);//找出后面重复数据的数据
        }
      }
      if (repArr.length == 0) {//若重复数组没有值说明其不是重复数据
        newArr.push(arr[i]);
      }
    }
    for (let i=0;i<newArr.length;i++){
      newArr[i]['designTasks']=[];
      for (let j=i;j<data.length;j++){
        if(newArr[i].id===data[j].projectId){
          newArr[i]['designTasks'].push(data[j])
        }
      }
    }
    return newArr
  }
  async created() {
    this.init();
    const {errcode, errmsg, data}= await getDeliveryMaterial({appCode:this.idObj.appCode??'',projectId:this.idObj.projectId??''});
    if(errcode!==0) return this.$message.error(errmsg as string);
    this.data=data;
  }
}
</script>
<style lang="less" scoped>
@import "../../../../../styles/public.module.less";
.content-wrap{
  width: 100%;
  .left-menu{
    width: 12.5vw;
    height:100%;
    background: #17202F;
  }
  .right-table{
    width: calc(100% - 12.5vw);
    background: #F4F6FC;
    height:100%;
    padding: 15px;
    .table-content{
      width:100%;
      height:100%;
      background: #FFFFFF;
      border: 1px solid #E8E8E8;
      box-shadow: 0px 0px 7px 0px rgba(0,72,152,0.1);
      padding: 15px 20px 20px 20px;
      .table-title{
        margin-bottom: 10px;
        .title{
          display: inline-block;
          height: 100%;
          line-height: 30px;
          font-size: 16px;
          font-family: Source Han Sans CN;
          font-weight: bold;
          color: #666666;
          border-bottom: 2px solid #3293FF;
        }
      }
    }
  }
}

</style>
<style lang="less" scoped>
/*设置Table最小高*/
/deep/.ant-table-content{
  min-height: 75vh;
}
/deep/.ant-table-small > .ant-table-content > .ant-table-body > table > .ant-table-tbody > tr > td{
  border-bottom: 1px solid #e8e8e8;
}
/deep/.ant-table-small > .ant-table-content > .ant-table-fixed-left > .ant-table-body-outer > .ant-table-body-inner > table > .ant-table-tbody > tr > td{
  border-bottom: 1px solid #e8e8e8;
}
/deep/.ant-table-small.ant-table-bordered .ant-table-placeholder{
  min-height: 78vh;
}
/deep/.ant-table-small > .ant-table-content > .ant-table-body {
   margin: 0;
}
/deep/.ant-menu-submenu-title{
  color: #FFFFFF;
}
</style>
