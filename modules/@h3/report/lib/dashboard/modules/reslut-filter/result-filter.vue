<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__close`" @click="cancel">
      <i class="h3yun_All close"></i>
    </div>
    <div :class="`${prefixCls}__check`">
      <a-checkbox @change="onCheckChange" :checked="setResultFilter">使用结果筛选器</a-checkbox>
    </div>
    <div :class="`${prefixCls}__setting`">
      <div :class="`${prefixCls}__setting__modules`">
        <span :class="`${prefixCls}__setting__modules-title`">筛选逻辑</span>
        <a-select
          style="width: 120px"
          :disabled="!setResultFilter"
          v-model="logic"
          :options="filterLogics"
          @change="onChangeLogic"
        >
        </a-select>
      </div>
      <div :class="`${prefixCls}__setting__modules`" v-if="showFilterCondition">
        <span :class="`${prefixCls}__setting__modules-title`">筛选条件</span>
        <a-input-number
          style="width: 100%"
          placeholder="请输入数值"
          v-if="!showFilterRange"
          v-model="numberResult"
          :disabled="!setResultFilter"
          :class="{'h3-result-error': showError}"
          @focus="showError = false"
          @blur="updateData"
        />
        <div v-else :class="`${prefixCls}__setting__modules-range`">
          <a-input-number
            style="width: 133px;margin-right: 8px"
            placeholder="最小值"
            v-model="leftRange.data"
            :class="{'h3-result-error': showError}"
            :disabled="!setResultFilter"
            @focus="showError = false"
            @blur="updateData"
          />

          <a-select
            v-model="leftRange.logic"
            :options="filterRangeLogic"
            
            style="width: 66px;margin-right: 8px"
            @change="updateData"
          >
          </a-select>

          <span style="margin-right: 8px"> 结果</span>

          <a-select
            v-model="rightRange.logic"
            :options="filterRangeLogic"
            style="width: 66px;margin-right: 8px"
            @change="updateData"
          >
          </a-select>

          <a-input-number
            v-model="rightRange.data"
            placeholder="最大值"
            style="width: 133px"
            :class="{'h3-result-error': showError}"
            :disabled="!setResultFilter"
            @focus="showError = false"
            @blur="updateData"
          />

        </div>
        <span :class="`${showError ? `${prefixCls}--error-tip` : `${prefixCls}--error-tip-disabled`}`">{{ errorMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  Checkbox,
  InputNumber,
  Select,
} from '@h3/antd-vue';
import { NumberType } from '@h3/report/basics/enum/filter-type'
@Component({
  name: 'h3-report-result-filter',
  components: {
    ACheckbox: Checkbox,
    AInputNumber: InputNumber,
    ASelect: Select,
    ASelectOption: Select.Option,
  }
})
export default class resultFilter extends Vue {
  @Prop() value!: H3.Report.ResultFilter;

  filterLogics: Array<any> = [
    {
      key: NumberType.Equal,
      value: NumberType.Equal,
      label: '等于',
      symbol: '='
    }, {
      key: NumberType.NotEqual,
      value: NumberType.NotEqual,
      label: '不等于',
      symbol: '≠'
    }, {
      key: NumberType.Above,
      value: NumberType.Above,
      label: '大于',
      symbol: '＞'
    }, {
      key: NumberType.NotBelow,
      value: NumberType.NotBelow,
      label: '大于等于',
      symbol: '≥'
    }, {
      key: NumberType.Below,
      value: NumberType.Below,
      label: '小于',
      symbol: '＜'
    }, {
      key: NumberType.NotAbove,
      value: NumberType.NotAbove,
      label: '小于等于',
      symbol: '≤'
    }, {
      key: NumberType.Range,
      value: NumberType.Range,
      label: '选择范围',
      symbol: '~'
    }, {
      key: NumberType.None,
      value: NumberType.None,
      label: '为空',
      symbol: '='
    }, {
      key: NumberType.NotNone,
      value: NumberType.NotNone,
      label: '不为空',
      symbol: '='
    }
  ];

  prefixCls: string = 'h3-report-result-filter'
  // 是否开启结果筛选器
  setResultFilter: boolean = false;
  // 默认的筛选逻辑
  logic: string = NumberType.Equal;
  // 筛选条件输入框数值
  numberResult: number|null = null;
  // 左范围值
  leftRange: any = {
    data: null,
    logic: NumberType.Below
  }
  // 右范围值
  rightRange: any = {
    data: null,
    logic: NumberType.Below
  }
  // 是否显示错误提示
  showError: boolean = true

  get filterRangeLogic() {
    return this.filterLogics
              .filter(i => i.key === NumberType.Below || i.key === NumberType.NotAbove)
              .map(f => {
                return Object.assign({}, f, {
                  label: f.symbol
                });
              }) ;
  }
  // 错误提示
  get errorMsg() {
    return this.logic === NumberType.Range ? '最大值不能小于或等于最小值' : '内容不可为空'
  }

  // 是否显示筛选条件
  get showFilterCondition() {
    return this.logic !== NumberType.None && this.logic !== NumberType.NotNone ;
  }
  // 是否显示筛选范围
  get showFilterRange() {
    return this.logic === NumberType.Range
  }
  // 输出结果
  get inputValue(): H3.Report.ResultFilter {
    let range = {
      leftData: this.leftRange.data,
      leftLogic: this.leftRange.logic,
      rightData: this.rightRange.data,
      rightLogic: this.rightRange.logic,
    };

    let condition = this.logic === NumberType.Range ? JSON.stringify(range) : this.numberResult;
    return {
      display: this.setResultFilter,
      logic: this.logic,
      condition,
    }
  }

  /**
   * 点击checkbox事件
   */
  onCheckChange(e) {
    this.setResultFilter = e.target.checked;
    if (!this.setResultFilter) {
      this.logic = NumberType.Equal;
      this.reSetValue();
    }
    this.updateData();
  }

  /**
   * 更改筛选逻辑
   */
  onChangeLogic(value) {
    // 更改一次清空一次输入的值
    // this.showFilterCondition = value !== NumberType.None || value !== NumberType.NotNone;
    // this.showFilterRange = value === NumberType.Range;
    // 切换逻辑时清空i次值
    this.reSetValue();

    this.updateData();
  }

  /**
   * 更新数据 回调
   */
  updateData() {
    this.showError = true;
    this.$emit('input', this.inputValue);
  }

  /**
   * 重置默认值
   */
  reSetValue() {
    this.numberResult = null;
    this.leftRange = {
      data: null,
      logic: NumberType.Below
    }
    this.rightRange = {
      data: null,
      logic: NumberType.Below
    }
  }

  /**
   * 取消
   */
  cancel() {
    this.$emit('cancel');
  }

  /**
   * 初始化设置数据
   */
  init() {
    this.setResultFilter = this.value.display;
    this.logic = this.value.logic;
    if (this.logic === NumberType.Range) {
      let params = JSON.parse(this.value.condition as string);
      this.leftRange.data = params.leftData;
      this.leftRange.logic = params.leftLogic || NumberType.Below;
      this.rightRange.logic = params.rightLogic || NumberType.Below;
      this.rightRange.data = params.rightData;
    } else {
      this.numberResult = this.value.condition as number | null
    }
  }

  mounted() {
    if (this.value) {
      this.init();
    }
  }
  
}
</script>

<style lang='less'>
.h3-report-result-filter__close{
  position: absolute;
  top: 16px;
  right: 24px;
  font-size: 16px;
  cursor: pointer;
}
.h3-report-model-error {
  .h3-report-result-filter{
    .h3-result-error{
      border: 1px solid #FF4384;
    }
    .h3-report-result-filter--error-tip {
      color: #FF4384
    }
  }
}
.h3-report-result-filter{
  &__setting{
    display: flex;
    margin-top: 24px;
    &__modules{
      display: flex;
      flex-direction: column;
      margin-right: 8px;
      &:last-child{
        flex: 1;
        margin-right: 0px;
      }
      &-title{
        font-size:14px;
        color:#304265;
        line-height:22px;
        margin-bottom: 4px;
      }
      &-range{
        display: flex;
        align-items: center;
      }
    }
  }
  &--error-tip, &--error-tip-disabled{
    margin-top: 4px;
    color: transparent;
  }
}
  
</style>
