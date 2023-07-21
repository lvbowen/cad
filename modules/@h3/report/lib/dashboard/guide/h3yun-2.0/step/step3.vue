<template>
  <div v-if="step > 2" :class="prefixCls">
    <div class="h3-report-models">
      <div :class="dataSourcPrefixCls">
        <div :class="[`${dataSourcPrefixCls}__title`]">
          <i class="h3-report-icon form"></i>
          <span>{{ dataSource.displayName }}</span>
        </div>
        <div ref="authorization" :class="[`${dataSourcPrefixCls}__authorization`]">
          <label>图表权限</label>
          <a-radio-group
            value="a"
            name="dataSourceGroup"
            :class="[`${dataSourcPrefixCls}__dataSourceGroup`]"
          >
            <a-radio value="a">成员对数据源表单的权限</a-radio>
            <a-radio value="b">数据源表单中的全部数据</a-radio>
          </a-radio-group>
        </div>
        <div
          :class="[`${dataSourcPrefixCls}__fields`]"
        >
          <label>字段列表</label>
          <div
            :class="[`${dataSourcPrefixCls}__fields--content`]"
          >
            <div
              :class="[`${dataSourcPrefixCls}__schema`]"
            >
              <label>{{ dataSource.displayName }}</label>
              <h3-draggable
                handle=".report-field"
                :value="dataSource.schema"
                :options="dragOptions"
                :clone="fieldClone"
                @start="fieldDragging"
                @end="fieldDragEnd"
              >
                <div
                  v-for="(field, i) in dataSource.schema"
                  :key="i"
                  :id="`${dataSourcPrefixCls}__field-${i}`"
                  :class="[`${dataSourcPrefixCls}__field`, 'report-field']"
                >
                  <i class="h3-report-icon down-o"></i>
                  <i :class="['h3-report-icon', field.type]"></i>
                  <span>{{ field.name }}</span>
                </div>
              </h3-draggable>
            </div>
          </div>
        </div>
      </div>
      <div class="h3-report-models__header">
        <label>数据来源</label><a>更改</a>
      </div>
    </div>
    <div class="h3-report-tools">
      <a-tabs
        class="tab-nav"
        activeKey="a"
      >
        <a-tab-pane
          key="a"
          tab="数据设置"
        >
          <div :class="[`${toolsPrefixCls}__wrap`]">
            <!-- 图表切换 -->
            <div class="h3-report-chart-switch-module report-modules" data="图表类型">
              <div class="h3-report-chart-switch-module__header report-modules__header">
                <label>图表类型</label>
              </div>
              <div class="h3-report-chart-switch-module__switch">
                <img src="">
                <label>柱状图</label>
                <i class="h3yun_All down-o"></i>
              </div>
            </div>
            <!-- 纬度 -->
            <div :class="['h3-report-dimension-module', 'report-modules', step === 3 ? 'introjs-showElement introjs-relativePosition' : '']">
              <div class="h3-report-dimension-module__header report-modules__header">
                <label>维度</label>
                <i class="h3yun_All question-circle-o h3-report-dimension-module__icon"></i>
              </div>
              <div :class="['h3-report-fields', step === 3 && isDragging ? 'h3-report-fields--dragging' : '']">
                <h3-draggable
                  handle=".report-field"
                  v-model="dimensionField"
                  :group="{ name: 'fields' }"
                  class="h3-report-fields__list"
                >
                  <div
                    v-for="(field, i) in dimensionField"
                    :key="i"
                    class="h3-report-fields__field report-field"
                  >
                    <i class="h3-report-icon down-o"></i><span>{{ field.name }}</span>
                    <i class="h3-report-icon h3-close"></i>
                  </div>
                </h3-draggable>
                <div v-if="step < 4 && dimensionField.length < 1" class="h3-report-fields__empty">拖动左侧字段到此处</div>
              </div>
            </div>
            <!-- 指标 -->
            <div :class="['h3-report-metric-module' ,'report-modules' , step === 4 ? 'introjs-showElement introjs-relativePosition' : '']">
              <div class="h3-report-metric-module__header report-modules__header">
                <label>指标</label>
                <i class="h3yun_All question-circle-o h3-report-metric-module__icon"></i>
              </div>
              <div :class="['h3-report-fields', step === 4 && isDragging ? 'h3-report-fields--dragging' : '']">
                <h3-draggable
                  handle=".report-field"
                  v-model="metricField"
                  :group="{ name: 'fields' }"
                  class="h3-report-fields__list"
                >
                  <div
                    v-for="(field, i) in metricField"
                    :key="i"
                    class="h3-report-fields__field report-field"
                  >
                    <i class="h3-report-icon down-o"></i><span>{{ field.name }}</span>
                    <i class="h3-report-icon h3-close"></i>
                  </div>
                </h3-draggable>
                <div v-if="step < 5 && metricField.length < 1" class="h3-report-fields__empty">拖动左侧字段到此处</div>
              </div>
            </div>

            <!-- 过滤器 -->
            <div :class="['h3-report-screen-module', 'report-modules', step === 5 ? 'introjs-showElement introjs-relativePosition' : '']">
              <div class="h3-report-screen-module__header report-modules__header">
                <label>过滤条件</label>
              </div>
              <div :class="['h3-report-fields', step === 5 && isDragging ? 'h3-report-fields--dragging' : '']">
                <h3-draggable
                  handle=".report-field"
                  v-model="filterField"
                  :group="{ name: 'fields' }"
                  class="h3-report-fields__list"
                >
                  <div
                    v-for="(field, i) in filterField"
                    :key="i"
                    class="h3-report-fields__field report-field"
                  >
                    <i class="h3-report-icon down-o"></i><span>{{ field.name }}</span>
                    <i class="h3-report-icon h3-close"></i>
                  </div>
                </h3-draggable>
                <div v-if="step < 6 && filterField.length <1" class="h3-report-fields__empty">拖动左侧字段到此处</div>
              </div>
            </div>

            <!-- 帮助提醒 -->
            <div :class="[`${toolsPrefixCls}__wrap--help`]">
              详细了解维度、指标和过滤条件
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="b" tab="显示设置"></a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Provide, Vue, Watch, Inject } from 'vue-property-decorator';
import { Mutation, Action, State, namespace } from 'vuex-class';
import { Modal, Input, Tooltip, Icon , Radio, Tabs} from '@h3/antd-vue';
import H3Draggable from 'vuedraggable';
const ReportPro = namespace('report');

