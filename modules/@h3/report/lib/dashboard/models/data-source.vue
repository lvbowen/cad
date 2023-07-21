<template>
  <div :class="prefixCls" v-if="dataSource">
    <div :class="[`${prefixCls}__title`]">
      <i class="h3-report-icon form"></i>
      <span :title="dataSource.displayName">{{ dataSource.displayName }}</span>
    </div>
    <div ref="authorization" :class="[`${prefixCls}__authorization`]">
      <label>图表权限</label>
      <a-radio-group
        name="dataSourceGroup"
        :class="[`${prefixCls}__dataSourceGroup`]"
        :value="chart.authorization"
        @change="changeAuthorization"
      >
        <a-radio
          v-for="item in authorizationList"
          :key="item.label"
          :value="item.value"
          :getPopupContainer="getPopupContainer"
        >
          {{ item.label }}
        </a-radio>
      </a-radio-group>
    </div>
    <div
      :class="[`${prefixCls}__fields`]"
    >
      <label>字段列表</label>
      <div
        :class="[`${prefixCls}__fields--content`]"
      >
        <div
          v-for="(schema, key) in dataSourceFilter"
          :key="key"
          :class="[`${prefixCls}__schema`]"
        >
          <label>{{ key }}</label>
          <h3-draggable
            handle=".report-field"
            :value="schema"
            :options="dragOptions"
            :clone="fieldClone"
            @start="fieldDragging"
            @end="fieldDragEnd"
          >
            <div
              v-for="(field, i) in schema"
              :key="i"
              :id="`${prefixCls}__field-${i}`"
              :class="[`${prefixCls}__field`, 'report-field']"
              :data-key="key"
              :data-index="i"
            >
              <i class="h3-report-icon down-o"></i><i :class="['h3-report-icon', field.type]"></i><span>{{ field.name }}</span>
            </div>
          </h3-draggable>
        </div>
      </div>
    </div>
  </div>
  <div :class="[`${prefixCls}__emptyDataSource`]" v-else>
    <img :src="require(`@h3/report/basics/assets/pro/bg-source.png`)" alt="数据源不存在">
    <label>数据源不存在</label>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import {
  Select,
  Radio,
} from '@h3/antd-vue';
import {
  H3Button
} from '@h3/awesome-ui';
import H3Draggable from 'vuedraggable';
import { ReportMutation } from '@h3/report/basics/store/dashboard/types';
import H3Scroll from '@h3/report/basics/components/scroll';
import { uuid } from '@h3/report/basics/utils/uid';

const ReportPro = namespace('report');
@Component({
  name: 'h3-report-data-source',
  components: {
    ASelect: Select,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    H3Draggable,
    H3Button,
    H3Scroll
  }
})
export default class ReportDataSource extends Vue {
  @Prop() chart!: H3.Report.Chart;
  @Prop({ default: null }) dataSource!: H3.Report.DataSource;
  @ReportPro.Mutation(ReportMutation.SETDRAGFIELD) setDragField!: Function;
  prefixCls = 'h3-report-data-source';
  authorizationList = [
    {
      label: '成员对数据源表单的权限',
      value: 1
    },
    {
      label: '数据源表单中的全部数据',
      value: 0
    }
  ];
  dragOptions = {
    group: { name: 'fields', pull: 'clone', put: false },
    sort: false,
    forceFallback: true,
    fallbackClass: `${this.prefixCls}__dragging-field`,
    fallbackOnBody: true
  };

