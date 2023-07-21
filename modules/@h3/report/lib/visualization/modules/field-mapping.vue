<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div v-if="isTitle" :class="[`${prefixCls}__header`,`${comPrefixCls}__header`]">
      <!-- title -->
      <label>{{ module.title }}</label>
      <a-tooltip
        placement="right"
        :class="[`${prefixCls}__icon`]"
        :getPopupContainer="getPopupContainer"
      >
        <template slot="title">
          <span>{{ tipLabel[tipLabelType] }}</span>
        </template>
        <i class="h3yun_All question-circle-o"></i>
      </a-tooltip>
      <!-- 添加btn -->
      <div v-if="isAddField" :class="[`${prefixCls}__add`]">
        <a @click="addField">
          <i class="h3-report-icon add"></i> {{ '增加' + module.title }}
        </a>
      </div>
    </div>
    <h3-draggable
      handle=".item"
      :list="innerData"
      :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]"
      :options="dragOptions"
      @end="sortEnd"
    >
      <div
        v-for="(field, i) in innerData"
        :class="[`${prefixCls}__field`]"
        :key="i"
      >
        <h3-report-field-select
          :class="[`${prefixCls}__select`]"
          :key="i"
          :index="i"
          :placeholder="`请选择${module.title}`"
          :showSearch="showSearch"
          :disabled="module.disabled"
          :schemas="schemas"
          :schemaType="module.supportedTypes"
          :field="field"
          :allOptions="allOptions"
          :extOptions="extOptions"
          :aggregateOptions="aggregateOptions"
          @fieldChange="fieldChange"
        >
        </h3-report-field-select>

        <!-- 删除 -->
        <div :class="[`${prefixCls}__remove`]">
          <a @click="removeField(i)">
            <i class="h3-report-icon delete"></i>
          </a>
        </div>
        <!-- 拖动 -->
        <div v-if="innerData.length > 1" :class="[`${prefixCls}__drag`]">
          <a class="item"><i class="h3yun_All drag"></i></a>
        </div>
      </div>
    </h3-draggable>
  </div>
</template>
<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {State, Mutation, Action, namespace} from 'vuex-class';
import { Select, Tooltip } from '@h3/antd-vue';
import H3Draggable from 'vuedraggable';
import { uuid } from '@h3/report/basics/utils/uid';
import { ReportAction, ReportMutation } from '@h3/report/basics/store/visualization/types';
import H3ReportFieldSelect from './field-select.vue';

const Visualization = namespace('visualization');
@Component({
  name: 'h3-report-easy-field-mapping',
  components: {
    ASelect: Select,
    ASelectOption: Select.Option,
    H3ReportFieldSelect,
    ATooltip: Tooltip,
    H3Draggable,
  }
})
export default class ReportEasyFieldMapping extends Vue {
  prefixCls = 'h3-report-easy-field-mapping';
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.FieldMapping;
  @Prop({ default: () => ({}) }) schemas!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => ({}) }) data!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => null }) tipLabelType !: 'dimension' | 'metric' | 'rowDimension' | 'lineDimension';
  @Prop({ default: () => false }) isRemoveFirst !: boolean;
  @Prop({ default: () => true }) showSearch !: boolean;
  @Prop({ default: () => true }) isTitle !: boolean;
  @Prop({ default: () => true }) isDefaultValue !: boolean;
  // 配置总开关
  @Prop({ default: () => true }) allOptions!: boolean;
  // 扩展开关(日期)
  @Prop({ default: () => false }) extOptions!: boolean;
  // 聚合开关(数值、字符串)
  @Prop({ default: () => false }) aggregateOptions!: boolean;

  @Visualization.Mutation(ReportMutation.HANDLESORT) handleSort!: Function;
  innerData: Array < H3.Report.FieldColumn > = [];
  tipLabel = {
    dimension: '【维度】是对数据做分类的依据',
    metric: '【指标】是要统计的数据，会根据【维度】中设置的分组方式进行汇总计算',
    rowDimension: '【行维度】是对透视表行数据做分类的依据',
    lineDimension: '【列维度】是对透视表列数据做分类的依据'
  };
  // 拖拽功能变量
  easyPrefixCls = 'h3-report-easy';
  dragOptions = {
    animation: 150,
    ghostClass: `${this.easyPrefixCls}__chart--drag`,
  };

  @Watch('data', {
    immediate: true
  })
  watchData() {
    const data: Array < H3.Report.FieldColumn > = [];
    if (this.isDefaultValue) {
      data.push({}as H3.Report.FieldColumn);
    }
    this.innerData = Object.assign(data, this.data);
  }

  /**
   * 是否能添加指标
   */
  get isAddField() {
    return !this.module.max || this.innerData.length < this.module.max;
  }

  getPopupContainer() {
    return this.$el;
  }
  /**
   * 字段改变
   * @param filed
   * @param index
   */
  fieldChange(filed: H3.Report.FieldColumn, index: number) {
    filed.uid = uuid(8, 16);
    this.innerData.splice(index, 1, filed);
    this.updateFields();
    this.$emit('changeField', this.innerData);
  }

  /**
   * 新增指标
   */
  addField() {
    this.innerData.push({}as H3.Report.FieldColumn);
    this.$emit('addField', this.innerData);
  }

  /**
   * 删除指标
   * @param index
   */
  removeField(index: number) {
    const field = this.innerData.splice(index, 1)[0] as H3.Report.FieldColumn;
    if (field.uid) {
      const fieldIndex = this.data.findIndex((fField: H3.Report.FieldColumn) => fField.uid === field.uid);
      if (fieldIndex > -1) {
        this.data.splice(fieldIndex, 1);
        this.updateFields();
      }
    }
    if (this.isDefaultValue && !this.innerData.length) {
      this.innerData.push({} as H3.Report.FieldColumn);
    }
    this.$emit('removeField', this.innerData);
  }
  updateFields() {
    this.innerData.forEach((item: any) => {
      if (!item.uid) item.uid = uuid(8, 16);
    });
    this.data.splice(0, this.data.length, ...this.innerData);
    this.handleSort();
  }
  /**
   * 排序结束
   */
  sortEnd(e: any) {
    this.updateFields();
  }
}
</script>

<style lang="less">
  .h3-report-easy-field-mapping {
    &__field {
      display: flex;
      max-width: 100%;
      overflow: hidden;
    }

    &__select {
      flex: 1;
      overflow: hidden;
    }

    &__remove, &__drag{
      flex: 0 0 16px;
      text-align: center;
      line-height: 32px;
      a {
        color: #8893A7;
        &:hover {
          color: #68758E;
        }
      }
    }
    &__remove + &__drag{
      margin-left: 10px;
    }
    &__remove {
      margin-left: 10px;
    }
    &__field+&__field {
      margin-top: 8px;
    }
    &__icon{
      margin-left: 6px;
      color: #8893A7;
      font-weight: normal;
    }
    &__add {
      a {
        color: #107FFF;
      }
      i {
        margin-right: 5px;
      }
      display: inline-block;
      float: right;
      text-align: center;
    }
    .ant-tooltip-placement-right .ant-tooltip-arrow{
      border-right-color: #FFF;
    }
    .ant-tooltip {
      .ant-tooltip-content {
        .ant-tooltip-inner{
          padding: 8px 9px 8px 3px;
          background: #FFF;
          box-shadow:0 2px 8px 0 rgba(0,0,0,0.15);
          span{
            color: #304265;
          }
        }
      }
    }
  }
</style>