@Component({
  name: 'h3-yun-guide-step-3',
  components: {
    AModal:Modal,
    AInput:Input,
    AIcon:Icon,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ATabs: Tabs,
    ATabPane: Tabs.TabPane,
    H3Draggable,
  },
})
export default class ReportStep extends Vue {
  @ReportPro.State('global') global!: H3.Report.Global;
  @Prop({ default: false })  visible!: boolean;
  @Prop({ default: 0 })  step!: number;
  @Inject({ default: () => {} }) setStep!: Function;


  prefixCls = 'h3-yun-guide-step-3';

  dataSourcPrefixCls = 'h3-report-data-source';
  toolsPrefixCls = 'h3-report-tools';

  isDragging: boolean = false;

  dragOptions = {
    group: { name: 'fields', pull: 'clone', put: false },
    sort: false,
    forceFallback: true,
    fallbackClass: `${this.dataSourcPrefixCls}__dragging-field`,
    fallbackOnBody: true
  };


  dataSource :any = {
    displayName: '深圳奥力给营业报表',
    title: '深圳奥力给营业报表',
    schema:[
      {
        uid: "",
        schemaCode: "z7wpswkjztvcheut840dioiq6",
        field: "Name",
        name: "数据标题",
        dataType: 14,
        visible: true,
        type: "string",
        alias: "",
        needAlias: false,
        relation: false,
        options: {}
      },
      {
        uid: "",
        schemaCode: "z7wpswkjztvcheut840dioiq6",
        field: "Name",
        name: "店铺名称",
        dataType: 14,
        visible: true,
        type: "string",
        alias: "",
        needAlias: false,
        relation: false,
        options: {}
      },
      {
      uid: "",
      schemaCode: "z7wpswkjztvcheut840dioiq6",
      field: "CreatedBy",
      name: "店铺编号",
      dataType: 14,
      visible: true,
      type: "string",
      alias: "",
      needAlias: true,
      relation: false,
      options: {}
      },
      {
      uid: "",
      schemaCode: "z7wpswkjztvcheut840dioiq6",
      field: "OwnerId",
      name: "营业额",
      dataType: 7,
      visible: true,
      type: "number",
      alias: "",
      needAlias: true,
      relation: false,
      options: {}
      },
      {
      uid: "",
      schemaCode: "z7wpswkjztvcheut840dioiq6",
      field: "OwnerDeptId",
      name: "净利润",
      dataType: 26,
      visible: true,
      type: "string",
      alias: "",
      needAlias: true,
      relation: false,
      options: {}
      },
      {
      uid: "",
      schemaCode: "z7wpswkjztvcheut840dioiq6",
      field: "CreatedTime",
      name: "创建时间",
      dataType: 5,
      visible: true,
      type: "date",
      alias: "",
      needAlias: false,
      relation: false,
      options: {}
      },
      {
      uid: "",
      schemaCode: "z7wpswkjztvcheut840dioiq6",
      field: "ModifiedTime",
      name: "修改时间",
      dataType: 5,
      visible: true,
      type: "date",
      alias: "",
      needAlias: false,
      relation: false,
      options: {}
      },
      {
      uid: "",
      schemaCode: "z7wpswkjztvcheut840dioiq6",
      field: "F0000001",
      name: "季度",
      dataType: 14,
      visible: true,
      type: "string",
      alias: "",
      needAlias: false,
      relation: false,
      options: {}
      },
      {
        uid: "",
        schemaCode: "z7wpswkjztvcheut840dioiq6",
        field: "CreatedBy",
        name: "创建人",
        dataType: 26,
        visible: true,
        type: "string",
        alias: "",
        needAlias: true,
        relation: false,
        options: {}
      },
      {
        uid: "",
        schemaCode: "z7wpswkjztvcheut840dioiq6",
        field: "OwnerId",
        name: "拥有者",
        dataType: 26,
        visible: true,
        type: "string",
        alias: "",
        needAlias: true,
        relation: false,
        options: {}
      },
      {
        uid: "",
        schemaCode: "z7wpswkjztvcheut840dioiq6",
        field: "OwnerDeptId",
        name: "所属部门",
        dataType: 26,
        visible: true,
        type: "string",
        alias: "",
        needAlias: true,
        relation: false,
        options: {}
      },
    ],
  }

  dimensionField: Array<any> = [];
  metricField: Array<any> = [];
  filterField: Array<any> = [];



  fieldDragging(evt: any) {
    this.isDragging = true;
  }
  /**
   * 排序结束
   */
  fieldDragEnd(evt: any) {
    this.isDragging = false;
    let endClass = evt.to.className;
    if (endClass === 'h3-report-fields__list') {
      if (this.step === 3) {
        this.dimensionField.push(this.dataSource.schema[1])
        this.setStep(4);
      } else if (this.step === 4) {
        this.metricField.push(this.dataSource.schema[2])
        this.setStep(5);
      } else if (this.step === 5) {
        this.filterField.push(this.dataSource.schema[7])
        this.setStep(6);
      }
    }
  }

  fieldClone(field: H3.Report.FieldColumn) {
  }

  mounted() {
  }

  destroyed() {
  }
}
</script>
<style lang="less">
.h3-yun-guide-step-3{
    position: absolute;
    display: flex;
    right: 0;
    width: 420px;
    height: 100%;
    top: 0;
    background: #fff;

    .report-modules{
      background: #fff;
    }
    .h3-report-data-source__field:hover{
      background: none;
    }
}
</style>
