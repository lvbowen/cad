<template>
  <div
    class="field relevance-form"
  >
    <div class="field__label" :style="style" :class="{ 'required': ctrl.required }">{{ label }}</div>
    <div class="field__control" @click="onClick">
      <template v-if="name">{{ name }}</template>
      <span v-else-if="isEditState" class="placeholder">{{ inputPlaceholder }}</span>
    </div>
    <span
      class="icon aufontAll clear"
      v-if="!readonly && ctrl.value"
      @click.stop="clear"
    >&#xe994;</span>
    <i v-if="isEditState && !isScan" class="icon aufontAll h-icon-all-right-o"/>
    <i @click.stop="scan" v-if="isScan && isEditState" class="icon scan aufontAll h-icon-all-scan-o"/>
    <relevance-form-modal
      class="relevance-form-panel"
      v-control-back
      v-transfer-dom
      :value="val"
      :visible="showModal"
      :control="control"
      @change="onChange"
      @back="close"
    ></relevance-form-modal>
    <div class="relevanceSelectorMask" :class="selector.visible?'active':'deactivate'"/>

    <div class="relevanceSelector" :class="selector.visible?'show':'hide'">
      <nav>
        <div @click="cancelSelector">取消</div>
      </nav>
      <section class="relevanceList">
        <template v-for="item in selector.list">
          <span @click="selectItem(item)" class="listItem" :key="item.id">{{ item.name }}</span>
        </template>
      </section>
    </div>
    <a-modal
      :title="formTitle"
      :visible="visibleTreeDig"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      class="dialog-class"
      okText="确定"
      cancelText="取消"
      @ok="onModalOkTree"
      @cancel="onModalCancelTree"
    >
      <a-tree
        :defaultExpandedKeys="defaultExpandedKeys"
        :key="num"
        :loadData="onLoadData"
        :treeData="treeData"
        :loadedKeys="loadedKeys"
        :replaceFields="replaceFields"
        @select="onSelect">
      </a-tree>
    </a-modal>
  </div>
</template>


<script lang="ts">
//@ts-nocheck
import {Component, Vue, Prop, Watch, Inject, InjectReactive} from "vue-property-decorator";

import { H3Field } from 'h3-mobile-vue';
import { formApi, listApi } from "@cloudpivot/api";
import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";

import RelevanceFormModal from "./relevance-form-modal.vue";

import common from '@cloudpivot/common';

import ControlBack from '@cloudpivot/form/src/common/directives/control-back';

// import TransferDom from '../../../directives/transfer-dom';
import { deepCopy, parseUrlParam,treeArrFilter } from '@cloudpivot/form/utils';
import Modal from "ant-design-vue/lib/modal";
import "ant-design-vue/lib/modal/style/index.css";
import Tree from "ant-design-vue/lib/tree";
import axios from "axios";
import env from "../../../../../../../../entries/mobile/src/config/env";
import * as Type from "../../../../../../../../entries/mobile/extends/type";

interface bizSelectorOptions {
  schemaCode: string;

}

interface Selector {
  visible: boolean;
  selectedKeys: Array<string>;
  options: Array<string>;
  list: Array<string>;
}

interface FormFilter {
  propertyCode: string;
  propertyType: number;
  propertyValue: string;
}

@Component({
  name: "relevance-form",
  components: {
    RelevanceFormModal,
    H3Field,
    AModal: Modal,
    ATree: Tree
  },
  directives: {
    ControlBack,
    TransferDom: common.directives.transferDom
  }
})
export default class MobileRelevanceForm extends RelevanceFormControl {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  showModal: boolean = false;

