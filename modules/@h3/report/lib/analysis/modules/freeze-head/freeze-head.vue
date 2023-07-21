<template>
  <div>
    <row-radio
      :title="moduleOptions.rowTitle"
      :options="DataLabelOptions"
      :value="innerValue.row ? 1 : 0"
      @change="change($event, 'row')"
    ></row-radio>
    <row-radio
      :title="moduleOptions.columnTitle"
      :options="DataLabelOptions"
      :value="innerValue.column ? 1 : 0"
      @change="change($event, 'column')"
    ></row-radio>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import RowRadio from '../../component/row-radio';
import ModulesMixin from '../../mixins/modules-mixins';
import { NumberTagOptions } from '../../config/static-option';

@Component({
  name: 'h3-analysis-freeze-head',
  components: {
    RowRadio,
  }
})

export default class AnalysisFreezeHead extends Mixins(ModulesMixin) {
  // 模块配置
  @Prop({ default: () => {} }) moduleOptions!:H3.Analysis.FreezeHeadModule;
  // 模块值
  @Prop({ default: true }) value!: H3.Report.FreezeHead

  prefixCls: string = 'h3-analysis-freeze-head';

  innerValue : H3.Report.FreezeHead = this.value;

  // 选项
  DataLabelOptions: Array<{value:string | number, label:string}> = [
    {
      value: 1,
      label: '冻结'
    }, {
      value: 0,
      label: '不冻结'
    }
  ];

  change($event, key) {
    this.innerValue[key] = !!$event;
    this.onModulesChange(this.chart, this.moduleKey, this.innerValue);
  }

}
</script>