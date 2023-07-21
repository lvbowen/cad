<template>
  <div class="class-library-pro full-width flex flex-column">
    <div class="line">基本信息</div>
    <a-menu v-model="currentStage" mode="horizontal" @click="changeCurrentStage">
      <a-menu-item v-for="item in topBimCards" :key="item.id" :disabled="classLibraryId===''">
        {{ item.buttonName }}
      </a-menu-item>
    </a-menu>
    <a-menu v-model="currentStage" mode="horizontal" @click="changeCurrentSubStage">
      <a-menu-item v-for="item in subBimCards" :key="item.id" :disabled="classLibraryId===''">
        {{ item.buttonName }}
      </a-menu-item>
    </a-menu>
    <div class="search-btn flex flex-space-between">
      <a-input-search
        placeholder="请输入关键词"
        v-model="keyWords"
        :disabled="classLibraryId===''"
        @pressEnter="enterSearch"
        @search="getProList"></a-input-search>
      <div>
        <a-button
          @click="addPropertie"
          :disabled="editingKey !== '' || classLibraryId===''"
          type="primary">新增</a-button>
        <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteProperties()">
          <a-button
            :disabled="editingKey !== '' || classLibraryId===''"
            type="primary">删除</a-button>
        </a-popconfirm>
      </div>
    </div>
    <div class="pro-table flex-1">
      <a-table
        bordered
        :key="num"
        :data-source="defaultPagesData"
        :columns="defaultPagesColumns"
        :loading="tableLoading"
        :rowSelection="rowSelection"
        :pagination="false">
        <template
          v-for="col in ['propertyName','englishName','type','unit','deliveryLevel']"
          :slot="col"
          slot-scope="text, record, index"
        >
          <span :key="col" class="flex-1">
            <a-input
              v-if="col==='propertyName' && record.editable"
              style="margin: 5px 0;"
              :value="text"
              @change="e => handleChange(e.target.value, record.id, col)"
            />
            <a-input
              v-else-if="col==='englishName' && record.editable"
              style="margin: 5px 0;"
              :value="text"
              @change="e => handleChange(e.target.value, record.id, col)"
            />
            <a-input
              v-else-if="col==='unit' && record.editable"
              style="margin: 5px 0;"
              :value="text"
              @change="e => handleChange(e.target.value, record.id, col)"
            />
            <a-select
              v-else-if="col==='type' && record.editable"
              v-model="record.type"
              @change="(val)=> handleChange(val,record.id,'type')">
              <a-select-option
                v-for="value in typeOptions"
                :key="value.value">
                {{ value.label }}
              </a-select-option>
            </a-select>
            <a-select
              v-else-if="col==='deliveryLevel' && record.editable"
              v-model="record.deliveryLevel"
              @change="(val)=> handleChange(val,record.id,'deliveryLevel')">
              <a-select-option
                v-for="value in deliveryLevelOptions"
                :key="value.value">
                {{ value.label }}
              </a-select-option>
            </a-select>
            <template v-else>
              <span>{{ text }}</span>
            </template>
          </span>
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <div class="editable-row-operations">
            <span v-if="record.editable && record.isEdit">
              <a @click="() => save(record.id,record)" :class="editingKey===record.id?'success-color':''">保存</a>
              <a @click="() => cancel(record.id,record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
            </span>
            <span v-else-if="record.isEdit">
              <a :disabled="editingKey !== ''" @click="() => edit(record.id,record)" :class="editingKey || editingKey.indexOf('-')>-1?'':'base-color'">编辑</a>
              <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteProperty(record)">
                <a :disabled="editingKey !== ''" :class="editingKey || editingKey.indexOf('-')>-1?'':'warning-color'">删除</a>
              </a-popconfirm>
            </span>
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Watch, InjectReactive} from 'vue-property-decorator';
import {
  BaseOptionType,
  BimCardMenu,
  ClassLibraryTreeProperties,
  ProjectConfig,
  StandardClass
} from "../../type";
import { TableColumn } from '../../type';
import {baseConfig} from "./config";
import Utils from '../../utils';
import { addOrUpdateProperty, deleteProperty,getPropertises,getTopBimCard,getSubBimCard,getBimCards} from "../../service/classLibrary";
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Popconfirm from "ant-design-vue/lib/popconfirm";
import 'ant-design-vue/lib/popconfirm/style/index';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Select from 'ant-design-vue/lib/select';
import 'ant-design-vue/lib/select/index';
import Menu from 'ant-design-vue/lib/menu';
import 'ant-design-vue/lib/menu/style/index.css';
@Component({
  name: 'ClassLibraryProperties',
  components: {
    AInputSearch: Input.Search,
    AButton: Button,
    APopconfirm: Popconfirm,
    ATable: Table,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    AMenu: Menu,
    AMenuItem: Menu.Item
  }
})
export default class ClassLibraryProperties extends Vue {
  @InjectReactive('project') projectCode!: string;
  @InjectReactive('projectConfig') projectConfig?:ProjectConfig
  @Prop() classLibraryId!:string;
  defaultPagesData: ClassLibraryTreeProperties[] = [];
  cacheDefaultPagesData: ClassLibraryTreeProperties[] = [];
  @Watch('classLibraryId',{deep:true})
  classlibraryIdListener(val){
    this.editingKey = '';
    if(val) {
      if(!this.topBimCards.length) return;
      this.currentStage = [this.topBimCards[0].id];
      this.getPropertises();
      this.getSubBimCards();
      //刷新列表
    }else {
      this.currentStage = [];
      this.defaultPagesData = [];
      this.cacheDefaultPagesData = []
    }
  }
  currentStage: string[] = [];
  num: number = 0;
  editingKey: string = '';
  tableLoading: boolean = false;
  defaultPagesColumns: TableColumn<any>[] = [
    {
      title: '名称',
      dataIndex: 'propertyName',
      key: 'propertyName',
      scopedSlots: { customRender: 'propertyName'}
    },
    {
      title: '英文名称',
      dataIndex: 'englishName',
      key: 'englishName',
      scopedSlots: { customRender: 'englishName'}
    },
    {
      title: '所属阶段',
      dataIndex: 'stageName',
      key: 'stageName',
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      scopedSlots: { customRender: 'type'}
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      scopedSlots: {customRender: 'unit'}
    },
    {
      title: '交付类别',
      dataIndex: 'deliveryLevel',
      key: 'deliveryLevel',
      width: 150,
      scopedSlots: {customRender: 'deliveryLevel'}
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
      width:160
    }
  ];
  typeOptions: BaseOptionType[] = [];
  deliveryLevelOptions: BaseOptionType[] = [];
  topBimCards: BimCardMenu[] = [];
  //sub
  subBimCards: BimCardMenu[] = [];
  changeCurrentSubStage({keyPath}:{keyPath:string[]}) {
    this.keyWords = '';
    this.currentStage = keyPath;
    this.getPropertises();
  }

