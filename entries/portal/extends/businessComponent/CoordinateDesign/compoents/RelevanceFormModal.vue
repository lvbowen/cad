<template>
  <a-modal
    :visible="showRelevanceTable"
    @ok="bind"
    :width="950"
    :maskClosable="false"
    :keyboard="false"
    :destroyOnClose="true"
    wrapClassName="relevance-form-modal"
    @cancel="onModalCancel">
    <template slot="title">
      {{ modelName }}
      <a-button
        type="primary"
        size="small"
        v-show="showAddForm"
        @click="toForm">新增</a-button>
    </template>
    <div class="flex flex-space-between">
      <div class="condition flex-wrap flex-center-align" :class="showMoreConditions?'lines':'line'">
        <div class="flex flex-center-align" v-for="(i,index) in tableFilters" :key="index">
          <div class="label-c">{{ i.label }}</div>
          <template v-if="[1,2].includes(i.propertyType)">
            <a-input-search
              class="flex-auto"
              :placeholder="`请输入${i.propertyValueName}`"
              v-model="i.propertyValue"
              @pressEnter="(e)=> enterSearch(e,i)"
              @search="(e)=> getDocumentList(e,i)"></a-input-search>
          </template>
          <template v-else-if="i.propertyType===7">
            <base-select
              :disabled="i.propertyCode==='baseType'"
              class="flex-auto"
              @changeValue="(val)=>changeValue(val,i.propertyCode)"
              :options="getDropOptions(i.options)"
              :value="i.propertyValue"/>
          </template>
          <template v-else-if="i.propertyType===8"></template>
          <template v-else-if="[50,51,60,61].includes(i.propertyType)">
            <staff-selector
              :options="depOptionsSingle"
              :disabled="false"
              @change="(val)=> onValueChangeDep(val,i)"
              :value="i.propertyValue"/>
          </template>
        </div>
        <span v-show="tableFilters.length>2" class="more" @click="showMoreConditions=!showMoreConditions"><a-icon :type="showMoreConditions?'up':'down'"/>{{ showMoreConditions?'收起':'更多' }}</span>
      </div>
      <a-button type="primary" @click="()=> {pageNum=0;getRelevanceList()}">查询</a-button>
    </div>
    <div class="">
      <a-table
        :key="num"
        rowKey="id"
        :data-source="lists"
        :columns="listsColumns"
        :loading="tableLoading"
        :customRow="customRow"
        :pagination="{
          current: this.pageNum+1,
          pageSize: this.pageSize,
          total: this.curTotal,
          onChange: this.paginationChange
        }">
        <template slot="index" slot-scope="t,r,index">
          <template v-if="activeRadio === index+1 || selectedRadioIndex===index+1">
            <a-radio :value="radioChecked" @change="()=> changeRadioChecked(radioChecked=!radioChecked,index+1)"></a-radio>
          </template>
          <div v-else>{{ index+1 }}</div>
        </template>
        <template
          style="display: inline"
          v-for="(s,index) in slots"
          :slot="s.key"
          slot-scope="t,r">
          <a-tooltip :key="index">
            <template slot="title">
              {{ trnasDisplayFieldValue(r.data[s.key],s.key) }}
            </template>
            <span v-if="[80,81].includes(s.type)" class="ref-status" @click="goFormDetail(r.data[s.key].schemaCode,r.data[s.key].id)">{{ trnasDisplayFieldValue(r.data[s.key],s.key) }}</span>
            <span v-else>{{ trnasDisplayFieldValue(r.data[s.key],s.key) }}</span>
          </a-tooltip>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch, Mixins, InjectReactive} from 'vue-property-decorator';
import Modal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/lib/modal/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Tooltip from 'ant-design-vue/lib/tooltip';
import 'ant-design-vue/lib/tooltip/style/index.css';
import Switch from 'ant-design-vue/lib/switch';
import 'ant-design-vue/lib/switch/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/style/index.css';
import BaseSelect from "../../deviceManagement/BaseSelect.vue";
import {TableColumn,RelevanceConditions} from "../../../type";
import {getTableList} from "../../../service/api";
import {formApi, listApi} from "@cloudpivot/api";
import {DataItemType} from "../../../../../../modules/@cloudpivot/list/src/typings/data-items";
import { FormControlType }  from "@cloudpivot/form/src/schema";
import staffSelector
  from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";
import { CommonMixins } from "../WorkingOutline/commonMixins";
import Utils from "../../../utils";
import {sheetConfig} from "../../../service/CoordinateDesign/common";

