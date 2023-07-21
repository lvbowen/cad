<template>
  <div :class="prefixCls">
    <div :class="[`${prefixCls}__content`]">
      <div :class="[`${prefixCls}__content-top`]" ref="header">
        <div
          :class="[
            `${prefixCls}__field-space`,
            `${prefixCls}__space`,
            activeEditIndex === index ? 'edit-mode' : ''
          ]"
          v-for="(item, index) in unionTop"
          :key="index"
          @mousedown="headerMousedown($event, item, index)"
        >
          <i :class="[`${prefixCls}__icon`, `h3-report-icon ${item.type}`]"></i>
          <span :class="`${prefixCls}__field-text`">{{ item.text }}</span>
          <i
            :class="[`${prefixCls}__icon`, `h3-report-icon edit icon-hover`]"
            @click="editName(index)"
          ></i>
          <input
            ref="input"
            type="text"
            :class="[`${prefixCls}__edit-input`]"
            v-model="item.text"
            v-show="activeEditIndex === index"
            @focus="focusInput"
            @blur="blurInput($event, index)"
          />
          <div class="dragged-append"></div>
        </div>
      </div>
      <div ref="left" :class="[`${prefixCls}__content-left`]">
        <div
          v-for="(item, index) in unionLeft"
          :class="[`${prefixCls}__left-space`, `${prefixCls}__space`]"
          :key="index"
          :title="item.text"
        >
          <i :class="[`${prefixCls}__icon`, `h3-report-icon ${item.type}-stage`]"></i>
          <span>{{ item.text }}</span>
        </div>
      </div>
      <div
        ref="body"
        :class="[`${prefixCls}__content-body`]"
        @scroll.passive="bodyScroll($event)"
      >
        <div
          :class="[`${prefixCls}__line`]"
          :key="node.id"
          v-for="node in unionLeft"
        >
          <div
            :class="[`${prefixCls}__cell`, `${prefixCls}__space`, field ? '' : 'empty']"
            :key="index"
            v-for="(field, index) in unionBody[node.id]"
          >
            <div
              :class="[`${prefixCls}__cell-content`]"
              v-if="field"
              @mousedown="cellMousedown($event, field, node.id, index)"
              :title="field.text"
            >
              <i :class="[`${prefixCls}__icon`, `h3-report-icon`, field ? field.type : '']"></i>
              <span v-html="field ? field.text : ''"></span>
              <!-- <i :class="[`${prefixCls}__icon`,`h3-report-icon remove icon-hover`]"></i>-->
            </div>
          </div>
        </div>
      </div>
      <div :class="[`${prefixCls}__content-title`, `${prefixCls}__space`]">
        <i :class="[`${prefixCls}__icon`, `h3-report-icon ${node.type}-stage`]"></i>
        <span>合并结果</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { Button } from "@h3/antd-vue";
import H3Scroll from "@h3/report/basics/components/scroll";
import { getLastNode, getNodeField } from "@h3/report/lib/data-source/help/utils";
import { ReportAction, ReportMutation } from "@h3/report/basics/store/data-source/types";
import { clearStageSetting } from "../../help/node";
import { StageType } from "../../enum/stage";
import { uuid } from "@h3/report/basics/utils/uid";

const ReportDataSource = namespace("dataSource");
@Component({
  name: "h3-report-stage-union",
  components: {
    AButton: Button,
    H3Scroll
  }
})
export default class ReportStageUnion extends Vue {
  @Prop() node!: H3.Falls.Node;
  @Prop() source!: H3.Falls.Source;
  @Prop() nodeRelationField!: Array<H3.Falls.NodeRelationField>;
  @ReportDataSource.State("merges") merges!: Array<H3.Falls.Merge>;
  @ReportDataSource.Mutation(ReportMutation.UPDATESETTING) updateSetting!: Function;
  @ReportDataSource.Mutation(ReportMutation.UPDATESTAGE) updateStage!: Function; // 更新所有节点配置