  bimCards: BimCardMenu[] = [];
  keyWords: string = '';
  rowSelection: any = {
    onChange: (selectedRowKeys,selectedRows)=> {
      this.record(selectedRows);
    },
    getCheckboxProps: record => ({
      props: {
        disabled: record.isEdit === false,
        isEdit: record.isEdit,
      }
    })
  };
  selectedProIds: string[] = [];
  changeCurrentStage({keyPath}:{keyPath:string[]}) {
    this.keyWords = '';
    this.currentStage = keyPath;
    this.getPropertises();
    this.getSubBimCards();
  }
  record(selectedRows) {
    this.selectedProIds = selectedRows.map((i)=> { return i.id});
  }
  deleteProperties() {
    if(!this.selectedProIds.length) {return this.$message.warning('请至少选择一项！')}
    deleteProperty({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      deleteIds: this.selectedProIds
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.getPropertises();
    });
  }

  getPropertises() {
    this.tableLoading = true;
    this.defaultPagesData = [];
    this.cacheDefaultPagesData = []
    getPropertises({
      classLibraryId: this.classLibraryId,
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      stageId:this.currentStage[0]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.defaultPagesData = JSON.parse(JSON.stringify(res.data));
      this.cacheDefaultPagesData = JSON.parse(JSON.stringify(res.data));
      this.num++
    }).finally(()=> {
      this.tableLoading = false;
      this.selectedProIds = [];
    })
  }
  addPropertie() {
    const addRow: ClassLibraryTreeProperties = {
      id: Utils.uuid(),
      classLibraryId: this.classLibraryId,
      deliveryLevel: '',
      englishName: '',
      isDefault: 0,
      propertyName: '',
      type: '',
      unit: '',
      stageId: this.currentStage[0],
      stageName: '',
      editable: true,
      isEdit: true
    }
    this.bimCards.map((item) => {
      if(item.id === this.currentStage[0]) {
        addRow.stageName = item.buttonName;
      }
    })
    this.editingKey = addRow.id as string;
    this.defaultPagesData.push(addRow);
    this.num++
  }
  save(id:string) {
    let params: ClassLibraryTreeProperties[] = this.defaultPagesData.filter((i)=> {
      return i.id === id
    })
    if(!params.length) return;
    addOrUpdateProperty({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      property: {
        propertyName:params[0].propertyName,
        isDefault: params[0].isDefault,
        englishName: params[0].englishName,
        deliveryLevel: params[0].deliveryLevel,
        classLibraryId: params[0].classLibraryId,
        unit:params[0].unit,
        type:params[0].type,
        stageId: params[0].stageId,
        stageName: params[0].stageName,
        isEdit: params[0].isEdit,
        id: params[0].id.indexOf('-')===-1?params[0].id:''
      }
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      this.$message.success('保存成功！')
      this.editingKey = '';
      this.getPropertises();
    })
  }
  edit(key:string) {
    this.editingKey = key;
    this.defaultPagesData.map((item) => {
      if(item.id === key) {
        Object.assign(item,{editable:true})
      }
    })
    this.num++
  }
  handleChange(value, key, column) {
    this.defaultPagesData.map((item) => {
      if(item.id === key) {
        item[column] = value;
      }
    })
  }
  enterSearch(e) {
    this.keyWords = e.target.value;
    this.defaultPagesData = this.cacheDefaultPagesData.filter((item)=> {
      return item.propertyName.indexOf(this.keyWords)>-1 || item.englishName.indexOf(this.keyWords)>-1 || item.type.indexOf(this.keyWords)>-1 || item.stageName.indexOf(this.keyWords)>-1 || item.unit.indexOf(this.keyWords)>-1 ||item.deliveryLevel.indexOf(this.keyWords)>-1
    })
  }
  getProList(keyword) {
    this.keyWords = keyword;
    this.defaultPagesData = this.cacheDefaultPagesData.filter((item)=> {
      return item.propertyName.indexOf(this.keyWords)>-1 || item.englishName.indexOf(this.keyWords)>-1 || item.type.indexOf(this.keyWords)>-1 || item.stageName.indexOf(this.keyWords)>-1 || item.unit.indexOf(this.keyWords)>-1 ||item.deliveryLevel.indexOf(this.keyWords)>-1
    })
  }

