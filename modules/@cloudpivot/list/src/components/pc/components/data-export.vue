<template>
  <a-modal
    v-model="showModal"
    :width="552"
    :cancelText="$t('cloudpivot.list.pc.Cancel')"
    :okText="$t('cloudpivot.list.pc.startExport')"
    @ok="submit"
    wrapClassName="data-export"
    :maskClosable="false"
    @cancel="closeModel"
  >
    <template slot="title">
      <h3 class="modal-title">{{ $t('cloudpivot.list.pc.exportData') }}</h3>
      <span class="gray">{{ $t('cloudpivot.list.pc.exportTips') }}</span>
    </template>
    <div class="check-all">
      <a-checkbox
        :checked="isCheckedAll"
        class="checkbox"
        @click="selectAll"
      ></a-checkbox><span class="left">{{ $t('cloudpivot.list.pc.checkAll') }}</span>
    </div>
    <div class="data-list">
      <div
        v-for="(i,index) in mainDataItemList"
        :key="index"
        class="check-item"
      >
        <a-checkbox
          :checked="i.selected"
          class="checkbox"
          @click="onSelectChange(i)"
        ></a-checkbox>
        <span class="span">{{ i.name }}</span>
      </div>
      <!-- 子表数据项 -->
      <div
        v-for="(data,index) in childDataItemList"
        :key="data.code"
        class="sub-item"
      >
        <a-checkbox
          :checked="data.selected"
          class="checkbox"
          @click="onSubSelectChange(data)"
        ></a-checkbox>
        <span class="sub-title">{{ data.name }}</span>
        <span class="toggle" @click="toggle(data)">
          <a-icon type="down" :class="{ collapsed : !data.collapsed }" />
        </span>
        <div class="line"></div>
        <div v-show="data.collapsed" class="sub-item-content">
          <div
            v-for="(sub,index) in data.subSchema.properties"
            :key="sub.code"
            class="sub-item-child"
            v-if="!sub.defaultProperty && !dataItemTypeArr.includes(sub.propertyType) && sub.published"
          >
            <a-checkbox
              :checked="sub.selected"
              class="checkbox"
              @click="onSubItemSelectChange(data, sub)"
            ></a-checkbox>
            <span class="span">{{ sub.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts">
import {
  Component, Vue, Prop, Watch
} from 'vue-property-decorator';
import {
  State, namespace
} from 'vuex-class';
import {
  Modal, Checkbox, Icon
} from '@h3/antd-vue';

import { listApi, listParams } from '@cloudpivot/api';

const WorkflowCenterModule = namespace('WorkflowCenter/WorkflowCenter');

@Component({
  name: 'data-export',
  components: {
    AModal: Modal,
    ACheckbox: Checkbox,
    AIcon: Icon
  }
})

export default class DataExport extends Vue {

  @WorkflowCenterModule.State("applicationPageTitle") applicationPageTitle: any;

  @WorkflowCenterModule.State('dataItemList') dataItemList: any;

  @Prop() value!: boolean;

  @Prop() queryColumns!: any;

  @Prop() exportFileId!: string;

  @Prop() extend1!: string;

  showModal: boolean = false; // 弹窗显隐

  checkAll: boolean = false; // 全选按钮

  dataItemTypeArr: any = [6, 7];

  mainDataItemList: any = []; // 主表数据项列表（除子表外）

  childDataItemList: any = []; // 子表数据项列表

  interval: any = null;

  async getExportProgress() {
    const res = await listApi.getExportingProgress({id: this.exportFileId});
    if (res.errcode === 0) {
      if (res.data.exportResultStatus) {
        clearInterval(this.interval);
        this.downLoadExportFile()
      }
    }else{
      clearInterval(this.interval);
      this.$message.error(res.errmsg as string);
    }
  }

  destroyed() {
    clearInterval(this.interval);
  }

  async downLoadExportFile(){
    const res:any = await listApi.getExportFile({id: this.exportFileId});
    const blob = new Blob([res], { type: 'application/vnd.ms-excel;charset=UTF-8' });
    const date = new Date();
    const mounth = date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    const days = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    const seconds = date.getSeconds() > 9 ? date.getSeconds() : `0${date.getSeconds()}`;

    const stamp = `${date.getFullYear()}${mounth}${days}${hours}${minutes}${seconds}`;
    const fileName = `${this.applicationPageTitle}导出${stamp}.xlsx`;

    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.download = fileName;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
    this.$message.destroy();
  }

  // 初始化数据列表
  dataMounted(queryColumns: any) {
    if (this.dataItemList) {
      const copyList = JSON.parse(JSON.stringify(this.dataItemList));
      this.mainDataItemList = copyList.filter((data: any) => data.code !== "ownerDeptQueryCode" && data.propertyType !== 8 && !this.dataItemTypeArr.includes(data.propertyType));
      this.childDataItemList = copyList.filter((data: any) => data.propertyType === 8);
    }
    if (Array.isArray(queryColumns)) {
      queryColumns.forEach((c: any) => {
        this.mainDataItemList.forEach((l: any) => {
          if (c.propertyCode === l.code) {
            this.$set(l, 'selected', true);
          }
        });
        this.childDataItemList.forEach((d: any) => {
          if (c.propertyCode === d.code) {
            this.$set(d, 'selected', true);
            d.subSchema.properties.forEach((s) =>{
              this.$set(s, 'selected', true);
            })
          }
        });
      });
    }
  }

  // 主表数据项change
  // onSelectChange(data?: any) {
  //   const dataItemArray = this.mainDataItemList.concat(this.childDataItemList);
  //   dataItemArray.some((d: any, l: number) => {
  //     if (!d.selected) {
  //       this.checkAll = false;
  //       return true;
  //     } else if (d.selected && l === dataItemArray.length - 1) {
  //       this.checkAll = true;
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  onSelectChange(item:any) {
    this.$set(item,'selected',!item.selected)
  }

  // 子表数据项change
  onSubItemSelectChange(subTable:any, subTableItem:any) {
    let flag = !subTableItem.selected;
    this.$set(subTableItem,'selected', flag);

    const subItemList = (Array.isArray(subTable.subSchema.properties)?
      subTable.subSchema.properties:
      []).filter((sub: any) => !sub.defaultProperty && !this.dataItemTypeArr.includes(sub.propertyType));

    this.$set(subTable, 'selected', subItemList.every((sitem:any)=>sitem.selected))
  }

  // 子表change
  onSubSelectChange(data:any) {
    let flag = !data.selected;
    this.$set(data,'selected',flag);
    if (Array.isArray(data.subSchema.properties)) {
      data.subSchema.properties.forEach((d: any) => {
        this.$set(d, 'selected', flag);
      });
    }
  }


  get isCheckedAll() {
    return this.mainDataItemList.every((item:any)=>item.selected)
      && this.childDataItemList.every((item:any)=>item.selected);
      //
        // item.selected && item.subSchema.properties.every((prop:any)=>prop.selected)
      // ));
  }

  // 全选
  selectAll(e:any) {
    let flag = !this.isCheckedAll;
    this.mainDataItemList.forEach((item: any) => {
      this.$set(item, 'selected', flag);
    });
    this.childDataItemList.forEach((item: any) => {
      this.$set(item, 'selected', flag);
      if (Array.isArray(item.subSchema.properties)) {
        item.subSchema.properties.forEach((d: any) => {
          this.$set(d, 'selected', flag);
        });
      }
    });
  }

  // 展开收缩子表数据项
  toggle(data: any) {
    const collapsed = !data.collapsed;
    this.$set(data, 'collapsed', collapsed);
  }

  /**
   * 根据展示字段顺序，对导出字段排序
   */
  sortProperty(targetList: Array<any>) {
    // console.log('targetList', targetList);
    // 获取本地缓存的列表列
    const { schemaCode } = this.$route.params;
    const columnsOptsKey: string = `${schemaCode}_columns_options`;
    const columnOpts: any = window.localStorage.getItem(columnsOptsKey);
    let sortedCodes: Array<string> = [];

    if (columnOpts) {
      const _column: any = JSON.parse(columnOpts);
      sortedCodes = _column.filter((col: any) => col.isShow).map((col: any) => col.key);
    } else if (Array.isArray(this.queryColumns)) {
      // 无本地缓存时根据展示字段排序
      sortedCodes = this.queryColumns.map((c: any) => c.propertyCode);
    }

    if (sortedCodes.length) {
      let resultList: Array<any> = [];
      sortedCodes.forEach((code: string) => {
        const item: any = targetList.find((li: any) => li.propertyCode === code);
        if (item) {
          resultList.push(item);
        }
      });
      const tailList: any = targetList.filter((item: any) => !sortedCodes.includes(item.propertyCode));
      resultList.push(...tailList);
      return resultList;
    }

    return targetList;
  }

  // 获取导出字段displayFormat
  getDataDisplayFormat(data: any) {
    if (Array.isArray(this.queryColumns)) {
      data = data.map((d: any) => {
        const item = this.queryColumns.find((c: any) => c.propertyCode === d.propertyCode);
        if (item) {
          d.displayFormat = item.displayFormat;
        } else {
          d.displayFormat = null;
        }
        return d;
      });
    }
    return data;
  }

  // 导出数据
  submit() {
    const copyArray = JSON.parse(JSON.stringify(this.childDataItemList));
    copyArray.forEach((child: any) => {
      if (Array.isArray(child.subSchema.properties)) {
        const subItemList = child.subSchema.properties.filter((sub: any) => !sub.defaultProperty && !this.dataItemTypeArr.includes(sub.propertyType) && sub.selected);
        if (subItemList.length) {
          child.selected = true;
        }
        child.subSchema.properties = subItemList.map((sub: any) => {
          const back = {
            propertyCode: sub.code,
            name: sub.name,
            propertyType: sub.propertyType,
          };
          return back
        });
      }
    });
    const dataArray = this.mainDataItemList.concat(copyArray).filter((d: any) => d.selected);
    let returnData = dataArray.map((data: any) => {
      const back = {
        propertyCode: data.code,
        name: data.name,
        propertyType: data.propertyType,
        childColumns: data.subSchema ? data.subSchema.properties : data.subSchema,
      };
      return back
    });
    returnData = this.getDataDisplayFormat(returnData);
    // returnData = this.sortProperty(returnData);
    console.log('exportdata', returnData);
    this.$emit('exportEnd', returnData);
    this.interval = setInterval(() => {
      this.getExportProgress();
    }, 2000);
    //设置定时任务5分钟;
    if(this.interval){
      setTimeout(() =>{
        clearInterval(this.interval);
        this.$message.error('连接超时');
      }, 300000)
    }

    this.closeModel();
  }

  closeModel() {
    this.$emit('input', false);
  }

  @Watch('value')
  onValueChange(v: boolean) {
    this.showModal = v;
    this.dataMounted(this.queryColumns);
  }

  @Watch('queryColumns', { deep: true, immediate: true })
  onColumnChange(v: any) {
    this.dataMounted(v);
  }

  @Watch('extend1')
  ext(val: any) {
    console.log('extend1', val)
    if (val === 'true') {
      this.dataItemTypeArr = [ 7 ]
      this.dataMounted(this.queryColumns)
    }
  }
}
</script>
<style lang="less">
.data-export {
  .ant-modal-body {
    max-height: 378px;
    overflow-y: auto;
    padding: 24px 20px;
    margin: 0 4px;
  }
  .modal-title {
    display: inline-block;
  }
  .gray {
    font-size: 12px;
    margin-left: 8px;
    color: rgba(0, 0, 0, 0.45);
  }
  .left {
    color: rgba(0, 0, 0, 0.85);
  }
  .data-list {
    overflow: hidden;
    .span {
      color: rgba(0, 0, 0, 0.85);
    }
    .check-item {
      float: left;
      width: 33%;
      margin-top: 10px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .sub-item {
      width: 100%;
      margin-top: 16px;
      float: left;
      .sub-title {
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
      }
      .line {
        background: #e8e8e8;
        width: 100%;
        height: 1px;
        margin-top: 8px;
      }
      .toggle {
        float: right;
        margin-right: 14px;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.45);
        & > i {
          transform: rotate(180deg);
        }
        & > i.collapsed {
          transform: rotate(0);
        }
      }
      .sub-item-child {
        float: left;
        width: 33%;
        margin-top: 8px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
</style>
