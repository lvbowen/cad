<template>
  <a-modal
    title="新增资料"
    :visible="showApproval"
    :maskClosable="false"
    :keyboard="false"
    :closable="true"
    :footer="null"
    okText="确定"
    wrapClassName="add-approval-modal default-modal-style"
    :destroyOnClose="true">
    <template slot="closeIcon">
      <a-button type="primary" icon="plus" @click="openRelevanceTable('fzcx')">资料库</a-button>
      <a-button type="primary" @click="addApproval">确定</a-button>
      <a-button @click="closeApprovalModal" class="cancel">取消</a-button>
    </template>
    <div class="item" :class="isClickOk && !inputState.essential?'required-text':''">
      <span class="doc-label required">资料名称：</span>
      <a-input v-model="essential"></a-input>
    </div>
    <div class="item" :class="isClickOk && !inputState.selected?'required-text':''">
      <span class="doc-label required">是否必选：</span>
      <base-select
        :options="['非必选','必选']"
        :value="selected"
        @changeValue="val=> handleChange('selected',val)"/>
    </div>
    <div class="item">
      <span class="doc-label">描述：</span>
      <a-input v-model="description"></a-input>
    </div>
    <!--    <div class="item">-->
    <!--      <span class="doc-label">清单项类型：</span>-->
    <!--      <base-select-->
    <!--        :options="['批复文件','技术文件']"-->
    <!--        :value="selectedItemType"-->
    <!--        @changeValue="val => handleChange('itemType',val)"/>-->
    <!--    </div>-->
    <div class="rowFlexWrap">
      <a-form-model-item
        v-if="itemShow('itemType')"
        :colon="false"
        class="rowFlexItem"
        :label="getItemName('itemType')"
        prop="itemType">
        <span class="readonly" v-if="itemEdit('itemType')">{{ formData.data.itemType }}</span>
        <a-select
          v-else
          allowClear
          v-model="formData.data.itemType"
          :mode="getMultiple('itemType')?'multiple':'default'"
          @focus="updateOptions('itemType')"
          @change="updateOptions('itemType')"
          :placeholder="placeholder('itemType')"
          :options="getOptions('itemType')"></a-select>
      </a-form-model-item>
    </div>
    <relevance-form-modal
      :showRelevanceTable="showRelevanceTable"
      :relevanceConditions="relevanceConditions"
      @closeRelevanceModal="closeRelevanceModal"
      :relevanceFormData="relevanceFormData"
      :relevanceParentKey="relevanceParentKey"
      @bindPerson="bindPerson"
      :defaultBaseType="$route.name==='PreviousApprovalData'?'前期资料':'批复验收'"
      :relevanceQueryCode="relevanceQueryCode"
      :relevanceCode="relevanceCode"/>
  </a-modal>
</template>

<script lang="ts">
import {Vue, Component,Prop,Watch,Mixins} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/index';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import BaseSelect from "../../../deviceManagement/BaseSelect.vue";
import { ApprovalRow } from "../../../../type";
import RelevanceFormModal from "../../compoents/RelevanceFormModal.vue";
import {SheetConfig, sheetConfig} from "../../../../service/CoordinateDesign/common";
import {CommonMixins} from "../commonMixins";
import { FormModel,Select } from "@h3/antd-vue";
import {ValidationRule} from "@h3/antd-vue/types/form-model/form";
@Component({
  name: 'AddApprovalModal',
  components: {
    AModal: Modal,
    AInput: Input,
    AButton: Button,
    BaseSelect,
    RelevanceFormModal
  }
})

