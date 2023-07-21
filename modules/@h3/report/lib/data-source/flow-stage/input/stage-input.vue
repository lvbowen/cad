<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__left`">
      <div :class="`${prefixCls}__title-wrap`">
        <i :class="[`${prefixCls}__icon`, `h3-report-icon profile`]"></i>
        <div :class="`${prefixCls}__title`">{{ sourceName }}</div>
      </div>
      <div :class="`${prefixCls}__field-container`">
        <div :class="`${prefixCls}__tip`">
          已选字段
        </div>
        <ul :class="`${prefixCls}__field-wrap`">
          <div v-if="fields.length > 0" :class="`${prefixCls}__inner_tip`">
            主表
          </div>
          <li
            :class="`${prefixCls}__field`"
            v-for="(item, index) in fields"
            :key="index"
            :title="item.text"
          >
            {{ item.text }}
          </li>
          <div v-if="subfields.length > 0" :class="`${prefixCls}__inner_tip`">
            子表
          </div>
          <li
            :class="`${prefixCls}__field`"
            v-for="(item, index) in subfields"
            :key="`sub${index}`"
            :title="item.text"
          >
            {{ item.text }}
          </li>
        </ul>
      </div>
    </div>
    <div :class="`${prefixCls}__right`"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Inject } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Button } from "@h3/antd-vue";
import { handleNodeValidate, clearStageSetting } from "../../help/node";

const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-stage-input",
  components: {
    AButton: Button
  }
})
export default class ReportStageInput extends Vue {
  @Prop() node!: H3.Falls.Node;
  @Prop() source!: H3.Falls.Source;
  @ReportDataSource.State("models") models!: Array<H3.Falls.Model>;
  prefixCls: string = "h3-report-stage-input";
  fields: Array<H3.Falls.Field> = [];
  subfields: Array<H3.Falls.Field> = [];

  @Watch("models", { deep: true })
  watchModels(models: Array<H3.Falls.Model>) {
    this.initModel(models);
  }

  // 监听节点改变
  @Watch("node", { deep: true })
  watchNode(node: H3.Falls.Node) {
    this.initModel(this.models);
  }
  // 获取节点名称
  get sourceName() {
    return this.node.text;
  }

  /**
   * 初始化model
   * @param models
   */
  initModel(models) {
    let tmpModel = models.find((item: H3.Falls.Model) => {
      return item.id === this.node.id;
    });
    tmpModel && tmpModel.main && (this.fields = tmpModel.main.fields);
    tmpModel && tmpModel.sub && (this.subfields = tmpModel.sub.fields);
  }
  created() {
    this.initModel(this.models);
  }
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";
.h3-report-stage-input {
  height: 100%;
  &__title-wrap {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 12px;
  }
  &__icon.profile {
    color: #107fff;
  }
  &__title {
    padding-left: 8px;
    color: #8893a7;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  &__tip {
    font-size: 12px;
    height: 32px;
    line-height: 32px;
    color: #8893a7;
    padding: 0 12px;
  }
  &__inner_tip {
    font-size: 14px;
    height: 40px;
    line-height: 40px;
    color: #000;
    font-weight: bold;
  }
  &__left {
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 100%;
  }
  &__field-container {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex: 1;
    border-right: 1px solid #e0e3e9;
  }
  &__field-wrap {
    .vertical-scrollbar();
    flex: 1;
    padding-left: 16px;
  }
  &__field {
    height: 32px;
    line-height: 32px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
