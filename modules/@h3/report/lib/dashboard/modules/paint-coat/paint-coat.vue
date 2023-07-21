<!-- 全局颜色设置 -->
<template>
  <div :class="prefixCls">
    <!-- 仪表盘背景 -->
    <div :class="`${prefixCls}__header`">
      <label>仪表盘背景</label>
    </div>
    <div :class="`${prefixCls}__body`">
      <div class="left-wrap">
        <label class="linshi">背景颜色</label>
        <!-- <a-radio-group
          :value="global.styles.paintCoat.type"
          @change="radioChange"
        >
          <a-radio v-for="(item, index) in radioOptions" :value="item.value">{{ item.name }}</a-radio>
        </a-radio-group> -->
      </div>
      <div class="right-wrap">
        <div :class="`${prefixCls}__color-wrap`">
          <colorPicker
            ref="globalRef"
            v-model="defaultColor"
            v-clickoutside="handleFunction"
            :defaultColor="pickerDefault"
            @change="colorChange"
          >
          </colorPicker>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import {Component, Vue, Prop, Watch, Mixins} from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import vcolorpicker from 'vcolorpicker';
import ClickOutSide from 'vue-v-clickoutside';
import { Color,ThemeType,CoatType,  paints } from '@h3/report/basics/enum/paint';
import ColorMixins from '../mixins/color';
import {
  Radio,
} from '@h3/antd-vue';

const ReportPro = namespace('report');

@Component({
  name: 'h3-report-paint-coat',
  components: {
    colorPicker: vcolorpicker.colorPicker,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
  },
  directives: {
    'clickoutside': ClickOutSide
  }
})

export default class ReportPaintCoatModule extends Mixins(ColorMixins) {
  @ReportPro.State('global') global!: H3.Report.Global;
  prefixCls: string = 'h3-report-paint-coat';
  // 仪表盘背景Options
  radioOptions: Array<any> = [
    { name: '背景颜色', value: CoatType.BGCOLOR },
    // { name: '背景图片', value: 'bgPicture' },
  ];
  defaultColor: string = '';
  pickerDefault: string = Color.PAINTCOATVALUE;

  @Watch('global.styles.paintCoatTheme', { deep: true })
  watchStyles() {
    this.getDefaultColor();
  }

  /**
   * clickoutside
   */
  handleFunction() {
    // 关闭颜色设置弹框
    (this.$refs.globalRef as any).openStatus = false;
  }

  /**
   * radio - change
   * @param e
   */
  radioChange(e: any) {
    this.$nextTick(() => {
      // 恢复默认主题
      // this.global.styles.paintCoatTheme = 'default';
      // 仪表盘背景色设置
      // this.global.styles.paintCoat = { type: e.target.value, value: 'url' };
    })
  }

  /**
   * color-picker - change
   * @param value
   */
  colorChange(value: string) {
    this.defaultColor = value;
    this.$nextTick(() => {
      // 恢复默认主题
      this.global.styles.paintCoatTheme = ThemeType.DEFAULT;
      // 仪表盘背景色设置
      this.global.styles.paintCoat = { type: paints.default.paintCoatType, value: value };
      if(this.global.styles.elementCoat && this.global.styles.elementCoat.value === Color.THEMEELEMENTCOATVALUE) {
        this.global.styles.elementCoat = { type: paints.default.elementCoatType, value: paints.default.elementCoatValue };
        this.global.styles.fontSetting = { fontColor: paints.default.fontColor, titleColor: paints.default.titleColor };
      }
    })
  }

  /**
   * 获取默认颜色
   */
  getDefaultColor() {
    if( this.global.styles.paintCoatTheme === ThemeType.DEFAULT) {
      if(this.global.styles.paintCoat.type === CoatType.BGCOLOR) {
        this.defaultColor = this.global.styles.paintCoat.value;
      }
    }else {
      this.defaultColor = Color.THEMEELEMENTCOATVALUE;
    }
  }

  created () {
    this.getDefaultColor();
  }
}
</script>

<style lang='less'>
  @import "~@h3/report/basics/styles/theme.less";
  .h3-report-paint-coat {
    &__header {
      padding-top: 16px;
      label {
        font-size: 14px;
        font-weight: 600;
        color: #304265;
      }
    }
    &__body {
      display: flex;
      align-items: center;
      position: relative;
      padding: 16px 0;
      border-bottom: 1px solid @report-border-line-color;
      .left-wrap {
        .linshi {
          font-size:14px;
          font-weight:400;
          color:rgba(136,147,167,1);
          margin-right: 10px;
        }
        .ant-radio-group {
          label {
            font-size:14px;
            color: #8893A7;
            font-weight:400;
          }
        }
      }
    }
    &__color-wrap {
      width: 32px;
      height: 32px;
      border-radius:4px;
      border:1px solid rgba(212,215,224,1);
      padding: 4px;
      /** 颜色选择器 **/
      .m-colorPicker {
        width: 100% !important;
        height: 100% !important;
        .box {
          width: 212px;
          margin-top: 6px;
          left: -5px;
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
