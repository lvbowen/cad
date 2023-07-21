<template>
  <report-header :class="prefixCls">
    <h2
      :class="[prefixCls+ '__title']"
    >{{ title }}</h2>
    <div :class="[`${prefixCls}__btns`]">
      <a :class="[prefixCls+ '__preview', `${prefixCls}__btn`]">
        <i class="h3yun_All eye-o"></i>
        <span>编辑</span>
      </a>
      <a :class="[prefixCls+ '__out', `${prefixCls}__btn`]">
        <i class="h3yun_All logout-o"></i>
        <span>退出</span>
      </a>
    </div>
  </report-header>
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {
  Form,
  Input,
  Select,
  Checkbox,
  Tooltip,
  Icon,
  Button,
} from '@h3/antd-vue';
import ReportHeader from '../header.vue';

@Component({
  name: 'h3-report-show-header',
  components: {
    ReportHeader,
  }
})
export default class ReportDesignerHeader extends Vue {
  @Prop({default: ''}) title !: string;
  prefixCls = 'h3-report-show-header';
}
</script>
<style lang="less" scoped>
.h3-report-show-header {
  padding: 0 20px;
  justify-content: space-between;

  &__title {
    cursor: text;
    font-size: 16px;
    padding: 4px 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__btns {
    display: flex;
  }

  &__btn {
    display: inline-block;
    text-align: center;
    height: 44px;
    font-size: 12px;
    margin-left: 20px;
    color: rgba(0, 0, 0, 0.45);
    font-weight: bold;

    i {
      display: block;
      font-size: 16px;
    }

    span {
      display: block;
      width: 100%;
    }
  }

  &__btn:hover {
    color: #107FFF;
  }
}
</style>
