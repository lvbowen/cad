<!-- 警戒线 -->
<template>
  <div v-if="module.display" :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`, `${comPrefixCls}__header`]">
      <label :class="[`${prefixCls}__title`]">{{ module.title }}</label>
      <label :class="`${prefixCls}__add`" @click="add">+添加</label>
    </div>
    <div :class="[`${prefixCls}__body`, `${comPrefixCls}__body`]">
      <div
        v-for="(item, index) in data"
        :key="index"
        :class="`${prefixCls}__content`"
        @click="warningDataShow(item, index)"
      >
        <div class="header">
          <label>{{ item.title }}</label>
          <i class="h3yun_All delete-o" @click.stop="warningNodeDelete(index)"></i>
        </div>
        <div class="content">
          <label class="label-name">{{ nodeTypeValue(item) }}</label>
          <label class="label-value" v-if="item.type === 'fixed'">{{ item.value }}</label>
          <div v-else class="label-metric">
            <label>{{ getMetricName(item) }}</label>
            <label>({{ nodeMetricAggregate(item) }})</label>
          </div>
        </div>
      </div>
    </div>
    <!-- 弹框 -->
    <div :class="`${prefixCls}__warning-alert`" v-if="showWarningAlert">
      <div :class="`${prefixCls}__warning-content`">
        <div class="header">
          <label>警戒线</label>
          <i class="h3yun_All close" @click="closeWarningAlert"></i>
        </div>
        <div :class="`${prefixCls}__middle-wrap`">
          <div class="warning-title mrt-16">
            <label>警戒线名称</label>
            <a-input
              placeholder="请输入警戒线名称,最多20个字符"
              :value="nameInputValue"
              @change="nameInputChange"
            />
            <span v-show="nameInputError">{{ nameInputError }}</span>
          </div>
          <div class="warning-type mrt-16">
            <label>类型</label>
            <div class="type-content">
              <!-- 警戒线类型 -->
              <a-select
                class="warning-type-select"
                placeholder="请选择警戒线类型"
                :value="typeSelectValue"
                @change="typeSelectChange"
              >
                <a-select-option v-for="item in typeSelect" :key="item.value">
                  {{ item.name }}
                </a-select-option>
              </a-select>
              <template v-if="typeSelectValue === 'fixed'">
                <!-- 警戒线Input -->
                <a-input
                  placeholder="请输入数值"
                  :value="typeInputValue"
                  @change="typeInputChange($event)"
                />
                <span class="type-input-error-span" v-show="typeInputError">{{
                  typeInputError
                }}</span>
              </template>
              <div class="dynamic-div" v-else>
                <!-- 指标警戒线 -->
                <a-select
                  style="width: 148px"
                  placeholder="请选择指标字段"
                  :value="metricSelectValue"
                  @change="metricSelectChange"
                >
                  <a-select-option v-for="item in chart.data.metric" :key="item.uid">
                    {{ item.alias || item.name }}
                  </a-select-option>
                </a-select>
                <!-- 平均值、最大值、最小值 -->
                <a-select
                  style="width: 148px; margin-right: 0;"
                  :value="averageSelectValue"
                  @change="averageSelectChange"
                >
                  <a-select-option v-for="item in averageSelect" :key="item.value">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </div>
          <div class="warning-showing mrt-16">
            <label>显示</label>
            <a-radio-group :value="radioValue" @change="radioChange">
              <a-radio
                v-for="(item, index) in radioOptions"
                :key="index"
                :value="item.value"
              >{{ item.name }}
              </a-radio>
            </a-radio-group>
          </div>
          <div class="warning-color">
            <label>颜色</label>
            <div class="color-wrap">
              <colorPicker
                ref="warningColor"
                :defaultColor="'#D9001B'"
                v-model="colorModel"
                @change="colorPickerChange"
              />
            </div>
          </div>
        </div>
        <div :class="`${prefixCls}__bottom-wrap`">
          <a-button @click="closeWarningAlert">取消</a-button>
          <a-button type="primary" @click="enter">确定</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import vcolorpicker from "vcolorpicker";
import { Mutation, Action, State, namespace } from "vuex-class";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";

const ReportPro = namespace("report");

import { Input, Select, Radio, Button, message } from "@h3/antd-vue";

@Component({
  name: "h3-report-warning-line-module",
  components: {
    colorPicker: vcolorpicker.colorPicker,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    AButton: Button
  }
})
export default class ReportWarningLine extends Vue {
  @Prop({ default: () => "" }) comPrefixCls!: string;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.WarningLine;
  @Prop({}) data!: Array<H3.Report.WarningLine>;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;

  prefixCls = "h3-report-warning-line-module";
  // 是否显示警戒线弹窗
  showWarningAlert: boolean = false;
  // 警戒线Input
  nameInputValue: string = "";
  // 颜色选择器model
  colorModel: string = "#D9001B";
  // 类型select
  typeSelect: Array<any> = [
    { name: "固定警戒线", value: "fixed", alias: "固定值" },
    { name: "动态警戒线", value: "dynamic", alias: "动态值" }
  ];
  // 类型select - value
  typeSelectValue: string = "fixed";
  // 指标select - value
  metricSelectValue: string = "";
  // average-select
  averageSelect: Array<any> = [
    { name: "平均值", value: "average" },
    { name: "最大值", value: "max" },
    { name: "最小值", value: "min" }
  ];
  // average-select - value
  averageSelectValue: string = "average";
  // 警戒线 - 固定值类型 - 数值
  typeInputValue: string = "";
  // radio - value
  radioValue: string = "name";
  // radio - options
  radioOptions: Array<any> = [
    { name: "名称", value: "name" },
    { name: "数值", value: "value" },
    { name: "名称+数值", value: "nameValue" }
  ];
  // 记录警戒线下标
  storeWarningIndex: number = -1;
  // 警戒线名称错误tip
  nameInputError: string = "";
  // 警戒线类型数值错误tip
  typeInputError: string = "";

  /**
   * 获取警戒线节点类型名称
   * @param item
   */
  nodeTypeValue(item: H3.Report.WarningLine) {
    for (let i of this.typeSelect) {
      if (i.value === item.type) {
        return i.alias;
      }
    }
  }

  /**
   * 获取指标名称
   * @param item
   */
  getMetricName(item: H3.Report.WarningLine) {
    for (let i of this.chart.data.metric) {
      if (i.uid === item.field) {
        return i.alias === "" ? i.name : i.alias;
      }
    }
  }

  /**
   * 添加
   */
  add() {
    if (this.data.length > 4) {
      message.error("警戒线最多只能添加5条");
      return;
    }
    this.storeWarningIndex = -1;
    this.showWarningAlert = true;
    this.clearData();
  }

  /**
   * 清空数据
   */
  clearData() {
    this.nameInputValue = "";
    this.typeSelectValue = "fixed";
    this.typeInputValue = "";
    this.radioValue = "name";
    this.colorModel = "#D9001B";
    this.metricSelectValue = "";
    this.averageSelectValue = "average";
    // 清空错误提示
    this.nameInputError = "";
    this.typeInputError = "";
  }

  /**
   * 警戒线数据显示
   * @param item
   * @param index
   */
  warningDataShow(item: H3.Report.WarningLine, index: number) {
    // 记录警戒线下标
    this.storeWarningIndex = index;
    // 弹框 show
    this.showWarningAlert = true;
    // 赋值
    this.nameInputValue = item.title;
    this.typeSelectValue = item.type;
    if (item.is_title && item.is_value) {
      this.radioValue = "nameValue";
    } else {
      item.is_title ? (this.radioValue = "name") : (this.radioValue = "value");
    }
    this.colorModel = item.color;
    // 动态警戒线赋值
    if (this.typeSelectValue === "dynamic") {
      (this.averageSelectValue as any) = item.aggregate;
      (this.metricSelectValue as any) = item.field;
    } else {
      this.typeInputValue = (item.value as any).toString();
    }
  }

  /**
   * 获取节点指标均值
   * @param item
   */
  nodeMetricAggregate(item: H3.Report.WarningLine) {
    for (let i of this.averageSelect) {
      if (i.value === item.aggregate) {
        return i.name;
      }
    }
  }

  /**
   * 删除警戒线节点
   * @param index
   */
  warningNodeDelete(index: number) {
    // 清空数据
    this.clearData();
    (this.chart.styles.warningLine as any).splice(index, 1);
    this.resizeChartView({ chart: this.chart, type: "view" });
  }

  /**
   * 警戒线名称 - change
   */
  nameInputChange(e) {
    this.nameInputError = "";
    this.nameInputValue = e.target.value;
  }

  /**
   * 类型input - change
   * @param e
   */
  typeInputChange(e: any) {
    this.typeInputError = "";
    this.typeInputValue = e.target.value;
  }

  /**
   * 类型select - change
   * @param value
   */
  typeSelectChange(value: string) {
    this.typeInputError = "";
    this.typeSelectValue = value;
  }

  /**
   * 动态警戒线 - 指标 - change
   * @param uid
   */
  metricSelectChange(uid: string) {
    this.typeInputError = "";
    this.metricSelectValue = uid;
  }

  /**
   * 动态警戒线 - 平均、最大、最小 - change
   * @param value
   */
  averageSelectChange(value: string) {
    this.averageSelectValue = value;
  }

  /**
   * radio - change
   * @param e
   */
  radioChange(e) {
    this.radioValue = e.target.value;
  }

  /**
   * 颜色选择器 - change
   * @param value
   */
  colorPickerChange(value: string) {
    this.colorModel = value;
  }

  /**
   * 关闭弹窗
   */
  closeWarningAlert() {
    this.showWarningAlert = false;
    this.clearData();
  }

  /**
   * 错误提示
   */
  errorTip() {
    if (!this.nameInputValue) {
      this.nameInputError = "请输入警戒线名称";
      return false;
    }
    if (this.nameInputValue.length > 20) {
      this.nameInputError = "警戒线名称不能超过20个字符";
      return false;
    }
    if (this.typeSelectValue === "fixed") {
      if (!this.typeInputValue) {
        this.typeInputError = "请输入数值";
        return false;
      }
      if (!/^(\-|\+)?\d+(\.\d+)?%?$/.test(this.typeInputValue)) {
        this.typeInputError = "请输入数字或百分数";
        return false;
      }
    } else {
      if (!this.metricSelectValue) {
        this.typeInputError = "请选择指标字段";
        return false;
      }
    }
    return true;
  }

  /**
   * 确定
   */
  enter() {
    if (!this.errorTip()) return;
    let typeInputValue = /%$/.test(this.typeInputValue)
      ? this.typeInputValue
      : Number(this.typeInputValue);
    if (this.storeWarningIndex !== -1) {
      this.data[this.storeWarningIndex].title = this.nameInputValue;
      this.data[this.storeWarningIndex].type = this.typeSelectValue;
      this.data[this.storeWarningIndex].value = typeInputValue;
      this.data[this.storeWarningIndex].is_title = this.radioValue !== "value";
      this.data[this.storeWarningIndex].is_value = this.radioValue !== "name";
      this.data[this.storeWarningIndex].color = this.colorModel;
      // 动态值
      if (this.typeSelectValue === "dynamic") {
        this.data[this.storeWarningIndex].field = this.metricSelectValue;
        this.data[this.storeWarningIndex].aggregate = this.averageSelectValue;
        delete this.data[this.storeWarningIndex].value;
      }
    } else {
      let warningOpt: H3.Report.WarningLine = {
        title: this.nameInputValue,
        type: this.typeSelectValue,
        value: typeInputValue,
        is_title: this.radioValue !== "value",
        is_value: this.radioValue !== "name",
        color: this.colorModel,
        field: this.chart.data.metric[0].uid // 固定值加在第一个指标上
      };
      // 动态值
      if (this.typeSelectValue === "dynamic") {
        warningOpt.field = this.metricSelectValue;
        warningOpt.aggregate = this.averageSelectValue;
        delete warningOpt.value;
      }
      (this.chart.styles.warningLine as any).push(warningOpt);
    }
    // 关闭弹窗
    this.showWarningAlert = false;
    // 刷新数据视图
    this.resizeChartView({ chart: this.chart, type: "view" });
  }
}
</script>

<style lang="less">
.h3-report-warning-line-module {
  border-bottom: none !important;
  label {
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: rgba(48, 66, 101, 1);
  }
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__add {
    cursor: pointer;
    font-weight: 400 !important;
    color: #107fff !important;
  }
  &__body {
    margin-top: 8px;
  }
  &__content {
    padding: 8px;
    margin-bottom: 8px;
    background: #f4f8fc;
    border-radius: 4px;
    cursor: pointer;
    .header {
      display: flex;
      justify-content: space-between;
      label {
        width: 156px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      i {
        cursor: pointer;
        color: #8893a7;
      }
    }
    .content {
      display: flex;
      font-size: 12px;
      font-weight: 400;
      .label-name {
        width: 54px;
        margin-right: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        color: rgba(136, 147, 167, 1);
      }
      .label-value {
        width: 108px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        color: rgba(136, 147, 167, 1);
      }
      .label-metric {
        display: flex;
        label {
          color: rgba(136, 147, 167, 1);
        }
        label:nth-child(1) {
          max-width: 50px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        label:nth-child(2) {
          margin-left: 6px;
        }
      }
    }
  }
  &__warning-alert {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 200;
  }
  &__warning-content {
    width: 480px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -216px;
    margin-left: -240px;
    .header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      border-bottom: 1px solid #e0e3e9;
      font-size: 16px;
      font-weight: 600;
      color: rgba(48, 66, 101, 1);
      i {
        color: #8893a7;
        cursor: pointer;
        font-size: 14px;
      }
    }
  }
  &__middle-wrap {
    padding: 24px;
    .mrt-16 {
      margin-bottom: 16px;
    }
    .warning-title {
      input {
        margin-top: 6px;
      }
      span {
        font-size: 12px;
        color: #f00;
      }
    }
    .warning-type {
      .type-content {
        display: flex;
        margin-top: 6px;
        position: relative;
        .warning-type-select {
          width: 120px;
          display: flex;
          align-items: center;
          margin-right: 8px;
          .ant-select-selection {
            width: 120px;
          }
        }
        .type-input-error-span {
          position: absolute;
          left: 130px;
          top: 32px;
          color: #f00;
          font-size: 12px;
        }
        .dynamic-div {
          display: flex;
          align-items: center;
          .ant-select {
            margin-right: 8px;
          }
        }
      }
    }
    .warning-showing {
      .ant-radio-group {
        display: block !important;
        margin-top: 8px;
        .ant-radio-wrapper {
          margin-right: 24px;
        }
      }
    }
    .warning-color {
      .color-wrap {
        width: 40px;
        height: 32px;
        margin-top: 6px;
        border-radius: 4px;
        border: 1px solid rgba(212, 215, 224, 1);
        padding: 4px;
        /** 颜色选择器 **/
        .m-colorPicker {
          width: 100% !important;
          height: 100% !important;
          .box {
            width: 212px;
            margin-top: 0;
            left: 35px;
            top: -142px;
          }
          .colorBtn {
            width: 100% !important;
            height: 100% !important;
          }
        }
      }
    }
  }
  &__bottom-wrap {
    height: 53px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid #e0e3e9;
    button {
      margin-left: 8px;
    }
  }
}
</style>