  //树控件
  visibleTreeDig: boolean = false; //树控件弹窗
  full = false;
  treeData: Array<any> = [];
  replaceFields = {
    key: "id",
    title: "taskName",
  };
  currentNode: any;
  currentDicName: string = '';
  defaultExpandedKeys: Array<string> = [];
  num: number = 0;
  loadedKeys: Array<string> = [];
  //获取已配置的树形组件
  getTreeConfig() {
    axios.get(`${env.apiHost}/dataManage/treeComponet/getTreeConfig`,{
      params: {
        appCode: this.projectCode,
        schemaCode: this.$route.query.schemaCode
      }
    }).then((res:any)=> {
      if(res.errcode === 0) {
        // this.formConfigTree = res?.data?? [];
      }
    })
  }
  getTreeData() {
    axios.get(`${env.apiHost}/dataManage/treeComponet/getTreeData`,{
      params: {
        appCode: this.projectCode,
        dicName:  this.currentDicName,
        currentId: '',
        projectName: this.projectConfig?.projectName ?? ''
      }
    }).then((res:any)=> {
      if(res.errcode === 0) {
        this.treeData = res?.data?? [];
        this.defaultExpandedKeys = treeArrFilter(this.treeData,'children','children',(obj:{children:any[]})=> {
          return obj['children'] && obj['children'].length
        });
        this.loadedKeys = treeArrFilter(this.treeData,'children','children',(obj:{children:any[],childCount:number})=> {
          return obj['children'] && !obj['children'].length && !obj['childCount']
        })
        ++this.num;
      }
    })
  }
  onModalOkTree() {
    if(this.currentNode) this.ctrl.value = deepCopy({
      name: this.currentNode.taskName,
      id: this.currentNode.id,
      task_name: this.currentNode.taskName,
      code_name: this.currentNode.taskName
    })
    this.visibleTreeDig = false;
  }
  onModalCancelTree() {
    this.visibleTreeDig = false;
  }
  onLoadData(treeNode:any) {
    this.loadedKeys.push(treeNode.$vnode.data.key);
    return new Promise(resolve => {
      if (treeNode.dataRef.children != undefined && treeNode.dataRef.children.length > 0) { // 有值了直接渲染
        //@ts-ignore
        resolve();
        return;
      }
      axios.get(`${env.apiHost}/dataManage/treeComponet/getTreeData`,{
        params: {
          appCode: this.projectCode,
          dicName:  this.currentDicName,
          currentId: treeNode.$vnode.data.key,
          projectName: this.projectConfig?.projectName ?? ''
        }
      }).then((res:any)=> {
        if(res.errcode === 0) {
          treeNode.dataRef.children = res.data;
        }
      })
      //@ts-ignore
      resolve();
    });
  }
  onSelect(key:string,e:any) {
    this.currentNode = e.selectedNodes[0].data.props.dataRef
  }

  show() {
    this.showModal = true;
  }

  close() {
    this.showModal = false;
  }

  showError(text: string) {
    this.$h3.toast.show({
      text,
      autoHide: true,
      iconType: text.length < 8 ? "close" : ""
    });
  }

  get inputPlaceholder() {
    if (this.isScan) {
      return this.$t("cloudpivot.form.renderer.scanInput");
    }
    return this.placeholder;
  }

  clear() {
    this.ctrl.value = null;
  }

  scan() {
    // const url = "http://47.107.160.206/mobile/?corpId=dingcebb92833861bfd735c2f4657eb6378f&agentId=217572455&schemaCode=model_1_1&sheetCode=null&id=6d49f6149b9f4640931ae3a27732c670&mode=form"
    // const url = "http://47.107.160.206/mobile/?workflowInstanceId=435a94545f30415180772d57dd151777&workItemId=254ee20feb564a459a0b340f031ee649&corpId=dingcebb92833861bfd735c2f4657eb6378f&agentId=217572455&mode=form&isWorkFlow=true#/form/detail?workflowInstanceId=435a94545f30415180772d57dd151777&workitemId=254ee20feb564a459a0b340f031ee649";
    // const url = "http://47.107.160.206/mobile/el.html?c=1vgZIyqyIXS";
    //  const url = "http://47.107.160.206/mobile/el.html?w=1vh0cqhjIJO";
    // const url = "http://47.107.160.206/form/detail?sheetCode=ywff&objectId=PO_20.0_00000&schemaCode=ywff&isWorkFlow=false&return=%2Fapplication%2Fsilver%2Fapplication-list%2Fywff%3FparentId%3Dafeb204e719a6d9401719a77445e0002%26code%3Dywff%26openMode%26pcUrl%26queryCode%3D%26iframeAction%3Ddetai"
    //const url = "http://47.107.160.206/mobile/?corpId=dingcebb92833861bfd735c2f4657eb6378f&agentId=217572455&schemaCode=bd233&sheetCode=null&mode=form"
    RelevanceFormControl.service.scan(this.setVal);
    // this.setVal('34234234423423');
  }

  setVal(val: string) {
    const query: any = parseUrlParam(val);
    if (!query) {
      this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeError") as string);
      return;
    }
    let params: any = {}
    // 业务表单
    if (query.schemaCode && (query.id || query.objectId)) {
      params.schemaCode = query.schemaCode;
      params.objectId = query.id || query.objectId;
      params.sheetCode = query.sheetCode
      this.loadForm(params);
      return;
    }
    // 流程表单
    if (query.workflowInstanceId && query.workItemId) {
      params.workflowInstanceId = query.workflowInstanceId;
      params.workitemId = query.workItemId;
      this.loadForm(params);
      return;
    }
    // 外链业务表单
    if (query.c) {
      params.ssc = query.c;
      this.loadForm(params);
      return;
    }

    // 外链流程表单
    if (query.w) {
      this.externalLinkSheet(query.w);
      return;
    }
    // 批量打印二维码
    if (query.sCode) {
      this.shortCodeConfig(query.sCode);
      return;
    }

    if (query.workflowCode && query.corpId && query.agentId) {
      this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
      return;
    }
    if (query.schemaCode && !query.id && !query.objectId) {
      this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
      return;
    }

    this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeError") as string);
  }

