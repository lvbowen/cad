<template>
  <div :class="`${prefixCls}`">
    <div :class="`${prefixCls}__select`">
      <h3-dropdown
        mode="default"
        ref="dropdown"
        :class="`${prefixCls}__field`"
        :value="renderValue"
        :propLabel="propLabel"
        :handleShow="handleShow"
        :getParentContainer="container"
        @onShow="onShow"
        @onHide="onHide"
        @onSearch="onSearch"
      >
        <div :class="`${prefixCls}__fields`">
          <div :class="`${prefixCls}__fields-tip`" v-if="tipNumber">{{ innerTip }}</div>
          <div :class="`${prefixCls}__fields-list`" v-if="Object.keys(renderFields).length">
            <div v-for="(inFields, key) of renderFields" :key="key">
              <div :class="`${prefixCls}__fields-list-title`">
                <span>{{ key }}</span>
              </div>
              <div
                v-for="item in inFields"
                :key="`${item.tableId}-${item.field}`"
                :class="getFieldClassName(item)"
                @click="onChange(item)"
                :title="item.alias || item.name"
              >
                <i :class="`iconfont ${getIconType(item.type)}`"></i>
                <span v-html="hightLight(item.name)"></span>
              </div>
            </div>
          </div>
          <div :class="`${prefixCls}__fields-empty`" v-else>
            无相关字段
          </div>
        </div>
      </h3-dropdown>
      <a-select
        v-if="optionFieldName && value && value.options[optionFieldName]"
        :placeholder="`请选择`"
        :class="`${prefixCls}__extra`"
        :value="value.options[optionFieldName]"
        :options="fieldOptionsMappings"
        @change="onOptionChange"
      >
      </a-select>
      <div :class="`${prefixCls}__delect`" @click="delect">
        <i class="iconfont icondelete-o"></i>
      </div>
    </div>
    <div :class="`${prefixCls}__check`" v-if="showDateComplete">
      <h3-checkbox @change="dateChange" :checked="!!value.options.dateComplete"></h3-checkbox>
      补齐日期
      <a-tooltip title="补齐数据表中缺少的日期数据">
        <i class="iconfont iconquestion-circle-o"></i>
      </a-tooltip>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins, Inject } from "vue-property-decorator";
import { Mutation, Action, State, namespace } from "vuex-class";
import { Tooltip, Select, Checkbox } from "@h3/antd-vue";
import H3Dropdown from "@h3/report/basics/components/dropdown";
import { uuid } from "@h3/report/basics/utils/uid";
import enumType from "@h3/report/basics/enum/aggregate-type";

@Component({
  name: "h3-analysis-field",
  components: {
    H3Dropdown,
    H3DropdownSingleItem: H3Dropdown.SingleItem,
    ASelect: Select,
    ASelectOption: Select.Option,
    H3Checkbox: Checkbox,
    ATooltip: Tooltip
  }
})
export default class AnalysisDimension extends Vue {
  // 字段值
  @Prop({ default: () => ({}) }) value!: H3.Report.FieldColumn;
  // 数据源
  @Prop({ default: () => [] }) fields!: Array<H3.Report.FieldColumn>;
  // 不可用的数据源
  @Prop({ default: () => [] }) disableFields!: Array<H3.Report.FieldColumn>;
  // 允许可以出现的字段类型
  @Prop({ default: () => ["string", "date", "number"] }) fieldType!: Array<string>;
  // 是否展示自动补全
  @Prop({ default: true }) showDateComplete!: boolean;
  // 是否展示配置项选项
  @Prop({ default: "" }) optionFieldName!: string;
  // 设计默认配置项
  @Prop({ default: true }) setDefaultOption!: boolean;
  // 字段类型映射
  @Prop({ default: "string" }) typeMapping!: string;
  // 字段挂载位置
  @Prop({ default: "" }) container!: Function;

  prefixCls: string = "h3-analysis-field";

  handleShow: boolean = true;

  searchKey: string = "";

  propLabel: any = {
    value: "calculateField",
    key: "calculateField",
    name: "name"
  };

