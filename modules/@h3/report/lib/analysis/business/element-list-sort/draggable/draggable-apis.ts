declare namespace H3 {
  namespace Draggable {
    interface Position {
      element: HTMLElement | number;
      y: number;
      x: number;
      top?: number;
      left?: number;
      delay?: number;
    }

    /**
     * 自定义mouse事件
     */
    interface comMouseEvent extends MouseEvent {
      isCustom?: boolean;
      position?: Position;
      rect: DOMRect;
    }
    interface Options {
      // 滚动的容器
      content?: HTMLElement | undefined;
      // 在列表项中拖动手柄选择器
      handle?: string;
      // 是否采用老实的mouse实现
      forceFallback?: boolean;
      // 占位样式
      ghostClass?: string;
      // 拖动中的样式
      dragClass?: string;
      //是否在容器里面拖动
      inside?: boolean;
      // 禁止使用Y轴移动
      banY?: boolean;
      // 禁止使用X轴移动
      banX?: boolean;
      // 动画
      animation?: number;
      // 滚动速度
      speed?: number;
      // 距离多少触发自动滚动
      scrollSensitivity?: number;
      //开始拖拽事件
      onStart?: Function;
      // 拖拽结束事件
      onEnd?: Function;
    }
    interface Event {
      from?: HTMLElement;
      to?: HTMLElement;
      newIndex?: number;
      oldIndex: number;
    }
  }
}
