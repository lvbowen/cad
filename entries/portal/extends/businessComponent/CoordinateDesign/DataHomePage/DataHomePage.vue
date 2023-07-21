<template>
  <div class="data-container">
    <div class="header">
      <a-month-picker :disabled="true" placeholder="请选择月份！" style="margin:0 10px 0 auto"/>
      <a-select :defaultValue="groupAll[0]" style="width: 160px;margin-right: 2%" @change="changeGroup">
        <a-select-option
          :value="v"
          :title="v"
          v-for="v in groupAll"
          :disabled="v!=='智慧工程事业部'&&v!=='全部事业部'"
          :key="v">{{ v }}</a-select-option>
      </a-select>
    </div>
    <img :src="isAll?picAll:picZH" alt="" class="img-container">
  </div>
</template>
<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Select from "ant-design-vue/lib/select";
import "ant-design-vue/lib/select/style/index.css";
import DatePicker from "ant-design-vue/lib/date-picker";
import "ant-design-vue/lib/date-picker/style/index.css";

import picAll from '../../../../src/assets/extends/CoordinateDesign/dataHomePage/组51.png'
import picZH from '../../../../src/assets/extends/CoordinateDesign/dataHomePage/组51拷贝.png'

@Component({
  name: "DataHomePage",
  components: {ASelect: Select, ASelectOption: Select.Option, AMonthPicker: DatePicker.MonthPicker},
})
export default class DataHomePage extends Vue {
  picAll: HTMLImageElement = picAll;
  picZH: HTMLImageElement = picZH;
  isAll: boolean = true;
  groupAll: Array<string> = ['全部事业部', '水运工程事业部', '航运工程事业部', '海外工程事业部', '路桥工程事业部', '城乡建设事业部', '水务环保工程事业部', '智慧工程事业部','岩土勘察事业部', '工程建设事业部', '国内市场开发部'];

  changeGroup(v) {
    console.log('选择事业部', v)
    this.isAll = v=== '全部事业部'
  }
}
</script>
<style lang="less" scoped>
@import "../../../styles/public.module.less";

.data-container {
  width: 100.05vw;
  height: 101.2%;
  .bg-full;
  .flex-column;
  background-image: url("../../../../src/assets/extends/CoordinateDesign/dataHomePage/bg.png");
  margin: 0 0 -0.5608vw -0.55vw;
  overflow: hidden;

  .img-container {
    width: 96%;
    height: calc(100% - 80px);
    margin: 0 auto;
  }

  .header {
    .flex;
    .flex-center-align;
    height: 40px;
    width: 100%;

    /deep/ .ant-calendar-picker-icon {
      color: #fff;
    }

    /deep/ .ant-input {
      background: transparent;
    }

    /deep/ .ant-select-selection {
      color: #ffffff;
      background: transparent;
    }

    /deep/ .ant-select-dropdown-menu {
      background: transparent;
      color: #FFFFFF;
    }

    /deep/ .ant-select-arrow {
      color: #FFFFFF;
    }
  }
}
</style>
