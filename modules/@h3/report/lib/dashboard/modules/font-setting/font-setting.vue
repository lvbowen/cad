<!-- 字体设置 -->
<template>
  <div :class="[prefixCls, comPrefixCls]">
    <div :class="[`${prefixCls}__header`]">
      <label>{{ module.title }}</label>
    </div>
    <div :class="`${prefixCls}__body`">
      <label>标题颜色</label>
      <div :class="`${prefixCls}__color-wrap`" id="title-color-id">
        <colorPicker
          ref="titleColorRef"
          v-clickoutside="titleColorHandle"
          :value="data.titleColor || ''"
          :defaultColor="module.defaultTitleColor || global.styles.fontSetting.titleColor"
          @change="titleColorChange"
        >
        </colorPicker>
      </div>
    </div>
    <div :class="`${prefixCls}__body`">
      <label>字体颜色</label>
      <div :class="`${prefixCls}__color-wrap`" id="font-color-id">
        <colorPicker
          ref="fontColorRef"
          v-clickoutside="fontColorHandle"
          :value="data.fontColor || ''"
          :defaultColor="module.defaultFontColor || global.styles.fontSetting.fontColor"
          @change="fontColorChange"
        >
        </colorPicker>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
  import {Component, Vue, Prop, Watch, Mixins} from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import vcolorpicker from 'vcolorpicker';
import ClickOutSide from 'vue-v-clickoutside';
import ColorMixins from '../mixins/color';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');

@Component({
  name: 'h3-report-font-color',
  components: {
    colorPicker: vcolorpicker.colorPicker,
  },
  directives: {
    'clickoutside': ClickOutSide
  }
})

export default class ReportFontSettingModule extends Mixins(ColorMixins) {
  @Prop({ default: () => ({}) }) data!: H3.Report.FontSetting;
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.FontSetting;
  @Prop({ default: () => '' }) comPrefixCls!: string;
  @ReportPro.State('global') global!: H3.Report.Global;
  @ReportPro.Mutation(ReportMutation.RESIZECHARTVIEW) resizeChartView!: Function;
  prefixCls: string = 'h3-report-font-color';

  fontColorHandle() {
    (this.$refs.fontColorRef as any).openStatus = false;
  }

  titleColorHandle() {
    (this.$refs.titleColorRef as any).openStatus = false;
  }

  /**
   * fontColorChange - change
   * @param value
   */
  fontColorChange(value: string) {
    if (value === (this.global.styles.fontSetting as any).fontColor) {
      this.$set(this.data, 'fontColor', null);
    } else {
      this.$set(this.data, 'fontColor', value);
    }
    this.resizeChartView({ chart: this.chart, type: 'view' });
  }

  /**
   * titleColor - change
   * @param value
   */
  titleColorChange(value: string) {
    if (value === (this.global.styles.fontSetting as any).titleColor) {
      this.$set(this.data, 'titleColor', null);
    } else {
      this.$set(this.data, 'titleColor', value);
    }
  }
}
</script>

<style lang='less'>
  .h3-report-font-color {
    border-bottom: none !important;
    &__header {
      label {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        margin-bottom: 0;
        color: #304265;
      }
    }
    &__body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      margin-top: 8px;
      label {
        color: #304265;
        font-size: 14px;
        font-weight: 400;
      }
    }
    &__color-wrap {
      width: 118px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid #d4d7e0;
      padding: 4px;
      .m-colorPicker {
        width: 100% !important;
        height: 100% !important;
        .box {
          width: 212px;
          margin-top: 6px;
        }
        .box.open {
          z-index: 100;
        }
        .colorBtn {
          width: 100% !important;
          height: 100% !important;
        }
      }
    }
  }
</style>