  innerValue: H3.Report.FieldColumn = Object.assign({}, this.value);
  /**
   * 搜索过滤字段的数量
   */
  get tipNumber() {
    let list: Array<H3.Report.FieldColumn> = [];
    let filterLength: number | string = "";
    if (this.searchKey !== "") {
      list = this.fields.filter(f => {
        let title = f.alias || f.name;
        return title.indexOf(this.searchKey) > -1 || !f.visible;
      });
      filterLength = this.fields.length - list.length;
      return filterLength > 99 ? "99+" : filterLength;
    } else {
      return filterLength;
    }
  }
  /**
   * 内部tip
   */
  get innerTip() {
    return this.tipNumber ? `已为您过滤${this.tipNumber}个不支持的字段` : "";
  }

  /**
   * 内部渲染的字段数据结构 筛选类型/是否可见/分组
   */
  get innerFields() {
    const fieldGroup: { [key: string]: Array<H3.Report.FieldColumn> } = this.getFormatFields();
    return fieldGroup;
  }

  /**
   * 渲染使用的序列 全部序列和搜索序列
   */
  get renderFields() {
    return this.searchKey === "" ? this.innerFields : this.searchFields;
  }

  /**
   * 内部计算值 呈现展示值和
   */
  get renderValue() {
    if (this.value && this.value.name) {
      const htmlName = `<i class="iconfont ${this.value.type}"></i>  ${this.value.name}`;
      const calculateField = `${this.value.tableId}-${this.value.field}`;
      const realValue = Object.assign({}, this.value, {
        htmlName,
        calculateField
      });
      return [realValue];
    }
    return [];
  }

  /***
   * 搜索结果列表
   */
  get searchFields() {
    let res = {};
    let list: Array<H3.Report.FieldColumn> = [];
    if (this.searchKey !== "") {
      list = this.fields.filter(f => {
        let title = f.alias || f.name;
        return title.indexOf(this.searchKey) > -1;
      });
    }
    res = this.getFormatFields(list);
    return res;
  }

  /**
   * 获取键值对格式的数据源
   */
  getFormatFields(fields: Array<H3.Report.FieldColumn> = this.fields) {
    const fieldGroup: { [key: string]: Array<H3.Report.FieldColumn> } = {};
    fields.forEach((field: H3.Report.FieldColumn) => {
      if (this.fieldType.includes(field.type) && field.visible) {
        if (!fieldGroup[field.tableName]) fieldGroup[field.tableName] = [];
        fieldGroup[field.tableName].push(field);
      }
    });
    return fieldGroup;
  }

  /**
   * 预留获取不同图标样式的函数
   */
  getIconType(type) {
    let icon = "icontext-o";
    switch (type) {
      case "string":
        icon = "icontext-o";
        break;
      case "number":
        icon = "iconnumber";
        break;
      case "date":
        icon = "iconcalendar-o";
        break;
      default:
        break;
    }
    return icon;
  }

  /**
   * 每个节点的样式
   */
  getFieldClassName(item: H3.Report.FieldColumn) {
    const { selected, disabled } = this.getItemSelectOrDisabled(item);
    return [
      `${this.prefixCls}__fields-list-item`,
      selected ? `${this.prefixCls}__fields-list-item--selected` : "",
      disabled ? `${this.prefixCls}__fields-list-item--disabled` : ""
    ];
  }

  /**
   * 选择指标
   */
  onChange(e: H3.Report.FieldColumn) {
    const { selected, disabled } = this.getItemSelectOrDisabled(e);
    if (selected || disabled) return;
    this.handleShow = false;
    this.$emit("change", e);
  }

  /**
   * 勾选日期补全
   */
  dateChange(e) {
    const v = JSON.parse(JSON.stringify(this.value)) as H3.Report.FieldColumn;
    v.options.dateComplete = e.target.checked ? 1 : 0;
    this.$emit("change", v);
  }

  /**
   * 判断传入的字段是否是被选中或者不可选的字段
   */
  getItemSelectOrDisabled(item: H3.Report.FieldColumn) {
    const selected = this.value
      ? item.field === this.value.field && item.tableId === this.value.tableId
      : false;
    const disabled =
      this.disableFields && this.disableFields.length > 0
        ? !selected &&
          this.disableFields.find(i => i.field === item.field && i.tableId === item.tableId)
        : false;
    return {
      selected,
      disabled
    };
  }

