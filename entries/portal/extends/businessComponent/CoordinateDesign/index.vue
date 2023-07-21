<template>
  <div class="routerWrap flex-column">
    <a-header
      :activeMenuConfig="activeMenuConfig"
      :activeMenu="activeMenu"
      @menuTab="menuTab"
      :treeArr="treeArr"></a-header>
    <!-- <div class="box">
      <div class="wrap-content flex-space-between flex-auto">
        <left-menu
          :class="flag?'left-menu':'flag-menu'"
          v-if="leftMenuObj.leftMenuList.length>0"
          :leftMenuObj="leftMenuObj"
          @changeItemBar="changeItemBar"></left-menu>
        <div :class="flag?'route-component':'route-flag'" :style="{width:leftMenuObj.leftMenuList.length>0?!flag?'99.6%':'90%':'100%'}">
          <div style="width:100%;height:100%;padding:0 20px">
            <router-view />
          </div>
        </div>
      </div>
    </div> -->
    <div class="routerViewContainer">
      <div v-if="leftMenuObj.leftMenuList.length>0" class="treeContainer">
        <left-menu
          class="leftTree"
          :class="flag?'left-menu':'flag-menu'"
          v-if="leftMenuObj.leftMenuList.length>0"
          :leftMenuObj="leftMenuObj"
          @changeItemBar="changeItemBar"></left-menu>
        <router-view class="fullPage full-height overflow-hidden" :class="openType==='BizModel'?'overflow-hidden':''"/>
      </div>
      <router-view v-else/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component,InjectReactive, Vue,Watch} from "vue-property-decorator";

import Header from "./Header/index.vue";
import LeftMenu from "./LeftMenu/leftMenu.vue";
import * as Type from "../../type";
import * as Api from "../../service/api";
import Utils from "../../utils";
Component.registerHooks(['beforeRouteEnter','beforeRouteUpdate','beforeRouteLeave']);
@Component({
  name: "index",
  components: {
    AHeader:Header,
    LeftMenu
  },
})
export default class index extends Vue {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive("projectConfig") projectConfig?: Type.ProjectConfig;
  projectName:string = "";

  treeArr:Array<any> =[];

  leftMenuObj: {
    menuTitle:string | null,
    leftMenuList:Array<any>;
    activeIndex:number | null;
  }= {
    menuTitle: "",
    leftMenuList:[],
    activeIndex:0,
  };

  activeMenuConfig={
    "Workbench":"我的首页",
    "Project":"项目管理",
    // "SystemManagement":"标准知识库",
    // "DigitalHandover":"数字移交",
    // "DataHomepage":"数据中心",
    // "CoordinateDesign": '问题反馈'
  }

  activeMenu="";
  token:any='';
  //TODO 激活目录 start
  @Watch('$route', {deep:true,immediate:true})
  routeListener(to,old) {
    this.changeMenu(to.path as string);
  }
  changeMenu(path:string) {
    const key = Object.keys(this.activeMenuConfig).find(item=>item.toLowerCase()===path.slice(1).split("/")[0].toLowerCase());
    if (key) {
      this.leftMenuObj.menuTitle = '';
      this.leftMenuObj.leftMenuList = [];
      this.leftMenuObj.activeIndex = 0;
      this.activeMenu = this.activeMenuConfig[key];
    }else {
      // eslint-disable-next-line no-shadow
      Utils.deepFind(this.treeArr,(item,index,level)=> {
        if (item.pcUrl===this.$route.fullPath){
          if (level===0) {
            this.activeMenu = item.name;
            this.init();
            return false
          }else if (level===1){
            Utils.deepFind(this.treeArr,(i)=> {
              if(i.id===item.parentId) {
                this.activeMenu = i.name;
                this.init();
              }
              return false
            },'children')
          }
        }
        return false
      },'children')
    }
  }
  //TODO end
  beforeRouteEnter(to,from,next){
    if(to.name === "ProjectList"){
      localStorage.setItem("listStyleIndex",'1');
      localStorage.setItem("projectName","");
      localStorage.setItem("menuIndex","0");
      localStorage.setItem("selectedKey","0");
    }
    next(vm=>{
      // debugger
      // const routeNames = to.path.slice(1).split("/");
      // // if(to.meta.leftMenuShow && to.meta.leftMenuShow===true){
      // //   vm.flag=true;
      // // }else{
      // //   vm.flag=false;
      // // }
      // const key = Object.keys(vm.activeMenuConfig).find(item=>item.toLowerCase()===routeNames[0].toLowerCase());
      // if(key){
      //   vm.activeMenu = vm.activeMenuConfig[key];
      // }else{
      //   vm.activeMenu="";
      // }
    })
  }

