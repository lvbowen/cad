<!--
 * @Date: 2020-05-19 13:53:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-06-23 14:24:34
 * @FilePath: \frontend\modules\@cloudpivot\form\src\components\RelevanceForm\components\pc-relevance-form\relevance-form.vue
--> 

<template>
  <div>
    <template v-if="!readonly">
      <relevance-form-tree v-if="isTreeCtrl" :control="control" :parseDisplayFieldValue="parseDisplayFieldValue"/>
      <relevance-form-modal v-else-if="isModal" :control="control" :parseDisplayFieldValue="parseDisplayFieldValue"></relevance-form-modal>

      <relevance-form-dropdown v-else :control="control" :parseDisplayFieldValue="parseDisplayFieldValue"></relevance-form-dropdown>
    </template>

    <template v-else-if="ctrl.value">
      <a
        class="link"
        v-if="showLink"
        @click.stop.prevent="onClick">
        {{ lookUpModalValue }}
      </a>
      <div v-else>{{ lookUpModalValue }}</div>
    </template>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch, Prop, Provide, InjectReactive} from "vue-property-decorator";

import RelevanceFormDropdown from "./relevance-form-dropdown.vue";
import RelevanceFormModal from "./relevance-form-modal.vue";
import RelevanceFormTree from "./relevance-form-tree.vue";

import { RelevanceFormControl } from "@cloudpivot/form/src/common/controls/relevance-form-control";

import {
  RendererFormControl,
  RelevanceFormOptions,
  RelevanceFormSelectMode
} from "@cloudpivot/form/schema";

import { formApi, listApi } from "@cloudpivot/api";

import {
  // TreeSelect,
  Select,
  Tooltip,
  Icon,
  Spin
} from "@h3/antd-vue";
import axios from "axios";
import env from "../../../../../../../../entries/portal/src/config/env";
import * as Type from "../../../../../../../../entries/portal/extends/type";

@Component({
  name: "relevance-form",
  components: {
    RelevanceFormDropdown,
    RelevanceFormModal,
    RelevanceFormTree
  }
})
export default class RelevanceForm extends RelevanceFormControl {
  @InjectReactive("project") projectCode?: string;
  @InjectReactive('projectConfig') projectConfig?: Type.ProjectConfig;
  @Watch('readonly',{immediate:true})
  watchReadonly(val) {
    if(!val) {
      //获取已配置的树形组件
      axios.get(`${env.apiHost}/dataManage/treeComponet/getTreeConfig`,{
        params: {
          appCode: this.projectCode,
          schemaCode: this.$route.query.schemaCode || ''
        }
      }).then((res:any)=> {
        if(res.errcode === 0) {
          // @ts-ignore
          let item = (res?.data?? []).filter((i)=> this.control.key === i.columnCode);
          if(item.length) {
            this.isTreeCtrl = true;
          }
        }
      })
    }
  }
  isTreeCtrl: boolean = false;//树控件显示
  onClick() {
    this.open();
  }

  async created() {
    //展示字段需取数据项列表中的relativePropertyCode;
    // let ls = await this.getRelativeDataList();
    // let dataModal: any = ls.find((c: any) => c.code === this.control.key);
    let dataModal:any = this.getDataItem(this.control.key, this.control.parentKey);
    console.log('dataModal',dataModal)
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
}
</script>

<style scoped>

  a.link{
    word-break: break-all;
  }

</style>
