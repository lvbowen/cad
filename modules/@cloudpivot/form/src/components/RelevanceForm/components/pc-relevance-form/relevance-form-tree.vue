<template>
  <div class="relevance-form-tree">
    <a-input
      :value="text"
      :readonly="true"
      :placeholder="placeholder"
      @click="onClick"
      @mouseover="onMouseenter"
      @mouseout="onMouseleave">
      <a-icon
        v-show="hover"
        slot="suffix"
        type="close-circle"
        @click="clear"
        @mouseenter="onMouseenter" />
      <a-icon v-show="!hover" slot="suffix" type="file" />
    </a-input>
    <a-modal
      :title="formTitle"
      :visible="visibleTreeDig"
      :width="full ? '100%' : '950px'"
      :destroyOnClose="true"
      :maskClosable="false"
      :keyboard="false"
      :class="{ 'full-modal': full, 'relevance-form': true }"
      :closable="!full"
      @ok="onModalOkTree"
      @cancel="onModalCancelTree"
    >
      <a-tooltip placement="top" v-show="!full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.fullScreen") }}</span>
        </template>
        <span @click="fullScreen(true)" class="fullscreen icon aufontAll">&#xe8e5;</span>
      </a-tooltip>

      <a-tooltip placement="top" v-show="full">
        <template slot="title">
          <span>{{ $t("cloudpivot.form.runtime.biz.smallScreen") }}</span>
        </template>
        <span @click="fullScreen(false)" class="fullscreen icon aufontAll">&#xe8e7;</span>
      </a-tooltip>
      <a-tree
        :loadData="onLoadData"
        :defaultExpandedKeys="defaultExpandedKeys"
        :key="num"
        :treeData="treeData"
        :loadedKeys="loadedKeys"
        :replaceFields="replaceFields"
        @select="onSelect">
      </a-tree>
    </a-modal>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch, Prop, InjectReactive} from "vue-property-decorator";
import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";
import cloneDeep from "lodash/cloneDeep";
import {
  DataItemType,
  RelevanceFormSelectMode,
  convertDataItemExp,
  RendererFormControl,
  FormControlType,
} from "@cloudpivot/form/schema";
import {
  // TreeSelect,
  Modal,
  Tooltip,
  Icon,
  Spin,
  Input,
  Tree
} from "@h3/antd-vue";
import axios from "axios";
import env from "../../../../../../../../entries/portal/src/config/env";
import * as Type from "../../../../../../../../entries/portal/extends/type";
import {treeArrFilter} from "../../../../../utils";

@Component({
  name: "relevance-form-tree",
  components: {
    ATooltip: Tooltip,
    AModal: Modal,
    AInput: Input,
    AIcon: Icon,
    ASpin: Spin,
    ATree: Tree
  },
})
export default class RelevanceFormTree extends RelevanceFormControl{
  @InjectReactive("project") projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;

  query = {};
  hover = false;
  full = false;
  //树控件
  visibleTreeDig: boolean = false; //树控件弹窗
  formConfigTree:{columnCode:string|null,dicName:string|null,id:string|null,mainTree:number|null,schemaCode:string|null,sequenceStatus:string|null}[] = [];
  currentDicName: string = '';
  treeData: Array<any> = [];
  replaceFields = {
    key: "id",
    title: "taskName",
  };
  selectedTree: string = '';
  currentNode: any;
  defaultExpandedKeys: Array<string> = [];
  num: number = 0;
  loadedKeys: Array<string> = [];
  get text() {
    //不用显示字段控制
    if (!this.ctrl.value) {
      return "";
    }
    if (!this.ctrl.value[this.getDisplayField]) {
      this.setLinkageValue();
    }
    return this.parseDisplayFieldValue(
        this.ctrl.value[this.getDisplayField],
        this.getDisplayField
    );
  }
  async onClick() {
    let item = this.formConfigTree.filter((i)=> this.control.key === i.columnCode);
    if(item.length) {
      this.visibleTreeDig = true;
      this.currentDicName = item[0]?.dicName??'';
      this.getTreeData();
      return
    }
  }
  fullScreen(full: boolean) {
    this.full = full;
  }
  onMouseenter() {
    this.hover = true;
  }
  onMouseleave() {
    this.hover = false;
  }
  clear() {
    this.ctrl.value = null;
  }
  //获取已配置的树形组件
  getTreeConfig() {
    axios.get(`${env.apiHost}/dataManage/treeComponet/getTreeConfig`,{
      params: {
        appCode: this.projectCode,
        schemaCode: this.$route.query.schemaCode
      }
    }).then((res:any)=> {
      if(res.errcode === 0) {
        this.formConfigTree = res?.data?? [];
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
  async onModalOkTree() {
    if(this.currentNode) this.setValue(cloneDeep({
      name: this.currentNode.taskName,
      id: this.currentNode.id,
      task_name: this.currentNode.taskName,
      code_name: this.currentNode.taskName
    }));
    this.visibleTreeDig = false;
  }
  onModalCancelTree() {
    this.visibleTreeDig = false;
  }
  mounted() {
    this.getTreeConfig()
  }
}
</script>

<style scoped lang="less">
.ant-input-suffix > i {
  color: #ccc;
}

.relevance-form-tree {
 height: 100%;
  .anticon-close-circle {
    cursor: pointer;
    transition: color 0.3s;
    font-size: 12px;

    &:hover {
      color: #999;
    }

    &:active {
      color: #666;
    }
  }
}

.fullscreen {
  position: absolute;
  top: 16px;
  right: 60px;
  cursor: pointer;
}

.full-modal .fullscreen {
  right: 16px;
}
.full-modal {
  /deep/ .ant-modal {
    height: 100%;
    top: 0;
    padding-bottom: 0;

    .ant-modal-content {
      height: 100%;
    }
  }
}
/deep/ .ant-modal-body {
  height: 400px;
  overflow: auto;
}
</style>