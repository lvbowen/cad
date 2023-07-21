
<template>
  <div class="form-actions">
    <a-button @click="close">关闭</a-button>
    <a-button @click="archiveBtn($event)" v-if="flag==true">归档</a-button>
    <a-button
      :ref="ac.code+'Action'"
      v-for="(ac, index) in actions"
      v-show="ac.visible !== false"
      :key="ac.code"
      :disabled="ac.disabled === true"
      :type="index === 0 ? 'primary' : 'default'"
      @click="(e) => proxyAction(ac,e)"
      :class="[ ac.code ]"
    >{{ ac.text }}
    </a-button>
    <div
      class="prints-drop-down animated fadeIn"
      v-show="toShowPrints && setPdfConf"
      :style="printBtnListStyle"
      @click="printBtn($event)"
    >
      <div class="item-print">系统默认模板</div>
      <div class="item-print">打印模板</div>
    </div>
  </div>
</template>


<script lang="ts">

import {
  Component, Vue, Prop, Watch, InjectReactive
} from 'vue-property-decorator';

  import {
    Button
  } from '@h3/antd-vue';

  import { FormAction } from '../../form-action';

  import { FormActionButton } from '../../form-action-modal';

  import axios from "axios";

  import env from '@/config/env';


  @Component({
    name: 'form-actions',
    components: {
      AButton: Button
    }
  })
  export default class FormActions extends Vue {
    @Prop()
    actions !: FormActionButton[];

    @Prop({ type: Boolean }) toShowPrints!: Boolean;

    @Prop({ type: Boolean }) setPdfConf!: Boolean;
    @Prop()formObj!:any

    @InjectReactive('project') projectCode!: string;
    //@ts-ignore
    @InjectReactive('projectConfig') projectConfig?:Type.ProjectConfig;

    flag:boolean=true;


    printBtnListStyle = {} // 打印按钮下拉框 样式
    onAction(ac: any) {
      this.$emit('action', ac);
    }
    // 按钮点击代理
    proxyAction(ac: any, e) {
      // 打印按钮的下拉框 跟随 打印按钮
      if (ac.code == "print" && !Object.keys(this.printBtnListStyle).length) {
        let pl = e.target
        this.printBtnListStyle = {left: pl.offsetLeft+'px'}
        this.$nextTick(() => {
          this.onAction(ac)
        })
      } else {
        this.onAction(ac)
      }
    }

    printBtn(e: any) {
      this.$emit('propPrintClick', e.target.innerText);
    }

    @Watch('actions')
    changActions() {
      console.log(this.actions)
      setTimeout(() => {
        console.log(this.$refs['printAction'])
      })
    }

  close() {
    top?.postMessage("close",top?.origin);
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
      // 此处报错Object is possibly null： 对象可能是null
      // 类型断言成any类型，any类型上访问任何属性和方法都是被允许的
      // (window as any).open('','_self').close()
      //need update babel
      //(window as Window).open('','_self')?.close()
      const winObjReference = (window as Window).open('','_self');
      if(winObjReference){
        winObjReference.close();
      }
    }
  }
 archiveBtn(e:any){
  const val=e.view.Environment
  const obj = JSON.parse(this.formObj.bizSheet.draftAttributesJson)
    axios.post(`${env.apiHost}/api/doc/filed`,{
      appCode:this.projectCode,
      projectName:this.projectConfig?.projectName,
      bizObjectId:val.objectId,
      schemaCode:val.schemaCode
    })
    .then((res)=>{
      console.log(res)
      this.ifDisplay(val);
    })
 }
  ifDisplay(val:any){//判断按钮接口
      if(this.formObj.bizObject.data.xmjc_1!==''){
        axios.get(`${env.apiHost}/api/doc/isDisplay`,{
          params:{
            appCode:this.projectCode,
            projectName:this.projectConfig?.projectName,
            bizObjectId:val.objectId,
            schemaCode:val.schemaCode
          }
        })
            .then((res)=>{
              this.flag=res.data
            })
      }
  }
  mounted(){
    const val=window.Environment
    this.ifDisplay(val);
  }
  };


</script>


<style lang="less" scoped>
  .form-actions {
    // flex-grow: 1;
    display: flex;
    margin-left: 16px;
    text-align: right;

    button {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
    // 取消高亮
    .noHover{
      color: rgba(0, 0, 0, 0.65);
      background-color: #fff;
      border-color: #d9d9d9;
    }
    .noHover:hover{
      border: 1px solid #5291FF;
      color: #5291FF;
    }
  }
  .prints-drop-down {
    width: 116px;
    height: 72px;
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgba(30,85,255,0.15);
    background: #fff;
    position: absolute;
    top: 55px;
    z-index: 999;
    .item-print {
      text-align: left;
      height: 32px;
      line-height: 32px;
      padding: 5px 15px;
      &:hover {
        cursor: pointer;
        background: rgba(240,247,255,1);
        transition: 0.3s all;
      }
    }
  }
</style>