  shortCodeConfig(sCode: string) {
    RelevanceFormControl.service.shortCodeConfig(sCode).then(res => {
      if (res.errcode === 0) {
        const json: any = JSON.parse(res.data.pairValue);
        const qrcodeParams = {
          formCode: json.sheetCode,
          schemaCode: json.schemaCode,
          objectId: json.id
        };
        this.loadForm(qrcodeParams);
      } else {
        this.showError(res.errmsg);
      }
    })
  }

  // 外链处理
  externalLinkSheet(id: string) {
    RelevanceFormControl.service.externalLinkSheet(id, 'w').then(res => {
      if (res.errcode === 0) {
        const workflowInstanceId = res.data.workflowInstanceId;
        if (workflowInstanceId) {
          const params = {
            workflowInstanceId
          }
          this.loadForm(params);
        }
      } else {
        this.showError(res.errmsg);
      }
    })
  }

  loadForm(params: any) {
    RelevanceFormControl.service.loadForm(params).then(async (res: any) => {
      if (res.errcode === 0) {
        const {schemaCode, data, loadedFromDb} = res.data.bizObject;
        if (schemaCode !== this.controlOpts.schemaCode) {
          this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
          return;
        }
        if (!loadedFromDb) {
          this.showError(this.$t("cloudpivot.form.runtime.tip.qrCodeNoData") as string);
          return;
        }
        const item = await this.convertForMappings(data);
        this.ctrl.value = item;
        setTimeout(() => {
          this.ctrl.value = deepCopy(item);
        }, 500);
      } else {
        this.showError(res.errmsg);
      }
    })
  }

  //Feature: releavance-form mobile selector
  private selector: Selector = {
    options: [],
    selectedKeys: [],
    visible: false,
    list: []
  }

  get val() {
    return this.ctrl.value || {};
  }

  get name() {
    if (!this.ctrl.value) {
      return "";
    }
    return this.parseDisplayFieldValue(this.ctrl.value[this.getDisplayField], this.getDisplayField)
  }

  get isEditState() {
    return !this.readonly || (this.showLink && this.ctrl.value && this.ctrl.value.id)
  }

  async onClick() {
    if (this.readonly) {
      if(this.showLink){
        super.open();
      }
    }else{
      const { data,errcode } = await axios.get(`${env.apiHost}/dataManage/treeComponet/getTreeConfig`,{
        params: {
          appCode: this.projectCode,
          schemaCode: this.$route.query.schemaCode
        }
      })
      if(errcode === 0) {
        let item = (data || []).filter((i)=> this.control.key === i.columnCode);
        if(item.length) {
          this.visibleTreeDig = true;
          this.currentDicName = item[0]?.dicName??'';
          this.getTreeData();
        }else {
          this.show();
        }
      }
    }
  }

  private initSelector() {
    this.selector.visible = false;
    this.selector.list = [];
    this.selector.selectedKeys = [];
    this.selector.options = [];
  }

  private getFormConditionFilters(sources: any, conditions: any): Array<FormFilter> {
    const
        filters: Array<FormFilter> = [],
        conditionMap = new Map();
    conditions.split(';').forEach((item: any) => {
      if (!item) return;
      const mimicryList = item.split(':');
      if (!Array.isArray(mimicryList)) return;
      conditionMap.set(mimicryList[0], mimicryList[1]);
    });
    const {queryConditions} = sources;
    if (!Array.isArray(queryConditions)) return filters;
    queryConditions.forEach(item => {
      filters.push({
        propertyCode: item.propertyCode,
        propertyType: item.propertyType,
        propertyValue: conditionMap.get(item.propertyCode) ?? ""
      })
    });
    return filters;
  }

  //Feature: relevance-form open mobile selector
  // onClick(): void {
  //   if (this.readonly) return;
  //   const {options} = this.control;
  //   if (!options) return;
  //   //query form condition
  //   const {queryCode, schemaCode, mobileConditions} = options;
  //   //get FormConfig
  //   this.$h3.toast.show({
  //     text:'加载中...',
  //     iconType:'loading'
  //   });
  //   listApi.getListConfigData({
  //     code: queryCode,
  //     schemaCode: schemaCode,
  //     clientType: 'APP'
  //   }).then(res => {
  //     if (res.errcode !== 0){
  //       this.$h3.toast.hide();
  //       return this.$message.error(res.errmsg as string);
  //     }
  //     return res;
  //   }).then(res => {
  //     return this.getFormConditionFilters(res.data, mobileConditions);
  //   }).then(filters => {
  //     return listApi.getQueryList({
  //       mobile: true,
  //       size: 9999,
  //       filters,
  //       page: 0,
  //       queryCode,
  //       schemaCode
  //     })
  //   }).then(res => {
  //     this.$h3.toast.hide();
  //     if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
  //     this.selector.list = res.data.content;
  //     this.selector.visible = true;
  //   })
  // }