  prefixCls: string = "h3-report-stage-union";
  // 控制更改字段名称
  activeEditIndex: number | null = null;
  // 合并配置
  merge: H3.Falls.Merge | null = null;
  // 左侧列表
  unionLeft: Array<H3.Falls.NodeRelationField> = [];
  // 顶部列表
  unionTop: Array<H3.Falls.DynamicField> = [];
  // 主体列表
  unionBody: H3.Union.Body = {};
  // 移动的index
  draggingIndex: any;
  // 记录移动的index，变化时才记录
  tmpDraggingIndex: null | number = null;
  // 当前移动的字段 Dom
  draggingItem: any;
  // 当前移动的对象
  activeSourceId: any;
  // 当前移动的field
  draggingField: H3.Falls.Field | null = null;
  // 当前移动的字段父节点 Dom
  draggingParentNode: HTMLDivElement | any = null;
  // 鼠标移动到落下的index
  dropIndex: any;
  // 移动标识 Dom
  placeholderDiv: HTMLDivElement | null = null;
  // 空格大小固定值
  cellWidth: number = 128;
  // body滚动距离
  scrollLeft: number = 0;
  scrollTop: number = 0;
  /**
   * 监听merge变化
   */
  @Watch("merge", { deep: true })
  watchMerge(merge: H3.Falls.Merge) {
    this.changeMerge(merge);
  }
  /**
   * 更新merge
   * @param merge 合并参数
   */
  changeMerge(merge) {
    this.updateSetting({ stage: merge, stageType: StageType.merges });
  }
  /**
   * 清除配置
   */
  clearSetting() {
    let tmpSource = clearStageSetting(this.node, this.source, true);
    this.updateStage({
      models: tmpSource.models,
      merges: tmpSource.merges,
      relations: tmpSource.relations,
      computes: tmpSource.computes
    });
  }
  /**
   * 监听主体滚动，固定头
   */
  @Watch("scrollLeft")
  watchScrollLeft() {
    const header = this.$refs.header as HTMLDivElement;
    if (header) {
      header.style.left = `${-this.scrollLeft + 166}px`;
    }
  }
  /**
   * 监听主体滚动，固定列
   */
  @Watch("scrollTop")
  watchScrollTop() {
    const left = this.$refs.left as HTMLDivElement;
    if (left) {
      left.style.top = `${-this.scrollTop + 38}px`;
    }
  }
  /**
   * 滚动触发
   */
  bodyScroll(e: Event) {
    this.scrollLeft = (e.target as HTMLDivElement).scrollLeft;
    this.scrollTop = (e.target as HTMLDivElement).scrollTop;
  }
  /**
   * 主体显示数据结构
   */
  initBody() {
    if (this.merge) {
      let tmpGroups: Array<H3.Falls.DynamicField> = this.merge.groups.filter(
        (item: H3.Falls.DynamicField) => {
          return Object.keys(item.source).length;
        }
      );
      this.merge.groups.splice(0, this.merge.groups.length, ...tmpGroups);
    }
    this.nodeRelationField.forEach((node: H3.Falls.NodeRelationField) => {
      if (this.merge) {
        this.unionBody[node.id] = [];
        this.merge.groups.forEach((item: H3.Falls.DynamicField, index: number) => {
          let tmpNode = node;
          let tmpId = item.source[node.id];
          if (tmpId) {
            // 校验字段是否存在
            let tmpField = node.fields.find((field: H3.Falls.Field) => {
              return field.id === tmpId;
            });
            if (tmpField) {
              this.unionBody[node.id].push(tmpField);
            } else {
              this.unionBody[node.id].push(null);
            }
          } else {
            this.unionBody[node.id].push(null);
          }
        });
        this.unionBody[node.id].push(null);
      }
    });

    console.log(this.nodeRelationField, this.unionBody);
  }
  /**
   * 顶部显示数据结构
   */
  initTop() {
    if (this.merge) {
      this.unionTop = this.merge.groups;
    }
  }
  /**
   * 左侧显示数据结构
   */
  initLeft() {
    this.unionLeft = this.nodeRelationField;
  }
  /**
   * 初始化合并节点数据
   */
  initUnion() {
    let tmpMerge = this.merges.find((item: H3.Falls.Merge) => {
      return item.id === this.node.id;
    });
    if (tmpMerge) {
      if (!(tmpMerge.groups && tmpMerge.groups.length)) {
        let groups: Array<H3.Falls.DynamicField> = [];
        let map: any = {};
        let hasMach: boolean = false;
        this.nodeRelationField.forEach((item: H3.Falls.NodeRelationField, index: number) => {
          let indexMap: any = {};
          item.fields.forEach((field: H3.Falls.Field, num: number) => {
            if (!indexMap[field.text]) {
              indexMap[field.text] = field;
            } else {
              indexMap[field.text + "$$other"] = field;
            }
          });
          Object.keys(indexMap).forEach((key: string, num: number) => {
            let groupItem = {
              id: `F_${uuid(8, 16)}`, // 追加合并生成的字段UUID
              type: indexMap[key].type, // 生成的字段类型
              text: indexMap[key].text, // 字段名称
              source: {
                [item.id]: indexMap[key].id
              }
            };
            if (!map[key]) {
              groups.push(groupItem);
              map[key] = indexMap[key];
            } else {
              for (let i = 0; i < groups.length; i++) {
                let group = groups[i];
                if (group.text === indexMap[key].text && group.type === indexMap[key].type) {
                  //依赖分组字段可自行更改！
                  group.source[item.id] = indexMap[key].id;
                  hasMach = true;
                  break;
                }
              }
              if (!hasMach) {
                groups.push(groupItem);
              }
              hasMach = false;
            }
          });
        });
        this.$set(tmpMerge, "groups", groups);
      }
      this.merge = tmpMerge;
    }
    this.initLeft();
    this.initTop();
    this.initBody();
  }
  /**
   * 生成groups
   */
  createdGroups(groups: H3.Falls.DynamicField) {}
  /**
   * 清除数据
   */
  clearData() {
    this.draggingItem.classList.remove("dragged");
    this.draggingItem.style = null;
    this.draggingItem = null;
    this.draggingIndex = null;
    this.draggingParentNode = null;
    this.tmpDraggingIndex = null;
    this.activeSourceId = null;
    this.draggingField = null;
    this.dropIndex = null;
  }
  /**
   * 移动到指定地点的index
   *  @param x  移动的距离
   *  @param length 数组的长度
   *  @param w 单位的宽度
   *  @param scroll 单位的宽度
   */
  countDropIndex(x: number, length: number, w: number, scroll) {
    return Math.floor(
      (x - 334 + scroll > (length - 1) * w
        ? (length - 1) * w
        : x - 334 + scroll < 0
        ? 0
        : x - 334 + scroll) / w
    );
  }
  /**
   * 移动到指定地点的index
   *  @param x  移动的距离
   *  @param length 数组的长度
   *  @param w 单位的宽度
   *  @param scroll 滚动的距离
   */
  countMoveDistance(x: number, length: number, w: number, scroll: number) {
    return x - 334 - w / 2 + scroll > (length - 1) * w
      ? (length - 1) * w
      : x - 334 + scroll - w / 2;
  }

