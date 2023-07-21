import { on, off, dispatch } from "@h3/report/basics/utils/events";
import { elementIndex, css } from "@h3/report/basics/utils/dom";

class Draggable {
  static create(el: HTMLDivElement, options: H3.Draggable.Options) {
    return new DraggableMouse(el, options);
  }
}

class DraggableMouse implements H3.Draggable.Options {
  prefixCls: string = "h3-x-draggable";
  content!: HTMLElement | undefined;
  handle!: string;
  ghostClass: string = `${this.prefixCls}__ghost`;
  itemClass: string = `${this.prefixCls}__item`;
  dragClass: string = `${this.prefixCls}__drag`;
  forceFallback: boolean = false;
  inside: boolean = false;
  banY: boolean = false;
  banX: boolean = false;
  animation: number = 0;
  speed: number = 10;
  scrollSensitivity: number = 30;
  onStart?: Function;
  onMove?: Function;
  onEnd?: Function;
  el!: HTMLElement;
  target!: HTMLElement | undefined;
  trigger!: HTMLElement | undefined;
  mouseEl!: HTMLDivElement | undefined;
  dragIndex: number = -1;
  dragRect!: DOMRect;
  x: number = 0;
  y: number = 0;
  fixed = {
    top: 0,
    left: 0
  };
  events = {
    mousemove: this.mousemove.bind(this),
    mousedown: this.mousedown.bind(this),
    mouseover: this.mouseover.bind(this),
    mouseup: this.mouseup.bind(this),
    transitionend: this.transitionend.bind(this)
  };

  throttleTimeout: any = 0;
  inTime: any = 0;
  animationSet: Set<HTMLElement> = new Set();
  isScroll = false;
  mousedownState = false;
  customTimer: any = 0;
  constructor(el: HTMLElement, options: H3.Draggable.Options) {
    this.initOptions(el, options);
  }

  /**
   * 初始化配置项
   * @param el
   * @param options
   */
  private initOptions(el: HTMLElement, options: H3.Draggable.Options) {
    this.el = el;
    this.content = options.content;
    this.el.classList.add(this.prefixCls);
    Object.assign(this, options);
    Array.prototype.forEach.call(this.el.children, (iEl: HTMLDivElement) => {
      on(iEl, "mousedown", this.events.mousedown, false);
      iEl.classList.add(this.itemClass);
    });
    on(this.el, "transitionend", this.events.transitionend, false);
  }

  /**
   * 动画结束事件
   */
  private transitionend(e: TransitionEvent) {
    const tEL = e.target as HTMLElement;
    this.animationSet.delete(tEL);
    tEL.removeAttribute("style");
  }

  /**
   * 初始化mousedown之后事件
   */
  private addEvents() {
    const warp = this.inside ? this.el : window.document;
    on(warp, "mousemove", this.events.mousemove, false);
    on(window.document, "mouseup", this.events.mouseup, false);
    Array.prototype.forEach.call(this.el.children, (el: HTMLDivElement) => {
      on(el, "mouseover", this.events.mouseover, false);
    });
  }

  /**
   * 删除mousedown之后事件
   */
  private removeEvents() {
    const warp = this.inside ? this.el : window.document;
    off(warp, "mousemove", this.events.mousemove, false);
    off(window.document, "mouseup", this.events.mouseup, false);
    Array.prototype.forEach.call(this.el.children, (el: HTMLDivElement) => {
      off(el, "mouseover", this.events.mouseover, false);
    });
  }

  /**
   * 鼠标移动中事件
   * @param e
   */
  private async mousemove(e: MouseEvent) {
    if (this.mouseEl) {
      const x = this.dragRect.left + e.clientX - this.x - this.fixed.left;
      const y = this.dragRect.top + e.clientY - this.y - this.fixed.top;
      if (!this.banY) {
        this.mouseEl.style.top = y + "px";
      }
      if (!this.banX) {
        this.mouseEl.style.left = x + "px";
      }
    }
    this.autoScroll(e);
  }

  /**
   * 鼠标按下事件
   * @param e
   */
  private mousedown(e: H3.Draggable.comMouseEvent) {
    this.target = e.currentTarget as HTMLElement;
    // 判断触发的target是否存在，并且触发的按键是否是左键
    if (this.target && e.button === 0) {
      this.mousedownState = true;
      this.dragRect = this.target.getBoundingClientRect();
      this.mouseEl = (this.target as HTMLElement).cloneNode(true) as HTMLDivElement;
      this.target.classList.add(this.ghostClass);
      this.mouseEl.classList.add(this.dragClass);

      if (!e.isCustom) {
        this.dragRect = this.target.getBoundingClientRect();
      } else {
        this.dragRect = e.rect;
      }
      this.fixed = this.getFixed(this.target);
      this.mouseEl.style.top = this.dragRect.top - this.fixed.top + "px";
      this.mouseEl.style.left = this.dragRect.left - this.fixed.left + "px";
      document.body.appendChild(this.mouseEl);
      this.dragIndex = elementIndex(e.currentTarget as HTMLDivElement);
      this.x = e.clientX;
      this.y = e.clientY;
      this.addEvents();
      this.animationSet.clear();
      this.onStart && this.onStart(this.eventParams());
    }
  }

