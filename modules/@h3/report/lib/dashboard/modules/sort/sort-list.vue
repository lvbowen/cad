<template>
  <div :class="[prefixCls]">
    <div :class="`${prefixCls}__left`">
      <div :class="`${prefixCls}__left-title`">
        <span>请添加需要排序的字段</span>
        <span
          :class="[
            !allSelect
              ? `${prefixCls}__left-title-extra`
              : `${prefixCls}__left-title-extra--disabled`
          ]"
          @click="addAllFileds"
        >
          全部添加
        </span>
      </div>
      <div :class="`${prefixCls}__left-search`">
        <a-input-search
          placeholder="搜索"
          v-model="searchKey"
          style="width: 230px;"
          @search="searchFiled"
          @blur="searchFiled"
        />
      </div>
      <div :class="`${prefixCls}__left-list`">
        <div
          v-for="item in viewList"
          :key="item.uid"
          :class="`${prefixCls}__left-list-item`"
        >
          <i
            :class="
              `h3yun_All ${
                item.type === 'date' ? 'calendar-o' : item.type === 'string' ? 'text-a' : item.type
              }`
            "
          ></i>
          <span :class="`${prefixCls}__left-list-item-content `" :title="item.alias || item.name">
            {{ item.alias || item.name }}
          </span>
          <span
            v-if="!selectedList[item.uid]"
            :class="`${prefixCls}__left-list-item--extra`"
            @click="addSingleFiled(item)"
          >添加</span>
        </div>
      </div>
    </div>
    <div :class="`${prefixCls}__right`">
      <h3-draggable
        v-model="value"
        id="sortList"
        :class="[`${prefixCls}__sort`]"
        handle=".drag"
        :options="dragOptions"
        @change="sortField"
      >
        <div
          v-for="item in value"
          :key="item.uid"
          :class="[`${prefixCls}__sort-item`]"
        >
          <i class="h3yun_All drag"></i>
          <i
            :class="
              `h3yun_All ${
                item.type === 'date' ? 'calendar-o' : item.type === 'string' ? 'text-a' : item.type
              }`
            "
          ></i>
          <span :class="[`${prefixCls}__sort-item-title`]" :title="item.alias || item.name">
            {{ item.alias || item.name }}
          </span>
          <a-radio-group
            :defaultValue="item.options.order || 'asc'"
            buttonStyle="solid"
            size="small"
            @change="changeOrder($event, item)"
          >
            <a-radio-button value="asc">升序</a-radio-button>
            <a-radio-button value="desc">降序</a-radio-button>
          </a-radio-group>
          <i class="h3yun_All delete-o" @click="delectFiled(item)"></i>
        </div>
      </h3-draggable>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from "vue-property-decorator";
import { Radio, Input } from "@h3/antd-vue";
import H3Draggable from "vuedraggable";

@Component({
  name: "h3-report-sort-module-list",
  components: {
    ARadio: Radio,
    ARadioButton: Radio.Button,
    ARadioGroup: Radio.Group,
    AInputSearch: Input.Search,
    H3Draggable
  }
})
export default class ReportSortListModule extends Vue {
  prefixCls = "h3-report-sort-module-list";
  comPrefixCls = "report-modules";
  @Prop({ default: () => ({}) }) chart!: H3.Report.Chart;
  @Prop({ default: () => "" }) chartType!: string;

  // 拖拽配置信息
  dragOptions = {
    group: "sortList",
    // ghostClass: 'h3-report-sort-module-list__sort-item',
    // chosenClass: 'h3-report-sort-module-list__sort-item',
    forceFallback: true,
    animation: 150,
    touchStartThreshold: 5,
    delay: 100,
    filter: ".undrag"
  };
  // 渲染的字段列表 搜索暂存列表
  renderList: Array<H3.Report.FieldColumn> = [];
  tempRenderList: Array<H3.Report.FieldColumn> = [];

  // 搜索值
  searchKey: string = "";

  // 添加近排序的字段
  value: Array<H3.Report.FieldColumn> = [];
  //  所有选中的字段
  get allFields() {
    return this.chart.data.dimension;
  }

  // 是否全部被选中
  get allSelect() {
    return this.allFields.length === this.value.length;
  }