  beforeRouteUpdate(to,from,next){
    // this.init();
    // if(to.meta.leftMenuShow && to.meta.leftMenuShow===true){
    //   this.flag=true;
    // }else{
    //   this.flag=false;
    // }
    next();
  }

  beforeRouteLeave(to,from,next){
    if(from.name === "ProjectList"){
      localStorage.setItem("listStyleIndex",'1');
      localStorage.setItem("projectName","");
      localStorage.setItem("menuIndex","0");
      localStorage.setItem("selectedKey","0");
    }
    next();
  }

  menuTab(obj){
    this.leftMenuObj=obj;
  }
  openType: string = '';
  changeItemBar(item){
    this.openType = item.type;
    if(item.type==="Page"){
      if(item.pcUrl===''){
        this.$message.error('页面地址未设置，请联系管理员！');
        this.$router.push({name:'Empty'});
        return;
      }
      if(item.openMode==='NEW_PAGE_MODE'){
        this.$router.push({name:'Empty'});
        window.open(item.pcUrl+`?access_token=${this.token}`,"_blank");
      }else {
        this.$router.push({path:item.pcUrl});
      }
    }else if(item.type==="BizModel"){
      this.goRouteBizModel(item);
    }
  }

  goRouteBizModel(item){
    this.$router
      .push({
        name: "applicationList",
        params: {
          appCode: item.appCode,
          schemaCode: item.code,
        },
        query: {
          parentId: item.parentId,
          code: item.code,
          openMode: item.openMode,
          pcUrl: item.pcUrl,
          queryCode: '',
        },
      })
      .catch((err: any) => {
        err;
      });
  }

  init(){
    const itemIndex = this.treeArr.findIndex(item=>item.name===this.activeMenu);
    if(itemIndex>-1){
      if(this.treeArr[itemIndex].children){
        this.leftMenuObj.menuTitle= this.treeArr[itemIndex].name;
        this.leftMenuObj.leftMenuList = this.treeArr[itemIndex].children;
        this.leftMenuObj.activeIndex = this.leftMenuObj.leftMenuList.findIndex(item=>item.pcUrl===this.$route.fullPath);
      }
    }
  }

  created(){
    this.token=localStorage.getItem('token');
    Api.getAppList({appCode:this.projectCode??"",isMobile:false}).then(res=>{
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      this.treeArr=res.data;
      this.changeMenu(this.$route.path as string);
      this.init();
    })
  }
  flag = true;
}
</script>

<style lang="less" scoped>
@import "../../styles/public.module.less";
.routerWrap{
  background-color:#f1f5f9;
  position: relative;
  // .box{
  //   height:calc(~'100% - 64px');
  //   position: relative;
  //   .top{
  //     height: 18%;
  //     //background-color:#004898;
  //     background: url('../../../src/assets/extends/coordinate/bg.png');
  //   }
  //   .wrap-content{
  //     width: 100%;
  //     height: 97%;
  //     padding: 0 4vw;
  //     position: absolute;
  //     top: 3%;
  //     left:0;
  //     .route-component{
  //       height: 100%;
  //       overflow:auto;
  //       .scrollbar-default;
  //     }
  //     .route-flag{
  //       height: 100%;
  //     }
  //     .left-menu{
  //       left:0;
  //       top: 0;
  //       transition:all .3s;
  //     }
  //     .flag-menu{
  //       position: absolute;
  //       left:-50%;
  //       top: 0;
  //       z-index:1;
  //       transition:all .8s;
  //     }
  //   }
  // }
  .routerViewContainer{
    position: absolute;
    top: 4.9479vw;
    left: 0;
    right: 0;
    bottom: 0;
    padding: .5208vw;
  }
  .treeContainer{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-flow: row nowrap;
    padding: 0 5.2083vw;
    .leftTree{
      margin-right: 1.0417vw;
    }
    /deep/ .fullPage{
      //flex: 1;
      width: -webkit-fill-available;
      .list-header>div:first-child {
        color: #FFFFFF;
      }
      .h-icon-all-filter-o,.h-icon-all-setting-o {
        color: #FFFFFF;
      }
      //hidden 导入，导出，打印二维码，修改二维码
      .list-action-import,.list-action-export,.list-action-qr_code,.list-action-editowner,.list-action-batch_print {
        display: none;
      }
    }
  }
}
</style>