  /**
   * 移动滚动
   *  @param x 鼠标位置
   */
  moveScrollLeft(x: number) {
    const body = this.$refs.body as HTMLDivElement;
    let sw = body.scrollWidth;
    let w = body.clientWidth;
    // 测试手感最佳距离
    if (w - x < 40) {
      body.scrollLeft += (sw - w) / 20;
    }
    if (x < 40) {
      body.scrollLeft -= (sw - w) / 20;
    }
  }
  /**
   * 鼠标按下
   *  @param e  鼠标事件
   *  @param field 字段
   *  @param id 源id
   *  @param index 点击的下标
   */
  cellMousedown(e: MouseEvent, field: H3.Falls.Field, id, index: number) {
    this.draggingIndex = index;
    this.draggingItem = e.currentTarget;
    this.draggingParentNode = (e.currentTarget as any).parentNode.parentNode;
    this.activeSourceId = id;
    this.draggingField = field;
    document.body.addEventListener("mouseup", this.cellMouseupBody, false);
    document.body.addEventListener("mousemove", this.cellMousemoveBody, false);
  }
  /**
   * 鼠标抬起
   *  @param e  鼠标事件
   */
  cellMouseupBody(e: MouseEvent) {
    document.body.removeEventListener("mouseup", this.cellMouseupBody, false);
    document.body.removeEventListener("mousemove", this.cellMousemoveBody, false);
    let dropIndex = this.countDropIndex(
      e.pageX,
      this.unionTop.length + 1,
      this.cellWidth,
      this.scrollLeft
    );
    this.draggingParentNode.querySelectorAll(".h3-report-stage-union__cell")[
      dropIndex
    ].style = null;
    if (this.merge && this.draggingField) {
      // 移动到最后的位置
      if (this.merge.groups.length === dropIndex) {
        this.$delete(this.merge.groups[this.draggingIndex].source, this.activeSourceId);
        let tmpGroup: H3.Falls.DynamicField = {
          id: `F_${uuid(8, 16)}`, // 追加合并生成的字段UUID
          type: this.draggingField.type, // 生成的字段类型
          text: this.draggingField.text, // 字段名称
          source: {
            [this.activeSourceId]: this.draggingField.id
          }
        };
        this.merge.groups.push(tmpGroup);
        // 原地位置不变，或者字段类型不同，不做处理，归位
      } else if (
        this.draggingIndex !== dropIndex &&
        this.merge.groups[dropIndex].type === this.draggingField.type
      ) {
        this.$set(this.merge.groups[dropIndex].source, this.activeSourceId, this.draggingField.id);
        // 移动位置存在字段
        if (this.unionBody[this.activeSourceId][dropIndex]) {
          this.$set(
            this.merge.groups[this.draggingIndex].source,
            this.activeSourceId,
            (this.unionBody as any)[this.activeSourceId][dropIndex].id
          );
        } else {
          this.$delete(this.merge.groups[this.draggingIndex].source, this.activeSourceId);
        }
      }
    }
    this.initLeft();
    this.initTop();
    this.initBody();
    this.clearData();

    this.clearSetting();
  }
  /**
   * 鼠标移动
   *  @param e  鼠标事件
   */
  cellMousemoveBody(e: MouseEvent) {
    this.draggingItem.classList.add("dragged");
    this.draggingItem.style.top = "0px";
    this.moveScrollLeft(e.pageX - 344);
    this.draggingItem.style.left =
      this.countMoveDistance(e.pageX, this.unionTop.length + 1, this.cellWidth, this.scrollLeft) +
      "px";
    let dropIndex = this.countDropIndex(
      e.pageX,
      this.unionTop.length + 1,
      this.cellWidth,
      this.scrollLeft
    );
    if (this.tmpDraggingIndex !== dropIndex && this.merge && this.draggingField) {
      if (this.tmpDraggingIndex === 0 || this.tmpDraggingIndex) {
        this.draggingParentNode.querySelectorAll(".h3-report-stage-union__cell")[
          this.tmpDraggingIndex
        ].style = null;
      }
      this.tmpDraggingIndex = dropIndex;
      if (
        (this.merge.groups.length !== dropIndex &&
          this.merge.groups[dropIndex].type === this.draggingField.type) ||
        this.merge.groups.length === dropIndex
      ) {
        this.draggingParentNode.querySelectorAll(".h3-report-stage-union__cell")[dropIndex].style =
          "border: 1px dashed #107FFF";
      } else {
        this.draggingParentNode.querySelectorAll(".h3-report-stage-union__cell")[dropIndex].style =
          "border: 1px dashed red";
      }
    }
  }

