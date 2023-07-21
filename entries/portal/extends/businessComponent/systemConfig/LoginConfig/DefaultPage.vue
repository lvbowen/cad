<template>
  <div class="default-page">
    <a-button
      @click="add"
      :disabled="editingKey !== ''"
      type="primary">新增
    </a-button>
    <a-table
      bordered
      :key="num"
      :data-source="defaultPagesData"
      :columns="defaultPagesColumns"
      :pagination="false">
      <template
        v-for="col in ['departments','pages']"
        :slot="col"
        slot-scope="text, record, index"
      >
        <span :key="col" class="flex-1">
          <template v-if="col==='departments' && !record.editable">
            <template v-if="record">
              <span v-for="(dep,index) in record.departments" :key="index">{{ dep.name }};</span>
            </template>
          </template>
          <span
            v-else-if="col==='departments' && record.editable"
            style="margin: 5px 0;">
            <staff-selector
              :options="depOptions"
              :disabled="false"
              @change="onValueChange"
              :value="text"/>
          </span>
          <span v-else-if="col==='pages'">
            <a-radio-group
              :options="record.plainOptions"
              :disabled="!record.editable"
              :defaultValue="record.defaultCheckedValue"
              @change="onChange"/>
          </span>
          <template v-else>
            <span>{{ text }}</span>
          </template>
        </span>
      </template>
      <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record.id,record)" :class="editingKey===record.id?'success-color':''">保存</a>
            <a @click="() => cancel(record.id,record)" :class="editingKey===record.id?'cancel-color':''">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(record.id,record)" :class="editingKey || editingKey.length===4?'':'base-color'">编辑</a>
            <a-popconfirm title="删除后不可恢复哦，确认删除吗？" @confirm="deleteConfig(record.id)" :class="editingKey || editingKey.length===4?'':'warning-color'">
              <a :disabled="editingKey !== ''">删除</a>
            </a-popconfirm>
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive, Prop, Watch} from 'vue-property-decorator';
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Button from 'ant-design-vue/lib/button';
import 'ant-design-vue/lib/button/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Popconfirm from 'ant-design-vue/lib/popconfirm';
import 'ant-design-vue/lib/popconfirm/style/index';
import Radio from 'ant-design-vue/lib/radio';
import 'ant-design-vue/lib/radio/style/index.css';
import {PackageInfo, DefaultPages} from "../type";
import {getLoginConfig, deleteDefaultPages, updateDefaultPagesConfig} from "../../../service/api";
import staffSelector from "@cloudpivot/form/src/common/components/form-staff-selector/pc/staff-selector.vue";

@Component({
  name: 'DefaultPage',
  components: {
    AIcon: Icon,
    ATable: Table,
    AInput: Input,
    AButton: Button,
    APopconfirm: Popconfirm,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    staffSelector
  }
})
export default class DefaultPage extends Vue {
  @InjectReactive('project') projectCode!: string;
  @Prop({
    default: []
  }) setDefaultPagesData!: PackageInfo[];
  @Watch('setDefaultPagesData', {immediate: true})
  getPackageData(val) {
    this.defaultPagesData = JSON.parse(JSON.stringify(val));
    this.cacheDefaultPagesData = JSON.parse(JSON.stringify(val));
  }

