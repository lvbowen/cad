<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__part`]">
      <div :class="[`${prefixCls}__name`]">筛选器名称</div>
      <a-input
        placeholder="请输入名称"
        :class="{[`${prefixCls}__input`]:true}"
        :value="tmpFilterPicker.title"
        @input="titleChange($event)"
      ></a-input>
    </div>
    <div :class="[`${prefixCls}__part`]" v-if="activeType === 'date'">
      <div :class="[`${prefixCls}__name`]">筛选方式</div>
      <a-select
        :class="[`${prefixCls}__select`]"
        :options="formatList"
        :defaultValue="tmpFilterPicker.format || 'Date'"
        @change="formatChange"
      >
      </a-select>
    </div>
    <div :class="[`${prefixCls}__part`]">
      <div :class="[`${prefixCls}__name`]">默认值</div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Select, Input } from '@h3/antd-vue';
import { formatDataList } from '@h3/report/basics/enum/filter-type';
import H3Scroll from '@h3/report/basics/components/scroll';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-set-condition',
  components: {
    H3Scroll,
    AInput: Input,
    ASelect: Select,
    ASelectOption: Select.Option,
  }
})
export default class SetCondition extends Vue {
  @Prop({ default: () => {} }) filterPicker!: H3.Report.FilterPicker;
  prefixCls:string = 'h3-report-set-condition';
  activeType: 'number' | 'string' | 'date' | string= (this.filterPicker.dataSources[0].field as H3.Report.FieldColumn).type;
  tmpFilterPicker: H3.Report.FilterPicker = JSON.parse(JSON.stringify(this.filterPicker));
  formatList:Array<{label: string, value: string}>= formatDataList; // 筛选方式
  
  @Watch('filterPicker', { deep: true })
  changeFilterPicker(newFilterPicker:H3.Report.FilterPicker) {
    Object.assign(this.tmpFilterPicker, newFilterPicker);
    this.activeType = (this.filterPicker.dataSources[0].field as H3.Report.FieldColumn).type;
  }

  /**
   * 筛选器标题
   * @param value 
   */
  titleChange(value:any) {
    this.tmpFilterPicker.title = (value.target.value);
    this.$emit('change-title', value.target.value);
  }
  formatChange(value:string) {
    this.tmpFilterPicker.format = value;
    this.$emit('change-format', value);
  }
  mounted() {
    this.tmpFilterPicker.format = this.tmpFilterPicker.format ? this.tmpFilterPicker.format : 'Date';
  }
  destroyed() {}
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";

  .h3-report-set-condition {
    display: flex;
    flex-direction: column;
    &__name {
      color:#8893A7;
    }
    &__select {
      width: 100%;
      margin-top: 10px;
    }
    &__input {
      margin: 10px 0;
    }
  }
</style>
