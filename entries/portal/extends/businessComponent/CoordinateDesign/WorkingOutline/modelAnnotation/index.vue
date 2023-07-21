<template>
  <div class="wrap flex-column">
    <div class="model-header flex-space-between">
      <div class="header-menu">
        <div class="bim-model">
          <span @click="bimModelClick('三维模型')" class="active-item" :class="{'activeBar':activeMenu==='三维模型'}">
            <img src="../../../../../src/assets/extends/coordinate/ModelAnnotation/bim_布满视图.png" alt="">
            三维模型
          </span>
        </div>
      </div>
      <div class="title">{{ projectTitle }}-模型批注平台-<span>{{ name }}</span></div>
      <div class="header-menu">
        <div class="drawings" v-if="personId==='2ccf3b346706a6d3016706dc51c0022b'">
          <span @click="drawingsClick('移交资料')" class="active-item" :class="{'activeBar':activeMenu==='移交资料'}">
            <img src="../../../../../src/assets/extends/coordinate/ModelAnnotation/图纸.png" alt="">
            移交资料
          </span>
        </div>
      </div>
    </div>
    <iframe
      v-if="activeMenu=='三维模型'"
      id="iframe"
      class="model"
      :src="iframeURL"
      frameborder="0"
      allowfullscreen="true">
    </iframe>
    <div v-if="activeMenu=='三维模型'" class="model-menu" :class="menuFlag?'model-menu':'hide-menu'">
      <div class="menu-content">
        <div class="menu-header">
          <img src="../../../../../src/assets/extends/coordinate/pic.png" alt="">
          <span style="margin-left: 10px">模型结构树</span>
        </div>
        <div class="menu-tree">
          <a-tree
            showIcon
            :showLine="true"
            :treeData="treeData"
            :replaceFields="replaceFields"
            @select="onSelect"
            @rightClick="rightClick"
          >
            <template #title="text,record">
              <a-dropdown :trigger="['contextmenu']">
                <span>{{ text.text }}</span>
                <template #overlay>
                  <a-menu @click="menuClick">
                    <a-menu-item key="选中">选中</a-menu-item>
                    <a-menu-item key="聚焦">聚焦</a-menu-item>
                    <a-menu-item key="隔离">隔离</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <template v-if="text.viewFlag">
                <a-icon type="eye" class="eye-icon" @click.stop="changeView(text.id)" v-if="!loadingViewTree"></a-icon>
                <a-icon type="loading" class="eye-icon" v-else-if="activeId===text.id"/>
              </template>
            </template>
          </a-tree>
        </div>
        <div :class="menuFlag?'back-btn':'show-btn'" @click="backClick"></div>
      </div>
    </div>
    <TransferInformation v-if="activeMenu=='移交资料'" :idObj="idObj"></TransferInformation>
  </div>
</template>
<script lang="ts">
import {Component, InjectReactive, Vue} from "vue-property-decorator";
import {Tree,Icon,Menu,Dropdown} from "@h3/antd-vue"

import axios from "axios";
import Utils from "../../../../utils";
import env from "@/config/env";
import TransferInformation from "./component/transferInformation.vue"

@Component({
  name: "index",
  components: {
    ATree:Tree,
    AIcon:Icon,
    AMenu: Menu,
    ASubMenu:Menu.SubMenu,
    AMenuItem: Menu.Item,
    ADropdown:Dropdown,
    TransferInformation
  },
})
export default class index extends Vue {
  @InjectReactive('title') projectTitle?: string;
  iframeURL:any='';
  appCode:any='';
  personId:any='';
  workflowInstanceId:any='';
  designFileId:any='';
  name:any='';
  VaultID:any='';
  ModelID:any='';
  // FileName:any='';
  annotationId:any='';

  idObj:any={
    appCode:'',
    projectId:'',
  }

  replaceFields = {
    key: 'id',
    title: 'text',
    children:'children'
  };
  treeData:Array<any> = [];
  menuFlag:boolean = true;

  nodeIdData:Array<any> = [];

  activeMenu:string = '三维模型';

  bimModelClick(val){
    this.activeMenu=val;
  }
  drawingsClick(val){
    this.activeMenu=val;
  }

