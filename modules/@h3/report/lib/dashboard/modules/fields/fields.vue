<template>
  <div :class="getStyles">
    <h3-draggable
      :class="[`${prefixCls}__list`]"
      v-model="innerData"
      handle=".report-field"
      :options="dragOptions"
      @start="fieldDragging"
      :clone="fieldClone"
      @add="addField"
      @sort="sortField"
      @end="fieldDragEnd"
    >
      <slot>
        <template>
          <div
            v-for="(field, i) in innerData"
            :class="[`${prefixCls}__field`, 'report-field']"
            :key="i"
            :data-index="i"
          >
            <i class="h3-report-icon down-o"></i>
            <span>{{ field.alias || field.name }}</span>
            <i class="h3-report-icon h3-close" :data-index="i"></i>
          </div>
        </template>
      </slot>
    </h3-draggable>
    <div
      v-if="!innerData.length"
      :class="[`${prefixCls}__empty`]"
      slot="footer"
    >
      拖动左侧字段到此处
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import H3Draggable from "vuedraggable";
import { ReportMutation } from "@h3/report/basics/store/dashboard/types";
import { uuid } from "@h3/report/basics/utils/uid";

const ReportPro = namespace("report");
@Component({
  name: "h3-report-field-Module",
  components: {
    H3Draggable
  }
})
export default class ReportFieldModule extends Vue {
  @Prop({ default: () => ({}) }) module!: H3.ReportModules.FieldMapping;
  @Prop({ default: () => [] }) data!: Array<H3.Report.FieldColumn>;
  @Prop({ default: () => true }) isRepeat!: boolean; // 是否可以重复
  @Prop({ default: () => "" }) group!: string;
  @ReportPro.State("dragField") dragField!: H3.Report.FieldColumn;
  @ReportPro.Mutation(ReportMutation.SETDRAGFIELD) setDragField!: Function;
  @ReportPro.Mutation(ReportMutation.HANDLESORT) handleSort!: Function;
  prefixCls = "h3-report-fields";
  adding = false;
  innerData: any = this.data;
  dragOptions = {
    group: { name: this.group, put: this.putField },
    ghostClass: "h3-report-fields__field-dragging",
    chosenClass: "h3-report-fields__field-dragging",
    forceFallback: true,
    animation: 150,
    touchStartThreshold: 5,
    delay: 100,
    filter: ".undrag"
  };
  @Watch("data")
  watchData() {
    this.innerData = this.data;
  }
  get getStyles() {
    return {
      "h3-report-fields": true,
      "h3-report-fields--empty": !this.data.length,
      "h3-report-fields--adding": this.adding,
      "h3-report-fields--dragging": this.dragField && this.isPutField
    };
  }
  get isPutField() {
    let isReport = true;
    if (!this.isRepeat) {
      isReport =
        this.data.findIndex((item: H3.Report.FieldColumn) => {
          return (
            this.dragField.schemaCode === item.schemaCode && item.field === this.dragField.field
          );
        }) < 0;
    }
    // 原始可拖拽结果
    let isAllowField =
      this.dragField && this.dragField.specialType
        ? this.module.supportedTypes.includes(this.dragField.specialType)
        : this.module.supportedTypes.includes(this.dragField.type);
    return (
      isAllowField && (!this.module.max || this.module.max > this.innerData.length) && isReport
    );
  }
  putField() {
    return this.isPutField;
  }
  mouseenter(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (this.isPutField && !this.data.length) {
      this.adding = true;
    } else {
      this.adding = false;
    }
  }
  mouseleave() {
    this.adding = false;
  }
  addField(e: any) {
    this.handleSort();
    const field = this.innerData[e.newIndex];
    field.options = {};
    this.$emit("add-field", field, e.newIndex);
    this.$emit("change-field", this.data);
  }
  sortField() {
    this.data.splice(0, this.data.length, ...this.innerData);
    this.$emit("sort-field", this.data);
    this.$emit("change-field", this.data);
    this.$nextTick(() => {
      this.handleSort();
    });
  }
  removeField(e: Event) {
    e.stopPropagation();
    const index = parseInt((e.target as HTMLDivElement).getAttribute("data-index") as string, 10);
    if (!isNaN(index) && this.data[index]) {
      this.data.splice(index, 1);
      this.handleSort();
      this.$emit("remove-field", index);
      this.$emit("change-field", this.data);
    }
  }
  removeEvent() {
    this.$el.querySelectorAll(".h3-report-icon.h3-close").forEach((ele: Element) => {
      ele.removeEventListener("click", this.removeField, false);
      ele.addEventListener("click", this.removeField, false);
    });
  }
  /**
   * 数据源字段拖动
   */
  fieldDragging(evt: any) {
    const index = (evt.item as HTMLDivElement).getAttribute("data-index");
    console.log("fieldDragging", index);
    if (index) {
      const field = JSON.parse(JSON.stringify(this.data[index]));
      field.inside = true;
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

    newField.options = {};
    return newField;
  }
  updated() {
    this.removeEvent();
  }
  mounted() {
    this.removeEvent();
  }
}
</script>
