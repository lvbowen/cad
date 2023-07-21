<template>
  <div :class="prefixCls">
    <a-radio-group
      v-if="joinList"
      :class="[`${prefixCls}__group`]"
      :value="joinType"
      @change="onChange"
    >
      <a-radio
        v-for="(item, index) in joinList"
        :key="index"
        :value="item.value"
        :class="`${prefixCls}__radio`"
      >  
        <!--   <i :class="[`${prefixCls}__icon`,`h3-report-icon ${item.value}-join`]"></i>{{ item.label }}-->
        <i :class="[`${prefixCls}__icon`,`${prefixCls}__${item.value}-join`]"></i><span>{{ item.label }}</span>
      </a-radio>
    </a-radio-group>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { radio } from '@h3/antd-vue';
import  { RelationTypeList } from '@h3/report/basics/enum/common-type'

const ReportDataSource = namespace('dataSource');
@Component({
  name: 'h3-report-join-type',
  components: {
    ARadio: radio,
    ARadioGroup: radio.Group
  }
})
export default class ReportJoinType extends Vue {
  @Prop({ default: () => ('') }) value!: string;
  prefixCls:string = 'h3-report-join-type';
  joinList: Array<{label:string,value:any}>= RelationTypeList;
  joinType : string='';
  
  @Watch("value",{immediate: true})
  changeValue(value: string) {
    this.joinType = value;
  }
  /**
   * 改变关联方式
   * @param e
   */
  onChange(e: Event) {
    this.joinType = (e.target as HTMLInputElement).value;
    this.$emit("on-change",(e.target as HTMLInputElement).value)
  }
}
</script>
<style lang="less">
  .h3-report-join-type {
    height: 100%;
    display: flex;
    flex-direction: column;
    &__radio{
      display: flex;
      align-items: center;
      span ~ span {
        display: flex;
        align-items: center;
      }
    }
    &__icon {
      display: inline-block;
      height: 17px;
      width: 17px;
      margin: 0 8px;
    }
    &__left-join{
      background: url('~@h3/report/basics/assets/data-source/left-join.png');
    }
    &__right-join{
      background: url('~@h3/report/basics/assets/data-source/right-join.png');
    }
    &__inner-join{
      background: url('~@h3/report/basics/assets/data-source/inner-join.png');
    }
    &__group{
      display: flex;
      flex-direction: column;
      .ant-radio-wrapper{
        margin: 5px 0 5px 12px;
      }
    }
  }
</style>