  menuClick({ item, key, keyPath }){
    switch (key) {
      case '选中':
        this.sendMessage('doSelect', this.nodeIdData);
        break;
      case '聚焦':
        this.sendMessage('doZoom', this.nodeIdData);
        break;
      case '隔离':
        this.sendMessage('doIsolate', this.nodeIdData);
        break;
    }
  }
  rightClick(event){
    const itemChild=event.node.$vnode.data.props.dataRef.children;
    if(itemChild.length>0){
      this.getNodeIdData(itemChild);
    }else {
      this.nodeIdData=[];
      this.nodeIdData.push(this.ModelID + '^' +event.node.$vnode.data.props.dataRef.id)
    }
  }

  onSelect(selectedKeys, info) {
    const item=info.node.$vnode.data.props.dataRef;
    if(item.children.length===0){
      let nodeId=this.ModelID + '^' +item.id
      this.sendMessage('onSelect', nodeId)
    }
  }

  sendMessage(methodName: string, data?: any) {
    let value = {methodName: methodName};
    if (data) {
      //@ts-ignore
      this.$set(value, 'data', data)}
    //@ts-ignore
    let frame1 = document.getElementById("iframe").contentWindow;
    frame1.postMessage(value, "*");
  }

  getNodeIdData(itemChild){
    this.nodeIdData=[];
    Utils.deepFind(itemChild, item => {
      if(item.children.length===0){
        this.nodeIdData.push(this.ModelID + '^' +item.id)
      }
      return false;
    }, "children" )
  }