  get dataSourceFilter() {
    const fields: { [key: string]: Array<H3.Report.FieldColumn> } = {};
    this.dataSource.properties.forEach((field: H3.Report.FieldColumn) => {
      if (field.visible && field.type !== 'other') {
        if (!fields[field.tableName]) fields[field.tableName] = [];
        fields[field.tableName].push(field);
      }
    });
    return fields;
  }
  getPopupContainer() {
    return this.$refs.authorization;
  }
  changeAuthorization(e: any) {
    this.chart.authorization = e.target.value;
  }
  /**
   * 数据源字段拖动
   */
  fieldDragging(evt: any) {
    const key = (evt.item as HTMLDivElement).getAttribute('data-key');
    const index = (evt.item as HTMLDivElement).getAttribute('data-index');
    if (key && index) {
      const field = JSON.parse(JSON.stringify(this.dataSourceFilter[key][index]));
      this.setDragField(field);
    }
  }
  /**
   * 排序结束
   */
  fieldDragEnd() {
    this.setDragField(null);
  }
  fieldClone(field: H3.Report.FieldColumn) {
    const newField = JSON.parse(JSON.stringify(field));
    newField.uid = uuid(8, 16);
    return newField;
  }
  updated() {
    if (this.$refs.scroll) {
      (this.$refs.scroll as any).setScrollBar();
    }
  }
}
</script>
<style lang="less">
  @import "~@h3/report/basics/styles/index";
  .h3-report-data-source{
    flex: 1 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 100;
    > div {
      display: flex;
      flex-direction: column;
    }
    > div:last-child {
      border-bottom: 0;
    }
    &__intro{
      position: absolute;
      z-index: 9999999999;
      width: 30px;
      height: 30px;
      top: 15px;
      right: 70px;
      &-arrow{
        border: 10px solid transparent;
        content: '';
        position: absolute;
        top: 50%;
        left: -100%;
        border-bottom-color: white;
        z-index: 2;
      }
      &-card{
        position: absolute;
        width: 180px;
        top: 114%;
        right: -60px;
        height: 110px;
        padding: 16px 12px;
        display: flex;
        background: rgba(255,255,255,1);
        box-shadow: 0px 2px 14px 0px rgba(52,94,184,0.2);
        img{
          height: 20px;
          margin-right: 12px;
        }
      }
    }
    &__title{
      display: flex;
      flex: 0 0 52px;
      padding: 0 15px;
      flex-direction: row !important;
      align-items: center;
      height: 52px;
      padding-bottom: 0 !important;
      overflow: hidden;
      border-bottom: 1px solid #DDDFE8;
      i {
        color: #FF7527;
        margin-right: 8px;
      }
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    &__authorization{
      flex: 0 0 100px;
      padding-bottom: 20px;
      border-bottom: 1px solid #DDDFE8;
      position: relative;
      label {
        font-weight:bold;
        margin: 22px 12px 8px 12px;
      }
    }
    &__dataSourceGroup {
      label {
        font-size: 12px;
        font-weight: inherit;
        margin: 0 0 0 12px;
      }
    }
    &__fields{
      flex: 1 1;
      overflow: hidden;
      margin: 20px 0;
      label {
        color: #304265;
        font-weight:600;
        margin: 0 12px;
      }
      &--content{
        height: 100%;
        .vertical-scrollbar();
      }
    }
    &__field{
      padding: 0 18px 0 16px;
      margin: 0 -12px;
      height: 32px;
      line-height: 32px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      i {
        color: @report-icon-blur-color;
        font-weight: bold;
        margin-right: 6px;
      }
      .h3-report-icon.down-o{
        display: none;
      }
    }
    &__field:hover{
      background-color: #F0F8FE;
    }
    &__dragging-field{
      width:108px;
      height:32px;
      background:rgba(255,255,255,1);
      box-shadow:0 0 14px 0 rgba(76,107,173,0.2);
      border-radius:2px;
      border:1px dashed rgba(16,127,255,1);
      cursor: move !important;
      z-index: 999999;
    }
    &__schema {
      padding: 8px 12px;
      label {
        margin: 0;
      }
    }
  }
  .h3-report-data-source__emptyDataSource {
    display: flex;
    flex: 1 1;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    label {
      margin-top: 20px;
      margin-bottom: 0;
      font-size: 14px;
      color: #8893A7;
      font-weight: 400;
    }
  }
</style>
