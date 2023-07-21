<template>
  <transition name="preview-shade" @after-leave="afterLeave">
    <div
      v-show="display"
      :class="prefixCls"
    >
      <div :class="[`${prefixCls}__shade`]"></div>
      <div :class="[`${prefixCls}__content`]">
        <report-preview-header
          @close="close"
          :status="status"
          @change-type="changType"
        >
        </report-preview-header>
        <report-container
          v-if="status === 'pc'"
          :status="'preview'"
          :layoutOptions="layoutOptions"
        />
      </div>
    </div>
  </transition>
</template>

<script lang='ts'>
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ReportPreviewHeader from './header.vue';
import ReportContainer from '../container';
import { ElementType } from '@h3/report/basics/enum/chart-type';
import { ReportAction, ReportMutation } from '@h3/report/basics/store/dashboard/types';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-preview',
  components: {
    ReportPreviewHeader,
    ReportContainer
  }
})
export default class ReportPreview extends Vue {
  @ReportPro.State('reportTop') reportTop!: number;
  @ReportPro.Action(ReportAction.SETFILTERPICKER) setFilterPicker!: Function;
  @ReportPro.Mutation(ReportMutation.SETCHARTS) setCharts!: Function;
  @ReportPro.Mutation(ReportMutation.SETGLOBAL) setGlobal!: Function;
  @ReportPro.Mutation(ReportMutation.SETREPORTTOP) setReportTop!: Function;
  @ReportPro.Mutation(ReportMutation.SETOBJECTID) setObjectId!: Function;
  @ReportPro.Mutation(ReportMutation.SETTITLE) setTitle!: Function;
  prefixCls = 'h3-report-preview';
  display = false;
  status = 'pc';
  layoutOptions = {
    draggable: false,
    showGridLine: false,
    editState: false,
    mask: false,
    resizable: false,
    responsive: false,
  };
  /**
   * 预览展示
   */
  show({ charts, global, top,objectId,title }) {
    charts.forEach((element: any) => {
      if (element.type === ElementType.FILTERPICKER as any) {
        if ((element.formula !== 'Range' && element.text[0]) || (element.formula === 'Range' && element.text[0] && element.text[1]) || ['None', 'NotNone'].includes(element.formula)) {
          this.setFilterPicker({ filterPicker: element, charts });
        }
      }
    });
    this.setCharts(charts);
    this.setGlobal(global);
    // this.setReportTop(top);
    this.setObjectId(objectId);
    this.setTitle(title);
    this.display = true;
  }
  /**
   * 关闭预览
   */
  close() {
    this.display = false;
  }
  /**
   * 修改预览类型
   */
  changType(type: 'pc' | 'mobile') {
    this.status = type;
  }

  /**
   * 关闭预览完毕后销毁
   */
  afterLeave() {
    this.$destroy();
  }

  destroyed() {
    this.$emit('destroy');
  }
}
</script>
<style lang="less">
@import "~@h3/report/basics/styles/theme.less";
.h3-report-preview{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  &__shade{
    position: absolute;
    background-color: #FFF;
    width: 100%;
    height: 100%;
    opacity: 0.7;
  }
  &__content{
    display: flex;
    flex-direction: column;
    background-color: @report-background-color;
    width: 100%;
    height: 100%;
  }
}
.preview-shade-enter-active {
  animation: preview-shade .3s;
}
.preview-shade-leave-active {
  animation: preview-shade .3s reverse;
}
@keyframes preview-shade {
  0% {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0,0,0);
  }
}
</style>