  /**
   * 鼠标按下
   *  @param e  鼠标事件
   *  @param item 数据
   *  @param index 点击的下标
   */
  headerMousedown(e: MouseEvent, item: H3.Falls.DynamicField, index: number) {
    this.draggingIndex = index;
    this.draggingItem = e.currentTarget;
    this.draggingParentNode = (e as any).currentTarget.parentNode;
    this.placeholderDiv = document.createElement("div");
    this.placeholderDiv.className = "placeholder";
    document.body.addEventListener("mouseup", this.headerMouseupBody, false);
    document.body.addEventListener("mousemove", this.headerMousemoveBody, false);
  }
  /**
   * 鼠标抬起
   *  @param e  鼠标事件
   */
  headerMouseupBody(e: MouseEvent) {
    document.body.removeEventListener("mouseup", this.headerMouseupBody, false);
    document.body.removeEventListener("mousemove", this.headerMousemoveBody, false);
    let dropIndex = this.countDropIndex(
      e.pageX,
      this.unionTop.length,
      this.cellWidth,
      this.scrollLeft
    );
    // 拖拽index有变化时，替换实际数组，重新布局
    if (dropIndex !== this.draggingIndex) {
      this.$set(
        this.unionTop,
        this.draggingIndex,
        this.unionTop.splice(dropIndex, 1, this.unionTop[this.draggingIndex])[0]
      );
      this.initBody();
    }
    this.draggingParentNode.querySelectorAll(".placeholder").forEach((item: HTMLDivElement) => {
      this.draggingParentNode.removeChild(item);
    });
    this.clearData();
    this.clearSetting();
  }
  /**
   * 鼠标移动
   *  @param e  鼠标事件
   */
  headerMousemoveBody(e: MouseEvent) {
    console.log("headerMousemoveBody");
    this.draggingItem.classList.add("dragged");
    this.draggingItem.style.top = "0px";
    // 移动距离
    this.moveScrollLeft(e.pageX - 344);
    this.draggingItem.style.left =
      this.countMoveDistance(e.pageX, this.unionTop.length, this.cellWidth, this.scrollLeft) + "px";
    let dropIndex = this.countDropIndex(
      e.pageX,
      this.unionTop.length,
      this.cellWidth,
      this.scrollLeft
    );
    // 竖线放置的位置
    if (this.tmpDraggingIndex !== dropIndex) {
      this.tmpDraggingIndex = dropIndex;
      let tmpIndex =
        this.draggingIndex === this.unionTop.length - 1
          ? dropIndex
          : this.draggingIndex <= dropIndex
          ? dropIndex + 1
          : dropIndex;
      this.draggingParentNode.insertBefore(
        this.placeholderDiv,
        this.draggingParentNode.querySelectorAll(".h3-report-stage-union__field-space")[tmpIndex]
      );
    }
  }
  /**
   * 聚焦自动选中内容
   *  @param e
   */
  focusInput(e: Event) {
    (e.currentTarget as HTMLInputElement).select();
  }
  /**
   * 失去焦点
   *  @param e
   *  @param index
   */
  blurInput(e: Event, index: number) {
    this.unionTop[index].text = (e.target as HTMLInputElement).value;
    this.activeEditIndex = null;
  }
  /**
   * 更改姓名
   *  @param index
   */
  editName(index: number) {
    this.activeEditIndex = index;
    this.$nextTick(() => {
      (this.$refs.input as HTMLInputElement)[index].focus();
    });
    return false;
  }