  cancel(id:string) {
    this.editingKey = '';
    //add
    if(id.indexOf('-')>-1) {
      this.defaultPagesData.pop();
    }else { //edit
      const editIndex = this.defaultPagesData.findIndex((i) => {
        return i.id === id
      })
      this.defaultPagesData[editIndex] = JSON.parse(JSON.stringify(this.cacheDefaultPagesData[editIndex]));
    }
    this.num++;
  }
  deleteProperty(record: ClassLibraryTreeProperties) {
    deleteProperty({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      deleteIds: [record.id]
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success("删除成功！");
      this.getPropertises();
    });
  }
  getTopBimCard() {
    getTopBimCard({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.topBimCards = res.data
    })
  }
  getSubBimCards() {
    this.subBimCards = [];
    getSubBimCard({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??'',
      fatherTabId: this.currentStage[0]
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.subBimCards = res.data
    })
  }
  getBimCards() {
    getBimCards({
      appCode: this.projectCode??'',
      projectName: this.projectConfig?.projectName??''
    }).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string)
      if(!res.data) return
      this.bimCards = res.data??[]
    })
  }
  mounted() {
    this.typeOptions = baseConfig.typeOptions as BaseOptionType[];
    this.deliveryLevelOptions = baseConfig.deliveryLevelOptions as BaseOptionType[];
    this.getTopBimCard();
    this.getBimCards();
    // this.topBimCards = baseConfig.stageOptions as BaseOptionType[]
  }
}
</script>

<style scoped lang="less">
@import '../../styles/public.module.less';
@import '../systemConfig/system.module.less';
@import './classLibrary.modules.less';
.class-library-pro {
  height: calc(100% - 48px);
  /deep/ .ant-menu-item-selected {
    background: transparent !important;
  }
  >.line {
    border-left: 4px solid #107FFF;
    padding-left: @spacing-base;
    margin-bottom: @spacing-base;
  }
  /deep/ .ant-table-wrapper {
    height: 100%;
    overflow: auto;
    .ant-select {
      width: 100%;
    }
  }
  .editable-row-operations {
    a {
      margin-right:@spacing-base;
    }
  }
}
</style>