@Component({
  name: 'RelevanceFormModal',
  components: {
    AModal: Modal,
    AInputSearch: Input.Search,
    ATable: Table,
    ARadio: Radio,
    AButton: Button,
    ATooltip: Tooltip,
    ASwitch: Switch,
    AIcon: Icon,
    staffSelector,
    ASelect: Select,
    ASelectOptions: Select.options,
    BaseSelect
  }
})
export default class RelevanceFormModal extends Mixins(CommonMixins) {
  @InjectReactive("project") projectCode!: string;
  @Prop() showRelevanceTable!:boolean;
  @Prop() relevanceCode!:string;
  @Prop() relevanceQueryCode!:string;
  @Prop() relevanceConditions!:string;
  // @Prop() relevanceParentKey!:string;
  @Prop() selectedSubTabRowIndex!:number;
  @Prop() relevanceFormData!:any;
  @Prop() business!:string;
  @Prop() projectState!:string;
  @Prop() projectType!:string;
  @Prop() showAddForm!:boolean;
  @Prop() addFormQuery!:any;
  @Prop() defaultBaseType!:string;
  @Watch('showRelevanceTable',{ immediate: true})
  showModalListener(val){
    if(val) {
      this.pageNum = 0;
      this.lists = [];
      this.tableFilters = [];
      //@ts-ignore
      this.listsColumns = [ {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        align: 'center',
        // fixed: 'left',
        width: 80,
        scopedSlots: {customRender: 'index'},
      }];
      this.slots = [];
      this.selectedRadioIndex = -1;
      if(this.relevanceConditions) {
        const a = this.relevanceConditions.split(';') //1个条件
        a.map((item) => {
          const b = item.split(':')
          this.$set(this.conditionsObj,b[0],b[1].substr(1,b[1].length-2))
        })
      }
      console.log(this.conditionsObj)
      this.getBizModelName();
      this.getFormConfig(this.relevanceCode)
    }
  }
  async getFormConfig(relevanceCode: string) {
    const config = await sheetConfig({sheetCode: relevanceCode, schemaCode: relevanceCode});
    if (typeof config === "string") {
      return
    }
    this.formData.sheetConfig = config;
    this.getRefTableConfig();
    console.log(this.formData.sheetConfig, 11)
  }
  onModalCancel() {
    this.$emit('closeRelevanceModal')
  }
  //table
  num: number = 1;
  lists: any[] = [];
  listsColumns: TableColumn<any>[] = [];
  tableFilters: RelevanceConditions[] = [];
  tableLoading: boolean = false;
  pageNum: number = 0;
  pageSize: number = 10;
  curTotal: number = 0;
  paginationChange(page: number, pageSize: number) {
    this.pageNum = page-1;
    this.pageSize = pageSize;
    this.radioChecked = false;
    this.selectedRadioIndex = -1;
    this.getRelevanceList();
  }
  modelName: string = '';
  getBizModelName() {
    formApi.getBizModelName(this.relevanceCode??'').then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      //@ts-ignore
      this.modelName = res.data.name
    })
  }
  slots: {key:string;type:number}[] = [];
  conditionsObj:{[key:string]:string}={};
  getRefTableConfig() {
    listApi.getListConfigData({
      code: this.relevanceQueryCode??'',
      schemaCode: this.relevanceCode??'',
      clientType: 'PC',
      source: 1
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      if(res.data.queryColumns && Array.isArray(res.data.queryColumns)){
        res.data.queryColumns.map((item) => {
          this.listsColumns.push({
            title: item.name,
            key: item.propertyCode,
            dataIndex: item.propertyCode,
            scopedSlots: {customRender: item.propertyCode},
            ellipsis: true,
            width: 160,
            align: 'center',
          })
          this.slots.push({
            type: this.transPropertyCode(item.propertyCode),
            key: item.propertyCode
          })
        })
      }
      if(res.data.queryConditions && Array.isArray(res.data.queryConditions)) {
        res.data.queryConditions.map((item) => {
          if([FormControlType.Text,FormControlType.Textarea,FormControlType.Number,FormControlType.Dropdown,FormControlType.StaffSelector,FormControlType.StaffMultiSelector,FormControlType.DepartmentSelector,FormControlType.DepartmentMultiSelector].includes(this.transPropertyCode(item.propertyCode))) {
            if(this.transPropertyCode(item.propertyCode)===FormControlType.Dropdown && this.isJSONString(this.formData.sheetConfig[item.propertyCode].options as string)) {
            }else {
              this.tableFilters.push({
                propertyCode: item.propertyCode,
                propertyType: this.transPropertyCode(item.propertyCode),
                propertyValue: item.propertyCode==='baseType'?this.defaultBaseType:this.relevanceConditions.indexOf(item.propertyCode)>-1?this.getDefaultConditions(this.transPropertyCode(item.propertyCode),item.propertyCode):'',
                propertyValueName: '',
                label: item.name,
                options: this.formData.sheetConfig[item.propertyCode].options
              })
            }
          }
        })
      }
      this.getRelevanceList();
    })
  }
  transPropertyCode(filed:string) {
    let type:number = 1;
    for (const sheetConfigKey in this.formData.sheetConfig) {
      if (this.formData.sheetConfig.hasOwnProperty(filed)) {
        type = this.formData.sheetConfig[filed].type;
      }
    }
    return type;
  }
  getRelevanceList() {
    this.tableLoading = true;
    this.lists = [];
    getTableList({
      filters: this.tableFilters.map((i)=> {
        return {
          propertyCode: i.propertyCode,
          propertyType: i.propertyType,
          propertyValue: i.propertyType===FormControlType.StaffSelector&&i.propertyValue.length?JSON.stringify(i.propertyValue):i.propertyValue,
          propertyValueName: '',
          label: ''
        }
      }),
      mobile:false,
      page: this.pageNum,
      queryCode: this.relevanceQueryCode??'',
      schemaCode: this.relevanceCode??'',
      size: this.pageSize //0
      // //res
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return;
      this.lists = res.data?.content??[];
      this.curTotal = res.data?.totalElements??0;
      // this.num++
    }).finally(()=> {
      this.tableLoading = false;
    })
  }
  //pc查询条件:conditions 设置查询条件 1.非子表 2.子表  xxx.yyy
  getDefaultConditions(type:number,key:string) {
    console.log(this.relevanceFormData,key)
    // if (this.relevanceFormData) return ;
    const isSubTable = this.conditionsObj[key] && this.conditionsObj[key].indexOf('.')>-1;
    switch (type) {
      case FormControlType.Text:
      case FormControlType.Textarea:
      case FormControlType.Date:
      case FormControlType.Number:
        return isSubTable?this.relevanceFormData[this.conditionsObj[key].split('.')[0]][this.selectedSubTabRowIndex][this.conditionsObj[key].split('.')[1]]:this.relevanceFormData[this.conditionsObj[key]]
       break;
      case FormControlType.Logic:
        return ''
        break;
      case FormControlType.StaffSelector:
        return isSubTable?this.relevanceFormData[this.conditionsObj[key].split('.')[0]][this.selectedSubTabRowIndex][this.conditionsObj[key].split('.')[1]]:this.relevanceFormData[this.conditionsObj[key]]
        break;
      case FormControlType.Attachment:
        return ''
        break;
      case FormControlType.ApprovalOpinion:
        return ''
        break;
      case FormControlType.Sheet:
        return ''
        break;
      case FormControlType.RelevanceForm:
        return ''
        break;
      case FormControlType.Address:
        return ''
        break;
      case FormControlType.RelevanceFormEx:
        return ''
        break;
      default:
        return ''
    }
  }
  showMoreConditions: boolean = false;
  activeRadio: number|null = null;
  radioChecked: boolean = false;
  customRow(record, index) {
    return {
      on: {
        // 鼠标移入
        mouseenter: (event) => {
          this.activeRadio=index+1
        },
        mouseleave: (event)=> {
          this.activeRadio=null
        }
      }
    }
  };
  selectedRadioIndex: number = -1;
  changeRadioChecked(isChecked:boolean,selectedIndex: number) {
    this.radioChecked = isChecked;
    this.selectedRadioIndex = selectedIndex
  }
  //search
  enterSearch(e,i) {
    i.propertyValue = e.target.value;
    this.pageNum = 0;
    this.radioChecked = false;
    this.selectedRadioIndex = -1;
    this.getRelevanceList();
  }
  getDocumentList(keyword:string,i) {
    i.propertyValue = keyword;
    this.pageNum = 0;
    this.radioChecked = false;
    this.selectedRadioIndex = -1;
    this.getRelevanceList();
  }
  //选人/部门控件
  depOptionsSingle:any = {
    selectOrg: true,
    selectUser: true,
    showModel: true,
    mulpitle: false,
    showSelect: true,
    placeholder: '请选择',
    title: '选择部门/联系人'
  };
  onValueChangeDep(val,i) {
    i.propertyValue = val;
  }
  //bind
  bind() {
    if(this.selectedRadioIndex!==-1) {
      this.$emit('bindPerson',this.lists[this.selectedRadioIndex-1].data);
      this.onModalCancel();
    }else {
      this.$message.warning('请先选择！')
    }
  }
  toForm() {
    Utils.goForm(this,'add',this.addFormQuery,this.isDingTalk)
  }
  //drop
  getDropOptions(options:string) {
    if (!options) return [];
    return options.split(';')
  }
  changeValue(val,property:string) {
    this.tableFilters.map((item)=> {
       if (item.propertyCode===property) {
         item.propertyValue = val;
       }
    })
  }
}
</script>

<style scoped lang="less">
@import '../../../styles/public.module.less';
/deep/ .relevance-form-modal {
  .ant-modal-body {
    height: 600px;
    overflow: auto;
  }
  .condition {
    width: calc(100% - 100px);
    margin-bottom: @spacing-base;

    overflow: hidden;
    position: relative;
    >div {
      width: calc(50% - 2 * @spacing-large);
      margin-right: @spacing-large;
      margin-bottom: @spacing-base;
      .label-c {
        flex-basis: 100px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        //word-break: keep-all;
        margin-right: @spacing-base;
      }
      .ant-input-search {
        width: auto;
      }
      .ant-select {
        .full-width
      }
    }
    >.more {
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .lines {
    height: auto;
  }
  .line {
    height: 35px;
  }
  .ref-status {
    color:#2970ff;
    cursor: pointer;
  }
}
</style>