  /**
   * 删除当前字段
   */
  delect() {
    this.$emit("change", null);
  }

  /**
   * 字段配置项的变化
   */
  onOptionChange(val) {
    const value = Object.assign({}, this.value, {
      options: {
        [this.optionFieldName]: val
      }
    });
    this.$emit("change", value);
  }

  /**
   * 字段类型映射
   * @param field
   */
  get fieldOptionsMappings() {
    return this.typeMapping ? enumType[this.typeMapping] : [];
  }

  onHide() {
    this.handleShow = true;
    this.searchKey = "";
    setTimeout(() => {
      if (Object.keys(this.value).length < 1) {
        console.log("onHide");
        this.$emit("change", null);
      }
    }, 300);
  }

  onShow() {}

  onSearch(val) {
    this.searchKey = val;
    // 解决弹窗浮动定位在搜索后不准的问题
    let wraps = document.getElementsByClassName("h3-analysis-modules__wrap");
    let wrap = wraps ? wraps[0] : null;
    wrap ? (wrap.scrollTop = wrap.scrollTop + 1) : null;
    this.$nextTick(() => {
      wrap ? (wrap.scrollTop = wrap.scrollTop - 1) : null;
    });
  }

  /**
   * 高亮内容
   */
  hightLight(content: string): string {
    let titleString: string = content;
    if (this.searchKey !== "") {
      const highLightStr = this.searchKey.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const replaceReg: RegExp = new RegExp(highLightStr, "g");
      const replaceString: string = '<span class="hightlight">' + highLightStr + "</span>";
      titleString = titleString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      titleString = titleString.replace(replaceReg, replaceString);
      return titleString;
    }
    return titleString;
  }

  mounted() {
    // 如果没有值的时候默认打开下拉框 并聚焦在搜索框上
    if (!this.value || Object.keys(this.value).length < 1) {
      if (this.$refs.dropdown) {
        (this.$refs.dropdown as any).visibleChange();
        const c = (this.$refs.dropdown as any).$children || [];
        if (c && c[2]) {
          this.$nextTick(() => {
            c[2].focus();
          });
        }
      }
    }
  }
}
</script>

<style lang="less">
.h3-analysis-field {
  display: flex;
  flex-direction: column;

  &:hover {
    background: #e0e3e9;

    .h3-analysis-field__delect {
      height: 100%;
      display: flex;
    }
  }

  &__delect {
    display: none;
    position: absolute;
    right: 0;
    top: 4px;
  }

  &__select {
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__check {
    width: 100%;
  }

  &__field {
    flex: 1;
    width: 100%;
    overflow: hidden;
  }

  &__extra {
    width: 120px;
    margin-left: 12px !important;
  }

  &__fields {
    max-height: 360px;
    overflow: hidden;
    &-empty {
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #b6bcc6;
    }
    &-tip {
      height: 20px;
      font-size: 12px;
      font-weight: 400;
      color: #777f8d;
      line-height: 20px;
      padding: 0 12px;
    }

    &-list {
      max-height: 200px;
      overflow-y: auto;
      color: #0f1c35;

      &-title {
        height: 32px;
        line-height: 32px;
        padding: 0 12px;

        span {
          height: 20px;
          background: rgba(236, 240, 246, 0.8);
          border-radius: 12px;
          padding: 0 8px;
          display: inline-block;
          line-height: 20px;
          font-size: 12px;
          color: #777f8d;
        }
      }

      &-item {
        height: 32px;
        line-height: 32px;
        padding: 0 12px;
        font-size: 14px;
        display: flex;

        span {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &--selected {
          font-weight: 600;
          background-color: #f0f7ff;
        }

        &--disabled {
          cursor: no-drop;
          color: #c9ccd8;

          .iconfont {
            color: #c9ccd8 !important;
          }
        }

        .iconfont {
          color: #777f8d;
          margin-right: 4px;
        }

        &:hover {
          background: #ecf0f6;
        }
      }
    }
  }
}

.h3-analysis-design {
  .h3-dropdown-content {
    max-height: 404px !important;
  }
}
</style>