  get selectedList() {
    let list = {};
    this.value.forEach(i => {
      list[i.uid] = true;
    });
    return list;
  }
  /**
   * 实际渲染的左侧未添加排序的字段
   */
  get viewList() {
    return this.allFields.filter(i => {
      return this.renderList.some(r => r.uid === i.uid);
    });
  }

  /**
   * 添加全部字段
   */
  addAllFileds() {
    if (this.allSelect) return;
    this.value = [...this.allFields];
    this.value.forEach(i => {
      if (!i.options.order) {
        i.options.order = "asc";
      }
    });
    this.renderList = [];
    this.tempRenderList = [];
    this.$emit("changeData", this.value);
  }
  /**
   * 添加单个字段
   */
  addSingleFiled(item) {
    if (this.value.find(i => i.uid === item.uid)) return;
    this.renderList = this.renderList.filter(i => i.uid !== item.uid);
    this.tempRenderList = this.tempRenderList.filter(i => i.uid !== item.uid);
    item.options.order = "asc";
    this.value = [...this.value, item];
    this.$emit("changeData", this.value);
  }
  /**
   * 删除单独字段
   */
  delectFiled(item) {
    this.value = this.value.filter(i => i.uid !== item.uid);
    this.renderList = [...this.renderList, item];
    this.tempRenderList = [...this.renderList];
    this.$emit("changeData", this.value);
  }
  /**
   * 改变单个排序规则
   */
  changeOrder(e: Event, item: H3.Report.FieldColumn) {
    let v = this.value.find(i => i.uid === item.uid);
    v && (v.options.order = (e.target as any).value);
    this.$emit("changeData", this.value);
  }
  /**
   * 搜索字段
   */
  searchFiled(e) {
    let val = this.searchKey;
    if (val === "") {
      this.renderList = [...this.tempRenderList];
    } else {
      this.renderList = this.tempRenderList.filter(i => {
        return (i.alias && i.alias.indexOf(val) > -1) || i.name.indexOf(val) > -1;
      });
    }
  }
  /**
   * 排序完毕
   */
  sortField(evt) {
    this.$nextTick(() => {
      this.$emit("changeData", this.value);
    });
  }

  mounted() {
    this.value = this.chart.data.sort;
    this.renderList = this.allFields.filter(f => {
      return !this.value.some(v => v.uid === f.uid);
    });
    this.tempRenderList = [...this.renderList];
    this.$emit("changeData", this.value);
  }
}
</script>

<style lang="less">
@import "../styles/index";
.h3-report-sort-module-list {
  display: flex;
  flex-direction: row;
  &__left {
    width: 240px;
    border-right: 1px solid #efefef;
    &-title {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-right: 12px;
      line-height: 22px;
      font-size: 14px;
      color: #304265;
      &-extra {
        font-size: 12px;
        color: #107fff;
        cursor: pointer;
        &--disabled {
          color: #efefef;
          cursor: no-drop;
        }
      }
    }
    &-list {
      margin-top: 4px;
      padding: 0 12px 0 16px;
      height: 190px;
      .vertical-scrollbar();
      &-item {
        height: 32px;
        color: #304265;
        display: flex;
        align-items: center;
        &:hover {
          .h3-report-sort-module-list__left-list-item--extra {
            color: #107fff;
          }
        }
        .number,
        .text-a,
        .calendar-o {
          color: #107fff;
          margin-right: 4px;
        }
        &-content {
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 4px;
          flex: 1;
        }
        &--extra {
          float: right;
          color: transparent;
          font-size: 12px;
          cursor: pointer;
        }
      }
    }
    .ant-input-search {
      min-height: 32px !important;
    }
  }
  &__right {
    flex: 1;
    .h3-report-sort-module-list__sort {
      .vertical-scrollbar();
      height: 250px;
      &-item {
        height: 32px;
        display: flex;
        align-items: center;
        .drag,
        .delete-o {
          margin-left: 8px;
          color: transparent;
        }
        .number,
        .text-a,
        .calendar-o {
          margin-left: 16px;
          color: #107fff;
        }
        &-title {
          margin-left: 4px;
          display: inline-block;
          width: 100px;
          color: #304265;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        &:hover {
          background-color: #f4f8fc;
          .drag,
          .delete-o {
            color: #8893a7;
            cursor: pointer;
          }
        }
      }
    }
    .ant-radio-group-small .ant-radio-button-wrapper {
      width: 60px;
      text-align: center;
      font-weight: 500;
    }
  }
}
</style>
