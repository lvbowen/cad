<template>
  <div class="flex flex-space-between" :class="themeType==='dark'?'dark':'light'">
    <div>
      <template v-if="showBack">
        <a-icon type="left" @click="$router.go(-1)"/><span class="return" @click="$router.go(-1)">返回</span>
      </template>
      <template v-else>
        <b>当前用户:{{ userName }}</b>
      </template>
      <!--      <a-button @click="changeUer" type="link">-->
      <!--        <span>切换用户</span>-->

      <!--      </a-button>-->
    </div>
    <div class="flex flex-center-align">
      <template v-if="$route.name==='ProjectTask'">
        <template v-if="themeType==='dark'">
          <img
            v-if="isExpand"
            title="收缩"
            src="../../../../../src/assets/extends/CoordinateDesign/External/收缩(1).png"
            alt=""
            @click="changeExpandState">
          <img
            v-else
            title="展开"
            src="../../../../../src/assets/extends/CoordinateDesign/External/展开.png"
            alt=""
            @click="changeExpandState">
        </template>
        <template v-else>
          <img
            v-if="isExpand"
            title="收缩"
            src="../../../../../src/assets/extends/CoordinateDesign/External/收缩.png"
            alt=""
            @click="changeExpandState">
          <img
            v-else
            title="展开"
            src="../../../../../src/assets/extends/CoordinateDesign/External/展开(1).png"
            alt=""
            @click="changeExpandState">
        </template>
      </template>
      <a-icon
        type="swap"
        @click="updateClientTheme"
        title="换肤"
        v-if="!isRevitEnv"/>
      <template v-if="!isRevitEnv">
        <img
          v-if="themeType==='dark'"
          @click="setWorkspace"
          src="../../../../../src/assets/extends/CoordinateDesign/External/下载目录(1).png"
          alt="设置工作目录"
          title="设置工作空间">
        <img
          v-else
          @click="setWorkspace"
          src="../../../../../src/assets/extends/CoordinateDesign/External/下载目录.png"
          alt="设置工作空间"
          title="设置工作目录">
      </template>
      <a-icon
        type="sync"
        @click="init"
        title="刷新"/>
      <a-icon type="logout" @click="changeUer" title="退出"/>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue,Prop } from 'vue-property-decorator';
  import{ Icon,Button } from "@h3/antd-vue";
  import { updateClientTheme } from "../../../../service/CoordinateDesign/External";
  import {EventBus} from "../v2/bus";
  import env from "@/config/env";
  @Component({
    name:"UserInfo",
    components:{
      [Icon.name]:Icon,
      [Button.name]:Button
    }
  })
  export default class UserInfo extends Vue {
    @Prop() showBack!: boolean;
    @Prop() clientId!:string;
    userName:string="";

    created(){
      // this.userName=localStorage.getItem("user_name")??"";
      const user:any = sessionStorage.getItem('user')
      if (user) {
        this.userName = JSON.parse(user).name
      }
      this.isRevitEnv = navigator.userAgent.indexOf('Revit')>-1
      this.themeType = sessionStorage.getItem('themeType') as string;
      EventBus.$on('themeType',(themeType)=> {
        this.themeType = themeType
      })
    }

    init() {
      this.$emit('init')
    }
    themeType: string = '';
    updateClientTheme() {
      const themeType = sessionStorage.getItem('themeType')==='dark'?'light':'dark'
      updateClientTheme({
        themeType: themeType
      }).then((res)=> {
        if(res.errcode!==0) return this.$message.error(res.errmsg as string)
        if(!res.data) return;
        this.$message.success('成功');
        this.themeType = themeType;
        sessionStorage.setItem('themeType',themeType)
        EventBus.$emit?.('themeType',themeType);
      })
    }
    setWorkspace() {
      try {
        //@ts-ignore
        let txt = jsdesigntool.setConfiguration(this.clientId??'')
        console.log(txt, 'submitDesignTask');
      }catch (error) {
        console.log(`error==>${error}`)
      }
    }
    changeUer(){
      this.$router.push({
        name:"loginExternal"
      })
    }
    isExpand: boolean = false;
    changeExpandState() {
      this.$emit('changeExpandState',!this.isExpand);
      this.isExpand = !this.isExpand;
    }
    isRevitEnv: boolean = false;
  }
</script>

<style scoped lang="less">
@import '../../../../styles/public.module.less';
@import url('../v2/v2-public.less');
.return {
  cursor: pointer;
  &:hover {
    border-bottom: 1px solid;
  }
}
.anticon {
  margin: @spacing-base;
  color: #2573F1;
  font-size: 15px;
  &:hover {
    transition: all 0.3s;
    transform: scale(1.2);
  }
}
img {
  width: 15px;
  height: 15px;
  margin: @spacing-base;
  &:hover {
    transition: all 0.3s;
    transform: scale(1.2);
  }
}
</style>
