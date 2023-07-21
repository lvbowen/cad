import { setInterval } from "./raf";

function scrollTop(el: HTMLElement, targetTop = 0, time?: number) {
  if (!time) {
    el.scrollTop = targetTop;
    return targetTop;
  }
  const spacingTime = 1000 / 60;
  let spacingIndex = time / spacingTime; // 计算循环的次数
  let nowTop = el.scrollTop; // 获取当前滚动条位置
  const everTop = (targetTop - nowTop) / spacingIndex; // 计算每次滑动的距离
  setInterval(() => {
    if (spacingIndex > 0) {
      spacingIndex--;
      el.scrollTop = nowTop += everTop;
    } else {
      return true; // 返回true，停止
    }
  }, spacingTime);
}

export { scrollTop };

export default {
  scrollTop
};
