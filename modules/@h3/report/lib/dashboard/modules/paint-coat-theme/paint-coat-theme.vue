<!-- 仪表盘主题 -->
<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__header`">
      <label>仪表盘样式</label>
    </div>
    <div :class="`${prefixCls}__body`">
      <ul :class="`${prefixCls}__pic-wrap`">
        <!-- <i class="h3yun_All left-o"></i> -->
        <li
          :key="index"
          v-for="(item, index) in themeList"
          :class="{'selected' : item.themeType === defaultSelect}"
          :style="{backgroundImage: 'url('+ item.url +')'}"
          @click="liClick(item, index)"
        >
        </li>
        <!-- <i class="h3yun_All right-o"></i> -->
        <!-- <ul class="circle-wrap">
          <li v-for="items in circleList"></li>
        </ul> -->
      </ul>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { paints } from '@h3/report/basics/enum/paint';

const ReportPro = namespace('report');

@Component({
  name: 'h3-report-paint-coat-theme',
  components: {}
})

export default class ReportPaintCoatThemeModule extends Vue {
  @ReportPro.State('global') global!: H3.Report.Global;
  prefixCls: string = 'h3-report-paint-coat-theme';
  // 主题List
  themeList: { [key: string]: any } = paints;
  defaultSelect: string = '';

  /**
   * 监听styles
   */
  @Watch('global.styles', { deep: true })
  watchStyles(val) {
    this.defaultSelect = val.paintCoatTheme;
  }

  // /**
  //  * 获取分页器数量
  //  */
  // get circleList() {
  //   const listLength = (this.themeList.length / 6) < 1 ? 1 : (this.themeList.length / 6);
  //   return parseInt(listLength.toString());
  // }

  /**
   * li - click
   * @param item
   * @param index
   */
  liClick(item: any, index: number) {
    this.defaultSelect = item.themeType;
    this.$nextTick(() => {
      // 仪表盘主题 - 赋值
      this.global.styles.paintCoatTheme = this.themeList[index].themeType;
      // 仪表盘背景色 - 赋值
      this.global.styles.paintCoat = {
        type: this.themeList[index].paintCoatType,
        value: this.themeList[index].paintCoatValue
      };
      // 组件背景色 - 赋值
      this.global.styles.elementCoat = {
        type: this.themeList[index].elementCoatType,
        value: this.themeList[index].elementCoatValue
      };
    });
    if (item.themeType !== 'default') {
      this.$nextTick(() => {
        // 更改非默认主题，字体变成默认色（白色）
        (this.global.styles.fontSetting as H3.Report.FontSetting) = {
          titleColor: '#ffffff',
          fontColor: '#ffffff'
        };
      })
    } else {
      this.$nextTick(() => {
        // 恢复默认
        (this.global.styles.fontSetting as H3.Report.FontSetting) = {
          titleColor: '#304265',
          fontColor: '#304265'
        }
      })
    }
  }

  created() {
    this.defaultSelect = this.global.styles.paintCoatTheme;
  }
}
</script>

<style lang='less'>
@import "~@h3/report/basics/styles/theme.less";

.h3-report-paint-coat-theme {
  &__header {
    padding-top: 16px;

    label {
      font-size: 14px;
      font-weight: 600;
      color: #304265;
    }
  }

  &__body {
    position: relative;
    padding: 16px 22px;
    border-bottom: 1px solid @report-border-line-color;
  }

  &__pic-wrap {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0;

    li {
      width: 30%;
      height: 80px;
      margin: 0 12px 12px 0;
      border-radius: 4px;
      cursor: pointer;
      background-repeat: no-repeat;
    }

    li:nth-child(3n+3) {
      margin-right: 0;
    }

    li:nth-child(n+4) {
      margin-bottom: 0;
    }

    .selected {
      box-shadow: 0 0 0 2px #107FFF;
    }

    // 分页器样式
    i {
      position: absolute;
      color: #304265;
      font-size: 12px;
      top: 42%;
      cursor: pointer;
    }

    .left-o {
      left: 0;
    }

    .right-o {
      right: 0;
    }

    .circle-wrap {
      display: flex;
      position: absolute;
      bottom: 0;
      left: 50%;
      margin-bottom: 0;

      li {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #C9CCD8;
        margin: 0 8px 0 0;
      }
    }
  }
}
</style>