export default class AddApprovalModal extends Mixins(CommonMixins) {
  @Prop() showApproval!:boolean;
  @Prop() business!:string;
  @Prop() projectState!:string;
  @Prop() projectType!:string;
  @Prop() relevanceFormData!:any;
  @Prop() defaultEssential!:string;
  @Prop() defaultSelected!:string;
  @Prop() defaultDescription!:string;
  @Prop() defaultItemType!:string;
  @Watch('showApproval',{ deep:true})
  showApprovalListener(val) {
    if(val) {
      // this.isClickOk = false;
      this.formData.data.business = this.business;
      this.formData.data.projectType = this.projectType;
      this.formData.data.projectState = this.projectState;
      this.formData.data.baseType = this.$route.name==='PreviousApprovalData'?'前期资料':'批复验收';
      this.essential = this.defaultEssential??'';
      this.selected = this.defaultSelected??'非必填';
      this.description = this.defaultDescription??'';
      this.formData.data.itemType = this.defaultItemType??''
    }
  }
  closeApprovalModal() {
    this.$emit('closeApprovalModal');
  }
  addApproval() {
    this.isClickOk = true;
    let pass: boolean = false;
    this.inputRequired();
    pass = this.inputState.essential && this.inputState.selected;
    if(pass) {
      this.$emit('addRow',{essential: this.essential,selected:this.selected,description:this.description,itemType:this.formData.data.itemType,fzcx:this.fzcx})
    }
  }
  handleChange(flag:string,val:any) {
    switch (flag) {
      case 'selected':
        this.selected = val;
        break;
      // case 'itemType':
      //   this.selectedItemType = val;
      //  break;
    }
  }
  inputRequired() {
    this.inputState.essential = this.essential.trim()!=='';
    this.inputState.selected = this.selected.trim()!=='';
  }
  essential: string = '';
  selected: string = '非必填';
  description: string = '';
  fzcx: any = {
    id: ''
  };
  // selectedItemType: string = '批复文件';
  //必填-非必填状态
  isClickOk: boolean = false;
  inputState: {essential:boolean;selected:boolean} = {
    essential: false,//是否必填：true:必填并且已填  false:必填并且未填
    selected: false
  }
  //relevance
  closeRelevanceModal() {
    this.showRelevanceTable = false
  }
  bindPerson(data:ApprovalRow) {
    // console.log(data,'data')
    this.essential = data.essential;
    this.selected = data.selected;
    this.description = data.description;
    // this.selectedItemType = data.itemType;
    this.formData.data.itemType = data.itemType;
    this.fzcx.id = data?.id??''
  }
  // //formConfig
  // formDataConfig: any = {};
  formData:{data:any,
    rules:{[key:string]:(ValidationRule|{trigger:'blur' | 'change' | ['change', 'blur']})[]},
    sheetConfig:SheetConfig,
    optionsWatch:{[key:string]:()=>void},
    options:{[key:string]:{value:string,label:string,key:number,disabled:boolean}[]}}={
    data:{
      business:'',
      projectType: '',
      projectState: '',
      baseType: ''
    },
    rules:{},
    sheetConfig:{},
    optionsWatch:{},
    options:{},
  }
  //关联单选
  showRelevanceTable: boolean = false;
  relevanceCode: string = '';
  relevanceQueryCode: string = '';
  relevanceConditions: string = '';
  relevanceParentKey: string = '';
  openRelevanceTable(type:string) {
    this.relevanceConditions = this.formData.sheetConfig[type].conditions as string;
    this.relevanceCode = this.formData.sheetConfig[type].schemaCode as string;
    this.relevanceParentKey = this.formData.sheetConfig[type].parentKey as string;
    this.relevanceQueryCode = this.formData.sheetConfig[type].queryCode as string;
    this.showRelevanceTable = true
  }
  async mounted() {
    const config = await sheetConfig({sheetCode: "XTSJ_pfzlqdb", schemaCode: "XTSJ_pfzlqdb"});
    if (typeof config === "string") {
      return
    }
    this.formData.sheetConfig = config;
  }
}
</script>

<style scoped lang="less">
@import '../../../../styles/public.module.less';
//@import '../../../../styles/modal.modules.less';
@label-width: 120px;
/deep/ .add-approval-modal {
  .ant-modal {
    width: 30% !important;
    top: 25%;
    height:41%;
    .ant-modal-body {
      overflow: auto;
    }
    .ant-modal-header {
      background-color: #EAE8E8;
      .title {
        font-weight: bold;
        margin-left: @spacing-base;
      }
    }
    .ant-modal-content {
      .full-height;
      .flex;
      .flex-column;
      .ant-modal-close-x {
        width: auto;
        height: auto;
        .ant-btn {
          margin-right: @spacing-base;
        }
      }
      .cancel {
        background-color: #808080;
        color: #FFFFFF;
      }
      .base-input-width {
        .ant-input {
          width: calc(100% - @label-width);
        }
      }
      .base-select {
        display: inline-block;
        width: calc(100% - @label-width);
        .ant-select {
          .full-height;
        }
      }
      .item {
        margin-bottom: @spacing-large;
        margin-right: @spacing-large;
        .required {
          &::before {
            content: '*';
            color: red;
          }
        }
        .doc-label {
          width: @label-width;
          text-align: right;
          display: inline-block;
          white-space: nowrap;
          font-weight: bold;
        }
        .base-input-width;
      }
      .required-text {
        .ant-select-selection {
          border: 1px solid red;
        }
        .ant-input {
          border: 1px solid red;
        }
      }

    }
  }
}
.rowFlexWrap {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  margin-bottom:@spacing-base;
  margin-right: @spacing-large;
  /deep/.ant-form-item {
    margin-bottom: 0;
    display: flex;
    align-items: center;
    .ant-form-item-label {
      width: @label-width;
      padding-left: 20px;
      vertical-align: middle;
      white-space: normal;
      line-height: 20px;
      &> label {
        color: #000000A6;
        font-weight: bold;
      }
      &> label.ant-form-item-no-colon::after {
        content: ':';
      }
    }
    .ant-form-item-control-wrapper {
      width: calc(100% - 120px);
      .ant-select {
        .full-width;
      }
    }
  }
  .rowFlexItem {
    width: 100%;
    min-height: 30px;
    margin-bottom: 1/4 * @spacing-base;
    margin-top: 1/4 * @spacing-base;
  }
  .fullRowFlexItem{
    width: 100%;
    min-height: 30px;
    margin-bottom: 2px;
    margin-top: 2px;
  }
}
</style>