  private selectItem(item) {
    this.onChange(item);
    this.selector.visible = false;
  }

  private cancelSelector() {
    this.initSelector();
  }

  async created() {
    //展示字段需取数据项列表中的relativePropertyCode;
    // let ls = await this.getRelativeDataList();
    // let dataModal: any = ls.find((c: any) => c.code === this.control.key);
    let dataModal: any = this.getDataItem(this.control.key, this.control.parentKey);
    if (!dataModal) {
      // 兼容列表查询条件没有传入DataItem。且查询条件只是存在主表；
      let ls = await this.getRelativeDataList(true);
      dataModal = ls.find((c: any) => c.code === this.control.key);
    }
    //覆盖数据项options中的displayField（表单设计中的displayField，若在数据模型中重新定义一次后，会导致与后台的展示字段对应不上，所以直接拿后台的展示字段即可）
    this.control.options.displayField = dataModal && dataModal.relativePropertyCode
        ? dataModal.relativePropertyCode
        : "name";
  }

  onChange(val: any) {
    if (val && Object.keys(val).length > 0) {
      this.ctrl.value = val;
      setTimeout(() => {
        this.ctrl.value = deepCopy(val);
      }, 500);
    } else {
      this.ctrl.value = null;
    }
    this.close();
  }
}
</script>

<style lang="less">
.relevance-form-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 100;
}

.relevance-form.vertical {
  display: block !important;

  .field__label {
    padding: 10px 0;
  }

  .field__control {
    padding-bottom: 10px;
  }

  .h-icon-all-right-o {
    position: absolute;
    bottom: 14px;
    right: 20px;
  }
}

.relevance-form {
  .required:before {
    content: "*";
    color: #f4454e;
    position: absolute;
    left: .5em;
  }
  &.field {
    .scan {
      height: .48rem;
      font-size: .48rem;
      line-height: .48rem;
      color: #888;
    }

    .clear {
      font-size: 12px;
      // float: right;
      margin-right: 6px;
      margin-bottom: 2px;
      line-height: 15px;
      color: #888;
      font-size: 15px;
    }
  }

  &.vertical {
    .clear {
      position: absolute;
      bottom: 11px;
      right: 32px;
    }
  }
}

.query-form {
  .field {
    text-align: left;
    display: -webkit-flex;
    display: flex;
    position: relative;
    min-height: 46px;
    font-size: 15px;
    padding-left: .4rem;
    padding-right: .4rem;
    -webkit-align-items: center;
    align-items: center;
    border-bottom: 1px solid #eee;

    .field__label {
      width: 106px;
      display: -webkit-flex;
      display: flex;
      -webkit-align-items: center;
      align-items: center;
      -webkit-flex-shrink: 0;
      flex-shrink: 0;
      color: rgba(0, 0, 0, .65);
    }

    .field__control {
      display: -webkit-flex;
      display: flex;
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-align-items: center;
      align-items: center;
      color: rgba(0, 0, 0, .65) !important;
      min-height: 1em;
      text-align: left;
      overflow: auto;

      .placeholder {
        color: #999;
      }
    }

    i.icon {
      color: #999;
      font-size: 10px;
      height: 13px;
    }
  }
}

.relevanceSelectorMask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  background-color: rgba(25, 25, 25, 0.4);
  transition: all .3s;
}

.active {
  display: flex;
}

.deactivate {
  display: none;
}


.relevanceSelector {
  position: fixed;
  bottom: 0;
  width: 100vw;
  height: 36vh;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  z-index: 99999;
  transition: all .3s;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px 0 rgba(25, 25, 25, 1);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;

  & > nav {
    display: flex;
    width: 100%;
    height: 16%;
    align-items: center;
    font-size: 16px;
    font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    padding-left: 10px;
    padding-right: 10px;

  }
}

.relevanceList {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 100%;
  height: 83%;

  & .listItem {
    display: flex;
    font-size: 18px;
    font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    margin-top: 3px;
    margin-bottom: 3px;
    justify-content: center;
  }
}

.show {
  bottom: 0;
}

.hide {
  bottom: -100vh;
}
</style>
<style scoped lang="less">
@import "~@cloudpivot/common/styles/mixins.less";
.dialog-class {
  /deep/ .ant-modal-body {
  .px2rem(height,400px);
  overflow: auto;
  }
  /deep/ .ant-modal-footer .ant-btn {
  .px2rem(font-size,16px);
  line-height: 1;
  }
}
</style>
