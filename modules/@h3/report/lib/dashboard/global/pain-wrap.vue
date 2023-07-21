<!-- 颜色设置皮 -->
<template>
  <div :class="prefixCls">
    <!-- 仪表盘主题 -->
    <paint-coat-theme></paint-coat-theme>
    <!-- 仪表盘背景 -->
    <paint-coat
      :chart="global"
      :data="global.styles.paintCoat"
      :module="globalModules.styles.paintCoat"
    ></paint-coat>
    <!-- 组件背景 -->
    <div :class="`${prefixCls}__element-coat`">
      <element-coat
        :chart="global"
        :data="global.styles.elementCoat"
        :module="globalModules.styles.elementCoat"
        @element-coat-color-change="elementCoatColorChange"
      ></element-coat>
    </div>
    <!-- 字体设置 -->
    <div :class="`${prefixCls}__font-setting`">
      <font-setting
        :chart="global"
        :module="globalModules.styles.fontSetting"
        :data="global.styles.fontSetting"
      ></font-setting>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import paintCoatTheme from '../modules/paint-coat-theme/index';
import paintCoat from '../modules/paint-coat/index';
import ElementCoat from '../modules/element-coat';
import FontSetting from '../modules/font-setting';
import { Color,ThemeType,CoatType } from '@h3/report/basics/enum/paint';
const ReportPro = namespace('report');

@Component({
  name: 'h3-report-paint-wrap',
  components: {
    paintCoatTheme,
    paintCoat,
    ElementCoat,
    FontSetting,
  }
})

export default class ReportPaintWrapModule extends Vue {
  @ReportPro.State('global') global!: H3.Report.Global;
  @ReportPro.State('globalModules') globalModules!: H3.ReportModules.GlobalModules;
  prefixCls: string = 'h3-report-paint-wrap';
  fontSettingModule: H3.ReportModules.FontSetting = {
    title: '字体设置',
    display: true,
  };

  /**
   * 获取背景色改变事件
   * @param elementCoat
   */
  elementCoatColorChange(elementCoat: H3.Report.ElementCoat) {
    this.global.styles.elementCoat = elementCoat;
    if(this.global.styles.paintCoatTheme !== ThemeType.DEFAULT) {
      this.global.styles.elementCoat = elementCoat;
      this.global.styles.paintCoatTheme = ThemeType.DEFAULT;
      this.global.styles.paintCoat.type = CoatType.BGCOLOR;
      this.global.styles.paintCoat.value = Color.PAINTCOATVALUE;
      this.global.styles.fontSetting.fontColor = Color.FONTCOLOR;
      this.global.styles.fontSetting.titleColor = Color.TITLECOLOR;
    }
  }
}
</script>

<style lang='less'>
  @import "~@h3/report/basics/styles/theme.less";
  .h3-report-paint-wrap {
    position: relative;
    &__element-coat {
      padding: 16px 0;
      border-bottom: 1px solid @report-border-line-color;
      .h3-report-element-coat__body {
        padding-top: 16px;
        margin-top: 0;
        justify-content: left;
        .left-wrap {
          label {
            font-size: 14px;
            font-weight: 400;
            color: #8893a7;
            margin-right: 10px;
          }
        }
        .right-wrap {
          .h3-report-element-coat__color-wrap {
            width: 32px;
          }
        }
      }
    }
    &__font-setting {
      padding: 16px 0;
      border-bottom: 1px solid @report-border-line-color;
      .h3-report-font-color__body {
        padding-top: 16px;
        margin-top: 0;
        justify-content: left;
        label {
          font-size: 14px;
          font-weight: 400;
          color: #8893a7;
          margin-right: 10px;
        }
        .h3-report-font-color__color-wrap {
          width: 32px;
        }
      }
    }
  }
</style>
