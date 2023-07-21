<template>
  <multi-group :title="moduleOptions.title" :tip="moduleOptions.tip">
    <div :class="prefixCls">
      <H3SelectField
        :class="`${prefixCls}__list`"
        v-for="(field, index) in innerValue"
        :key="index"
        :value="field"
        :fields="Fields"
        :disableFields="value"
        :typeMapping="getTypeMapping(field)"
        :showDateComplete="getShowDateComplement(field, index)"
        :optionFieldName="getShowFiledOption(field)"
        :container="getContainer"
        @change="onchangeField(index, arguments)"
      ></H3SelectField>
      <div
        :class="`${prefixCls}__add ${!canAddFields ? prefixCls + '__add--disabled' : ''}`"
        @click="add"
      >
        <i class="iconfont iconplus-o"></i>
        添加{{ moduleOptions.title }}
      </div>
    </div>
    <span slot="extra" v-if="showMetricSet">
      <icon
        :option="iconOption"
        placement="topRight"
        @click="showModel"
      > </icon>
    </span>
    <a-modal
      v-model="visible"
      :width="480"
      :centered="true"
      :destroyOnClose="true"
      okText="确定"
      cancelText="取消"
      title="指标-更多设置"
      wrapClassName="number-format-modal"
      @ok="changeFieldsNumberFormat"
    >
      <number-format
        :fields="innerValue"
        :chart="chart"
        @change="changeNumberFormat"
      ></number-format>
    </a-modal>
  </multi-group>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip, Select, Modal } from "@h3/antd-vue";
import MultiGroup from "../../component/multi-group";
import { setOption } from "../../config/static-option";
import NumberFormat from "../number-format";
import Icon from "../../component/icon";
import ModulesMixin from "../../mixins/modules-mixins";
import { uuid } from "@h3/report/basics/utils/uid";
import enumType from "@h3/report/basics/enum/aggregate-type";
import { ModuleType } from "@h3/report/basics/enum/chart-modules-type";
import Field from "../../component/field";
import { chartDMLimit, getMainType } from "@h3/report/basics/instance/help/getModules";
import { ElementType } from "@h3/report/basics/enum/chart-type";
import options from "@h3/report/dist/options";
const Analysis = namespace("analysisState");

@Component({
  name: "h3-analysis-dimension",
  components: {
    MultiGroup,
    H3SelectField: Field,
    Icon,
    AModal: Modal,
    NumberFormat
  }
})
export default class AnalysisDimension extends Mixins(ModulesMixin) {
  @Prop({ default: {} }) moduleOptions!: H3.Analysis.DimensionModule;
  @Prop({ default: () => [] }) value!: Array<H3.Report.FieldColumn>;
  @Prop({ default: false }) disabledAdd!: boolean;
  @Prop({ default: true }) autoChange!: boolean;
  @Analysis.State("dataSources") dataSources!: { [dataSourceId: string]: H3.Report.DataSource };
  @Analysis.State("dataSourceId") dataSourceId!: string;

  prefixCls: string = "h3-analysis-dimension";
  // icon配置
  iconOption: { icon: string; label: string } = setOption;
  //内部数据
  innerValue: Array<H3.Report.FieldColumn | {}> = JSON.parse(JSON.stringify(this.value));
  //弹窗临时内部数据
  tmpInnerValue: Array<H3.Report.FieldColumn | {}> = [];
  recordChange: boolean = false; // 记录数值格式改变
  // 弹窗显示
  visible: boolean = false;
  // 支持日期补全的数组
  dateCompleteType: Array<string> = [
    ElementType.BAR,
    ElementType.LINE,
    ElementType.BIAX,
    ElementType.CARD
  ];

  /**
   * 监听动态改动字段
   */
  @Watch("value")
  watchValue(val) {
    this.innerValue = JSON.parse(JSON.stringify(this.value));
  }

  /**
   * 是否显示指标设置
   */
  get showMetricSet() {
    return this.isMetric && this.innerValue.length && this.chart.type !== ElementType.SCATTER;
  }
  /**
   * 可选的字段
   */
  get Fields() {
    const realDataSource =
      this.chart && this.chart.dataSourceId
        ? this.dataSources[this.chart.dataSourceId]
        : this.dataSources[this.dataSourceId];
    let source =
      realDataSource && realDataSource.properties
        ? JSON.parse(JSON.stringify(realDataSource.properties))
        : [];
    // 合并已有的数据的uid和整合字段
    this.value.forEach(v => {
      let item = source.find(s => s.field === v.field && s.tableId === v.tableId);
      if (item) {
        item.uid = v.uid;
      }
    });
    source = source.filter(i => {
      return i.specialType
        ? this.moduleOptions.supportedTypes.includes(i.specialType)
        : this.moduleOptions.supportedTypes.includes(i.type);
    });
    return source;
  }

  get isMetric() {
    return this.moduleKey === ModuleType.Metric;
  }