  @Prop({
    default: []
  }) setDefaultPageRange?: string[];
  defaultPagesData: DefaultPages[] = [];
  defaultPagesColumns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: 80,
      customRender: (text, record, index) => `${index + 1}`,
    },
    {
      title: '部门名称',
      dataIndex: 'departments',
      key: 'departments',
      scopedSlots: {customRender: 'departments'},
    },
    {
      title: '页面设置',
      dataIndex: 'pages',
      key: 'pages',
      width: 550,
      scopedSlots: {customRender: 'pages'},
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 200,
      scopedSlots: {customRender: 'operation'},
    }
  ];
  cacheDefaultPagesData: DefaultPages[] = [];
  num: number = 1;
  editingKey: string = '';
  depOptions: any = {
    selectOrg: true,
    selectUser: false,
    showModel: true,
    mulpitle: true,
    showSelect: true,
    placeholder: '请选择',
    title: '部门多选'
  };
  defaultCheckedValue: string = '';

  add() {
    if(!this.setDefaultPageRange) {return}
    this.defaultCheckedValue = '';
    const addRow: DefaultPages = {
      id: this.rndNum(4), //id
      pages: {},
      departments: [],
      editable: true
    }
    this.editingKey = addRow.id as string;
    let options: any[] = [];
    this.setDefaultPageRange.map((i) => {
      options.push({
        label: i,
        value: i
      })
      addRow.pages[i] = false
    })
    addRow.plainOptions = options;
    addRow.defaultCheckedValue = '';
    this.defaultPagesData.push(addRow);
  };

  rndNum(n) {
    let rnd = "";
    for (let i = 0; i < n; i++)
      rnd += Math.floor(Math.random() * 10);
    return rnd;
  }

  edit(key, record) {
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.id)[0];
    this.editingKey = key;
    // @ts-ignore
    if (target) {
      target.editable = true;
      this.defaultPagesData = newData;
    }
  }

  handleChange(value, key, column) {
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      target[column] = value;
      this.defaultPagesData = newData;
    }
  }

  save(id: string = '', row) {
    if(!row.departments.length) { return this.$message.warning('部门选择必填！')}
    if(this.defaultCheckedValue==='') { return this.$message.warning('页面设置必填！')}
    const params = {
      appCode: this.projectCode ?? '',
      deptIds: [],
      pages: row.pages
    }
    params.deptIds = row.departments.map((i) => {
      return i.id
    });
    //编辑参数
    if (id.length !== 4) {
      Object.assign(params, {id: id});
    }
    if (params.pages) {
      for (const pagesKey in params.pages) {
        if (this.defaultCheckedValue.indexOf(pagesKey) > -1) {
          params.pages[pagesKey] = true
        } else {
          params.pages[pagesKey] = false
        }
      }
    }
    updateDefaultPagesConfig(params).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('修改成功！')
      this.editingKey = '';
      this.init()
    })
  }

  cancel(key, row) {
    // @ts-ignore
    this.editingKey = '';
    this.defaultCheckedValue = ''; //初始数据
    if (key.length === 4) {
      this.defaultPagesData = this.defaultPagesData.filter((i)=> { return i.id!==key});
      return
    }
    const newData = [...this.defaultPagesData];
    const target = newData.filter(item => key === item.id)[0];
    if (target) {
      Object.assign(target, this.cacheDefaultPagesData.filter(item => key === item.id)[0]);
      delete target.editable;
      this.defaultPagesData = newData;
      this.num++;
    }
  }

  deleteConfig(id: string) {
    deleteDefaultPages({appCode: this.projectCode ?? '', id: id}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('删除成功！');
      this.init();
    })
  }

  onChange(e) {
    this.defaultCheckedValue = e.target.value;
  }

  onValueChange(value) {
    this.defaultPagesData.map((i)=> {
      if(i.id === this.editingKey) {
        i.departments = value;
      }
    })
  }

  init() {
    this.defaultPagesData = [];
    getLoginConfig({appCode: this.projectCode ?? ''}).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      if (res.data) {
        const data = res.data;
        //默认页配置
        if (!res.data.defaultPages) {
          return
        }
        //默认页
        (data || []).defaultPages.map((item) => {
          let options: any[] = [], values: string = '';
          for (const f_key in item.pages) {
            options.push({
              label: f_key,
              value: f_key
            })
            if (item.pages[f_key]) {
              values = f_key
            }
          }
          item.plainOptions = options;
          item.defaultCheckedValue = values;
        })
        this.defaultPagesData = res.data.defaultPages;
        this.cacheDefaultPagesData = JSON.parse(JSON.stringify(this.defaultPagesData));
      }
    })
  }

  mounted() {
    //处理，选部门控件前置条件

  }
}
</script>

<style scoped lang="less">
@import '../system.module.less';
.default-page {}
</style>