  backClick(){
    this.menuFlag=!this.menuFlag;
  }
  viewID: string = '';
  created() {
    this.iframeURL=`${env.host}/BIMe/index.html`;
    // this.iframeURL = 'http://10.20.105.28:8088/index.html'
    this.appCode=this.$route.query.appCode;
    this.personId=this.$route.query.personId;
    this.workflowInstanceId=this.$route.query.workflowInstanceId;
    this.designFileId=this.$route.query.designFileId;
    this.name=this.$route.query.name;
    this.VaultID=this.$route.query.VaultID;
    this.ModelID=this.$route.query.ModelID;
    // this.FileName=this.$route.query.FileName;
    this.annotationId=this.$route.query?.annotationId;

    this.idObj.appCode=this.$route.query?.appCode;
    this.idObj.projectId=this.$route.query?.projectId;
    this.treeData = [];
    axios.get('https://bime.ctesi.com.cn/Model/GetAllViews', {
      params: {
        VaultID: this.VaultID,
        ModelID:  this.ModelID
      }
    }).then((res:any)=> {
      this.treeData.push({text: this.name.split('.')[0],children:res.map((i)=> {
        return {text: i.name,id: i.id,children:[],viewFlag: true}
      })});
      const idArr = [...new Set(res.map((r)=> Number(r.id)))].sort()
      // console.log(idArr)
      if (this.$route.query.FileName) {
        this.viewID = this.$route.query.FileName as string
      }else {
        if (Array.isArray(res) && res.length) {
          if (idArr.length) {
            //@ts-ignore
            if (idArr[0].toString()==='NaN') {
              this.viewID = res[0].id
            }else {
              //@ts-ignore
              this.viewID = idArr[0].toString()
            }
          }
        }
      }
      this.getModelStructureTree();
      this.initMessage();
    })
  }
  initMessage() {
    const query = Utils.GetRequest();
    let data={
      appCode: this.appCode,
      personId: this.personId,
      workflowInstanceId: this.workflowInstanceId,
      designFileId: this.designFileId,
      VaultID: this.VaultID,
      ModelID: this.ModelID,
      FileName: this.viewID,
      name: this.name,
      annotationId: this.annotationId??'',
      server:'https://bime.ctesi.com.cn',
      lightFlag: query && query.hasOwnProperty('lightFlag')?query.lightFlag==='true'?true:query.lightFlag==='false'?false:undefined:undefined,
    }
    window.addEventListener("message",(event)=>{
      if(event.data.finished===0){
        this.sendMessage('init', data)
      }
    })
  }
  getModelStructureTree() {
    axios.get( 'https://bime.ctesi.com.cn/Model/ParseModelStructureTree', {
      params: {
        VaultID: this.VaultID,
        ModelID: this.ModelID,
        FileName: this.viewID,
        name: this.name,
        NodePath: '',
        VersionNO: '0',
        WithChild: 'true',
      },
    }).then((res:any)=>{
      //@ts-ignore
      // res.text=this.name.split('.')[0];
      // // res.text=res.name;
      // this.treeData.push(res)
      Utils.deepFind( this.treeData, item => {
        if (item.id===this.viewID && res.children ) {
          item.children = res.children[0].children
        }else if (item.viewFlag) {
          item.children = []
        }
        item['scopedSlots']={title:'title'};
        return false;
      }, "children" )
    }).finally(()=> {
      this.loadingViewTree = false;
      this.activeId = '';
    })
  }
  loadingViewTree: boolean = false;
  activeId: string = '';
  changeView(id: string) {
    this.loadingViewTree = true;
    this.activeId = id;
    this.viewID = id;
    this.sendMessage('changeView', { fileName: this.viewID })
    this.getModelStructureTree();
  }
}
</script>
<style lang="less" scoped>
@import "../../../../styles/public.module.less";
.wrap{
  .model-header{
    width: 100%;
    height: 58px;
    background:url("../../../../../src/assets/extends/coordinate/ModelAnnotation/顶部.png");
    background-size: 100% 100%;
    padding: 5px 13.021vw;
    background-color: #004898;
    color: #FFFFFF;
    .title{
      font-size: 26px;
      font-family: Source Han Sans CN;
      font-weight: 700;
    }
    .header-menu{
      display: flex;
      flex-flow: row nowrap;
    }

    .bim-model{
      height: 100%;
      padding-top: 8px;
    }
    .drawings{
      height: 100%;
      padding-top: 8px;
    }
    .active-item{
      display: inline-block;
      font-size: 18px;
      height: 100%;
      line-height: 44px;
      cursor: pointer;
      border-bottom: 5px solid transparent;
    }
    .activeBar{
      border-bottom: 5px solid #00EAFF;
    }
  }
  .model{
    width: 100%;
    height: calc(100vh - 58px);
    border: 0;
  }
  .model-menu{
    position: absolute;
    left: 0.521vw;
    top: 14vh;
    transition: all 1s;
    z-index: 1;
    .menu-content{
      position: relative;
      .menu-header{
        width: 16vw;
        height: 4.5vh;
        background: #0a3c74;
        border-radius: 16px 16px 0px 0px;
        border-bottom: 1px solid #4f5860;
        color: #fff;
        padding: 10px;
      }
      .menu-tree{
        width: 16vw;
        height: calc(80vh - 4.5vh);
        background: #192b3f;
        border-radius: 0px 0px 16px 16px;
        padding: 10px;
        overflow: auto;
        .scrollbar-default;
        .eye-icon  {
          margin-left: @spacing-large;
          :hover {
            transform: scale(1.1);
            color: white;
          }
        }
      }
      .back-btn{
        width: 20px;
        height: 122px;
        background:url("../../../../../src/assets/extends/coordinate/clipbord_l.png");
        background-size: 100% 100%;
        position: absolute;
        left: 16.042vw;
        top: 0;
        right: 0;
        bottom:0;
        margin: auto;
        cursor: pointer;
      }
      .show-btn{
        width: 20px;
        height: 122px;
        background:url("../../../../../src/assets/extends/coordinate/clipbord_r.png");
        background-size: 100% 100%;
        position: absolute;
        left: 16.042vw;
        top: 0;
        right: 0;
        bottom:0;
        margin: auto;
        cursor: pointer;
      }
    }
  }
  .hide-menu{
    position: absolute;
    left: -15.9375vw;
    top:14vh;
    transition: all 1s;
    z-index: 1;
  }
}
</style>
<style scoped lang="less">
/deep/.ant-tree.ant-tree-show-line li span.ant-tree-switcher {
  color: #fff;
  background: transparent;
  .anticon-file{
    color:#ffca28;
  }
}
/deep/.ant-tree li .ant-tree-node-content-wrapper{
  color: #fff;
}
/deep/.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected{
  background: #e6f7ff !important;
}
/deep/.ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
   background-color: #366fb1;
}
/deep/.ant-tree li .ant-tree-node-content-wrapper:hover{
  background-color: #366fb1;
}

/deep/.ant-menu{
  background-color:#17202F !important;
}
/deep/.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected{
  color: #5C92FF !important;
  .changeStyle
}
/deep/.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-active{
  color: #fff !important;
}
.changeStyle{
  background-color: rgba(42, 112, 253,0.24) !important;
  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: 400 !important;
  position: relative;
  transition: none !important;
  &::before{
    display: block;
    content: '';
    width: 2px;
    height: 100%;
    background: #2970FF;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
  }
}

</style>
