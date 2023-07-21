<!-- 图表内容 -->
<template>
  <div :class="prefixCls">
    <div ref="wrap" :class="`${prefixCls}__warp`">
      <div
        v-for="element in elements"
        :class="[`${prefixCls}__item`]"
        :key="element.uid"
      >
        <label :class="[`${prefixCls}__title`]">{{ element.title }}</label>
        <img :src="getImages(element.type)" draggable="false"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import H3Draggable from "vuedraggable";
import chartImages from "./images-type";
import Draggable, { DraggableMouse } from "./draggable";
import { dispatch } from "@h3/report/basics/utils/events";
import { css } from "@h3/report/basics/utils/dom";
import { getMainType } from "@h3/report/basics/instance/help/getModules";

@Component({
  name: "h3-element-list-sort",
  components: {
    H3Draggable
  }
})
export default class H3ElementListSort extends Vue {
  @Prop({ default: [] }) value!: H3.Report.BaseElement[];
  @Prop({ default: null }) active!: H3.Report.BaseElement | number | string;
  prefixCls: string = "h3-element-list-sort";
  images = chartImages;
  drag!: DraggableMouse;
  elements: H3.Report.BaseElement[] = [];

  @Watch("value", { immediate: true })
  watchValue() {
    this.elements = this.value;
  }
  /**
   * 开始拖拽
   */
  onStart(evt: H3.Draggable.Event) {
    this.$emit("start", evt);
  }
  /**
   * 拖拽结束
   */
  onEnd(evt: H3.Draggable.Event) {
    if (evt.hasOwnProperty("newIndex")) {
      const element = this.elements[evt.oldIndex] as any;
      const list = this.elements.map(item => item);
      list.splice(evt.oldIndex, 1);
      list.splice(evt.newIndex || 0, 0, element);
      this.$emit("input", list);
    }
    this.$emit("end", evt);
  }

  /**
   * 获取正在的图表类型
   */
  getImages(type) {
    const maintype = getMainType(type);
    return this.images[maintype]();
  }

  /**
   * 处理自定义参数
   * @param el
   * @param position
   */
  handleCustomEvent(el: HTMLElement, position: H3.Draggable.Position) {
    if (position) {
      const wrap = this.$el as HTMLDivElement;
      const elCSS = css(wrap);
      const rect = el.getBoundingClientRect();
      if (position.top) {
        const top = rect.top - position.top;
        const scrollTop = wrap.scrollTop;
        if (top < 0) {
          if (Math.abs(top) > scrollTop) {
            wrap.scrollTop = 0;
            css(
              this.$el as HTMLDivElement,
              "paddingTop",
              Math.abs(top) - scrollTop + parseInt(elCSS.paddingTop.replace("px", "")) + "px"
            );
          } else {
            wrap.scrollTop += top;
          }
        } else {
          if (top > wrap.scrollHeight - wrap.clientHeight - scrollTop) {
            css(
              this.$el as HTMLDivElement,
              "paddingBottom",
              top -
                (wrap.scrollHeight - wrap.clientHeight) +
                scrollTop +
                parseInt(elCSS.paddingBottom.replace("px", "")) +
                "px"
            );
            wrap.scrollTop = wrap.scrollHeight;
          } else {
            wrap.scrollTop += top;
          }
        }
      }
      if (position.left) {
        const left = rect.left - position.left;
        const scrollLeft = wrap.scrollLeft;
        // todo x轴没有写 后面需要可以补充
      }
      return {
        top: position.y - el.clientHeight / 2,
        left: position.x - el.clientWidth / 2
      } as DOMRect;
    }
  }
  /**
   * 设置激活的元件
   * @param position
   */
  setActive(position: H3.Draggable.Position) {
    const el = position.element;
    const wrap = this.$refs.wrap as HTMLDivElement;
    const nEl: HTMLElement = typeof el === "number" ? (wrap.childNodes[el] as HTMLElement) : el;
    if (!nEl) return;
    this.$el.scrollTop = 0;
    this.$el.removeAttribute("style");
    const rect = this.handleCustomEvent(nEl, position);
    setTimeout(() => {
      dispatch(nEl, "mousedown", {
        button: 0,
        clientX: position.x,
        clientY: position.y,
        isCustom: true,
        position,
        rect
      });
    }, position.delay || 0);
  }

  mounted() {
    this.drag = Draggable.create(this.$refs.wrap as HTMLDivElement, {
      content: this.$el as any,
      animation: 150,
      onStart: this.onStart,
      onEnd: this.onEnd
    });
  }
  destroyed() {
    this.drag.destroy();
  }
}
</script>
