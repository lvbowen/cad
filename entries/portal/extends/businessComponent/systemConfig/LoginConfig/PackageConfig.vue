<template>
  <div class="set-package">
    <a-table
      :key="num"
      bordered
      :data-source="packageData"
      :columns="packageColumns"
      :pagination="false">
      <template
        v-for="col in ['url']"
        :slot="col"
        slot-scope="text, record, index"
      >
        <span :key="col" class="flex-1">
          <a-input
            v-if="record.editable"
            style="margin: 5px 0;"
            :value="text"
            @change="e => handleChange(e.target.value, record.type, col)"
          />
          <template v-else>
            <span>{{ text }}</span>
          </template>
        </span>
      </template>
      <template slot="qr" slot-scope="text, record, index">
        <img :src="text" alt="" class="qr">
      </template>
      <template slot="operation" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record.type,record)" :class="editingKey===record.type?'success-color':''">保存</a>
            <a @click="() => cancel(record.type,record)" :class="editingKey===record.type?'cancel-color':''">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(record.type,record)" :class="editingKey?'':'base-color'">编辑</a>
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {Vue, Component, InjectReactive,Prop,Watch} from 'vue-property-decorator';
// import {Icon, Table, Input} from "ant-design-vue";
import Table from 'ant-design-vue/lib/table';
import 'ant-design-vue/lib/table/style/index.css';
import Icon from 'ant-design-vue/lib/icon';
import 'ant-design-vue/lib/icon/style/index.css';
import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/style/index.css';
import {getLoginConfig, updatePackageInfo} from "../../../service/api";
import {PackageInfo} from "../type";

@Component({
  name: 'SetPackage',
  components: {
    AIcon: Icon,
    ATable: Table,
    AInput: Input,
  }
})
export default class SetPackage extends Vue {
  @InjectReactive('project') projectCode!: string;
  @Prop({
    default: []
  }) setPackageData?: PackageInfo[];
  @Watch('setPackageData', { immediate: true })
  getPackageData(val) {
    this.packageData = JSON.parse(JSON.stringify(val));
    this.cachePackageData = JSON.parse(JSON.stringify(val));
  }
  packageData: PackageInfo[] = [];//前端处理
  cachePackageData: PackageInfo[] = [];
  packageColumns: any[] = [
    {
      title: '安装包类型',
      dataIndex: 'type',
      // width: '30%',
      key: 'type'
    },
    {
      title: '下载链接',
      dataIndex: 'url',
      key: 'url',
      scopedSlots: {customRender: 'url'},
    },
    {
      title: '二维码',
      dataIndex: 'qr',
      key: 'qr',
      scopedSlots: {customRender: 'qr'},
    },
    {
      title: '操作',
      dataIndex: 'operation',
      scopedSlots: {customRender: 'operation'},
    }
  ];
  num: number = 0;
  editingKey: string = '';

  edit(key, record) {
    const newData = [...this.packageData];
    const target = newData.filter(item => key === item.type)[0];
    this.editingKey = key;
    // @ts-ignore
    if (target) {
      target.editable = true;
      this.packageData = newData;
    }
  }

  handleChange(value, key, column) {
    const newData = [...this.packageData];
    const target = newData.filter(item => key === item.type)[0];
    if (target) {
      target[column] = value;
      this.packageData = newData;
    }
  }

  save() {
    updatePackageInfo({
      appCode: this.projectCode ?? '',
      androidUrl: this.packageData[0].url,
      iosUrl: this.packageData[1].url
    }).then((res) => {
      if (res.errcode !== 0) return this.$message.error(res.errmsg as string);
      this.$message.success('修改成功！')
      this.editingKey = '';
      this.init()
    })
  }

  cancel(key, row) {
    const newData = [...this.packageData];
    const target = newData.filter(item => key === item.type)[0];
    // @ts-ignore
    this.editingKey = '';
    if (target) {
      Object.assign(target, this.cachePackageData.filter(item => key === item.type)[0]);
      delete target.editable;
      this.packageData = newData;
    }
  }

  init() {
    this.packageData = [];
    getLoginConfig({appCode:this.projectCode??''}).then((res)=> {
      if(res.errcode!==0) return this.$message.error(res.errmsg as string);
      if(res.data) {
        const data = res.data;
        //安装包
        this.packageData.push({
          type: 'android',
          url: data.mobilePackage && data.mobilePackage.androidUrl?data.mobilePackage.androidUrl:'',
          qr: data.mobilePackage && data.mobilePackage.androidQR?data.mobilePackage.androidQR:''
        })
        this.packageData.push({
          type: 'ios',
          url: data.mobilePackage && data.mobilePackage.iosUrl?data.mobilePackage.iosUrl:'',
          qr: data.mobilePackage && data.mobilePackage.iosQR?data.mobilePackage.iosQR:''
        })
        this.cachePackageData = JSON.parse(JSON.stringify(this.packageData));
      }
    })
  }
}
</script>

<style scoped lang="less">
@import '../system.module.less';
.set-package {
  .qr {
    width: 80px;
  }
}
</style>
