

<template>
  <div class="h3-panel">
    <div
      class="h3-panel-header"
      v-if="title"
      :class="[align,bold?'bold':'',vertical?'vertical':'']"

      @click="collapse">

      <i
        class="icon aufontAll h-icon-all-right-o"
        :class="{ expanded : show }"
        v-if="collapsible && !iconRight"
      />

      <span :style="labelStyle">{{ title }}</span>
      <a-tooltip placement="top" v-if="tips">
        <template slot="title">
          <span>{{ tips }}</span>
        </template>
        <a-icon :style="labelStyle" type="question-circle" style="font-size: 14px;" />
      </a-tooltip>

      <i
        class="icon aufontAll h-icon-all-right-o"
        :class="{ expanded : show }"
        v-if="collapsible && iconRight"
      />

    </div>
    <div class="h3-panel-right">
      <slot name="fullIcon"></slot>
    </div>

    <transition name="h3-fade">
      <div class="h3-panel-body" v-show="show">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>


<script lang='ts'>
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { Tooltip, Icon } from "@h3/antd-vue";
@Component({
  name: "h3-panel",
  components: {
    ATooltip: Tooltip,
    AIcon: Icon
  }
})
export default class H3Panel extends Vue {
  @Prop({
    default: ""
  })
  title!: string;
  @Prop({
    default: ""
  })
  tips!: string;

  @Prop()
  collapsible!: boolean;

  @Prop()
  collapsed!: boolean;

  @Prop({
    default: "left"
  })
  align!: string;

  @Prop({
    default: false
  })
  vertical!: boolean;

  @Prop({
    default: ""
  })
  labelStyle!: string;

  @Prop({
    default: false
  })
  iconRight!: boolean;

  @Prop({
    default: false
  })
  bold!: boolean;

  show = true;

  get icon() {
    return this.show ? "h-icon-all-down-o" : "h-icon-all-right-o";
  }

  collapse() {
    if (this.collapsible) {
      this.show = !this.show;
    }
  }
  @Watch("collapsed", {
    immediate: true
  })
  setCollapsed(val: boolean) {
    this.show = !val;
  }
}
</script>


<style lang="less" scoped>
.h3-panel {
  text-align: left;

  &.required > .h3-panel-header::before {
    content: "*";
    color: @error-color;
    display: inline-block;
  }
}

.h3-panel-right {
  position: absolute;
  right: 0;
  top: 0;
  float: right;
  cursor: pointer;
  margin-top: 6px;
}
.h3-panel-header {
  width: 100%;
  display: inline-block;
  // align-items: center;
  text-align: left;
  padding: @base10-padding-sm 0;

  // user-select: none;
  // overflow: hidden;
  // white-space: nowrap;
  // text-overflow: ellipsis;
  cursor: pointer;

  &.bold > span {
    font-weight: bold;
  }

  &.center {
    // justify-content: center;
    text-align: center;
  }

  &.right {
    // justify-content: flex-end;
    text-align: right;
  }

  &.left {
    text-align: left;
  }

  &.vertical {
    padding-left: 8px !important;
  }

  & > span {
    font-size: 14px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.65);
  }

  & > i {
    margin-left: 0.5em;
    margin-right: 9px;
    font-size: 10px;
    display: inline-block;
    transition: transform 0.24s;

    &.expanded {
      transform: rotate(90deg);
    }
    color: rgba(0, 0, 0, 0.65);
    // & > svg {
    //   color: rgba(0, 0, 0, 0.65);
    // }
  }
}

.h3-panel-body {
  overflow: hidden;
}

.h3-panel.xl > .h3-panel-header {
  padding: @base4-padding-sm 0;

  & > span {
    font-size: 18px;
  }
}

.h3-fade-enter-active,
.h3-fade-leave-active {
  max-height: 100rem;
  // transition: all 3s ease;
  transition: all 0.15s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
}

.h3-fade-enter,
.h3-fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