  /**
   * 是否可以新增 是否达到最大数量
   */
  get canAddFields() {
    let can = true;
    let dl, ml;
    let fLength = this.innerValue
      ? this.innerValue.length + 1
      : this.getDataLength(this.moduleKey) + 1;
    // 如果设置了模块最大值限制 那么预超出就不允许新增
    if (this.moduleOptions.max && fLength > this.moduleOptions.max) return false;
    // 如果没有超过最大值 那么判断当前纬度指标是否允许
    if (this.isMetric) {
      dl = this.dimensionLength;
      ml = fLength;
    } else {
      dl = fLength;
      ml = this.chart.data.metricGroup
        ? Math.max(...this.chart.data.metricGroup.map(i => i.length))
        : this.getDataLength(ModuleType.Metric); // 如果用this.Metriclength会导致图表切换的时候无法更新
    }

    let dLimit = chartDMLimit[dl] ? chartDMLimit[dl] : chartDMLimit[chartDMLimit.length - 1];
    let mLimit = dLimit[ml] ? dLimit[ml] : dLimit[dLimit.length - 1];

    const realType = getMainType(this.chart.type);
    can = mLimit.includes(realType);

    return can;
  }
  /**
   * 新增
   */
  add() {
    if (!this.canAddFields) return;
    if (!this.disabledAdd) {
      this.innerValue.push({});
    }
  }
  /**
   * 获取挂载容器
   */
  getContainer() {
    return document.querySelector(".h3-analysis-design")
      ? document.querySelector(".h3-analysis-design")
      : document.body;
  }
  /**
   * 点击设置数值格式
   */
  showModel() {
    this.visible = true;
  }
  /**
   * 记录临时改变记录
   */
  changeNumberFormat(value: Array<H3.Report.FieldColumn>) {
    this.recordChange = true;
    this.tmpInnerValue = value;
  }
  /**
   * 改变字段数值设置
   */
  changeFieldsNumberFormat() {
    this.visible = false;
    if (this.recordChange) {
      this.innerValue = [...this.tmpInnerValue];
      this.recordChange = false;
    }
    if (this.autoChange) {
      this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
    }
    this.$emit("change", this.innerValue);
  }
  /**
   * 当字段的值被改变时
   */
  onchangeField(index, args) {
    if (args && args[0]) {
      // 更新字段时
      let selectItem = Object.assign({}, args[0]);
      if (!selectItem.uid) {
        selectItem.uid = uuid(8, 16);
        this.setDefaultOptions(selectItem);
      }
      this.innerValue.splice(index, 1, selectItem);
    } else {
      // 删除字段时
      this.innerValue.splice(index, 1);
    }
    // 过滤非空字段
    const filterFields = this.innerValue.filter(i => {
      return Object.keys(i).length > 0;
    });

    if (this.autoChange) {
      this.onModulesChange(this.chart, this.moduleKey, filterFields);
    }
    this.$emit("change", filterFields);
  }

  /**
   * 设置默认的options
   */
  setDefaultOptions(field: H3.Report.FieldColumn) {
    if (this.moduleKey === "metric") {
      let tmpField: any = null;
      // 判断字段格式设置有没有默认值，有就使用默认值
      if (options.fieldsOptions && options.fieldsOptions.length) {
        tmpField = options.fieldsOptions.find(item => {
          return item.schemaCode === field.schemaCode && item.field === item.field;
        });
      }
      if (tmpField && !field.options.numberFormat) {
        let numberFormat = tmpField.numberFormat || {};
        field.options.numberFormat = {
          comma: numberFormat.comma ? numberFormat : false,
          percent: numberFormat.percent ? numberFormat.percent : false,
          fraction: numberFormat.fraction ? numberFormat.fraction : 0
        };
      } else if (!field.options.numberFormat) {
        field.options.numberFormat = {
          comma: false,
          percent: false,
          fraction: 0
        };
      }
    }
    switch (field.type) {
      case "string":
        if (this.moduleKey === "metric") {
          field.options.aggregateType = "COUNT";
        }
        break;
      case "date":
        if (this.moduleKey === "metric") {
          field.options.aggregateType = "COUNT";
        } else {
          field.options.format = "Y";
        }
        break;
      case "number":
        field.options.aggregateType = "SUM";
        break;
      default:
        break;
    }
  }

  /**
   * 选择
   */
  onSelect() {}
  /**
   * 设置是否显示补全日期
   */
  getShowDateComplement(field: H3.Report.FieldColumn, index) {
    // 需要抽离逻辑
    return (
      index === 0 &&
      field.type === "date" &&
      this.moduleKey === ModuleType.Dimension &&
      this.dateCompleteType.includes(this.chart.type)
    );
  }

  /**
   * 设置是否显示配置项
   */
  getShowFiledOption(field: H3.Report.FieldColumn) {
    // 需要抽离逻辑
    if (this.moduleKey === "metric") {
      return field.type ? "aggregateType" : "";
    } else {
      return field.type === "date" ? "format" : "";
    }
    return "";
  }

  /**
   * 设置是否显示配置项
   */
  getTypeMapping(field: H3.Report.FieldColumn) {
    // 需要抽离逻辑
    if (this.moduleKey === "metric") {
      return field.type === "date" || field.type === "string"
        ? "string"
        : field.type
        ? field.type
        : "";
    } else {
      return field.type;
    }
    return "string";
  }
}
</script>

<style lang="less">
.h3-analysis-dimension {
  &__list {
    margin-bottom: 12px;
    padding: 0 16px;
    position: relative;
  }

  &__add {
    width: calc(100% - 32px);
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: #777f8d;
    background: #ffffff;
    border-radius: 4px;
    margin: 0 16px;
    &--disabled {
      background: #f3f5f8;
      border: 1px solid #d4d7e0;
      &:hover {
        outline: none !important;
        color: #777f8d !important;
        cursor: no-drop;
        .iconfont {
          color: #b6bcc6 !important;
        }
      }
    }
    &:hover {
      outline: 1px dashed #2565f1;
      color: #2565f1;
      transition: all 0.3s;
      .iconfont {
        color: #2565f1;
      }
    }
    .iconfont {
      font-size: 14px;
      color: #b6bcc6;
    }
  }
}
</style>