  created() {
    this.initUnion();
  }
  mounted() {}
  destroyed(): void {
    const body = this.$refs.body as HTMLDivElement;
    if (body) {
      body.removeEventListener("scroll", this.bodyScroll);
    }
  }
}
</script>

<style lang="less">
@import "~@h3/report/basics/styles/index";

.h3-report-stage-union {
  position: relative;
  height: 100%;
  width: 100%;

  &__icon {
    padding-right: 8px;
  }
  &__icon.icon-hover {
    display: none;
    font-size: 14px;
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 0 8px;
  }

  &__icon.edit {
    color: #107fff;
    line-height: 38px;
  }
  &__icon.remove {
    color: #8893a7;
    line-height: 38px;
  }

  &__icon.input-stage {
    color: #00d495;
  }

  &__icon.output-stage {
    color: #ffca00;
  }
  &__content {
    position: absolute;
    top: 8px;
    left: 8px;
    bottom: 0;
    right: 8px;
    overflow: hidden;
    &-top {
      display: flex;
      position: absolute;
      top: 0;
      left: 166px;
      right: 0;
      overflow: hidden;
    }

    &-left {
      position: absolute;
      top: 38px;
      left: 0;
      bottom: 0;
      width: 166px;
      overflow: hidden;
      padding-bottom: 30px;
      z-index: 4;
      background: #fff;
    }

    &-body {
      position: absolute;
      top: 38px;
      left: 166px;
      right: 0;
      bottom: 0;
      .bothway-scrollbar();
    }

    &-title {
      padding: 0 12px;
      width: 166px;
      background: #fff;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 4;
    }
  }

  &__space {
    height: 38px;
    line-height: 36px;
    white-space: nowrap;
    border: 1px solid #e2e1e6;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__left-space {
    padding: 0 12px;
    width: 166px;
    margin-top: 8px;
  }
  &__field-text {
    position: absolute;
    top: 50%;
    left: 34px;
    right: 0;
    transform: translate(0, -50%);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__field-space {
    padding: 0 12px;
    width: 128px;
    border-left: none;
    cursor: move;
    position: relative;
    background: #fff;
    flex: none;
  }
  &__field-space.dragged {
    position: absolute;
    z-index: 3;
    border: 1px solid #e2e1e6;
    .dragged-append {
      position: absolute;
      top: 37px;
      left: 0;
      width: 128px;
      background: #d7e9fe;
      z-index: 1;
    }
  }
  .dragged-append {
    height: 310px;
  }
  .placeholder {
    z-index: 1;
    height: 348px;
    border: 1px dashed #107fff;
    background: #fff;
  }
  .drop-valid {
    border: 1px dashed #107fff;
  }
  .drop-invalid {
    border: 1px dashed red;
  }
  &__field-space.edit-mode {
    border: none;
    border: 0;
  }

  &__field-space:hover .edit {
    display: block;
    background-color: #fff;
  }

  &__edit-input:focus {
    border-color: #107fff;
  }

  &__line {
    margin-top: 8px;
    position: relative;
    display: flex;
    flex-wrap: nowrap;
  }

  &__cell {
    width: 128px;
    background: @report-background-color;
    border-left: none;
    height: 38px;
    flex: none;
    overflow: hidden;
  }
  &__cell-content {
    background: #ebf4ff;
    cursor: move;
    width: 128px;
    height: 100%;
    padding: 0 12px;
    position: relative;
    line-height: 38px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__cell-content.dragged {
    position: absolute;
    z-index: 3;
    border: 1px solid #e2e1e6;
  }
  &__cell.empty {
    background: #e2e1e6;
    cursor: auto;
  }
  &__cell:hover .remove {
    display: block;
  }
  &__cell.empty {
    background: @report-background-color;
  }
  &__edit-input {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    caret-color: #107fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-image: none;
    margin: 0;
    padding-left: 8px;
    outline: 0;
    border: 1px solid #e2e1e6;
    -webkit-appearance: none;
    box-shadow: 0 -1px 0 0 rgba(16, 127, 255, 1), -1px 0 0 0 rgba(16, 127, 255, 1),
      0 1 0 0 rgba(16, 127, 255, 1), 1px 0 0 0 rgba(16, 127, 255, 1);
  }
}
</style>
