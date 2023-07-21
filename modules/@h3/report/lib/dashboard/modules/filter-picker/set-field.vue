<template>
  <div :class="prefixCls" v-if ="dataSourcesShowValue.length > 0">
    <div
      :class="[`${prefixCls}__item`]"
      v-for="(dataSource,index) in dataSourcesShowValue"
      :key="index"
    >
      <div :class="[`${prefixCls}__name`]">{{ dataSource.displayName }}</div>
      <a-select
        showSearch
        placeholder="请选择字段"
        :class="{[`${prefixCls}__select`]:true,[`${prefixCls}__select-error`]:false}"
        :value="dataSource.defaultValue"
        @change="changeField"
        :disabled="index !== 0 && !tmpDataSourcesList[0].field"
      >
        <a-select-option
          v-for="(field,i) in dataSource.properties"
          :key="i"
          :value="`${index}___${dataSource.dataSourceId}___${JSON.stringify(field)}`"
        >
          <i :class="[`${prefixCls}__icon`,`h3-report-icon ${field.type}`]"></i>{{ field.name }}
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Select } from '@h3/antd-vue';
import options from '@h3/report/dist/options';
import H3Scroll from '@h3/report/basics/components/scroll';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-set-field',
  components: {
    H3Scroll,
    ASelect: Select,
    ASelectOption: Select.Option
  }
})
export default class SetFilterField extends Vue {
  @Prop({ default: () => ([]) }) dataSourcesList!: Array<H3.Report.FilterDataSource>; // [{ dataSourceId, field }]
  @ReportPro.State('dataSources') dataSources!: { [dataSourceId: string]: any};
  prefixCls:string = 'h3-report-set-field';
  dataSourcesOptions:Array<H3.extendDataSource> = [];  // 数据源集合实际值
  dataSourcesShowValue:Array<H3.extendDataSource> =[]; // 数据源集合展示值
  activeType?:string; // 当前激活数据类型
  classification: Array<any> = []; // 字段分类
  tmpDataSourcesList:Array<H3.Report.FilterDataSource> = JSON.parse(JSON.stringify(this.dataSourcesList));
  
  @Watch('dataSourcesList', { immediate: true, deep: true })
  getDataSourcesOptions(newFilterDataSource:Array<H3.Report.FilterDataSource>) { // [{ dataSourceId, field }]
    this.tmpDataSourcesList = newFilterDataSource;
    this.dataSourcesOptions.splice(0);
    newFilterDataSource.forEach((filterDataSource: H3.Report.FilterDataSource, index) => {
      this.dataSourcesOptions[index] = this.dataSources[filterDataSource.dataSourceId];
      this.dataSourcesOptions[index].properties = this.dataSources[filterDataSource.dataSourceId].properties.filter(item => item.visible);
      this.dataSourcesOptions[index].defaultValue = null;
      // 字段反显及兼容字段缺失
      if (filterDataSource && filterDataSource.field) {
        const field: H3.Report.FieldColumn | undefined = this.dataSources[filterDataSource.dataSourceId].properties.find((item: H3.Report.FieldColumn) => item.field === (filterDataSource.field as H3.Report.FieldColumn).field && item.schemaCode === (filterDataSource.field as H3.Report.FieldColumn).schemaCode && item.visible);
        if (field) {
          if (index === 0) {
            this.activeType = filterDataSource.field.type;
            if (typeof options.classification === 'function' && options.classification(field)) {
              this.classification = options.classification(field);
            } else {
              this.classification = [];
            }
          }
          this.dataSourcesOptions[index].defaultValue = filterDataSource.field.name;
        }
      }
    });
    
    // 展示数据源,字段类型分类
    this.dataSourcesShowValue = JSON.parse(JSON.stringify(this.dataSourcesOptions));
    this.dataSourcesOptions.forEach((item:H3.extendDataSource, index:number) => {
      if (index === 0) {
        this.dataSourcesShowValue[index].properties = item.properties;
      } else if (this.classification.length) {
        this.dataSourcesShowValue[index].properties = item.properties.filter((param:H3.Report.FieldColumn) => this.classification.includes(param.dataType));
      } else {
        this.dataSourcesShowValue[index].properties = item.properties.filter(field => field.type === this.activeType);
      }
    });
  }
  /**
   * 改变筛选字段
   * @param value
   */
  changeField(value:string) {
    let tmpList:Array<H3.Report.FilterDataSource> = JSON.parse(JSON.stringify(this.tmpDataSourcesList));
    const tmpValue:Array<string> = value.split('___');
    const activeIndex:number = Number(tmpValue.shift());
    const tmpSourceItem:H3.Report.FilterDataSource = {
      dataSourceId: tmpValue[0],
      field: JSON.parse(tmpValue[1]),
    };
    this.tmpDataSourcesList.splice(activeIndex, 1, tmpSourceItem);
    // 当第一个字段改变类型时触发
    if (activeIndex === 0 && tmpSourceItem.field) {
      if (this.activeType !== tmpSourceItem.field.type) {
        this.activeType = tmpSourceItem.field.type;
        tmpList = this.tmpDataSourcesList.map((item, index) => {
          if (index === 0) return item;
          return {
            dataSourceId: item.dataSourceId,
            field: null,
          };
        });
        this.tmpDataSourcesList = tmpList;
        this.dataSourcesOptions.forEach((item, index) => {
          if (index > 0) {
            item.defaultValue = null;
          }
        });
      }
      this.$emit('change-field-type', this.activeType);
    }
    this.$emit('change-field', this.tmpDataSourcesList);
  }
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";

  .h3-report-set-field {
    display: flex;
    flex-direction: column;
    &__title{
      color:@report-font-color-base;
    }
    &__name {
      line-height: 32px;
      color:#8893A7;
    }
    &__icon {
      margin-right: 2px;
    }
    &__select {
      width: 100%;
    }
    &__error-text{
      color: #FF4384;
      font-size:12px;
    }
    &__select-error {
      .ant-select-selection{
        border: 1px solid #FF4384;
      }
    }
    .ant-select-dropdown-menu-item-disabled {
      color: #C9CCD8;
      &:hover {
        color: #C9CCD8;
      }
    }
    .ant-select-selection__placeholder {
      color: #C9CCD8;
    }
  }
</style>