  /**
   * 鼠标弹起事件
   * @param e
   */
  private mouseup(e: MouseEvent) {
    clearTimeout(this.customTimer);
    if (this.mouseEl && this.target && this.mousedownState) {
      this.target.classList.remove(this.ghostClass);
      document.body.removeChild(this.mouseEl);
      clearInterval(this.inTime);
      this.removeEvents();
      this.mousedownState = false;
      this.onEnd && this.onEnd(this.eventParams());
      this.mouseEl = undefined;
      this.target = undefined;
    }
  }

  /**
   * 获取fixed布局元素的位置
   * @param el
   */
  getFixed(el: HTMLElement) {
    const rect = this.el.getBoundingClientRect();
    // todo 后期可以做按需放置移动元素
    return { top: 0, left: 0 };
  }

  /**
   * 鼠标经过元素事件
   * @param e
   */
  private mouseover(e: MouseEvent) {
    if (
      this.mouseEl &&
      this.target &&
      !(e.currentTarget as HTMLElement).classList.contains(this.ghostClass) &&
      !this.animationSet.has(e.currentTarget as HTMLElement) //&&
      //!this.isScroll
    ) {
      this.convertPositions(this.target, e.currentTarget as HTMLElement);
    }
  }

  /**
   * 交换元素位置
   * @param el
   * @param nEl
   */
  private convertPositions(el: HTMLElement, nEl: HTMLElement) {
    const parent = el.parentNode;
    if (parent) {
      const elIndex = elementIndex(el);
      const nElIndex = elementIndex(nEl);
      const elList = Array.prototype.slice.call(
        parent.children,
        Math.min(elIndex, nElIndex),
        Math.max(elIndex, nElIndex) + 1
      );
      const oRects: DOMRect[] = [];
      if (this.animation) {
        elList.forEach((cEl: HTMLElement, index: number) => {
          oRects.push(Object.assign(cEl.getBoundingClientRect(), { el: cEl }));
          cEl.removeAttribute("style");
        });
      }
      if (elIndex > nElIndex) {
        parent.insertBefore(el, nEl);
        if (this.isScroll) {
          this.el.scrollTop -= el.offsetHeight;
        }
      } else {
        if (nEl.nextSibling) {
          parent.insertBefore(el, nEl.nextSibling);
        } else {
          parent.appendChild(el);
        }
      }
      if (this.animation) {
        elList.forEach((cEl: HTMLElement, index: number) => {
          const rect = cEl.getBoundingClientRect();
          const oRect = oRects[index];
          if (oRect.top - rect.top === 0) {
            (cEl as any).animation = false;
            return;
          }
          (cEl as any).animation = true;
          cEl.setAttribute(
            "style",
            `transform: translate3d(${oRect.left - rect.left}px, ${oRect.top - rect.top}px, 0px);`
          );
          setTimeout(() => {
            cEl.setAttribute(
              "style",
              `transform: translate3d(0px, 0px, 0px); transition: transform ${this.animation}ms ease 0s;`
            );
          }, 10);
        });
        this.animationSet.clear();
        (el as any).animation && this.animationSet.add(el);
        (nEl as any).animation && this.animationSet.add(nEl);
      }
      this.trigger = nEl;
    }
  }

  /**
   * 节流函数
   * @param callback
   * @param ms
   */
  private throttle(callback: Function, ms: number) {
    if (!this.throttleTimeout) {
      callback();
      this.throttleTimeout = setTimeout(() => {
        this.throttleTimeout = void 0;
      }, ms);
    }
  }

  /**
   * 自动滚动
   * @param e
   */
  private autoScroll(e: MouseEvent) {
    let rect = this.el.getBoundingClientRect();
    let el = this.el;
    if (this.content) {
      el = this.content;
      rect = this.content.getBoundingClientRect();
    }
    const x = e.clientX;
    const y = e.clientY;
    const elCSS = css(el);
    const sens = this.scrollSensitivity;
    const canScrollX =
      rect.width < el.scrollWidth &&
      (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
    const canScrollY =
      rect.height < el.scrollHeight &&
      (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");

    const vy =
      canScrollY &&
      y > rect.top &&
      y < rect.bottom &&
      ((Math.abs(rect.bottom - y) <= sens && this.speed) ||
        (Math.abs(rect.top - y) <= sens && -this.speed));
    const vx =
      canScrollX &&
      x > rect.left &&
      y < rect.right &&
      ((Math.abs(rect.right - y) <= sens && this.speed) ||
        (Math.abs(rect.left - y) <= sens && -this.speed));
    if (vx || vy) {
      this.isScroll = true;
      clearInterval(this.inTime);
      this.inTime = setInterval(() => {
        this.throttle(() => {
          if (vx) {
            el.scrollLeft += vx;
          }
          if (vy) {
            el.scrollTop += vy;
          }
        }, 24);
      }, 30);
    } else {
      this.isScroll = false;
      clearInterval(this.inTime);
    }
  }

  private eventParams(): H3.Draggable.Event {
    const event: H3.Draggable.Event = {
      oldIndex: this.dragIndex
    };
    if (this.target) {
      const newIndex = elementIndex(this.target);
      if (this.trigger && this.dragIndex !== newIndex) {
        event.from = this.target;
        event.to = this.trigger;
        event.newIndex = elementIndex(this.target);
      }
    }
    return event;
  }

  /**
   * 销毁
   */
  destroy() {
    Array.prototype.forEach.call(this.el.children, (iEl: HTMLDivElement) => {
      off(iEl, "mousedown", this.events.mousedown, false);
    });
    off(this.el, "transitionend", this.events.transitionend, false);
  }
}

export { Draggable, DraggableMouse };

export default {
  Draggable,
  DraggableMouse
};
